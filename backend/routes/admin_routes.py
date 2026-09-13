from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from bson import ObjectId
import bcrypt

import shared
from auth import require_roles
from shared import (
    users_collection,
    datasets_collection,
    audit_logs_collection,
    create_audit_log,
    SYSTEM_ADMIN_EMAIL,
    is_system_admin_email,
    CreateAdminUser,
)

router = APIRouter()


@router.get("/api/admin/users")
def get_all_users(
    current_user: dict = Depends(
        require_roles("System Administrator")
    )
):
    users = list(
        users_collection.find().sort("created_at", 1)
    )

    result = []

    for user in users:
        created_at = user.get("created_at")

        if created_at:
            try:
                created_at = created_at.isoformat()
            except AttributeError:
                created_at = str(created_at)

        result.append({
            "id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "role": user.get("role", ""),
            "department": user.get("department"),
            "created_at": created_at,
        })

    if not any(
        user["email"].lower() == SYSTEM_ADMIN_EMAIL.lower()
        for user in result
    ):
        result.insert(
            0,
            {
                "id": "system-admin",
                "name": "System Administrator",
                "email": SYSTEM_ADMIN_EMAIL,
                "role": "System Administrator",
                "department": None,
                "created_at": None,
            },
        )

    return {
        "total_users": len(result),
        "users": result,
    }


@router.post("/api/admin/users")
def create_user(
    user: CreateAdminUser,
    current_user: dict = Depends(
        require_roles("System Administrator")
    )
):
    allowed_roles = {
        "Doctor",
        "Hospital Administrator",
        "Healthcare Researcher",
    }

    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid user role.",
        )

    email = str(user.email).lower().strip()

    if is_system_admin_email(email):
        raise HTTPException(
            status_code=400,
            detail="The System Administrator account cannot be created here.",
        )

    existing_user = users_collection.find_one({
        "email": email
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists.",
        )

    department = None

    if user.role == "Doctor":
        department = (
            user.department.strip()
            if user.department
            else None
        )

        if not department:
            raise HTTPException(
                status_code=400,
                detail="Department is required for Doctor accounts.",
            )

    password = user.password.strip()

    if not password:
        raise HTTPException(
            status_code=400,
            detail="Password is required.",
        )

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")

    user_data = {
        "name": user.name.strip(),
        "email": email,
        "password": hashed_password,
        "role": user.role,
        "department": department,
        "created_at": datetime.now(timezone.utc),
    }

    result = users_collection.insert_one(user_data)

    create_audit_log(
        current_user,
        "ADMIN_USER_CREATED",
        resource="user",
        details={
            "created_user_id": str(result.inserted_id),
            "email": email,
            "role": user.role,
            "department": department,
        },
    )

    return {
        "message": "User created successfully.",
        "user_id": str(result.inserted_id),
    }


@router.patch("/api/admin/users/{user_id}")
def update_user(
    user_id: str,
    user_data: dict,
    current_user: dict = Depends(
        require_roles("System Administrator")
    )
):
    if user_id == "system-admin":
        raise HTTPException(
            status_code=403,
            detail="The System Administrator account cannot be modified.",
        )

    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID.",
        )

    object_id = ObjectId(user_id)

    existing_user = users_collection.find_one({
        "_id": object_id
    })

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    allowed_roles = {
        "Doctor",
        "Hospital Administrator",
        "Healthcare Researcher",
    }

    new_name = str(
        user_data.get(
            "name",
            existing_user.get("name", ""),
        )
    ).strip()

    new_email = str(
        user_data.get(
            "email",
            existing_user.get("email", ""),
        )
    ).lower().strip()

    new_role = user_data.get(
        "role",
        existing_user.get("role"),
    )

    new_department = user_data.get(
        "department",
        existing_user.get("department"),
    )

    if not new_name:
        raise HTTPException(
            status_code=400,
            detail="Name is required.",
        )

    if not new_email:
        raise HTTPException(
            status_code=400,
            detail="Email is required.",
        )

    if new_role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid user role.",
        )

    if is_system_admin_email(new_email):
        raise HTTPException(
            status_code=400,
            detail="This email belongs to the System Administrator account.",
        )

    duplicate_user = users_collection.find_one({
        "email": new_email,
        "_id": {"$ne": object_id},
    })

    if duplicate_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists.",
        )

    if new_role == "Doctor":
        if new_department:
            new_department = str(
                new_department
            ).strip()

        if not new_department:
            raise HTTPException(
                status_code=400,
                detail="Department is required for Doctor accounts.",
            )
    else:
        new_department = None

    update_fields = {
        "name": new_name,
        "email": new_email,
        "role": new_role,
        "department": new_department,
        "updated_at": datetime.now(timezone.utc),
    }

    new_password = user_data.get("password")

    if new_password:
        new_password = str(
            new_password
        ).strip()

        if new_password:
            update_fields["password"] = bcrypt.hashpw(
                new_password.encode("utf-8"),
                bcrypt.gensalt(),
            ).decode("utf-8")

    update_result = users_collection.update_one(
        {"_id": object_id},
        {"$set": update_fields},
    )

    if update_result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    create_audit_log(
        current_user,
        "ADMIN_USER_UPDATED",
        resource="user",
        details={
            "updated_user_id": user_id,
            "email": new_email,
            "role": new_role,
            "department": new_department,
        },
    )

    return {
        "message": "User updated successfully.",
        "user": {
            "id": user_id,
            "name": new_name,
            "email": new_email,
            "role": new_role,
            "department": new_department,
        },
    }


