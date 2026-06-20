import React from 'react';

export default function PredictionResult({ result }) {
  if (!result) return null;

  const { prediction, confidence, description, top_5 } = result;
  
  // Format probability (e.g. 0.85 -> 85.0%)
  const confidencePercent = (confidence * 100).toFixed(1);

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl hover:border-slate-750 transition-all duration-300">
      
      {/* Card Title */}
      <div className="pb-3 border-b border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Diagnosis Report
        </h3>
      </div>

      {/* Main Prediction */}
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            Primary Diagnosis
          </span>
          <h4 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-3">
            {prediction}
          </h4>
        </div>
        
        {/* Definition Description */}
        {description && (
          <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl leading-relaxed">
            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
              {description}
            </p>
          </div>
        )}
        
        {/* Confidence progress indicator */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Prediction Confidence</span>
            <span className="text-emerald-400 font-bold">{confidencePercent}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-850">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top 5 Diseases Grid */}
      <div className="pt-6 border-t border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Top 5 Likely Matches
        </h4>
        
        <div className="space-y-2.5">
          {top_5 && top_5.map((item, index) => {
            const pct = (item.confidence * 100).toFixed(1);
            return (
              <div 
                key={item.disease} 
                className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl text-xs hover:border-slate-700 hover:bg-slate-950/60 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-slate-900 text-[10px] font-bold text-slate-400 border border-slate-800">
                    {index + 1}
                  </span>
                  <span className="text-slate-200 font-semibold">
                    {item.disease}
                  </span>
                </div>
                <span className="text-slate-300 font-extrabold">
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
