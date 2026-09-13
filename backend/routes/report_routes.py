from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from bson import ObjectId
from io import BytesIO
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from auth import get_current_user, require_roles

from shared import (
    Report,
    patients_collection,
    reports_collection,
    users_collection,
    create_audit_log,
    serialize_report,
)

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER

from pydantic import BaseModel


# =========================================================
# ROUTER
# =========================================================

router = APIRouter()

IST = ZoneInfo("Asia/Kolkata")


def get_current_ist():
    return datetime.now(IST)


# =========================================================
# OPERATIONAL REPORT INPUT
# =========================================================

class OperationalReportInput(BaseModel):
    report_type: str
    patient_id: str | None = None
    department: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    current_status: str | None = None


# =========================================================
# EXISTING MEDICAL REPORT
# DOCTOR + SYSTEM ADMIN
# =========================================================

@router.post("/api/reports")
def create_report(
    report: Report,
    current_user: dict = Depends(
        require_roles(
            "Doctor",
            "System Administrator",
        )
    ),
):

    try:
        patient = patients_collection.find_one(
            {
                "_id": ObjectId(report.patient_id)
            }
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid patient ID.",
        )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    if current_user["role"] == "Doctor":

        if patient.get("doctor_id") != current_user["id"]:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only create reports "
                    "for assigned patients."
                ),
            )

    report_data = {
        "patient_id": report.patient_id,
        "patient_name": report.patient_name,
        "type": report.type,
        "status": report.status,
        "created_at": datetime.now(timezone.utc),
        "created_by": current_user["id"],
    }

    result = reports_collection.insert_one(
        report_data
    )

    create_audit_log(
        current_user,
        "CREATE_REPORT",
        resource=str(result.inserted_id),
    )

    return {
        "message": "Report created successfully",
        "report_id": str(result.inserted_id),
    }


# =========================================================
# GET EXISTING REPORTS
# =========================================================

@router.get("/api/reports")
def get_reports(
    current_user: dict = Depends(get_current_user),
):

    role = current_user["role"]

    # -----------------------------------------------------
    # DOCTOR
    # -----------------------------------------------------

    if role == "Doctor":

        assigned_patients = list(
            patients_collection.find(
                {
                    "doctor_id": current_user["id"]
                },
                {
                    "_id": 1
                },
            )
        )

        patient_ids = [
            str(patient["_id"])
            for patient in assigned_patients
        ]

        reports = list(
            reports_collection.find(
                {
                    "patient_id": {
                        "$in": patient_ids
                    }
                }
            )
        )

    # -----------------------------------------------------
    # HOSPITAL ADMIN + SYSTEM ADMIN
    # -----------------------------------------------------

    elif role in {
        "Hospital Administrator",
        "System Administrator",
    }:

        reports = list(
            reports_collection.find()
        )

    # -----------------------------------------------------
    # RESEARCHER
    # -----------------------------------------------------

    elif role == "Healthcare Researcher":

        reports = list(
            reports_collection.find(
                {},
                {
                    "patient_name": 0
                },
            )
        )

    else:

        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    return [
        serialize_report(report)
        for report in reports
    ]


# =========================================================
# DELETE EXISTING REPORT
# DOCTOR + SYSTEM ADMIN
# =========================================================

