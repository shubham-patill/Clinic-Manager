import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertCircle, 
  Check, 
  Trash2, 
  PlusCircle, 
  Info,
  Layers,
  Baby,
  Smile
} from 'lucide-react';

// Standard FDI notation mapping
const ADULT_TEETH = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft:  [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft:  [31, 32, 33, 34, 35, 36, 37, 38],
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41]
};

const PEDIATRIC_TEETH = {
  upperRight: [55, 54, 53, 52, 51],
  upperLeft:  [61, 62, 63, 64, 65],
  lowerLeft:  [71, 72, 73, 74, 75],
  lowerRight: [85, 84, 83, 82, 81]
};

// FDI to Universal number helper
const FDI_TO_UNIVERSAL = {
  18: 1, 17: 2, 16: 3, 15: 4, 14: 5, 13: 6, 12: 7, 11: 8,
  21: 9, 22: 10, 23: 11, 24: 12, 25: 13, 26: 14, 27: 15, 28: 16,
  38: 17, 37: 18, 36: 19, 35: 20, 34: 21, 33: 22, 32: 23, 31: 24,
  41: 25, 42: 26, 43: 27, 44: 28, 45: 29, 46: 30, 47: 31, 48: 32
};

const CONDITIONS = [
  { id: 'Healthy', label: 'Healthy / Sound', color: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-300', bgSoft: 'bg-emerald-50' },
  { id: 'Caries', label: 'Caries / Cavity', color: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-300', bgSoft: 'bg-rose-50' },
  { id: 'Restoration', label: 'Filling / Restored', color: 'bg-sky-500', text: 'text-sky-700', border: 'border-sky-300', bgSoft: 'bg-sky-50' },
  { id: 'RCT', label: 'Root Canal (RCT)', color: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-300', bgSoft: 'bg-purple-50' },
  { id: 'Crown', label: 'Crown / Cap', color: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-300', bgSoft: 'bg-amber-50' },
  { id: 'Implant', label: 'Dental Implant', color: 'bg-teal-500', text: 'text-teal-700', border: 'border-teal-300', bgSoft: 'bg-teal-50' },
  { id: 'Missing', label: 'Missing / Extracted', color: 'bg-slate-500', text: 'text-slate-700', border: 'border-slate-300', bgSoft: 'bg-slate-100' },
  { id: 'Fracture', label: 'Fractured / Chipped', color: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-300', bgSoft: 'bg-orange-50' },
  { id: 'Impacted', label: 'Impacted Tooth', color: 'bg-indigo-500', text: 'text-indigo-700', border: 'border-indigo-300', bgSoft: 'bg-indigo-50' },
];

export default function Odontogram({ 
  odontogramData = [], 
  onSaveTooth, 
  onPlanTreatment,
  patientName = 'Patient' 
}) {
  const [dentitionType, setDentitionType] = useState('adult'); // 'adult' | 'pediatric'
  const [numberingSystem, setNumberingSystem] = useState('FDI'); // 'FDI' | 'Universal'
  const [selectedTooth, setSelectedTooth] = useState(null);
  
  // Modal/Drawer state for tooth condition edit
  const [condition, setCondition] = useState('Healthy');
  const [surface, setSurface] = useState('All');
  const [notes, setNotes] = useState('');

  // Map odontogram array to a lookup object by tooth_number
  const toothLookup = React.useMemo(() => {
    const map = {};
    for (const item of odontogramData) {
      map[item.tooth_number] = item;
    }
    return map;
  }, [odontogramData]);

  const handleToothClick = (toothNum) => {
    const existing = toothLookup[toothNum];
    setSelectedTooth(toothNum);
    if (existing) {
      setCondition(existing.condition);
      setSurface(existing.surface || 'All');
      setNotes(existing.notes || '');
    } else {
      setCondition('Healthy');
      setSurface('All');
      setNotes('');
    }
  };

  const handleSave = () => {
    if (!selectedTooth) return;
    onSaveTooth(selectedTooth, condition, surface, notes);
    setSelectedTooth(null);
  };

  const getToothLabel = (toothNum) => {
    if (numberingSystem === 'Universal' && FDI_TO_UNIVERSAL[toothNum]) {
      return `#${FDI_TO_UNIVERSAL[toothNum]}`;
    }
    return toothNum;
  };

  const getToothConditionConfig = (toothNum) => {
    const record = toothLookup[toothNum];
    if (!record) return null;
    return CONDITIONS.find(c => c.id === record.condition);
  };

  const renderToothVisual = (toothNum, isUpper) => {
    const record = toothLookup[toothNum];
    const isSelected = selectedTooth === toothNum;
    const condConfig = record ? CONDITIONS.find(c => c.id === record.condition) : null;
    
    // Determine crown fill based on condition
    let crownColor = '#f8fafc'; // clean white
    let strokeColor = '#94a3b8'; // slate 400
    let badgeText = '';

    if (condConfig) {
      switch (condConfig.id) {
        case 'Caries':
          crownColor = '#f43f5e'; // rose-500
          strokeColor = '#be123c';
          badgeText = 'C';
          break;
        case 'Restoration':
          crownColor = '#0ea5e9'; // sky-500
          strokeColor = '#0369a1';
          badgeText = 'F';
          break;
        case 'RCT':
          crownColor = '#a855f7'; // purple-500
          strokeColor = '#7e22ce';
          badgeText = 'RCT';
          break;
        case 'Crown':
          crownColor = '#f59e0b'; // amber-500
          strokeColor = '#b45309';
          badgeText = 'Cr';
          break;
        case 'Implant':
          crownColor = '#14b8a6'; // teal-500
          strokeColor = '#0f766e';
          badgeText = 'Imp';
          break;
        case 'Missing':
          crownColor = '#cbd5e1'; // slate-300
          strokeColor = '#64748b';
          badgeText = 'X';
          break;
        case 'Fracture':
          crownColor = '#f97316'; // orange-500
          strokeColor = '#c2410c';
          badgeText = 'Fx';
          break;
        case 'Impacted':
          crownColor = '#6366f1'; // indigo-500
          strokeColor = '#4338ca';
          badgeText = 'Impk';
          break;
        default:
          crownColor = '#f8fafc';
          strokeColor = '#94a3b8';
      }
    }

    const toothDisplay = getToothLabel(toothNum);

    return (
      <button
        key={toothNum}
        onClick={() => handleToothClick(toothNum)}
        className={`relative group flex flex-col items-center p-1 rounded-xl transition-all duration-150 ${
          isSelected 
            ? 'ring-2 ring-teal-500 bg-teal-50 shadow-md scale-105 z-10' 
            : 'hover:bg-slate-100 hover:scale-105'
        }`}
        title={`Tooth ${toothDisplay} (${toothNum}) - ${record ? record.condition : 'Healthy'}`}
      >
        {/* Upper number if lower jaw, or lower number if upper jaw */}
        {isUpper && (
          <span className="text-[11px] font-bold text-slate-500 mb-0.5 group-hover:text-teal-600">
            {toothDisplay}
          </span>
        )}

        {/* Anatomical Tooth SVG */}
        <div className="w-9 h-14 relative flex items-center justify-center">
          <svg viewBox="0 0 40 60" className="w-full h-full drop-shadow-sm">
            {isUpper ? (
              // Upper Tooth (Roots pointing UP, Crown pointing DOWN)
              <g>
                {/* Roots */}
                <path
                  d="M12 28 C10 18, 14 6, 17 4 C18 6, 20 18, 20 28"
                  fill="#e2e8f0"
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />
                <path
                  d="M20 28 C20 18, 22 6, 23 4 C26 6, 30 18, 28 28"
                  fill="#e2e8f0"
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />
                {/* Crown */}
                <path
                  d="M8 28 C7 38, 10 52, 20 54 C30 52, 33 38, 32 28 C28 29, 20 27, 8 28 Z"
                  fill={crownColor}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />
                {/* Surface grooves */}
                <path
                  d="M14 36 Q20 40 26 36 M20 32 L20 46"
                  stroke={record ? '#ffffff' : '#cbd5e1'}
                  strokeWidth="1"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            ) : (
              // Lower Tooth (Crown pointing UP, Roots pointing DOWN)
              <g>
                {/* Crown */}
                <path
                  d="M8 32 C7 22, 10 8, 20 6 C30 8, 33 22, 32 32 C28 31, 20 33, 8 32 Z"
                  fill={crownColor}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />
                {/* Surface grooves */}
                <path
                  d="M14 24 Q20 20 26 24 M20 14 L20 28"
                  stroke={record ? '#ffffff' : '#cbd5e1'}
                  strokeWidth="1"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Roots */}
                <path
                  d="M12 32 C10 42, 14 54, 17 56 C18 54, 20 42, 20 32"
                  fill="#e2e8f0"
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />
                <path
                  d="M20 32 C20 42, 22 54, 23 56 C26 54, 30 42, 28 32"
                  fill="#e2e8f0"
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* Missing Tooth Cross */}
            {record?.condition === 'Missing' && (
              <path d="M6 10 L34 50 M34 10 L6 50" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </svg>

          {/* Quick badge indicator */}
          {badgeText && record?.condition !== 'Missing' && (
            <span className="absolute bottom-1 right-0 text-[8px] font-black px-1 rounded-sm bg-slate-900 text-white shadow-sm">
              {badgeText}
            </span>
          )}
        </div>

        {!isUpper && (
          <span className="text-[11px] font-bold text-slate-500 mt-0.5 group-hover:text-teal-600">
            {toothDisplay}
          </span>
        )}
      </button>
    );
  };

  const teethConfig = dentitionType === 'adult' ? ADULT_TEETH : PEDIATRIC_TEETH;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Odontogram Header Controls */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Smile className="w-5 h-5 text-teal-600" />
            Interactive Dental Chart (Odontogram)
          </h3>
          <p className="text-xs text-slate-500">
            Click any tooth to examine diagnosis, record pathology, or plan a procedure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Dentition Selector */}
          <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setDentitionType('adult')}
              className={`px-3 py-1.5 rounded-md transition ${
                dentitionType === 'adult'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Adult (32)
            </button>
            <button
              onClick={() => setDentitionType('pediatric')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1 transition ${
                dentitionType === 'pediatric'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Baby className="w-3.5 h-3.5" /> Pediatric (20)
            </button>
          </div>

          {/* Numbering System Selector */}
          <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setNumberingSystem('FDI')}
              className={`px-2.5 py-1.5 rounded-md transition ${
                numberingSystem === 'FDI'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FDI Notation
            </button>
            <button
              onClick={() => setNumberingSystem('Universal')}
              className={`px-2.5 py-1.5 rounded-md transition ${
                numberingSystem === 'Universal'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Universal #
            </button>
          </div>
        </div>
      </div>

      {/* Main Dental Chart Canvas */}
      <div className="p-6 bg-radial from-slate-50 to-white">
        {/* Upper Arch (Maxilla) */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2 px-4 uppercase tracking-wider">
            <span>Upper Right (Q1)</span>
            <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-semibold">
              Maxillary Arch (Upper Jaw)
            </span>
            <span>Upper Left (Q2)</span>
          </div>

          <div className="flex justify-center items-center gap-1 sm:gap-2 p-3 bg-slate-50/90 rounded-2xl border border-slate-200/70">
            {/* Q1 Teeth */}
            <div className="flex items-center gap-1">
              {teethConfig.upperRight.map(tooth => renderToothVisual(tooth, true))}
            </div>

            {/* Midline Divider */}
            <div className="w-px h-16 bg-red-400 mx-2 relative flex items-center justify-center">
              <span className="absolute -top-3 text-[9px] font-black text-red-500 uppercase">Mid</span>
            </div>

            {/* Q2 Teeth */}
            <div className="flex items-center gap-1">
              {teethConfig.upperLeft.map(tooth => renderToothVisual(tooth, true))}
            </div>
          </div>
        </div>

        {/* Lower Arch (Mandible) */}
        <div>
          <div className="flex justify-center items-center gap-1 sm:gap-2 p-3 bg-slate-50/90 rounded-2xl border border-slate-200/70">
            {/* Q4 Teeth */}
            <div className="flex items-center gap-1">
              {teethConfig.lowerRight.map(tooth => renderToothVisual(tooth, false))}
            </div>

            {/* Midline Divider */}
            <div className="w-px h-16 bg-red-400 mx-2 relative flex items-center justify-center">
              <span className="absolute -bottom-3 text-[9px] font-black text-red-500 uppercase">Mid</span>
            </div>

            {/* Q3 Teeth */}
            <div className="flex items-center gap-1">
              {teethConfig.lowerLeft.map(tooth => renderToothVisual(tooth, false))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mt-2 px-4 uppercase tracking-wider">
            <span>Lower Right (Q4)</span>
            <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-semibold">
              Mandibular Arch (Lower Jaw)
            </span>
            <span>Lower Left (Q3)</span>
          </div>
        </div>
      </div>

      {/* Conditions Legend Bar */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-600 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-teal-600" /> Chart Legend:
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {CONDITIONS.map(cond => (
            <div key={cond.id} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${cond.color} shadow-xs`}></span>
              <span className="text-slate-600 font-medium">{cond.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Tooth Modal / Action Panel */}
      {selectedTooth && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold flex items-center gap-2">
                  Tooth Record: {getToothLabel(selectedTooth)}
                  <span className="text-xs bg-teal-600/70 px-2 py-0.5 rounded font-normal text-teal-100">
                    FDI #{selectedTooth}
                  </span>
                </h4>
                <p className="text-xs text-teal-100 mt-0.5">
                  Recording for: <span className="font-semibold">{patientName}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedTooth(null)}
                className="w-8 h-8 rounded-full bg-teal-900/40 hover:bg-teal-900/80 text-white flex items-center justify-center font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Select Condition */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Clinical Condition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map(c => {
                    const isPicked = condition === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCondition(c.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition text-left ${
                          isPicked
                            ? `${c.bgSoft} ${c.text} ${c.border} ring-2 ring-teal-500 shadow-xs font-bold`
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${c.color} shrink-0`}></span>
                        <span className="truncate">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Surface Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Affected Surface
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'O (Occlusal)', 'M (Mesial)', 'D (Distal)', 'B (Buccal)', 'L (Lingual)', 'MO', 'DO', 'MOD'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSurface(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                        surface === s
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical Notes for this tooth */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tooth Notes / Diagnosis
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Deep cavity, sensitive to cold, plan RCT..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              {/* Quick Action: Plan Treatment */}
              {onPlanTreatment && (
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between">
                  <div className="text-xs text-teal-900">
                    <p className="font-semibold">Ready to treat this tooth?</p>
                    <p className="text-[11px] text-teal-700">Open treatment planner with tooth #{selectedTooth} pre-selected.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const toothNum = selectedTooth;
                      setSelectedTooth(null);
                      onPlanTreatment(toothNum, condition);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Plan Treatment
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setCondition('Healthy');
                  setNotes('');
                  handleSave();
                }}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear / Mark Healthy
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTooth(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
                >
                  Save Tooth Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
