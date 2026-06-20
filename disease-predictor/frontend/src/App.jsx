import React, { useState, useEffect } from 'react';
import SymptomSelector from './components/SymptomSelector';
import PredictionResult from './components/PredictionResult';

// Fallback port 8080 used for the API
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';

export default function App() {
  const [availableSymptoms, setAvailableSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load symptom columns on start
  useEffect(() => {
    fetch(`${API_URL}/symptoms`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Could not fetch symptoms data.");
        }
        return res.json();
      })
      .then((data) => {
        setAvailableSymptoms(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg("Failed to connect to backend server. Please verify it is running.");
        setLoading(false);
      });
  }, []);

  const handleAddSymptom = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleRemoveSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setResult(null);
    setErrorMsg(null);
  };

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
            throw new Error(err.detail || "Prediction request failed.");
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
        setErrorMsg(err.message || "An unexpected error occurred.");
        setPredicting(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-4xl w-full mx-auto space-y-8 flex-grow">
        
        {/* Banner Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            AI-Powered Disease Prediction System
          </h1>
          <p className="text-sm text-slate-400 font-medium max-w-md mx-auto">
            A Machine Learning project mapping symptoms to clinical prognosis models.
          </p>
        </header>

        {/* Connection/Fetch Error banner */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Interface Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Input Panel */}
          <div className="md:col-span-7 bg-slate-800 border border-slate-700/80 rounded-2xl p-6 shadow-lg space-y-6">
            <div className="border-b border-slate-700/60 pb-3">
              <h2 className="text-md font-bold text-slate-200">
                Symptom Diagnostic Input
              </h2>
            </div>
            
            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500">
                Fetching symptoms dictionary...
              </div>
            ) : (
              <SymptomSelector
                availableSymptoms={availableSymptoms}
                selectedSymptoms={selectedSymptoms}
                onSelectSymptom={handleAddSymptom}
                onRemoveSymptom={handleRemoveSymptom}
              />
            )}

            {/* Form actions */}
            {!loading && (
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={selectedSymptoms.length === 0 || predicting}
                  className="flex-grow py-3 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-750 disabled:text-slate-500 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {predicting ? "Analyzing symptoms..." : "Run Diagnosis"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={selectedSymptoms.length === 0 && !result}
                  className="px-5 py-3 bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-slate-750"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Results Display Panel */}
          <div className="md:col-span-5">
            {result ? (
              <PredictionResult result={result} />
            ) : (
              <div className="p-8 border border-slate-800 border-dashed rounded-2xl text-center text-slate-500 text-xs py-20 bg-slate-800/20">
                Select your symptoms on the left and click Run Diagnosis to show model classifications.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-600 font-semibold border-t border-slate-800/40 pt-4">
        <p>© 2026 Student SIWES Project. Developed with Python, FastAPI, and React.</p>
      </footer>
    </div>
  );
}
