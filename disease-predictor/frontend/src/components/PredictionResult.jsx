import React from 'react';

export default function PredictionResult({ result }) {
  if (!result) return null;

  const { prediction, confidence, description, top_5 } = result;
  
  // Format probability (e.g. 0.85 -> 85.0%)
  const confidencePercent = (confidence * 100).toFixed(1);

  return (
    <div className="w-full bg-slate-800 border border-slate-700/80 rounded-2xl p-6 space-y-6 shadow-xl">
      
      {/* Card Title */}
      <div className="pb-3 border-b border-slate-700/60">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          Diagnosis Report
        </h3>
      </div>

      {/* Main Prediction */}
      <div className="space-y-3.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            Primary Predicted Disease
          </span>
          <h4 className="text-2xl font-extrabold text-white tracking-tight mt-2.5">
            {prediction}
          </h4>
        </div>
        
        {/* Definition Description */}
        {description && (
          <div className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl leading-relaxed">
            <p className="text-xs text-slate-300 font-medium">
              {description}
            </p>
          </div>
        )}
        
        {/* Confidence progress indicator */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Prediction Confidence</span>
            <span className="text-emerald-400 font-bold">{confidencePercent}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top 5 Diseases Grid */}
      <div className="pt-5 border-t border-slate-700/60 space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Top 5 Likely Matches
        </h4>
        
        <div className="space-y-2">
          {top_5 && top_5.map((item, index) => {
            const pct = (item.confidence * 100).toFixed(1);
            return (
              <div 
                key={item.disease} 
                className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-700/40 rounded-xl text-xs hover:border-slate-600 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 border border-slate-700">
                    {index + 1}
                  </span>
                  <span className="text-slate-200 font-medium">
                    {item.disease}
                  </span>
                </div>
                <span className="text-slate-300 font-bold">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
