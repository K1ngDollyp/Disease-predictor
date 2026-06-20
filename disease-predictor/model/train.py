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
from sklearn.metrics import accuracy_score, f1_score

def main():
    # Downlading the files from github urls if we do not have them
    train_url = "https://raw.githubusercontent.com/parthsompura/Disease-prediction-using-Machine-Learning/master/Training.csv"
    test_url = "https://raw.githubusercontent.com/parthsompura/Disease-prediction-using-Machine-Learning/master/Testing.csv"
    
    if not os.path.exists("Training.csv"):
        print("Downloading training csv file...")
        urllib.request.urlretrieve(train_url, "Training.csv")
    if not os.path.exists("Testing.csv"):
        print("Downloading testing csv file...")
        urllib.request.urlretrieve(test_url, "Testing.csv")

    # Load data using pandas
    print("Loading datasets...")
    train_data = pd.read_csv("Training.csv")
    test_data = pd.read_csv("Testing.csv")

    # print dataset shape to check
    print("Train shape:", train_data.shape)
    print("Test shape:", test_data.shape)

    # Clean data (remove unnamed last column if it exists in the csv)
    if "Unnamed: 133" in train_data.columns:
        print("Dropping Unnamed: 133 column from training set")
        train_data = train_data.drop("Unnamed: 133", axis=1)
    if "Unnamed: 133" in test_data.columns:
        print("Dropping Unnamed: 133 column from testing set")
        test_data = test_data.drop("Unnamed: 133", axis=1)

    # Check for missing values
    print("Missing values in train:", train_data.isnull().sum().sum())
    print("Missing values in test:", test_data.isnull().sum().sum())

    # Get features (X) and targets (y)
    # The last column is 'prognosis' which is the disease name
    X_train = train_data.drop("prognosis", axis=1)
    y_train = train_data["prognosis"]
    X_test = test_data.drop("prognosis", axis=1)
    y_test = test_data["prognosis"]

    # Save symptoms list to use in backend
    symptoms = list(X_train.columns)
    pickle.dump(symptoms, open("symptoms.pkl", "wb"))
    print("Symptoms list saved to symptoms.pkl")

    # Encode disease names to numbers
    print("Encoding target variable...")
    encoder = LabelEncoder()
    y_train_enc = encoder.fit_transform(y_train)
    y_test_enc = encoder.transform(y_test)

    # Save encoder to decode predictions later
    pickle.dump(encoder, open("label_encoder.pkl", "wb"))
    print("LabelEncoder saved to label_encoder.pkl")

    # 1. Random Forest Classifier
    print("\nTraining Random Forest...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train_enc)
    rf_preds = rf_model.predict(X_test)
    rf_acc = accuracy_score(y_test_enc, rf_preds)
    rf_f1 = f1_score(y_test_enc, rf_preds, average='weighted')
    print("Random Forest Accuracy:", rf_acc)

    # 2. Logistic Regression
    print("\nTraining Logistic Regression...")
    lr_model = LogisticRegression(max_iter=1000, random_state=42)
    lr_model.fit(X_train, y_train_enc)
    lr_preds = lr_model.predict(X_test)
    lr_acc = accuracy_score(y_test_enc, lr_preds)
    lr_f1 = f1_score(y_test_enc, lr_preds, average='weighted')
    print("Logistic Regression Accuracy:", lr_acc)

    # 3. Gradient Boosting Classifier
    print("\nTraining Gradient Boosting...")
    gb_model = GradientBoostingClassifier(random_state=42)
    gb_model.fit(X_train, y_train_enc)
    gb_preds = gb_model.predict(X_test)
    gb_acc = accuracy_score(y_test_enc, gb_preds)
    gb_f1 = f1_score(y_test_enc, gb_preds, average='weighted')
    print("Gradient Boosting Accuracy:", gb_acc)

    # 4. Support Vector Machine
    print("\nTraining Support Vector Machine...")
    svm_model = SVC(probability=True, kernel='rbf', random_state=42)
    svm_model.fit(X_train, y_train_enc)
    svm_preds = svm_model.predict(X_test)
    svm_acc = accuracy_score(y_test_enc, svm_preds)
    svm_f1 = f1_score(y_test_enc, svm_preds, average='weighted')
    print("SVM Accuracy:", svm_acc)

    # 5. Decision Tree Classifier
    print("\nTraining Decision Tree...")
    dt_model = DecisionTreeClassifier(max_depth=10, random_state=42)
    dt_model.fit(X_train, y_train_enc)
    dt_preds = dt_model.predict(X_test)
    dt_acc = accuracy_score(y_test_enc, dt_preds)
    dt_f1 = f1_score(y_test_enc, dt_preds, average='weighted')
    print("Decision Tree Accuracy:", dt_acc)

    # Comparison printout
    print("\n--- Model Results Comparison ---")
    print(f"Random Forest Accuracy: {rf_acc:.4f}, F1: {rf_f1:.4f}")
    print(f"Logistic Regression Accuracy: {lr_acc:.4f}, F1: {lr_f1:.4f}")
    print(f"Gradient Boosting Accuracy: {gb_acc:.4f}, F1: {gb_f1:.4f}")
    print(f"SVM Accuracy: {svm_acc:.4f}, F1: {svm_f1:.4f}")
    print(f"Decision Tree Accuracy: {dt_acc:.4f}, F1: {dt_f1:.4f}")

    # Random Forest is the best, save it
    print("\nSaving the best model (Random Forest)...")
    pickle.dump(rf_model, open("model.pkl", "wb"))
    print("Saved model.pkl successfully!")

if __name__ == "__main__":
    main()
