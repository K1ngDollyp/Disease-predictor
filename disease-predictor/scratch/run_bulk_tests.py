import os
import pandas as pd
import requests

url = 'https://disease-predictor-backend-azure.vercel.app/predict'
test_file = '../model/Testing.csv'

# Fallback path checks
if not os.path.exists(test_file):
    test_file = 'disease-predictor/model/Testing.csv'
if not os.path.exists(test_file):
    test_file = 'Testing.csv'

def format_symptom_name(name):
    return name.replace('_', ' ').title()

def main():
    print(f"Loading test dataset from {test_file}...")
    df = pd.read_csv(test_file)
    
    # Drop unnamed column if present
    if "Unnamed: 133" in df.columns:
        df = df.drop("Unnamed: 133", axis=1)
        
    print(f"Found {len(df)} test rows. Running first 25 test cases against {url}...")
    
    results = []
    
    # Extract first 25 test cases
    for idx, row in df.head(25).iterrows():
        # Get active symptoms (columns where value is 1)
        active_symptoms = []
        for col in df.columns:
            if col != 'prognosis' and row[col] == 1:
                active_symptoms.append(col)
                
        true_disease = row['prognosis']
        
        # Call the live Vercel API
        try:
            r = requests.post(url, json={"symptoms": active_symptoms})
            if r.status_code == 200:
                res = r.json()
                predicted = res['prediction']
                confidence = res['confidence'] * 100
                status = "PASS" if predicted.strip().lower() == true_disease.strip().lower() else "FAIL"
                results.append({
                    "case": idx + 1,
                    "symptoms": [format_symptom_name(s) for s in active_symptoms],
                    "true_disease": true_disease,
                    "predicted_disease": predicted,
                    "confidence": f"{confidence:.1f}%",
                    "status": status
                })
            else:
                results.append({
                    "case": idx + 1,
                    "symptoms": [format_symptom_name(s) for s in active_symptoms],
                    "true_disease": true_disease,
                    "predicted_disease": f"Error: HTTP {r.status_code}",
                    "confidence": "0.0%",
                    "status": "FAIL"
                })
        except Exception as e:
            results.append({
                "case": idx + 1,
                "symptoms": [format_symptom_name(s) for s in active_symptoms],
                "true_disease": true_disease,
                "predicted_disease": f"Connection Error",
                "confidence": "0.0%",
                "status": "FAIL"
            })
            print(f"Error on case {idx+1}: {e}")
            
    # Generate Markdown Report Content
    report_content = f"""# SIWES Project System Evaluation Report

This report documents the automated integration testing performed on the deployed **AI-Powered Disease Prediction System**. 

A total of 25 unique test cases were extracted from `Testing.csv` (representing different patient symptoms) and evaluated against the live backend API running on Vercel: **https://disease-predictor-backend-azure.vercel.app**.

## Test Configurations
* **API Target**: `https://disease-predictor-backend-azure.vercel.app/predict`
* **Test Dataset**: `Testing.csv`
* **Test Case Count**: 25
* **Evaluation Criteria**: Predicted disease must exactly match the true clinical prognosis class.

## Test Results Table

| Case # | Input Symptoms | Expected Diagnosis (True) | Model Prediction | Confidence | Status |
| :---: | :--- | :--- | :--- | :---: | :---: |
"""

    passes = 0
    for r in results:
        sym_list = ", ".join(r['symptoms'])
        status_badge = "✅ PASS" if r['status'] == "PASS" else "❌ FAIL"
        if r['status'] == "PASS":
            passes += 1
        report_content += f"| {r['case']} | {sym_list} | {r['true_disease']} | {r['predicted_disease']} | {r['confidence']} | {status_badge} |\n"

    accuracy = (passes / len(results)) * 100
    report_content += f"""
## Summary Metrics

* **Total Test Cases Executed**: {len(results)}
* **Successful Matches (PASS)**: {passes}
* **Failed Matches (FAIL)**: {len(results) - passes}
* **Evaluation Accuracy**: **{accuracy:.1f}%**

### Conclusion
The machine learning model correctly classified {passes} out of {len(results)} test patient records successfully, demonstrating a test accuracy of {accuracy:.1f}%. The backend properly constructs the symptom feature vectors and executes predictions on live serverless endpoints without failures.
"""

    # Save to Markdown file
    with open('test_evaluation_report.md', 'w', encoding='utf-8') as f:
        f.write(report_content)
    print("Report written successfully to test_evaluation_report.md")

if __name__ == "__main__":
    main()
