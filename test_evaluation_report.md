# SIWES Project System Evaluation Report

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
| 1 | Itching, Skin Rash, Nodal Skin Eruptions, Dischromic  Patches | Fungal infection | Fungal infection | 100.0% | ✅ PASS |
| 2 | Continuous Sneezing, Shivering, Chills, Watering From Eyes | Allergy | Allergy | 100.0% | ✅ PASS |
| 3 | Stomach Pain, Acidity, Ulcers On Tongue, Vomiting, Cough, Chest Pain | GERD | GERD | 100.0% | ✅ PASS |
| 4 | Itching, Vomiting, Yellowish Skin, Nausea, Loss Of Appetite, Abdominal Pain, Yellowing Of Eyes | Chronic cholestasis | Chronic cholestasis | 100.0% | ✅ PASS |
| 5 | Itching, Skin Rash, Stomach Pain, Burning Micturition, Spotting  Urination | Drug Reaction | Drug Reaction | 100.0% | ✅ PASS |
| 6 | Vomiting, Indigestion, Loss Of Appetite, Abdominal Pain, Passage Of Gases, Internal Itching | Peptic ulcer diseae | Peptic ulcer diseae | 100.0% | ✅ PASS |
| 7 | Muscle Wasting, Patches In Throat, High Fever, Extra Marital Contacts | AIDS | AIDS | 100.0% | ✅ PASS |
| 8 | Fatigue, Weight Loss, Restlessness, Lethargy, Irregular Sugar Level, Blurred And Distorted Vision, Obesity, Excessive Hunger, Increased Appetite, Polyuria | Diabetes  | Diabetes  | 100.0% | ✅ PASS |
| 9 | Vomiting, Sunken Eyes, Dehydration, Diarrhoea | Gastroenteritis | Gastroenteritis | 100.0% | ✅ PASS |
| 10 | Fatigue, Cough, High Fever, Breathlessness, Family History, Mucoid Sputum | Bronchial Asthma | Bronchial Asthma | 100.0% | ✅ PASS |
| 11 | Headache, Chest Pain, Dizziness, Loss Of Balance, Lack Of Concentration | Hypertension  | Hypertension  | 100.0% | ✅ PASS |
| 12 | Acidity, Indigestion, Headache, Blurred And Distorted Vision, Excessive Hunger, Stiff Neck, Depression, Irritability, Visual Disturbances | Migraine | Migraine | 100.0% | ✅ PASS |
| 13 | Back Pain, Weakness In Limbs, Neck Pain, Dizziness, Loss Of Balance | Cervical spondylosis | Cervical spondylosis | 100.0% | ✅ PASS |
| 14 | Vomiting, Headache, Weakness Of One Body Side, Altered Sensorium | Paralysis (brain hemorrhage) | Paralysis (brain hemorrhage) | 100.0% | ✅ PASS |
| 15 | Itching, Vomiting, Fatigue, Weight Loss, High Fever, Yellowish Skin, Dark Urine, Abdominal Pain | Jaundice | Jaundice | 100.0% | ✅ PASS |
| 16 | Chills, Vomiting, High Fever, Sweating, Headache, Nausea, Diarrhoea, Muscle Pain | Malaria | Malaria | 100.0% | ✅ PASS |
| 17 | Itching, Skin Rash, Fatigue, Lethargy, High Fever, Headache, Loss Of Appetite, Mild Fever, Swelled Lymph Nodes, Malaise, Red Spots Over Body | Chicken pox | Chicken pox | 100.0% | ✅ PASS |
| 18 | Skin Rash, Chills, Joint Pain, Vomiting, Fatigue, High Fever, Headache, Nausea, Loss Of Appetite, Pain Behind The Eyes, Back Pain, Malaise, Muscle Pain, Red Spots Over Body | Dengue | Dengue | 100.0% | ✅ PASS |
| 19 | Chills, Vomiting, Fatigue, High Fever, Headache, Nausea, Constipation, Abdominal Pain, Diarrhoea, Toxic Look (Typhos), Belly Pain | Typhoid | Typhoid | 100.0% | ✅ PASS |
| 20 | Joint Pain, Vomiting, Yellowish Skin, Dark Urine, Nausea, Loss Of Appetite, Abdominal Pain, Diarrhoea, Mild Fever, Yellowing Of Eyes, Muscle Pain | hepatitis A | hepatitis A | 100.0% | ✅ PASS |
| 21 | Itching, Fatigue, Lethargy, Yellowish Skin, Dark Urine, Loss Of Appetite, Abdominal Pain, Yellow Urine, Yellowing Of Eyes, Malaise, Receiving Blood Transfusion, Receiving Unsterile Injections | Hepatitis B | Hepatitis B | 100.0% | ✅ PASS |
| 22 | Fatigue, Yellowish Skin, Nausea, Loss Of Appetite, Yellowing Of Eyes, Family History | Hepatitis C | Hepatitis C | 100.0% | ✅ PASS |
| 23 | Joint Pain, Vomiting, Fatigue, Yellowish Skin, Dark Urine, Nausea, Loss Of Appetite, Abdominal Pain, Yellowing Of Eyes | Hepatitis D | Hepatitis D | 100.0% | ✅ PASS |
| 24 | Joint Pain, Vomiting, Fatigue, High Fever, Yellowish Skin, Dark Urine, Nausea, Loss Of Appetite, Abdominal Pain, Yellowing Of Eyes, Acute Liver Failure, Coma, Stomach Bleeding | Hepatitis E | Hepatitis E | 100.0% | ✅ PASS |
| 25 | Vomiting, Yellowish Skin, Abdominal Pain, Swelling Of Stomach, Distention Of Abdomen, History Of Alcohol Consumption, Fluid Overload.1 | Alcoholic hepatitis | Alcoholic hepatitis | 100.0% | ✅ PASS |

## Summary Metrics

* **Total Test Cases Executed**: 25
* **Successful Matches (PASS)**: 25
* **Failed Matches (FAIL)**: 0
* **Evaluation Accuracy**: **100.0%**

### Conclusion
The machine learning model correctly classified 25 out of 25 test patient records successfully, demonstrating a test accuracy of 100.0%. The backend properly constructs the symptom feature vectors and executes predictions on live serverless endpoints without failures.
