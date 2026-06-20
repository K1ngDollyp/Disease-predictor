import React, { useState, useEffect } from 'react';
import SymptomSelector from './components/SymptomSelector';
import PredictionResult from './components/PredictionResult';

// Read API URL from environment variables or use port 8080 fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';

export default function App() {
  // state for all symptoms loaded from API
  const [availableSymptoms, setAvailableSymptoms] = useState([]);
  // state for symptoms selected by user
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  // state for prediction results returned by backend
  const [result, setResult] = useState(null);
  
  // states for loaders and errors
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load all symptoms on startup
  useEffect(() => {
    fetch(`${API_URL}/symptoms`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Could not load symptoms list.");
        }
        return res.json();
      })
      .then((data) => {
        setAvailableSymptoms(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg("Failed to connect to the backend server. Make sure it is running.");
        setLoading(false);
      });
  }, []);

  // When user selects a symptom
  const handleAddSymptom = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  // When user removes a symptom
  const handleRemoveSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
  };

  // Reset all fields
  const handleReset = () => {
    setSelectedSymptoms([]);
    setResult(null);
    setErrorMsg(null);
  };

  // call the prediction api
  const handlePredict = () => {
    if (selectedSymptoms.length === 0) return;

    setPredicting(true);
    setErrorMsg(null);

    fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms: selectedSymptoms }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.detail || "Prediction failed.");
          });
        }
        return res.json();
      })
      .then((data) => {
        setResult(data);
        setPredicting(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg(err.message || "An error occurred.");
        setPredicting(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="text-center py-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            AI Disease Predictor System
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Student SIWES Project - Machine Learning Diagnosis System
          </p>
        </header>

        {/* Show error banner if connection fails */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 p-3 rounded-lg text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Input Panel */}
          <div className="bg-slate-800 border border-slate-700/80 rounded-lg p-5 space-y-5">
            <h2 className="text-md font-bold text-slate-200 border-b border-slate-700 pb-2">
              Select Symptoms
            </h2>
            
            {loading ? (
              <div className="text-center py-10 text-xs text-slate-400">
                Loading symptoms list...
              </div>
            ) : (
              <SymptomSelector
                availableSymptoms={availableSymptoms}
                selectedSymptoms={selectedSymptoms}
                onSelectSymptom={handleAddSymptom}
                onRemoveSymptom={handleRemoveSymptom}
              />
            )}

            {/* Actions */}
            {!loading && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={selectedSymptoms.length === 0 || predicting}
                  className="flex-grow py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-bold text-sm transition-colors"
                >
                  {predicting ? "Analyzing..." : "Predict Disease"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div>
            {result ? (
              <PredictionResult result={result} />
            ) : (
              <div className="p-10 border border-slate-800 border-dashed rounded-lg text-center text-slate-500 text-xs py-16">
                Please select symptoms and run the prediction to show results.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
