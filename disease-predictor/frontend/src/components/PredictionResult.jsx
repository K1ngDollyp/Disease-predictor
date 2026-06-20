import React from 'react';
import { ShieldCheck, Percent, Award, AlertCircle } from 'lucide-react';

export default function PredictionResult({ result }) {
  if (!result) return null;

  const { prediction, confidence, description, top_3 } = result;
  const primaryConfidencePercent = (confidence * 100).toFixed(1);

  return (
    <div className="w-full bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
        <ShieldCheck className="h-6 w-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-slate-100">Prediction Results</h2>
      </div>

      {/* Primary Prediction */}
      <div className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Primary Diagnosis
        </span>
        <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-2">
          {prediction}
        </h3>
        
        {description && (
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-slate-850">
            {description}
          </p>
        )}
        
        {/* Confidence Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-medium">Confidence Score</span>
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              {primaryConfidencePercent}% <Percent className="h-3 w-3" />
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${primaryConfidencePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top 3 Likely Diseases */}
      <div className="space-y-4 pt-4 border-t border-slate-700/50">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Award className="h-4 w-4 text-brand-400" />
          Top 3 Most Likely Diseases
        </h4>
        
        <div className="space-y-3">
          {top_3.map((item, index) => {
            const pct = (item.confidence * 100).toFixed(1);
            return (
              <div 
                key={item.disease} 
                className="flex items-center justify-between p-3.5 bg-slate-800 border border-slate-700/60 rounded-xl hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    index === 0 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-200 text-sm md:text-base">
                    {item.disease}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-sm ${
                    index === 0 ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Information Warning */}
      <div className="flex items-start gap-2.5 p-3.5 bg-sky-950/20 border border-sky-800/30 rounded-xl">
        <AlertCircle className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
        <p className="text-xs text-sky-300/80 leading-normal">
          AI predictions are based on statistical training data. If you are experiencing severe symptoms, please visit a doctor or seek immediate emergency care.
        </p>
      </div>
    </div>
  );
}