@router.delete("/api/reports/{report_id}")
def delete_report(
    report_id: str,
    current_user: dict = Depends(
        require_roles(
            "Doctor",
            "System Administrator",
        )
    ),
):

    try:
        report = reports_collection.find_one(
            {
                "_id": ObjectId(report_id)
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid report ID.",
        )

    if not report:

        raise HTTPException(
            status_code=404,
            detail="Report not found.",
        )

    # -----------------------------------------------------
    # DOCTOR CAN DELETE ONLY ASSIGNED PATIENT REPORTS
    # -----------------------------------------------------

    if current_user["role"] == "Doctor":

        try:

            patient = patients_collection.find_one(
                {
                    "_id": ObjectId(
                        report["patient_id"]
                    )
                }
            )

        except Exception:

            raise HTTPException(
                status_code=400,
                detail="Invalid patient ID in report.",
            )

        if not patient:

            raise HTTPException(
                status_code=404,
                detail="Patient not found.",
            )

        if patient.get("doctor_id") != current_user["id"]:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only delete reports "
                    "for assigned patients."
                ),
            )

    result = reports_collection.delete_one(
        {
            "_id": ObjectId(report_id)
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Report not found.",
        )

    create_audit_log(
        current_user,
        "DELETE_REPORT",
        resource=report_id,
    )

    return {
        "message": "Report deleted successfully"
    }


# =========================================================
# HELPER
# GET PATIENTS AVAILABLE TO CURRENT USER
# =========================================================

def get_operational_patients(
    current_user: dict,
    department: str | None = None,
):

    role = current_user["role"]

    # -----------------------------------------------------
    # DOCTOR
    # -----------------------------------------------------

    if role == "Doctor":

        patients = list(
            patients_collection.find(
                {
                    "doctor_id": current_user["id"]
                }
            )
        )

    # -----------------------------------------------------
    # HOSPITAL ADMIN
    # -----------------------------------------------------

    elif role == "Hospital Administrator":

        patients = list(
            patients_collection.find()
        )

    else:

        raise HTTPException(
            status_code=403,
            detail=(
                "Only Doctors and Hospital "
                "Administrators can generate "
                "operational reports."
            ),
        )

    # -----------------------------------------------------
    # DEPARTMENT FILTER
    # -----------------------------------------------------

    if (
        department
        and role == "Hospital Administrator"
    ):

        doctors = list(
            users_collection.find(
                {
                    "role": "Doctor",
                    "department": department,
                },
                {
                    "_id": 1,
                },
            )
        )

        doctor_ids = [
            str(doctor["_id"])
            for doctor in doctors
        ]

        patients = [
            patient
            for patient in patients
            if str(
                patient.get("doctor_id")
            ) in doctor_ids
        ]

    return patients


# =========================================================
# HELPER
# GET SELECTED OPERATIONAL PATIENT
# =========================================================

def get_selected_operational_patient(
    current_user: dict,
    patient_id: str,
):

    if not patient_id:

        raise HTTPException(
            status_code=400,
            detail="Please select a patient.",
        )

    try:

        patient = patients_collection.find_one(
            {
                "_id": ObjectId(patient_id)
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid patient ID.",
        )

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    # -----------------------------------------------------
    # DOCTOR CAN ONLY ACCESS ASSIGNED PATIENT
    # -----------------------------------------------------

    if current_user["role"] == "Doctor":

        if patient.get("doctor_id") != current_user["id"]:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only generate reports "
                    "for your assigned patients."
                ),
            )

    return patient


# =========================================================
# HELPER
# CALCULATE OPERATIONAL STATISTICS
# =========================================================

