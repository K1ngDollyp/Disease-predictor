# AI-Powered Disease Prediction Web Application

This is a full-stack web application that predicts a disease based on the symptoms selected by the user. It uses a machine learning classifier trained on the "Disease Prediction Using Machine Learning" dataset from Kaggle.

## Project Structure

```
disease-predictor/
├── model/
│   ├── train.py           # ML training and evaluation script
│   ├── model.pkl          # Pickled best-performing model (Random Forest)
│   ├── label_encoder.pkl  # Pickled target label encoder
│   ├── symptoms.pkl       # Pickled symptoms columns list
│   ├── Training.csv       # Training dataset
│   └── Testing.csv        # Testing dataset
├── backend/
│   ├── main.py            # FastAPI backend server
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment configuration
└── frontend/
    ├── src/
    │   ├── App.jsx        # Main application layout
    │   └── components/
    │       ├── SymptomSelector.jsx  # Searchable symptom dropdown and chips
    │       └── PredictionResult.jsx # Visual prediction dashboard
    ├── tailwind.config.js # Tailwind CSS configuration
    └── package.json       # React frontend dependencies
```

---

## 1. Machine Learning Model Training (Optional)

The model is already pre-trained during initial setup. However, to retrain the model, follow these steps:

1. Navigate to the `model/` directory:
   ```bash
   cd disease-predictor/model
   ```
2. Install dependencies:
   ```bash
   pip install pandas scikit-learn
   ```
3. Run the training script:
   ```bash
   python train.py
   ```
   This trains and compares 5 different classifiers (Random Forest, Logistic Regression, Gradient Boosting, SVM, Decision Tree), logs their F1/accuracy metrics, and saves the best performing classifier as `model.pkl`.

---

## 2. Backend Setup (FastAPI)

1. Navigate to the `backend/` directory:
   ```bash
   cd disease-predictor/backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend API will run on `http://127.0.0.1:8000`. You can view the interactive documentation at `http://127.0.0.1:8000/docs`.

---

## 3. Frontend Setup (React + Tailwind CSS)

1. Navigate to the `frontend/` directory:
   ```bash
   cd disease-predictor/frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser to view the application.

---

## Technical Highlights

- **Dynamic Search & Formatting**: The system features a responsive, searchable list of 132 symptoms. The technical names (e.g. `muscle_wasting`) are dynamically mapped and formatted into human-readable Title Case (e.g. `Muscle Wasting`) for a premium user experience.
- **Ordered Mapping**: The frontend sends a clean list of selected symptoms to the backend. The backend maps the symptoms to a 132-length binary feature vector using `symptoms.pkl`, guaranteeing that the features align exactly with the columns order used during ML training.
- **Top 3 Confidence Outputs**: Uses the model's `predict_proba` function to yield the top 3 most likely diagnoses and their confidence percentages in a ranked visual display.
