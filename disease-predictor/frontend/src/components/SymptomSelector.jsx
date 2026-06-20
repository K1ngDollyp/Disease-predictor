import React, { useState } from 'react';

// Formatter to convert snake_case (e.g., muscle_wasting) to Title Case (e.g., Muscle Wasting)
export const formatSymptomName = (name) => {
  if (!name) return '';
  return name
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function SymptomSelector({ 
  availableSymptoms, 
  selectedSymptoms, 
  onSelectSymptom, 
  onRemoveSymptom 
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filter symptoms matching search query that aren't already selected
  const filtered = availableSymptoms.filter(s => {
    const readable = formatSymptomName(s).toLowerCase();
    const technical = s.toLowerCase();
    const query = search.toLowerCase();
    const notSelected = !selectedSymptoms.includes(s);
    return (readable.includes(query) || technical.includes(query)) && notSelected;
  });

  return (
    <div className="space-y-6">
      {/* Search Input Box */}
      <div className="relative">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          1. Find and Add Your Symptoms
        </label>
        <div className="relative">
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm"
            placeholder="Search symptoms (e.g., fever, headache, cough)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
        </div>

        {/* Dropdown Options */}
        {isOpen && search && (
          <div className="absolute z-20 mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-900">
            {filtered.length > 0 ? (
              filtered.map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => {
                    onSelectSymptom(symptom);
                    setSearch('');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-xs text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-colors flex items-center justify-between"
                >
                  <span>{formatSymptomName(symptom)}</span>
                  <span className="text-[10px] text-slate-500 hover:text-cyan-400">+ Add</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3.5 text-slate-600 text-xs italic">
                No matching symptoms found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Chips */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            2. Selected Symptoms
          </label>
          <span className="text-xs bg-slate-950 px-2.5 py-0.5 rounded-full font-bold text-cyan-400 border border-slate-800">
            {selectedSymptoms.length}
          </span>
        </div>
        
        {selectedSymptoms.length === 0 ? (
          <div className="p-8 bg-slate-950/20 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-xs">
            Start typing in the search box above to add your symptoms.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/20 border border-slate-850 rounded-xl p-3">
            {selectedSymptoms.map((symptom) => (
              <span
                key={symptom}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/20 border border-cyan-900/30 text-cyan-300 text-xs font-medium"
              >
                {formatSymptomName(symptom)}
                <button
                  type="button"
                  onClick={() => onRemoveSymptom(symptom)}
                  className="text-cyan-500 hover:text-cyan-300 font-bold ml-1 focus:outline-none"
                  title="Remove symptom"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Medical Disclaimer Banner */}
      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
        <span className="text-sm mt-0.5">⚠️</span>
        <div className="space-y-0.5">
          <h5 className="text-xs font-bold text-amber-400/90">Medical Disclaimer</h5>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            This app is a student machine learning project and is not a replacement for professional clinical advice, diagnoses, or treatments.
          </p>
        </div>
      </div>
    </div>
  );
}
