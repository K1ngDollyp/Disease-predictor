import React, { useState, useEffect } from 'react';
import SymptomSelector from './components/SymptomSelector';
import PredictionResult from './components/PredictionResult';
import { Activity, Heart, RefreshCw, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';

export default function App() {
  const [availableSymptoms, setAvailableSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [predictionResult, setPredictionResult] = useState(null);
  
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available symptoms list from backend on mount
  useEffect(() => {
    async function fetchSymptoms() {
      try {
        setIsLoadingSymptoms(true);
        const response = await fetch(`${API_BASE_URL}/symptoms`);
        if (!response.ok) {
          throw new Error('Failed to load symptoms list from server.');
        }
        const data = await response.json();
        setAvailableSymptoms(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching symptoms:', err);
        setError('Could not connect to the backend server. Please verify the backend is running.');
      } finally {
        setIsLoadingSymptoms(false);
      }
    }
    fetchSymptoms();
  }, []);

  const handleSelectSymptom = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleRemoveSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setPredictionResult(null);
    setError(null);
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) return;
    
    try {
      setIsPredicting(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: selectedSymptoms }),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Prediction failed.');
      }
      
      const data = await response.json();
      setPredictionResult(data);
    } catch (err) {
      console.error('Error during prediction:', err);
      setError(err.message || 'An unexpected error occurred during prediction.');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      
      {/* Container */}
      <div className="max-w-4xl w-full mx-auto space-y-8 flex-grow">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-2xl shadow-inner animate-pulse">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-teal-300">
            AI-Powered Disease Predictor
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto font-medium">
            Select the symptoms you are experiencing to receive an AI-based prognosis and confidence scores.
          </p>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-300 animate-fadeIn">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* Main Interface Grid */}
        <main className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Selector */}
          <section className="md:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Heart className="h-5 w-5 text-sky-400" />
              Symptom Evaluation
            </h2>
            
            {isLoadingSymptoms ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <RefreshCw className="h-8 w-8 text-sky-500 animate-spin" />
                <span className="text-sm text-slate-400">Loading valid symptoms...</span>
              </div>
            ) : (
              <SymptomSelector
                availableSymptoms={availableSymptoms}
                selectedSymptoms={selectedSymptoms}
                onSelectSymptom={handleSelectSymptom}
                onRemoveSymptom={handleRemoveSymptom}
              />
            )}

            {/* Action Buttons */}
            {!isLoadingSymptoms && (
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={selectedSymptoms.length === 0 || isPredicting}
                  className="flex-grow py-3 px-6 rounded-xl font-bold bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700/50 border border-transparent text-white transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isPredicting ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Analyzing Symptoms...
                    </>
                  ) : (
                    'Predict Disease'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={selectedSymptoms.length === 0 && !predictionResult}
                  className="py-3 px-5 rounded-xl font-bold border border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-slate-800/40"
                  title="Reset Selection"
                >
                  Reset
                </button>
              </div>
            )}
          </section>

          {/* Right Panel: Result */}
          <section className="md:col-span-5">
            {predictionResult ? (
              <PredictionResult result={predictionResult} />
            ) : (
              <div className="h-full flex items-center justify-center p-8 bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl text-slate-500 text-center py-16">
                <div className="space-y-3">
                  <Activity className="h-10 w-10 mx-auto text-slate-600 stroke-[1.5]" />
                  <p className="text-sm">
                    Select symptoms and click Predict to view diagnosis confidence and recommendations.
                  </p>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-600 font-medium">
        <p>© 2026 AI Disease Predictor App. Built with FastAPI & React.</p>
      </footer>
    </div>
  );
}
