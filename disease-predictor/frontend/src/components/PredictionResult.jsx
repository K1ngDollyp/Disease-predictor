import React from 'react';

export default function PredictionResult({ result }) {
  // If we don't have results yet, don't show anything
  if (!result) return null;

  const { prediction, confidence, description, top_5 } = result;
  
  // Convert 0.32 to 32.0%
  const confidencePercent = (confidence * 100).toFixed(1);

  return (
    <div className="w-full bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6 shadow-md">
      
      {/* Title */}
      <div className="pb-3 border-b border-slate-700">
        <h3 className="text-lg font-bold text-slate-100">Prediction Results</h3>
      </div>

      {/* Main prognosis prediction */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
          Main Diagnosis
        </span>
        <h4 className="text-xl font-bold text-white mt-1">
          {prediction}
        </h4>
        
        {/* Description / Definition */}
        {description && (
          <p className="text-xs text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 leading-relaxed">
            {description}
          </p>
        )}
        
        {/* Progress bar showing confidence */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Confidence</span>
            <span className="font-semibold text-emerald-400">{confidencePercent}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top 5 list */}
      <div className="pt-4 border-t border-slate-700 space-y-3">
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Top 5 Likely Diseases
        </h5>
        
        <div className="space-y-2">
          {top_5 && top_5.map((item, index) => {
            const pct = (item.confidence * 100).toFixed(1);
            return (
              <div 
                key={item.disease} 
                className="flex items-center justify-between p-2.5 bg-slate-900/30 border border-slate-700/50 rounded-lg text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">
                    {index + 1}.
                  </span>
                  <span className="text-slate-200 font-medium">
                    {item.disease}
                  </span>
                </div>
                <span className="text-emerald-400 font-semibold">
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
