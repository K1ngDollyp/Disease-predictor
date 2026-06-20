import os
import urllib.request
import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, f1_score, classification_report

# URLs to download the dataset if not already present
TRAIN_URL = "https://raw.githubusercontent.com/parthsompura/Disease-prediction-using-Machine-Learning/master/Training.csv"
TEST_URL = "https://raw.githubusercontent.com/parthsompura/Disease-prediction-using-Machine-Learning/master/Testing.csv"

TRAIN_PATH = "Training.csv"
TEST_PATH = "Testing.csv"

def download_data():
    """Download training and testing CSV files if they are not already present."""
    if not os.path.exists(TRAIN_PATH):
        print(f"Downloading Training.csv from {TRAIN_URL}...")
        urllib.request.urlretrieve(TRAIN_URL, TRAIN_PATH)
    else:
        print("Training.csv already exists.")

    if not os.path.exists(TEST_PATH):
        print(f"Downloading Testing.csv from {TEST_URL}...")
        urllib.request.urlretrieve(TEST_URL, TEST_PATH)
    else:
        print("Testing.csv already exists.")

def main():
    # 1. Download/Load datasets
    download_data()
    
    print("\n--- Loading Datasets ---")
    train_df = pd.read_csv(TRAIN_PATH)
    test_df = pd.read_csv(TEST_PATH)
    
    # 2. Explore dataset
    print(f"Training set shape: {train_df.shape}")
    print(f"Testing set shape: {test_df.shape}")
    
    # Check for missing values
    train_missing = train_df.isnull().sum().sum()
    test_missing = test_df.isnull().sum().sum()
    print(f"Missing values in Training set: {train_missing}")
    print(f"Missing values in Testing set: {test_missing}")
    
    # 3. Clean datasets
    # Drop unnamed column if present (Kaggle dataset sometimes has 'Unnamed: 133')
    unnamed_cols_train = [c for c in train_df.columns if 'Unnamed' in c]
    if unnamed_cols_train:
        print(f"Dropping unnamed columns in Training: {unnamed_cols_train}")
        train_df.drop(columns=unnamed_cols_train, inplace=True)
        
    unnamed_cols_test = [c for c in test_df.columns if 'Unnamed' in c]
    if unnamed_cols_test:
        print(f"Dropping unnamed columns in Testing: {unnamed_cols_test}")
        test_df.drop(columns=unnamed_cols_test, inplace=True)
        
    # Check target class distribution
    print("\nNumber of unique disease classes (prognosis):", train_df['prognosis'].nunique())
    print("\nClass distribution (first 5 classes):")
    print(train_df['prognosis'].value_counts().head(5))
    
    # 4. Separate features and target
    # The last column is 'prognosis', all other columns are symptom features
    X_train = train_df.drop(columns=['prognosis'])
    y_train = train_df['prognosis']
    X_test = test_df.drop(columns=['prognosis'])
    y_test = test_df['prognosis']
    
    # Ensure correct alignment of symptom columns
    symptoms_list = list(X_train.columns)
    print(f"\nNumber of symptom features: {len(symptoms_list)}")
    
    # 5. Target encoding
    print("\nEncoding target variables...")
    le = LabelEncoder()
    y_train_encoded = le.fit_transform(y_train)
    y_test_encoded = le.transform(y_test)
    
    # Save the label encoder
    with open('label_encoder.pkl', 'wb') as f:
        pickle.dump(le, f)
    print("Saved label_encoder.pkl")
    
    # Save the symptoms list (correct column ordering)
    with open('symptoms.pkl', 'wb') as f:
        pickle.dump(symptoms_list, f)
    print("Saved symptoms.pkl")

    # 6. Train and evaluate classifiers
    models = {
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42),
        "Support Vector Machine": SVC(probability=True, kernel='rbf', random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=10, random_state=42)
    }
    
    results = []
    trained_models = {}
    
    print("\n--- Training and Evaluating Models ---")
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train_encoded)
        trained_models[name] = model
        
        # Predict on testing set
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        acc = accuracy_score(y_test_encoded, y_pred)
        f1_weighted = f1_score(y_test_encoded, y_pred, average='weighted')
        f1_macro = f1_score(y_test_encoded, y_pred, average='macro')
        
        results.append({
            "Model": name,
            "Accuracy": acc,
            "Weighted F1": f1_weighted,
            "Macro F1": f1_macro
        })
        
        print(f"{name} Evaluation Report:")
        print(classification_report(y_test_encoded, y_pred, target_names=le.classes_))
        print("-" * 50)
        
    # 7. Print clean comparison table
    results_df = pd.DataFrame(results)
    print("\n--- Model Comparison Table ---")
    print(results_df.to_string(index=False))
    
    # 8. Select and save best performing model
    best_row = results_df.sort_values(by="Accuracy", ascending=False).iloc[0]
    best_model_name = best_row["Model"]
    print(f"\nBest Model selected: {best_model_name} with Accuracy {best_row['Accuracy']:.4f}")
    
    best_model = trained_models[best_model_name]
    with open('model.pkl', 'wb') as f:
        pickle.dump(best_model, f)
    print("Saved model.pkl successfully!")

if __name__ == "__main__":
    main()
