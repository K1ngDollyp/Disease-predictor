import requests
import json

url = 'http://127.0.0.1:8080/predict'

scenarios = [
    {
        "name": "Scenario 1: Textbook Fungal Infection",
        "symptoms": ["itching", "skin_rash", "nodal_skin_eruptions"]
    },
    {
        "name": "Scenario 2: Textbook Heart Attack",
        "symptoms": ["vomiting", "breathlessness", "sweating", "chest_pain"]
    },
    {
        "name": "Scenario 3: Vague Flu-like Symptoms",
        "symptoms": ["high_fever", "headache", "nausea"]
    },
    {
        "name": "Scenario 4: Highly Unrelated Symptoms",
        "symptoms": ["back_pain", "cough", "itching"]
    }
]

print("--- DISEASE PREDICTOR SCENARIO TEST RESULTS ---\n")

for sc in scenarios:
    print(f"=== {sc['name']} ===")
    print(f"Input Symptoms: {', '.join(sc['symptoms'])}")
    try:
        r = requests.post(url, json={"symptoms": sc['symptoms']})
        if r.status_code == 200:
            res = r.json()
            print(f"Primary Prediction: {res['prediction']} ({res['confidence']*100:.1f}%)")
            print(f"Definition: {res['description']}")
            print("Top 5 Predictions:")
            for idx, item in enumerate(res['top_5']):
                print(f"  {idx+1}. {item['disease']}: {item['confidence']*100:.1f}%")
        else:
            print(f"Error: HTTP {r.status_code} - {r.text}")
    except Exception as e:
        print(f"Connection Error: {e}")
    print("-" * 50 + "\n")