def calculate_operational_statistics(
    patients,
):

    total_patients = len(patients)

    high_risk = 0
    medium_risk = 0
    low_risk = 0

    readmitted_patients = 0
    readmitted_within_30_days = 0
    not_readmitted_patients = 0

    treatment_plans = 0
    follow_ups = 0

    for patient in patients:

        # -------------------------------------------------
        # RISK
        # -------------------------------------------------

        risk = str(
            patient.get(
                "risk",
                "",
            )
        ).strip().upper()

        if risk == "HIGH":

            high_risk += 1

        elif risk == "MEDIUM":

            medium_risk += 1

        elif risk == "LOW":

            low_risk += 1

        # -------------------------------------------------
        # READMISSION
        # -------------------------------------------------

        readmission_value = patient.get(
            "readmitted",
            patient.get(
                "readmission",
                None,
            ),
        )

        if readmission_value is None:

            binary_value = patient.get(
                "readmission_30_days"
            )

            if binary_value == 1:

                readmission_value = "<30"

            elif binary_value == 0:

                readmission_value = "NO"

        if readmission_value is not None:

            normalized = str(
                readmission_value
            ).strip().upper()

            if normalized in {
                "<30",
                ">30",
                "YES",
                "READMITTED",
                "TRUE",
                "1",
            }:

                readmitted_patients += 1

            if normalized in {
                "<30",
                "WITHIN 30 DAYS",
                "30 DAYS",
                "YES",
                "READMITTED",
                "TRUE",
                "1",
            }:

                readmitted_within_30_days += 1

            elif normalized in {
                "NO",
                "NOT READMITTED",
                "FALSE",
                "0",
            }:

                not_readmitted_patients += 1

        # -------------------------------------------------
        # TREATMENT
        # -------------------------------------------------

        treatment = patient.get(
            "treatment_plan",
            {}
        )

        if treatment:

            has_treatment_data = any(
                treatment.get(field)
                for field in [
                    "diagnosis",
                    "medicines",
                    "doctor_recommendations",
                ]
            )

            if has_treatment_data:

                treatment_plans += 1

            if treatment.get(
                "follow_up_date"
            ):

                follow_ups += 1

    # -----------------------------------------------------
    # READMISSION RATE
    # -----------------------------------------------------

    if total_patients > 0:

        readmission_rate = round(
            (
                readmitted_patients
                / total_patients
            )
            * 100,
            2,
        )

    else:

        readmission_rate = 0.0

    return {
        "total_patients": total_patients,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "readmitted_patients": readmitted_patients,
        "readmitted_within_30_days": (
            readmitted_within_30_days
        ),
        "not_readmitted_patients": (
            not_readmitted_patients
        ),
        "readmission_rate": readmission_rate,
        "treatment_plans": treatment_plans,
        "follow_ups": follow_ups,
    }


# =========================================================
# HELPER
# DEPARTMENT PERFORMANCE
# =========================================================

def calculate_department_performance(
    patients,
):

    doctors = list(
        users_collection.find(
            {
                "role": "Doctor"
            }
        )
    )

    doctor_map = {}
    departments = {}

    # -----------------------------------------------------
    # CREATE DOCTOR / DEPARTMENT MAP
    # -----------------------------------------------------

    for doctor in doctors:

        doctor_id = str(
            doctor["_id"]
        )

        doctor_department = (
            doctor.get("department")
            or "Department Not Assigned"
        )

        doctor_map[doctor_id] = (
            doctor_department
        )

        if doctor_department not in departments:

            departments[
                doctor_department
            ] = {
                "department": doctor_department,
                "doctor_count": 0,
                "patient_count": 0,
                "high_risk": 0,
                "medium_risk": 0,
                "low_risk": 0,
                "readmitted_patients": 0,
                "treatment_plans": 0,
                "follow_ups": 0,
            }

        departments[
            doctor_department
        ]["doctor_count"] += 1

    # -----------------------------------------------------
    # PROCESS PATIENTS
    # -----------------------------------------------------

    for patient in patients:

        doctor_id = patient.get(
            "doctor_id"
        )

        department = doctor_map.get(
            str(doctor_id),
            "Department Not Assigned",
        )

        if department not in departments:

            departments[
                department
            ] = {
                "department": department,
                "doctor_count": 0,
                "patient_count": 0,
                "high_risk": 0,
                "medium_risk": 0,
                "low_risk": 0,
                "readmitted_patients": 0,
                "treatment_plans": 0,
                "follow_ups": 0,
            }

        department_data = departments[
            department
        ]

        department_data[
            "patient_count"
        ] += 1

        # -------------------------------------------------
        # RISK
        # -------------------------------------------------

        risk = str(
            patient.get(
                "risk",
                "",
            )
        ).strip().upper()

        if risk == "HIGH":

            department_data[
                "high_risk"
            ] += 1

        elif risk == "MEDIUM":

            department_data[
                "medium_risk"
            ] += 1

        elif risk == "LOW":

            department_data[
                "low_risk"
            ] += 1

        # -------------------------------------------------
        # READMISSION
        # -------------------------------------------------

        readmission_value = patient.get(
            "readmitted",
            patient.get(
                "readmission",
                None,
            ),
        )

        if readmission_value is None:

            binary_value = patient.get(
                "readmission_30_days"
            )

            if binary_value == 1:

                readmission_value = "<30"

            elif binary_value == 0:

                readmission_value = "NO"

        if readmission_value is not None:

            normalized = str(
                readmission_value
            ).strip().upper()

            if normalized in {
                "<30",
                ">30",
                "YES",
                "READMITTED",
                "TRUE",
                "1",
            }:

                department_data[
                    "readmitted_patients"
                ] += 1

        # -------------------------------------------------
        # TREATMENT
        # -------------------------------------------------

        treatment = patient.get(
            "treatment_plan",
            {}
        )

        if treatment:

            has_treatment_data = any(
                treatment.get(field)
                for field in [
                    "diagnosis",
                    "medicines",
                    "doctor_recommendations",
                ]
            )

            if has_treatment_data:

                department_data[
                    "treatment_plans"
                ] += 1

            if treatment.get(
                "follow_up_date"
            ):

                department_data[
                    "follow_ups"
                ] += 1

    return sorted(
        departments.values(),
        key=lambda item: item[
            "department"
        ].lower(),
    )


