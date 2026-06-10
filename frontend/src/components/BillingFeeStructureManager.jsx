import React, { useState } from 'react';
import { useGetFeeStructuresQuery, useCreateFeeStructureMutation, useUpdateFeeStructureMutation, useDeleteFeeStructureMutation } from '../services/billingApi';
import { useGetClassesQuery } from '../redux/academicApi';
import { Trash2, Edit, Plus, X, CheckCircle2 } from 'lucide-react';

const BillingFeeStructureManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ feeType: '', isActive: true });
  
  const [formData, setFormData] = useState({
    feeType: 'tuition',
    name: '',
    amount: 0,
    frequency: 'monthly',
    dueDay: 15,
    lateFeeAmount: 0,
    lateFeePercentage: 0,
    isActive: true,
    classId: ''
  });

  const { data: structures = [], isLoading } = useGetFeeStructuresQuery(filters);
  const { data: classes = [] } = useGetClassesQuery();
  const [create] = useCreateFeeStructureMutation();
  const [update] = useUpdateFeeStructureMutation();
  const [delete_] = useDeleteFeeStructureMutation();

  const handleClassChange = (e) => {
    const classId = e.target.value;
    const selectedClass = classes.find(c => c._id === classId);
    
    setFormData(prev => ({
      ...prev,
      classId,
      amount: selectedClass?.feeAmount || prev.amount
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        classId: formData.classId || null
      };
      
      if (editingId) {
        await update({ id: editingId, ...submitData }).unwrap();
      } else {
        await create(submitData).unwrap();
      }
      resetForm();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (structure) => {
    setFormData({
      ...structure,
      classId: structure.classId?._id || structure.classId || ''
    });
    setEditingId(structure._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      feeType: 'tuition',
      name: '',
      amount: 0,
      frequency: 'monthly',
      dueDay: 15,
      lateFeeAmount: 0,
      lateFeePercentage: 0,
      isActive: true,
      classId: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">Fee Structures</h3>
          <p className="text-sm text-gray-500 mt-1">Create and manage fee structures for your classes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={18} /> {showForm ? 'Hide Form' : 'Add Fee Structure'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Fee Name *</label>
              <input
                type="text"
                placeholder="e.g., Monthly Tuition"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Amount (₹) *</label>
              <input
                type="number"
                placeholder="5000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Fee Type</label>
              <select
                value={formData.feeType}
                onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tuition">Tuition Fee</option>
                <option value="recurring">Recurring Fee</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Apply to Class</label>
              <select
                value={formData.classId}
                onChange={handleClassChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} - {cls.section} (₹{cls.feeAmount?.toLocaleString() || 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Due Day (1-31)</label>
              <input
                type="number"
                placeholder="15"
                value={formData.dueDay}
                onChange={(e) => setFormData({ ...formData, dueDay: parseInt(e.target.value) || 15 })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="31"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Late Fee Amount (₹)</label>
              <input
                type="number"
                placeholder="100"
                value={formData.lateFeeAmount}
                onChange={(e) => setFormData({ ...formData, lateFeeAmount: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-1 lg:col-span-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700">Active Fee Structure</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-blue-200">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 size={20} />
              {editingId ? 'Update Fee Structure' : 'Create Fee Structure'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 transition"
            >
              <X size={20} />
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading fee structures...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Day</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Late Fee</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {structures.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{s.name}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {s.feeType}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {s.classId?.name ? `${s.classId.name} - ${s.classId.section}` : 'All Classes'}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                    ₹{s.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600">
                    {s.dueDay}
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-red-600 font-medium">
                    ₹{s.lateFeeAmount}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      s.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this fee structure?')) {
                            delete_(s._id).unwrap().catch(err => alert(err.message));
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {structures.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus size={48} className="mx-auto" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No fee structures yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "Add Fee Structure" to create your first one</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BillingFeeStructureManager;
