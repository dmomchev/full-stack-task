from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers import login, user
from app.controllers.car import car_routers
from app.startup_bootstrap import lifespan


app = FastAPI(
    title="Car Specification API",
    description="Full-Stack Car Management System with Role-Based Access Control",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(login.router)
app.include_router(user.router)
for router in car_routers:
    app.include_router(router)

@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Car Specification API is running",
        "docs": "/docs"
    }