# =========================================================
# GENERATE OPERATIONAL REPORT
# DOCTOR + HOSPITAL ADMIN
# =========================================================

@router.post("/api/reports/operational")
def generate_operational_report(
    report_input: OperationalReportInput,
    current_user: dict = Depends(
        require_roles(
            "Doctor",
            "Hospital Administrator",
        )
    ),
):

    allowed_report_types = {
        "patient_outcome",
        "treatment_followup",
        "readmission",
        "hospital_performance",
        "department_performance",
        "treatment_outcome",
    }

    if report_input.report_type not in allowed_report_types:

        raise HTTPException(
            status_code=400,
            detail="Invalid operational report type.",
        )

    role = current_user["role"]

    # =====================================================
    # DOCTOR RESTRICTIONS
    # =====================================================

    if (
        role == "Doctor"
        and report_input.report_type
        in {
            "hospital_performance",
            "department_performance",
        }
    ):

        raise HTTPException(
            status_code=403,
            detail=(
                "Doctors can only generate "
                "patient-level operational reports."
            ),
        )

    # =====================================================
    # PATIENT-LEVEL REPORTS
    # =====================================================

    patient_level_reports = {
        "patient_outcome",
        "treatment_followup",
        "readmission",
        "treatment_outcome",
    }

    selected_patient = None

    if report_input.report_type in patient_level_reports:

        if not report_input.patient_id:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Please select a patient "
                    "for this report."
                ),
            )

        selected_patient = (
            get_selected_operational_patient(
                current_user,
                report_input.patient_id,
            )
        )

        # -------------------------------------------------
        # DOCTOR-SPECIFIC VALIDATION
        # -------------------------------------------------

        if role == "Doctor":

            if not report_input.start_date:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Please select a start date "
                        "for the patient report."
                    ),
                )

            if not report_input.end_date:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Please select an end date "
                        "for the patient report."
                    ),
                )

            if (
                report_input.start_date
                > report_input.end_date
            ):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Start date cannot be later "
                        "than end date."
                    ),
                )

            if not report_input.current_status:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Please provide the patient's "
                        "current status."
                    ),
                )

    # =====================================================
    # HOSPITAL / DEPARTMENT REPORTS
    # =====================================================

    if report_input.report_type in {
        "hospital_performance",
        "department_performance",
    }:

        if role != "Hospital Administrator":

            raise HTTPException(
                status_code=403,
                detail=(
                    "Only Hospital Administrators "
                    "can generate hospital-level reports."
                ),
            )

    # =====================================================
    # PATIENT-LEVEL RESPONSE
    # =====================================================

    if selected_patient:

        treatment = selected_patient.get(
            "treatment_plan",
            {},
        )

        doctor_id = selected_patient.get(
            "doctor_id"
        )

        doctor = None

        if doctor_id:

            try:

                doctor = users_collection.find_one(
                    {
                        "_id": ObjectId(doctor_id)
                    }
                )

            except Exception:

                doctor = None

        patient_data = {
            "patient_id": str(
                selected_patient["_id"]
            ),

            "patient_name": selected_patient.get(
                "name",
                "N/A",
            ),

            "age": selected_patient.get(
                "age",
                "N/A",
            ),

            "disease": selected_patient.get(
                "disease",
                "N/A",
            ),

            "risk": selected_patient.get(
                "risk",
                "N/A",
            ),

            "status": (
                report_input.current_status
                if role == "Doctor"
                and report_input.current_status
                else selected_patient.get(
                    "status",
                    "N/A",
                )
            ),

            "diagnosis": treatment.get(
                "diagnosis",
                "N/A",
            ),

            "medicines": treatment.get(
                "medicines",
                "N/A",
            ),

            "doctor_recommendations": treatment.get(
                "doctor_recommendations",
                "N/A",
            ),

            "follow_up_date": treatment.get(
                "follow_up_date",
                "N/A",
            ),

            "doctor_name": (
                doctor.get("name")
                if doctor
                else "N/A"
            ),

            "department": (
                doctor.get("department")
                if doctor
                else "N/A"
            ),
        }

        generated_at = get_current_ist()

        create_audit_log(
            current_user,
            "OPERATIONAL_REPORT_GENERATED",
            resource=report_input.report_type,
            details={
                "report_type": report_input.report_type,
                "patient_id": report_input.patient_id,
                "start_date": report_input.start_date,
                "end_date": report_input.end_date,
                "current_status": (
                    report_input.current_status
                ),
            },
        )

        return {
            "report_type": report_input.report_type,

            "report_title": (
                report_input.report_type
                .replace("_", " ")
                .title()
            ),

            "generated_by": {
                "name": current_user.get(
                    "name",
                    "N/A",
                ),
                "role": current_user.get(
                    "role",
                    "N/A",
                ),
            },

            "generated_at": (
                generated_at.isoformat()
            ),

            "report_period": {
                "start_date": (
                    report_input.start_date
                ),
                "end_date": (
                    report_input.end_date
                ),
            },

            "current_status": (
                report_input.current_status
                if role == "Doctor"
                else patient_data["status"]
            ),

            "patient": patient_data,

            "patients": [
                patient_data
            ],

            "departments": [],

            "total_patients": 1,

            "high_risk": (
                1
                if str(
                    patient_data["risk"]
                ).upper() == "HIGH"
                else 0
            ),

            "medium_risk": (
                1
                if str(
                    patient_data["risk"]
                ).upper() == "MEDIUM"
                else 0
            ),

            "low_risk": (
                1
                if str(
                    patient_data["risk"]
                ).upper() == "LOW"
                else 0
            ),

            "readmitted_patients": 0,

            "readmitted_within_30_days": 0,

            "not_readmitted_patients": 0,

            "readmission_rate": 0,

            "treatment_plans": (
                1
                if treatment
                and any(
                    treatment.get(field)
                    for field in [
                        "diagnosis",
                        "medicines",
                        "doctor_recommendations",
                    ]
                )
                else 0
            ),

            "follow_ups": (
                1
                if treatment.get(
                    "follow_up_date"
                )
                else 0
            ),
        }

    # =====================================================
    # HOSPITAL ADMIN OPERATIONAL REPORTS
    # =====================================================

    patients = get_operational_patients(
        current_user,
        report_input.department,
    )

    statistics = calculate_operational_statistics(
        patients
    )

    department_data = []

    if role == "Hospital Administrator":

        if report_input.report_type in {
            "hospital_performance",
            "department_performance",
            "treatment_outcome",
        }:

            department_data = (
                calculate_department_performance(
                    patients
                )
            )

    generated_at = get_current_ist()

    create_audit_log(
        current_user,
        "OPERATIONAL_REPORT_GENERATED",
        resource=report_input.report_type,
        details={
            "report_type": report_input.report_type,
            "department": report_input.department,
            "records": len(patients),
        },
    )

    return {
        "report_type": report_input.report_type,

        "report_title": (
            report_input.report_type
            .replace("_", " ")
            .title()
        ),

        "generated_by": {
            "name": current_user.get(
                "name",
                "N/A",
            ),
            "role": current_user.get(
                "role",
                "N/A",
            ),
        },

        "generated_at": (
            generated_at.isoformat()
        ),

        "department": report_input.department,

        **statistics,

        "departments": department_data,

        "patients": [],
    }


