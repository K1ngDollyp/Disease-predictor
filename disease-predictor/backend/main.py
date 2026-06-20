import os
import pickle
import numpy as np
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Disease Predictor API",
    description="API to predict diseases based on selected symptoms using a trained ML model.",
    version="1.0.0"
)

# Enable CORS for frontend communication
# Allow localhost:5173 for Vite Dev server by default, or read from environment
origins = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Disease Predictor API.",
        "endpoints": {
            "predict": "POST /predict",
            "symptoms": "GET /symptoms",
            "documentation": "/docs"
        }
    }

# Global variables for model, label encoder, and symptom headers
model = None
label_encoder = None
symptoms_list = []
symptom_to_idx = {}

@app.on_event("startup")
def load_ml_assets():
    """Load pickled model, label encoder, and symptoms list on startup."""
    global model, label_encoder, symptoms_list, symptom_to_idx
    
    # Try multiple paths to find assets (running from backend/ or root folder)
    base_dirs = [
        os.path.join(os.path.dirname(__file__), "..", "model"),
        os.path.join(os.getcwd(), "model"),
        os.path.join(os.getcwd(), "disease-predictor", "model")
    ]
    
    model_path = None
    encoder_path = None
    symptoms_path = None
    
    for d in base_dirs:
        m_p = os.path.join(d, "model.pkl")
        e_p = os.path.join(d, "label_encoder.pkl")
        s_p = os.path.join(d, "symptoms.pkl")
        if os.path.exists(m_p) and os.path.exists(e_p) and os.path.exists(s_p):
            model_path = m_p
            encoder_path = e_p
            symptoms_path = s_p
            break
            
    if not model_path:
        raise RuntimeError("ML pickle assets (model.pkl, label_encoder.pkl, symptoms.pkl) could not be found.")
        
    print(f"Loading model from {model_path}...")
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
        
    print(f"Loading label encoder from {encoder_path}...")
    with open(encoder_path, 'rb') as f:
        label_encoder = pickle.load(f)
        
    print(f"Loading symptoms list from {symptoms_path}...")
    with open(symptoms_path, 'rb') as f:
        symptoms_list = pickle.load(f)
        
    # Map symptom names to indices for fast lookup
    symptom_to_idx = {symptom: idx for idx, symptom in enumerate(symptoms_list)}
    print(f"Loaded {len(symptoms_list)} symptoms and {len(label_encoder.classes_)} disease classes.")

# Define Request and Response Models
class PredictRequest(BaseModel):
    symptoms: List[str] = Field(
        ..., 
        description="List of symptom names selected by the user",
        example=["itching", "skin_rash", "nodal_skin_eruptions"]
    )

class DiseaseConfidence(BaseModel):
    disease: str
    confidence: float

class PredictResponse(BaseModel):
    prediction: str
    confidence: float
    top_3: List[DiseaseConfidence]

@app.post("/predict", response_model=PredictResponse, status_code=status.HTTP_200_OK)
def predict_disease(request: PredictRequest):
    """
    Predict the most likely disease based on input symptoms.
    
    - Accepts a list of symptom strings
    - Maps them to a 132-length binary array matching the ML model's trained columns
    - Runs prediction and returns the top predicted class and the top 3 options with confidence scores.
    """
    if not model or not label_encoder or not symptoms_list:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="Machine learning model is not loaded."
        )
        
    if not request.symptoms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one symptom must be selected."
        )
        
    # Construct binary feature vector
    # 0 = symptom absent, 1 = present
    feature_vector = np.zeros(len(symptoms_list))
    
    invalid_symptoms = []
    for symptom in request.symptoms:
        if symptom in symptom_to_idx:
            feature_vector[symptom_to_idx[symptom]] = 1
        else:
            invalid_symptoms.append(symptom)
            
    # If all input symptoms are invalid and none matched
    if len(invalid_symptoms) == len(request.symptoms):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"None of the provided symptoms are valid. Invalid: {invalid_symptoms}"
        )

    # Reshape for scikit-learn model input (1, 132)
    feature_vector = feature_vector.reshape(1, -1)
    
    try:
        # Get probability distribution across all 42 classes
        probabilities = model.predict_proba(feature_vector)[0]
        
        # Sort indices by probability in descending order
        top_indices = np.argsort(probabilities)[::-1]
        
        # Build top 3 list
        top_3_list = []
        for idx in top_indices[:3]:
            disease_name = label_encoder.classes_[idx]
            confidence = float(probabilities[idx])
            top_3_list.append(DiseaseConfidence(disease=disease_name, confidence=confidence))
            
        # Primary prediction is the top 1
        primary_disease = top_3_list[0].disease
        primary_confidence = top_3_list[0].confidence
        
        return PredictResponse(
            prediction=primary_disease,
            confidence=primary_confidence,
            top_3=top_3_list
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error running prediction model: {str(e)}"
        )

@app.get("/symptoms", response_model=List[str])
def get_symptoms_list():
    """Retrieve the full list of 132 valid symptom names."""
    if not symptoms_list:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="Symptoms list is not loaded."
        )
    return symptoms_list
