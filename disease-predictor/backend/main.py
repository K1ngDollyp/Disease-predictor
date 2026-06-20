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

# Dictionary containing descriptions/definitions for all 41 diseases in the dataset
DISEASE_DEFINITIONS = {
    "Fungal infection": "An inflammatory skin condition caused by a fungus, typically leading to itching, redness, and scaling.",
    "Allergy": "An immune system reaction to a foreign substance (allergen) that is typically harmless to most people.",
    "GERD": "Gastroesophageal Reflux Disease is a chronic digestive condition where stomach acid flows back into the food pipe, irritating the lining.",
    "Chronic cholestasis": "A liver condition characterized by a sustained reduction or stoppage of bile flow.",
    "Drug Reaction": "An adverse, unintended reaction of the body to a medication or therapeutic drug.",
    "Peptic ulcer diseae": "Sores that develop on the inner lining of the stomach, lower esophagus, or small intestine.",
    "AIDS": "Acquired Immunodeficiency Syndrome is a chronic, potentially life-threatening condition caused by the Human Immunodeficiency Virus (HIV).",
    "Diabetes ": "A group of metabolic disorders characterized by high blood sugar levels over a prolonged period.",
    "Gastroenteritis": "Inflammation of the stomach and intestines caused by viral, bacterial, or parasitic infections, leading to diarrhea and vomiting.",
    "Bronchial Asthma": "A chronic inflammatory disease of the airways causing airway narrowing, coughing, wheezing, and shortness of breath.",
    "Hypertension ": "High blood pressure, a common condition where the long-term force of blood against artery walls can lead to heart disease.",
    "Migraine": "A neurological condition characterized by intense, throbbing headaches, often accompanied by nausea and sensitivity to light/sound.",
    "Cervical spondylosis": "Age-related wear and tear affecting the spinal disks and joints in the neck.",
    "Paralysis (brain hemorrhage)": "Loss of muscle function in parts of the body caused by bleeding inside the brain (a hemorrhagic stroke).",
    "Jaundice": "A yellowing of the skin and eyes caused by high bilirubin levels in the blood, indicating liver or gallbladder dysfunction.",
    "Malaria": "A serious, sometimes fatal mosquito-borne disease caused by Plasmodium parasites.",
    "Chicken pox": "A highly contagious viral infection causing an itchy, blister-like rash on the skin.",
    "Dengue": "A mosquito-borne viral disease causing high fever, severe headache, joint/muscle pain, and rash.",
    "Typhoid": "A bacterial infection caused by Salmonella typhi, leading to high fever, diarrhea, and vomiting.",
    "hepatitis A": "A highly contagious, food/water-borne liver infection caused by the hepatitis A virus.",
    "Hepatitis B": "A serious liver infection caused by the hepatitis B virus, spread through contact with infectious body fluids.",
    "Hepatitis C": "An infectious liver disease caused by the hepatitis C virus, primarily spread through blood-to-blood contact.",
    "Hepatitis D": "A liver disease caused by the hepatitis D virus, which only occurs in people who are already infected with Hepatitis B.",
    "Hepatitis E": "A liver infection caused by the hepatitis E virus, usually self-limiting and transmitted through contaminated water.",
    "Alcoholic hepatitis": "Liver inflammation caused by drinking excessive amounts of alcohol over a long period.",
    "Tuberculosis": "A potentially serious infectious bacterial disease that mainly affects the lungs, spread through airborne droplets.",
    "Common Cold": "A viral infectious disease of the upper respiratory tract that primarily affects the nose and throat.",
    "Pneumonia": "An infection that inflames the air sacs in one or both lungs, which may fill with fluid or pus.",
    "Dimorphic hemmorhoids(piles)": "Swollen and inflamed veins in the anus and lower rectum, which can cause discomfort, pain, and bleeding.",
    "Heart attack": "A medical emergency where the flow of blood to the heart muscle suddenly becomes blocked, damaging the tissue.",
    "Varicose veins": "Gnarled, enlarged veins, most commonly appearing in the legs and feet, caused by weak or damaged vein valves.",
    "Hypothyroidism": "A condition where the thyroid gland does not produce enough thyroid hormones, leading to fatigue, weight gain, and depression.",
    "Hyperthyroidism": "The overproduction of thyroid hormones by the thyroid gland, which can accelerate the body's metabolism.",
    "Hypoglycemia": "A condition characterized by an abnormally low level of blood sugar (glucose), the body's main energy source.",
    "Osteoarthristis": "The most common form of arthritis, characterized by the gradual wear and tear of protective joint cartilage.",
    "Arthritis": "Inflammation of one or more joints, causing pain, stiffness, and decreased range of motion.",
    "(vertigo) Paroymsal  Positional Vertigo": "A disorder of the inner ear characterized by short, sudden episodes of spinning sensations triggered by head movements.",
    "Acne": "A common skin condition that occurs when hair follicles become plugged with oil and dead skin cells, causing pimples.",
    "Urinary tract infection": "An infection in any part of the urinary system, including kidneys, ureters, bladder, and urethra.",
    "Psoriasis": "A skin disease that causes red, itchy, scaly patches, most commonly on the knees, elbows, trunk, and scalp.",
    "Impetigo": "A highly contagious bacterial skin infection that causes red sores, particularly on the face.",
}

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
    description: str
    top_5: List[DiseaseConfidence]

@app.post("/predict", response_model=PredictResponse, status_code=status.HTTP_200_OK)
def predict_disease(request: PredictRequest):
    """
    Predict the most likely disease based on input symptoms.
    
    - Accepts a list of symptom strings
    - Maps them to a 132-length binary array matching the ML model's trained columns
    - Runs prediction and returns the top predicted class and the top 5 options with confidence scores.
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
        
        # Build top 5 list
        top_5_list = []
        for idx in top_indices[:5]:
            disease_name = label_encoder.classes_[idx]
            confidence = float(probabilities[idx])
            top_5_list.append(DiseaseConfidence(disease=disease_name, confidence=confidence))
            
        # Primary prediction is the top 1
        primary_disease = top_5_list[0].disease
        primary_confidence = top_5_list[0].confidence
        
        # Get description
        description = DISEASE_DEFINITIONS.get(
            primary_disease,
            "No definition available for this disease."
        )
        
        return PredictResponse(
            prediction=primary_disease,
            confidence=primary_confidence,
            description=description,
            top_5=top_5_list
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
