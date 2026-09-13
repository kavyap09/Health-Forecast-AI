from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth_routes import router as auth_router
from routes.patient_routes import router as patient_router
from routes.prediction_routes import router as prediction_router
from routes.treatment_routes import router as treatment_router
from routes.report_routes import router as report_router
from routes.analytics_routes import router as analytics_router
from routes.research_routes import router as research_router
from routes.admin_routes import router as admin_router

app = FastAPI(
    title="HealthForecast AI API",
    description="Hospital Readmission Prediction & Patient Risk Intelligence System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(prediction_router)
app.include_router(treatment_router)
app.include_router(report_router)
app.include_router(analytics_router)
app.include_router(research_router)
app.include_router(admin_router)


@app.get("/")
def home():
    return {
        "message": "HealthForecast AI Backend is running!"
    }


@app.get("/api/health")
def health_check():
    from database.connection import client

    try:
        client.admin.command("ping")

        return {
            "status": "healthy",
            "database": "connected",
            "ml_model": "loaded",
        }

    except Exception as e:
        return {
            "status": "error",
            "database": "disconnected",
            "ml_model": "loaded",
            "message": str(e),
        }