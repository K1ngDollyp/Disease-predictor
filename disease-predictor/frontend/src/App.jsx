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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-4xl w-full mx-auto space-y-10 flex-grow">
        
        {/* Banner Header */}
        <header className="text-center space-y-3">
          <div className="inline-block px-3 py-1 text-xs font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 rounded-full mb-2">
            SIWES Technical Project
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Disease Prediction System
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
            Diagnose illnesses using machine learning. Select symptoms below to compute model classifications and confidence indices.
          </p>
        </header>

        {/* Connection/Fetch Error banner */}
        {errorMsg && (
          <div className="bg-rose-950/20 border border-rose-800/30 text-rose-300 p-4 rounded-2xl text-xs font-semibold shadow-lg">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Interface Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Input Panel */}
          <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 hover:border-slate-750 transition-all duration-300">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-md font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
                Symptom Diagnostic Input
              </h2>
            </div>
            
            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500 italic">
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
                  className="flex-grow py-3 px-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-cyan-900/10 cursor-pointer disabled:cursor-not-allowed"
                >
                  {predicting ? "Analyzing symptoms..." : "Run Diagnosis"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={selectedSymptoms.length === 0 && !result}
                  className="px-5 py-3 bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-slate-800"
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
              <div className="p-8 border border-slate-850 rounded-2xl text-center text-slate-500 text-xs py-24 bg-slate-900/30">
                <div className="space-y-3">
                  <div className="text-2xl opacity-60">🩺</div>
                  <p className="max-w-xs mx-auto">
                    Select your symptoms on the left and click Run Diagnosis to show model classifications.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-600 font-semibold border-t border-slate-900 pt-6">
        <p>© 2026 Student SIWES Project. Developed with Python, FastAPI, and React.</p>
      </footer>
    </div>
  );
}
