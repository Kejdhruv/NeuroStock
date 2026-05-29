from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
import traceback
import os

import tensorflow as tf
tf.config.run_functions_eagerly(False)
tf.get_logger().setLevel('ERROR')

app = FastAPI(title="NeuroStock Predictor")

default_origins = [
    "http://localhost:3003",
    "http://127.0.0.1:3003",
    "https://neuro-stock.vercel.app",
]

configured_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", os.getenv("FRONTEND_ORIGIN", "")).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_origins or default_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# Pydantic Request Models
# ------------------------
class TimeRow(BaseModel):
    date: Optional[str] = None
    open: float
    high: float
    low: float
    close: float

class PredictInput(BaseModel):
    timeseries: List[TimeRow]
    meta: Optional[dict] = None

# ------------------------
# Load Model Once (FAST)
# ------------------------
MODEL_PATH = Path(__file__).with_name("model.pkl")
model = None

@app.on_event("startup")
def load_model():
    global model
    try:
        if MODEL_PATH.exists():
            model = joblib.load(MODEL_PATH)
            if hasattr(model, "compile"):
                model.compile(run_eagerly=False)
            print("[INFO] Model loaded FAST mode.")
        else:
            print(f"[WARN] Model not found at {MODEL_PATH}.")
            model = None
    except Exception:
        traceback.print_exc()
        model = None

@app.get("/")
def root():
    return {"service": "neurostock-prediction", "status": "ok"}

@app.get("/health")
def health():
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded.",
        )

    return {
        "status": "ok",
        "model_loaded": True,
    }

@app.post("/predict")
def predict(payload: PredictInput):
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded.")

        closes = np.array([t.close for t in payload.timeseries], dtype=float)

        if len(closes) < 100:
            raise HTTPException(status_code=400, detail="Need at least 100 rows.")

        closes = closes[-100:]  # Last 100 closes

        # Scaling
        y_min = closes.min()
        y_max = closes.max()
        if y_max == y_min:
            y_max += 1
        scaled = (closes - y_min) / (y_max - y_min)

        # LSTM input
        X = scaled.reshape(1, 100, 1)

        # Predict next 1 day (fast)
        scaled_pred = float(model.predict(X, verbose=0)[0][0])
        real_pred = scaled_pred * (y_max - y_min) + y_min

        # -----------------------------
        # Predict NEXT 10 days (FAST LOOP)
        # -----------------------------
        rolling = scaled.copy().reshape(100, 1)

        next_scaled = []
        next_real = []

        for _ in range(10):
            X_roll = rolling.reshape(1, 100, 1)

            sp = float(model.predict(X_roll, verbose=0)[0][0])
            rp = sp * (y_max - y_min) + y_min

            next_scaled.append(sp)
            next_real.append(rp)

            # FAST sliding-window update (no array reallocation)
            rolling[:-1] = rolling[1:]
            rolling[-1] = sp

        return {
            "scaled_prediction": scaled_pred,
            "real_price_prediction": real_pred,
            "next_10_scaled_predictions": next_scaled,
            "next_10_real_predictions": next_real,
            "y_min_used": float(y_min),
            "y_max_used": float(y_max),
            "status": "fast_mode_success",
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
