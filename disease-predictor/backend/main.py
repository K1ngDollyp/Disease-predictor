import os
import pickle
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

# Load env variables from .env file
load_dotenv()

app = FastAPI()

# Enable CORS so React can connect
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the pickle models directly on startup
# We use simple relative paths to find them in the model folder
try:
    print("Loading models from pickle files...")
    model = pickle.load(open("../model/model.pkl", "rb"))
    label_encoder = pickle.load(open("../model/label_encoder.pkl", "rb"))
    symptoms_list = pickle.load(open("../model/symptoms.pkl", "rb"))
    print("Models loaded successfully!")
except Exception as e:
    print("Error loading models:", e)
    # Try current directory path if running directly in the model directory
    model = pickle.load(open("model.pkl", "rb"))
    label_encoder = pickle.load(open("label_encoder.pkl", "rb"))
    symptoms_list = pickle.load(open("symptoms.pkl", "rb"))

# Disease descriptions dictionary
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
    "Hepatitis D": "A liver disease caused by the hepatitis D virus, which only occurs in people who are also infected with Hepatitis B.",
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

# Request and Response schemas
class PredictRequest(BaseModel):
    symptoms: List[str]

class DiseaseConfidence(BaseModel):
    disease: str
    confidence: float

class PredictResponse(BaseModel):
    prediction: str
    confidence: float
    description: str
    top_5: List[DiseaseConfidence]

@app.get("/")
def home():
    return {"message": "API is working!"}

@app.get("/symptoms")
def get_symptoms():
    # Just return the symptoms list we loaded
    return symptoms_list

@app.post("/predict", response_model=PredictResponse)
def predict(data: PredictRequest):
    # check if we got symptoms
    if not data.symptoms:
        raise HTTPException(status_code=400, detail="Please select at least one symptom")

    # Create the 132-length 0/1 array
    input_vector = []
    for symptom in symptoms_list:
        if symptom in data.symptoms:
            input_vector.append(1)
        else:
            input_vector.append(0)

    # Convert to numpy array and reshape for prediction
    final_input = np.array(input_vector).reshape(1, -1)

    try:
        # Get probability scores for all classes
        probabilities = model.predict_proba(final_input)[0]
        diseases = label_encoder.classes_

        # Combine diseases and scores in a list
        all_predictions = []
        for i in range(len(diseases)):
            all_predictions.append({
                "disease": diseases[i],
                "confidence": float(probabilities[i])
            })

        # Sort the predictions list by confidence descending
        # standard python sort is easier than np.argsort
        all_predictions.sort(key=lambda x: x["confidence"], reverse=True)

        # Get top 5 predictions
        top_5 = all_predictions[:5]

        # Get prediction and confidence
        prediction_disease = top_5[0]["disease"]
        prediction_confidence = top_5[0]["confidence"]

        # Get description
        description = DISEASE_DEFINITIONS.get(prediction_disease, "No definition found.")

        # Return response matching the schema
        return {
            "prediction": prediction_disease,
            "confidence": prediction_confidence,
            "description": description,
            "top_5": top_5
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
