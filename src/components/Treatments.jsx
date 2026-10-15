import React, { useState } from 'react';
import { 
  Stethoscope, 
  Search, 
  Plus, 
  Tag, 
  Check, 
  Trash2,
  FolderPlus,
  UserCheck,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Diagnostic',
  'Preventive',
  'Restorative',
  'Endodontics',
  'Prosthodontics',
  'Oral Surgery',
  'Implantology',
  'Orthodontics',
  'Cosmetic'
];

export default function Treatments({ 
  procedures = [], 
  doctors = [],
  onSaveProcedure, 
  onDeleteProcedure,
  currency = '₹'
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    category: 'Restorative',
    name: '',
    standard_fee: '',
    doctor_name: 'All Doctors',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.standard_fee) {
      alert('Please fill out procedure name and standard fee.');
      return;
    }
    onSaveProcedure({
      ...formData,
      standard_fee: Number(formData.standard_fee)
    });
    setIsModalOpen(false);
    setFormData({
      code: '',
      category: 'Restorative',
      name: '',
      standard_fee: '',
      doctor_name: 'All Doctors',
      description: ''
    });
  };

  const filteredProcedures = procedures.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesDoc = selectedDoctor === 'All Doctors' || p.doctor_name === selectedDoctor || p.doctor_name === 'All Doctors' || !p.doctor_name;
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(s) || 
      (p.code && p.code.toLowerCase().includes(s)) ||
      (p.description && p.description.toLowerCase().includes(s));
    return matchesCat && matchesDoc && matchesSearch;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Search & Filters Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search procedures by code, name, or doctor..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Filter by Doctor */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500">Doctor:</span>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50"
              >
                <option value="All Doctors">All Doctors / Clinic</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add Doctor Treatment
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Procedures Catalog Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-base">Dental Procedures Master & Doctor Catalog</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            {filteredProcedures.length} Procedures
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-6">Procedure Title</th>
                <th className="py-3 px-4">Provided By</th>
                <th className="py-3 px-4">Standard Fee</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProcedures.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-6 font-mono font-bold text-teal-700">
                    {p.code || '-'}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-slate-100 text-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-800 text-sm block">{p.name}</span>
                    {p.description && (
                      <span className="text-[11px] text-slate-500">{p.description}</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 inline-flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-teal-600" />
                      {p.doctor_name || 'All Doctors'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-black text-slate-900 text-sm">
                    {currency}{p.standard_fee}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Remove procedure "${p.name}" from catalog?`)) {
                          onDeleteProcedure(p.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Deactivate Procedure"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProcedures.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-xs">
              No procedures found for this category or doctor. Click "+ Add Doctor Treatment" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Add Procedure Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Create Custom Doctor Treatment / Procedure</h3>
                <p className="text-xs text-teal-200">Add treatments you provide with your customized fee</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-teal-900/50 hover:bg-teal-900 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Procedure Code (ADA / Internal)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. D2391 / RCT-01"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doctor Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Provided By (Doctor Specialization)
                </label>
                <select
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  <option value="All Doctors">All Doctors / Clinic Standard</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Procedure Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Microscopic Root Canal Retreatment"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Standard Fee ({currency}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.standard_fee}
                  onChange={(e) => setFormData({ ...formData, standard_fee: e.target.value })}
                  placeholder="e.g. 4500"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Description / Notes</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Clinical protocol, materials, post-op instructions..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs"
                >
                  Save Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
