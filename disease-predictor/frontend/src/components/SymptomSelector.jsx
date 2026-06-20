import React, { useState } from 'react';

// Help function to format names nicely
export const formatSymptomName = (name) => {
  if (!name) return '';
  // replace underscores with spaces and make it title case
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

  // Filter the list of symptoms based on search term
  // Simple filter checking if the name contains the search text
  const filtered = availableSymptoms.filter(s => {
    const readable = formatSymptomName(s).toLowerCase();
    const matchesSearch = readable.includes(search.toLowerCase()) || s.toLowerCase().includes(search.toLowerCase());
    const notSelected = !selectedSymptoms.includes(s);
    return matchesSearch && notSelected;
  });

  return (
    <div className="space-y-4">
      {/* Search Input Box */}
      <div>
        <label className="block text-sm text-slate-300 mb-1">
          Search Symptoms
        </label>
        <div className="relative">
          <input
            type="text"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            placeholder="Type symptom (e.g. fever, headache)..."
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
          <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((symptom) => (
                <div
                  key={symptom}
                  onClick={() => {
                    onSelectSymptom(symptom);
                    setSearch('');
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-slate-700 text-slate-200 text-sm"
                >
                  {formatSymptomName(symptom)}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-slate-400 text-xs">
                No matching symptoms found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Chips */}
      <div>
        <h4 className="text-sm font-semibold text-slate-300 mb-2">
          Selected Symptoms ({selectedSymptoms.length})
        </h4>
        
        {selectedSymptoms.length === 0 ? (
          <div className="p-4 bg-slate-800/40 border border-slate-700 border-dashed rounded-lg text-center text-slate-400 text-xs">
            No symptoms selected. Search for symptoms above to add them.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map((symptom) => (
              <div
                key={symptom}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold"
              >
                {formatSymptomName(symptom)}
                <button
                  type="button"
                  onClick={() => onRemoveSymptom(symptom)}
                  className="text-sky-400 hover:text-sky-200 font-bold ml-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medical Disclaimer */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <h5 className="text-xs font-bold text-amber-300 mb-1">⚠️ Medical Disclaimer</h5>
        <p className="text-[10px] text-amber-200/80 leading-normal">
          This system is an AI project and is not a clinical diagnosis tool. Please seek a qualified doctor's advice for professional treatment.
        </p>
      </div>
    </div>
  );
}
