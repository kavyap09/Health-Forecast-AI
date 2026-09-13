from fastapi import APIRouter, Depends, HTTPException
from auth import require_roles
from shared import *
from datetime import datetime

router = APIRouter()


# ============================================================
# RESEARCH ANALYTICS
# ============================================================

@router.get("/api/research/analytics")
def research_analytics(
    current_user: dict = Depends(
        require_roles(
            "Healthcare Researcher",
            "System Administrator",
            "Hospital Administrator",
        )
    ),
):
    patients = list(
        patients_collection.find()
    )

    total_patients = len(patients)

    age_groups = {
        "0-18": 0,
        "19-40": 0,
        "41-60": 0,
        "61+": 0,
    }

    risk_distribution = {
        "LOW": 0,
        "MEDIUM": 0,
        "HIGH": 0,
    }

    status_distribution = {}

    disease_distribution = {}

    readmission_count = 0

    treatment_count = 0

    follow_up_count = 0

    for patient in patients:

        # ----------------------------------------------------
        # AGE
        # ----------------------------------------------------

        age = patient.get("age")

        if age is not None:

            if age <= 18:
                age_groups["0-18"] += 1

            elif age <= 40:
                age_groups["19-40"] += 1

            elif age <= 60:
                age_groups["41-60"] += 1

            else:
                age_groups["61+"] += 1

        # ----------------------------------------------------
        # RISK
        # ----------------------------------------------------

        risk = str(
            patient.get("risk", "")
        ).upper()

        if risk in risk_distribution:
            risk_distribution[risk] += 1

        # ----------------------------------------------------
        # STATUS
        # ----------------------------------------------------

        status = str(
            patient.get("status", "Unknown")
        )

        status_distribution[status] = (
            status_distribution.get(status, 0) + 1
        )

        # ----------------------------------------------------
        # DISEASE
        # ----------------------------------------------------

        disease = str(
            patient.get("disease", "Unknown")
        )

        disease_distribution[disease] = (
            disease_distribution.get(disease, 0) + 1
        )

        # ----------------------------------------------------
        # READMISSION
        # ----------------------------------------------------

        readmission_value = str(
            patient.get("readmission", "")
        ).lower()

        if readmission_value in [
            "yes",
            "true",
            "1",
            "<30",
            "readmitted",
        ]:
            readmission_count += 1

        # ----------------------------------------------------
        # TREATMENT / FOLLOW-UP
        # ----------------------------------------------------

        if patient.get("treatment_plan"):
            treatment_count += 1

        if patient.get("follow_up_date"):
            follow_up_count += 1

    return {
        "total_records": total_patients,

        "age_distribution": age_groups,

        "risk_distribution": risk_distribution,

        "status_distribution": status_distribution,

        "disease_distribution": disease_distribution,

        "readmission_count": readmission_count,

        "treatment_count": treatment_count,

        "follow_up_count": follow_up_count,

        "population_statistics": {
            "total_population": total_patients,
            "age_groups": age_groups,
            "risk_groups": risk_distribution,
        },
    }


# ============================================================
# POPULATION HEALTH STATISTICS
# ============================================================

@router.get("/api/research/population-health")
def population_health(
    current_user: dict = Depends(
        require_roles(
            "Healthcare Researcher",
            "System Administrator",
        )
    ),
):

    patients = list(
        patients_collection.find()
    )

    total = len(patients)

    age_distribution = {
        "0-18": 0,
        "19-40": 0,
        "41-60": 0,
        "61+": 0,
    }

    disease_distribution = {}

    risk_distribution = {
        "LOW": 0,
        "MEDIUM": 0,
        "HIGH": 0,
    }

    for patient in patients:

        age = patient.get("age")

        if age is not None:

            if age <= 18:
                age_distribution["0-18"] += 1

            elif age <= 40:
                age_distribution["19-40"] += 1

            elif age <= 60:
                age_distribution["41-60"] += 1

            else:
                age_distribution["61+"] += 1

        disease = str(
            patient.get("disease", "Unknown")
        )

        disease_distribution[disease] = (
            disease_distribution.get(disease, 0) + 1
        )

        risk = str(
            patient.get("risk", "")
        ).upper()

        if risk in risk_distribution:
            risk_distribution[risk] += 1

    return {
        "total_population": total,
        "age_distribution": age_distribution,
        "disease_distribution": disease_distribution,
        "risk_distribution": risk_distribution,
    }


# ============================================================
# READMISSION TRENDS
# ============================================================

