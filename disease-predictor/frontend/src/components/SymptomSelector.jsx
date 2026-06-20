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
    <div className="space-y-5">
      {/* Search Input Box */}
      <div className="relative">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          1. Find and Add Your Symptoms
        </label>
        <div className="relative">
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
            placeholder="Type here to search (e.g., fever, headache, rash)..."
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
          <div className="absolute z-20 mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-800">
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
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  + {formatSymptomName(symptom)}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-slate-500 text-xs italic">
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
          <span className="text-xs bg-slate-800 px-2.5 py-0.5 rounded-full font-bold text-cyan-400 border border-slate-700/60">
            {selectedSymptoms.length}
          </span>
        </div>
        
        {selectedSymptoms.length === 0 ? (
          <div className="p-6 bg-slate-900/40 border border-dashed border-slate-750 rounded-xl text-center text-slate-500 text-xs">
            Start typing in the search box above to add your symptoms.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
            {selectedSymptoms.map((symptom) => (
              <span
                key={symptom}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-800/40 text-cyan-300 text-xs font-medium"
              >
                {formatSymptomName(symptom)}
                <button
                  type="button"
                  onClick={() => onRemoveSymptom(symptom)}
                  className="text-cyan-500 hover:text-cyan-300 font-bold ml-0.5 focus:outline-none"
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
      <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-2.5">
        <span className="text-sm mt-0.5">⚠️</span>
        <div className="space-y-0.5">
          <h5 className="text-xs font-bold text-amber-400/90">Medical Warning</h5>
          <p className="text-[11px] text-amber-300/70 leading-relaxed">
            This app is a student machine learning project and is not a replacement for professional clinical advice, diagnoses, or treatments.
          </p>
        </div>
      </div>
    </div>
  );
}