# =========================================================
# OPERATIONAL REPORT PDF
# DOCTOR + HOSPITAL ADMIN
# =========================================================

@router.post("/api/reports/operational/pdf")
def download_operational_report_pdf(
    report_input: OperationalReportInput,
    current_user: dict = Depends(
        require_roles(
            "Doctor",
            "Hospital Administrator",
        )
    ),
):

    # -----------------------------------------------------
    # VALIDATE REPORT TYPE
    # -----------------------------------------------------

    allowed_report_types = {
        "patient_outcome",
        "treatment_followup",
        "readmission",
        "hospital_performance",
        "department_performance",
        "treatment_outcome",
    }

    if (
        report_input.report_type
        not in allowed_report_types
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid operational report type.",
        )

    role = current_user["role"]

    # -----------------------------------------------------
    # DOCTOR RESTRICTIONS
    # -----------------------------------------------------

    if (
        role == "Doctor"
        and report_input.report_type
        in {
            "hospital_performance",
            "department_performance",
        }
    ):

        raise HTTPException(
            status_code=403,
            detail=(
                "Doctors can only generate "
                "patient-level operational reports."
            ),
        )

    # -----------------------------------------------------
    # PATIENT-LEVEL REPORT
    # -----------------------------------------------------

    patient_level_reports = {
        "patient_outcome",
        "treatment_followup",
        "readmission",
        "treatment_outcome",
    }

    selected_patient = None

    if report_input.report_type in patient_level_reports:

        if not report_input.patient_id:

            raise HTTPException(
                status_code=400,
                detail="Please select a patient.",
            )

        selected_patient = (
            get_selected_operational_patient(
                current_user,
                report_input.patient_id,
            )
        )

        # -------------------------------------------------
        # DOCTOR DATE / STATUS VALIDATION
        # -------------------------------------------------

        if role == "Doctor":

            if not report_input.start_date:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Please select a start date "
                        "for the patient report."
                    ),
                )

            if not report_input.end_date:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Please select an end date "
                        "for the patient report."
                    ),
                )

            if (
                report_input.start_date
                > report_input.end_date
            ):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Start date cannot be later "
                        "than end date."
                    ),
                )

            if not report_input.current_status:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Please provide the patient's "
                        "current status."
                    ),
                )

    # -----------------------------------------------------
    # GET PATIENTS
    # -----------------------------------------------------

    patients = get_operational_patients(
        current_user,
        report_input.department,
    )

    # -----------------------------------------------------
    # DEPARTMENT PERFORMANCE
    # -----------------------------------------------------

    department_data = []

    if role == "Hospital Administrator":

        if report_input.report_type in {
            "hospital_performance",
            "department_performance",
            "treatment_outcome",
        }:

            department_data = (
                calculate_department_performance(
                    patients
                )
            )

    # -----------------------------------------------------
    # CREATE PDF
    # -----------------------------------------------------

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=35,
        leftMargin=35,
        topMargin=35,
        bottomMargin=35,
    )

    styles = getSampleStyleSheet()

    title_style = styles["Title"]
    title_style.alignment = TA_CENTER

    heading_style = styles["Heading2"]
    normal_style = styles["BodyText"]

    elements = []

    # =====================================================
    # TITLE
    # =====================================================

    elements.append(
        Paragraph(
            "HealthForecast AI",
            title_style,
        )
    )

    elements.append(
        Spacer(1, 8)
    )

    report_title = (
        report_input.report_type
        .replace("_", " ")
        .title()
    )

    elements.append(
        Paragraph(
            report_title,
            heading_style,
        )
    )

    elements.append(
        Spacer(1, 15)
    )

    # =====================================================
    # REPORT INFORMATION
    # =====================================================

    report_info = [
        [
            "Generated By",
            current_user.get(
                "name",
                "N/A",
            ),
        ],
        [
            "Role",
            current_user.get(
                "role",
                "N/A",
            ),
        ],
    ]

    # -----------------------------------------------------
    # HOSPITAL ADMIN DEPARTMENT
    # -----------------------------------------------------

    if role == "Hospital Administrator":

        report_info.append(
            [
                "Department",
                report_input.department
                or "All Departments",
            ]
        )

    # -----------------------------------------------------
    # DOCTOR REPORT DETAILS
    # -----------------------------------------------------

    if role == "Doctor":

        report_info.append(
            [
                "Patient",
                (
                    selected_patient.get(
                        "name",
                        "N/A",
                    )
                    if selected_patient
                    else "N/A"
                ),
            ]
        )

        report_info.append(
            [
                "From Date",
                report_input.start_date
                or "N/A",
            ]
        )

        report_info.append(
            [
                "To Date",
                report_input.end_date
                or "N/A",
            ]
        )

        report_info.append(
            [
                "Current Status",
                report_input.current_status
                or "N/A",
            ]
        )

    # -----------------------------------------------------
    # GENERATED TIME
    # -----------------------------------------------------

    report_info.append(
        [
            "Generated On",
            get_current_ist().strftime(
                "%Y-%m-%d %I:%M %p IST"
            ),
        ]
    )

    info_table = Table(
        report_info,
        colWidths=[
            150,
            330,
        ],
    )

    info_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold",
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    elements.append(
        info_table
    )

    elements.append(
        Spacer(1, 20)
    )

    # =====================================================
    # PATIENT-LEVEL PDF
    # NO OPERATIONAL SUMMARY
    # =====================================================

    if selected_patient:

        treatment = selected_patient.get(
            "treatment_plan",
            {},
        )

        doctor_id = selected_patient.get(
            "doctor_id"
        )

        doctor = None

        if doctor_id:

            try:

                doctor = users_collection.find_one(
                    {
                        "_id": ObjectId(doctor_id)
                    }
                )

            except Exception:

                doctor = None

        # -------------------------------------------------
        # PATIENT INFORMATION
        # -------------------------------------------------

        elements.append(
            Paragraph(
                "Patient Information",
                heading_style,
            )
        )

        patient_data = [
            [
                "Information",
                "Details",
            ],
            [
                "Patient Name",
                str(
                    selected_patient.get(
                        "name",
                        "N/A",
                    )
                ),
            ],
            [
                "Age",
                str(
                    selected_patient.get(
                        "age",
                        "N/A",
                    )
                ),
            ],
            [
                "Disease",
                str(
                    selected_patient.get(
                        "disease",
                        "N/A",
                    )
                ),
            ],
            [
                "Risk Level",
                str(
                    selected_patient.get(
                        "risk",
                        "N/A",
                    )
                ),
            ],
            [
                "Current Status",
                (
                    report_input.current_status
                    if role == "Doctor"
                    and report_input.current_status
                    else str(
                        selected_patient.get(
                            "status",
                            "N/A",
                        )
                    )
                ),
            ],
            [
                "Doctor",
                (
                    doctor.get(
                        "name",
                        "N/A",
                    )
                    if doctor
                    else "N/A"
                ),
            ],
            [
                "Department",
                (
                    doctor.get(
                        "department",
                        "N/A",
                    )
                    if doctor
                    else "N/A"
                ),
            ],
        ]

        patient_table = Table(
            patient_data,
            colWidths=[
                200,
                280,
            ],
        )

        patient_table.setStyle(
            TableStyle(
                [
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.grey,
                    ),
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.lightgrey,
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold",
                    ),
                    (
                        "FONTNAME",
                        (0, 1),
                        (0, -1),
                        "Helvetica-Bold",
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "TOP",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                ]
            )
        )

        elements.append(
            patient_table
        )

        elements.append(
            Spacer(1, 20)
        )

        # -------------------------------------------------
        # TREATMENT INFORMATION
        # -------------------------------------------------

        elements.append(
            Paragraph(
                "Treatment & Follow-up Information",
                heading_style,
            )
        )

        treatment_data = [
            [
                "Item",
                "Details",
            ],
            [
                "Diagnosis",
                str(
                    treatment.get(
                        "diagnosis",
                        "N/A",
                    )
                ),
            ],
            [
                "Medicines",
                str(
                    treatment.get(
                        "medicines",
                        "N/A",
                    )
                ),
            ],
            [
                "Doctor Recommendations",
                str(
                    treatment.get(
                        "doctor_recommendations",
                        "N/A",
                    )
                ),
            ],
            [
                "Follow-up Date",
                str(
                    treatment.get(
                        "follow_up_date",
                        "N/A",
                    )
                ),
            ],
        ]

        treatment_table = Table(
            treatment_data,
            colWidths=[
                200,
                280,
            ],
        )

        treatment_table.setStyle(
            TableStyle(
                [
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.grey,
                    ),
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.lightgrey,
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold",
                    ),
                    (
                        "FONTNAME",
                        (0, 1),
                        (0, -1),
                        "Helvetica-Bold",
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "TOP",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                ]
            )
        )

        elements.append(
            treatment_table
        )

    # =====================================================
    # HOSPITAL ADMIN DEPARTMENT PERFORMANCE
    # =====================================================

    if department_data:

        elements.append(
            Spacer(1, 20)
        )

        elements.append(
            Paragraph(
                "Department Performance",
                heading_style,
            )
        )

        department_table_data = [
            [
                "Department",
                "Doctors",
                "Patients",
                "High Risk",
                "Readmitted",
                "Treatments",
                "Follow-ups",
            ]
        ]

        for item in department_data:

            department_table_data.append(
                [
                    str(
                        item.get(
                            "department",
                            "N/A",
                        )
                    ),

                    str(
                        item.get(
                            "doctor_count",
                            0,
                        )
                    ),

                    str(
                        item.get(
                            "patient_count",
                            0,
                        )
                    ),

                    str(
                        item.get(
                            "high_risk",
                            0,
                        )
                    ),

                    str(
                        item.get(
                            "readmitted_patients",
                            0,
                        )
                    ),

                    str(
                        item.get(
                            "treatment_plans",
                            0,
                        )
                    ),

                    str(
                        item.get(
                            "follow_ups",
                            0,
                        )
                    ),
                ]
            )

        department_table = Table(
            department_table_data,
            colWidths=[
                115,
                55,
                60,
                60,
                65,
                65,
                60,
            ],
            repeatRows=1,
        )

        department_table.setStyle(
            TableStyle(
                [
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.grey,
                    ),
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.lightgrey,
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold",
                    ),
                    (
                        "ALIGN",
                        (1, 1),
                        (-1, -1),
                        "CENTER",
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "TOP",
                    ),
                    (
                        "FONTSIZE",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                ]
            )
        )

        elements.append(
            department_table
        )

    # =====================================================
    # FOOTER
    # =====================================================

    elements.append(
        Spacer(1, 25)
    )

    elements.append(
        Paragraph(
            "Generated by HealthForecast AI",
            normal_style,
        )
    )

    # =====================================================
    # BUILD PDF
    # =====================================================

    document.build(
        elements
    )

    buffer.seek(0)

    # =====================================================
    # AUDIT LOG
    # =====================================================

    create_audit_log(
        current_user,
        "OPERATIONAL_REPORT_PDF_GENERATED",
        resource=report_input.report_type,
        details={
            "department": (
                report_input.department
            ),
            "patient_id": (
                report_input.patient_id
            ),
            "start_date": (
                report_input.start_date
            ),
            "end_date": (
                report_input.end_date
            ),
            "current_status": (
                report_input.current_status
            ),
        },
    )

    # =====================================================
    # RESPONSE
    # =====================================================

    filename = (
        f"{report_input.report_type}"
        "_operational_report.pdf"
    )

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        },
    )