@router.get("/api/research/readmission-trends")
def readmission_trends(
    current_user: dict = Depends(
        require_roles(
            "Healthcare Researcher",
            "System Administrator",
        )
    ),
):

    patients = list(
        patients_collection.find()
    )

    total = len(patients)

    readmitted = 0

    not_readmitted = 0

    readmission_distribution = {}

    for patient in patients:

        value = str(
            patient.get("readmission", "")
        ).strip()

        normalized = value.lower()

        if normalized in [
            "yes",
            "true",
            "1",
            "<30",
            "readmitted",
        ]:
            readmitted += 1

        elif normalized in [
            "no",
            "false",
            "0",
            "not readmitted",
        ]:
            not_readmitted += 1

        if value:
            readmission_distribution[value] = (
                readmission_distribution.get(value, 0) + 1
            )

    rate = (
        (readmitted / total) * 100
        if total > 0
        else 0
    )

    return {
        "total_patients": total,
        "readmitted": readmitted,
        "not_readmitted": not_readmitted,
        "readmission_rate": round(rate, 2),
        "distribution": readmission_distribution,
    }


# ============================================================
# TREATMENT EFFECTIVENESS
# ============================================================

@router.get("/api/research/treatment-effectiveness")
def treatment_effectiveness(
    current_user: dict = Depends(
        require_roles(
            "Healthcare Researcher",
            "System Administrator",
        )
    ),
):

    patients = list(
        patients_collection.find()
    )

    total = len(patients)

    recovered = 0

    under_treatment = 0

    active = 0

    discharged = 0

    follow_up = 0

    status_distribution = {}

    for patient in patients:

        status = str(
            patient.get("status", "Unknown")
        ).strip()

        status_distribution[status] = (
            status_distribution.get(status, 0) + 1
        )

        normalized = status.lower()

        if normalized == "recovered":
            recovered += 1

        elif normalized == "under treatment":
            under_treatment += 1

        elif normalized == "active":
            active += 1

        elif normalized == "discharged":
            discharged += 1

        elif normalized == "follow-up":
            follow_up += 1

    recovery_rate = (
        (recovered / total) * 100
        if total > 0
        else 0
    )

    return {
        "total_patients": total,

        "recovered": recovered,

        "under_treatment": under_treatment,

        "active": active,

        "discharged": discharged,

        "follow_up": follow_up,

        "recovery_rate": round(
            recovery_rate,
            2,
        ),

        "status_distribution": status_distribution,
    }


# ============================================================
# CLINICAL OUTCOMES
# ============================================================

@router.get("/api/research/clinical-outcomes")
def clinical_outcomes(
    current_user: dict = Depends(
        require_roles(
            "Healthcare Researcher",
            "System Administrator",
        )
    ),
):

    patients = list(
        patients_collection.find()
    )

    outcomes = {
        "Recovered": 0,
        "Discharged": 0,
        "Under Treatment": 0,
        "Active": 0,
        "Follow-up": 0,
        "Other": 0,
    }

    for patient in patients:

        status = str(
            patient.get("status", "")
        ).strip()

        if status in outcomes:
            outcomes[status] += 1
        else:
            outcomes["Other"] += 1

    total = len(patients)

    outcome_percentages = {}

    for key, value in outcomes.items():

        outcome_percentages[key] = (
            round(
                (value / total) * 100,
                2,
            )
            if total > 0
            else 0
        )

    return {
        "total_patients": total,
        "outcomes": outcomes,
        "outcome_percentages": outcome_percentages,
    }


# ============================================================
# ANONYMIZED RESEARCH DATASET
# ============================================================

@router.get("/api/research/dataset")
def research_dataset(
    current_user: dict = Depends(
        require_roles(
            "Healthcare Researcher",
            "System Administrator",
        )
    ),
):

    patients = list(
        patients_collection.find()
    )

    anonymized_data = []

    for index, patient in enumerate(patients):

        anonymized_data.append(
            {
                "record_id": f"R-{index + 1:06d}",
                "age": patient.get("age"),
                "disease": patient.get("disease"),
                "risk": patient.get("risk"),
                "status": patient.get("status"),
            }
        )

    return {
        "records": anonymized_data
    }


# ============================================================
# EXPORT RESEARCH DATASET
# ============================================================

@router.get("/api/research/dataset/export")
def export_research_dataset(
    current_user: dict = Depends(
        require_roles(
            "Healthcare Researcher",
            "System Administrator",
        )
    ),
):

    patients = list(
        patients_collection.find()
    )

    records = []

    for index, patient in enumerate(patients):

        records.append(
            {
                "record_id": f"R-{index + 1:06d}",
                "age": patient.get("age"),
                "disease": patient.get("disease"),
                "risk": patient.get("risk"),
                "status": patient.get("status"),
            }
        )

    create_audit_log(
        current_user,
        "RESEARCH_DATA_EXPORT",
        details={
            "records": len(records)
        },
    )

    return {
        "records": records
    }