@router.delete("/api/admin/users/{user_id}")
def delete_user(
    user_id: str,
    current_user: dict = Depends(
        require_roles("System Administrator")
    )
):
    if user_id == "system-admin":
        raise HTTPException(
            status_code=403,
            detail="The System Administrator account cannot be deleted.",
        )

    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID.",
        )

    object_id = ObjectId(user_id)

    existing_user = users_collection.find_one({
        "_id": object_id
    })

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    delete_result = users_collection.delete_one({
        "_id": object_id
    })

    if delete_result.deleted_count != 1:
        raise HTTPException(
            status_code=500,
            detail="User could not be deleted.",
        )

    create_audit_log(
        current_user,
        "ADMIN_USER_DELETED",
        resource="user",
        details={
            "deleted_user_id": user_id,
            "email": existing_user.get("email"),
            "role": existing_user.get("role"),
            "department": existing_user.get("department"),
        },
    )

    return {
        "message": "User deleted successfully.",
        "user_id": user_id,
    }


@router.get("/api/admin/datasets")
def get_admin_datasets(
    current_user: dict = Depends(
        require_roles("System Administrator")
    )
):
    datasets = list(datasets_collection.find())

    result = []

    for dataset in datasets:
        created_at = dataset.get("created_at")

        if created_at:
            try:
                created_at = created_at.isoformat()
            except AttributeError:
                created_at = str(created_at)

        result.append({
            "id": str(dataset["_id"]),
            "name": dataset.get("name", ""),
            "description": dataset.get("description", ""),
            "source": dataset.get("source", ""),
            "created_at": created_at,
        })

    return {
        "total_datasets": len(result),
        "datasets": result,
    }


@router.get("/api/admin/audit-logs")
def get_admin_audit_logs(
    current_user: dict = Depends(
        require_roles("System Administrator")
    )
):
    # --------------------------------------------------
    # GET AUDIT LOGS FROM LAST 7 DAYS ONLY
    # --------------------------------------------------

    from datetime import timedelta

    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)

    logs = list(
        audit_logs_collection.find({
            "created_at": {
                "$gte": seven_days_ago,
                "$lte": now,
            }
        })
        .sort("created_at", -1)
    )

    result = []

    for log in logs:
        created_at = log.get("created_at")

        if created_at:
            try:
                created_at = created_at.isoformat()
            except AttributeError:
                created_at = str(created_at)

        result.append({
            "_id": str(log["_id"]),
            "action": log.get("action", ""),
            "user_id": log.get("user_id", ""),
            "user_name": log.get("user_name", ""),
            "user_email": log.get("user_email", ""),
            "role": log.get("role", ""),
            "resource": log.get("resource"),
            "details": log.get("details", {}),
            "created_at": created_at,
        })

    return {
        "total_logs": len(result),
        "logs": result,
        "period": "Last 7 days",
    }

@router.get("/api/admin/model")
def admin_model_info(
    current_user: dict = Depends(
        require_roles("System Administrator")
    )
):
    return {
        "model_loaded": shared.readmission_model is not None,
        "threshold": shared.READMISSION_THRESHOLD,
        "features": shared.MODEL_FEATURES,
    }


@router.post("/api/admin/model/reload")
def reload_model(
    current_user: dict = Depends(
        require_roles("System Administrator")
    )
):
    try:
        model_package = shared.joblib.load(
            shared.MODEL_PATH
        )

        shared.readmission_model = model_package["model"]
        shared.READMISSION_THRESHOLD = model_package["threshold"]
        shared.MODEL_FEATURES = model_package["features"]

        create_audit_log(
            current_user,
            "MODEL_RELOADED",
            resource="ai_model",
            details={
                "threshold": shared.READMISSION_THRESHOLD,
                "features": shared.MODEL_FEATURES,
            },
        )

        return {
            "message": "AI model reloaded successfully.",
            "threshold": shared.READMISSION_THRESHOLD,
            "features": shared.MODEL_FEATURES,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reload AI model: {str(e)}",
        )