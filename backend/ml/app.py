from fastapi import FastAPI, HTTPException
import joblib
import numpy as np

app = FastAPI(title="Student Level Predictor")

# Load model and encoders
model = joblib.load("coa_model.pkl")
topic_encoder = joblib.load("topic_encoder.pkl")
level_encoder = joblib.load("level_encoder.pkl")

@app.post("/predict")
def predict_level(data: dict):
    try:
        topic = data["topic"]
        accuracy = float(data["accuracy_percent"])
        avg_time = float(data["avg_time_seconds"])
        attempts = int(data["attempts"])

        topic_encoded = topic_encoder.transform([topic])[0]

        X = np.array([[accuracy, avg_time, attempts, topic_encoded]])

        prediction = model.predict(X)
        level = level_encoder.inverse_transform(prediction)[0]

        return {"predicted_level": level}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
