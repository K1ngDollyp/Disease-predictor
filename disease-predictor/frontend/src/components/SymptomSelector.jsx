import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, AlertTriangle, Plus, Check } from 'lucide-react';

// Format helper: convert snake_case symptom names into Title Case
export const formatSymptomName = (name) => {
  if (!name) return '';
  return name
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available symptoms based on search query
  const filteredSymptoms = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];
    
    return availableSymptoms.filter(symptom => {
      const readable = formatSymptomName(symptom).toLowerCase();
      const technical = symptom.toLowerCase();
      const isSelected = selectedSymptoms.includes(symptom);
      return (readable.includes(query) || technical.includes(query)) && !isSelected;
    });
  }, [searchQuery, availableSymptoms, selectedSymptoms]);

  const handleSelect = (symptom) => {
    onSelectSymptom(symptom);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-full space-y-6">
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Search and Add Symptoms
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-lg backdrop-blur-sm"
            placeholder="Type symptoms (e.g. fever, rash, itching)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isDropdownOpen && searchQuery && (
          <div className="absolute z-10 mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-700/50 backdrop-blur-md">
            {filteredSymptoms.length > 0 ? (
              filteredSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => handleSelect(symptom)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-700/50 transition-colors flex items-center justify-between text-slate-200"
                >
                  <span>{formatSymptomName(symptom)}</span>
                  <Plus className="h-4 w-4 text-sky-400" />
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-slate-400 text-sm">
                No matching symptoms found or already selected
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Symptoms Chips */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <span>Selected Symptoms</span>
          <span className="px-2 py-0.5 text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-full font-bold">
            {selectedSymptoms.length}
          </span>
        </h3>
        
        {selectedSymptoms.length === 0 ? (
          <div className="text-center py-6 px-4 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl text-slate-400 text-sm">
            No symptoms selected yet. Start typing above to select symptoms.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map((symptom) => (
              <span
                key={symptom}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-sm font-medium animate-fadeIn transition-all duration-200 hover:border-sky-400"
              >
                {formatSymptomName(symptom)}
                <button
                  type="button"
                  onClick={() => onRemoveSymptom(symptom)}
                  className="text-sky-400 hover:text-sky-200 focus:outline-none transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Medical Disclaimer */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-amber-300">Medical Disclaimer</h4>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            This application is powered by an artificial intelligence model and is intended for informational/educational purposes only. It does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for clinical assessments.
          </p>
        </div>
      </div>
    </div>
  );
}
