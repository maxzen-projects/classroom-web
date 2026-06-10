import React, { useState } from 'react';
import { useGetExtraFeesQuery, useCreateExtraFeeMutation, useUpdateExtraFeeMutation, useDeleteExtraFeeMutation } from '../services/billingApi';
import { useGetClassesQuery } from '../redux/academicApi';
import { Plus, Edit, Trash2, X, CheckCircle2, BookOpen, Truck, GraduationCap, Home, FileText, Star, MoreHorizontal } from 'lucide-react';

const BillingExtraFeeManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ isActive: true });

  const [formData, setFormData] = useState({
    name: 'transport',
    description: '',
    amount: 0,
    frequency: 'monthly',
    dueDay: 15,
    appliedToClasses: [],
    appliedToStudents: [],
    isActive: true
  });

  const { data: extraFees = [], isLoading } = useGetExtraFeesQuery(filters);
  const { data: classes = [] } = useGetClassesQuery();
  const [create] = useCreateExtraFeeMutation();
  const [update] = useUpdateExtraFeeMutation();
  const [delete_] = useDeleteExtraFeeMutation();

  const feeTypes = [
    { value: 'transport', label: 'Transport', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' },
    { value: 'books', label: 'Books', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-100' },
    { value: 'uniform', label: 'Uniform', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-100' },
    { value: 'hostel', label: 'Hostel', icon: Home, color: 'text-orange-600', bg: 'bg-orange-100' },
    { value: 'exam_fee', label: 'Exam Fee', icon: FileText, color: 'text-red-600', bg: 'bg-red-100' },
    { value: 'activity', label: 'Activity', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-gray-600', bg: 'bg-gray-100' }
  ];

  const getFeeTypeInfo = (value) => feeTypes.find(t => t.value === value) || feeTypes[feeTypes.length - 1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await update({ id: editingId, ...formData }).unwrap();
      } else {
        await create(formData).unwrap();
      }
      resetForm();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (fee) => {
    setFormData({
      ...fee,
      appliedToClasses: fee.appliedToClasses?.map(c => c._id || c) || [],
      appliedToStudents: fee.appliedToStudents?.map(s => s._id || s) || []
    });
    setEditingId(fee._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: 'transport',
      description: '',
      amount: 0,
      frequency: 'monthly',
      dueDay: 15,
      appliedToClasses: [],
      appliedToStudents: [],
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">Extra Fees (Transport, Books, etc.)</h3>
          <p className="text-sm text-gray-500 mt-1">Manage additional fees like transport, books, uniform, etc.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={18} /> {showForm ? 'Hide Form' : 'Add Extra Fee'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-6 border border-green-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Fee Type</label>
              <select
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {feeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Amount (₹) *</label>
              <input
                type="number"
                placeholder="1500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
                <option value="one-time">One Time</option>
              </select>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="2"
                placeholder="e.g., Transport for school bus service"
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Due Day (1-31)</label>
              <input
                type="number"
                placeholder="15"
                value={formData.dueDay}
                onChange={(e) => setFormData({ ...formData, dueDay: parseInt(e.target.value) || 15 })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="1"
                max="31"
              />
            </div>

            <div className="space-y-1 lg:col-span-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm font-semibold text-gray-700">Active Extra Fee</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-green-200">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 size={20} />
              {editingId ? 'Update Extra Fee' : 'Create Extra Fee'}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading extra fees...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fee Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Frequency</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {extraFees.map((fee) => {
                const typeInfo = getFeeTypeInfo(fee.name);
                const Icon = typeInfo.icon;
                return (
                  <tr key={fee._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
                          <Icon size={16} className={typeInfo.color} />
                        </div>
                        <span className="text-sm font-medium text-gray-900 capitalize">{fee.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {fee.description || '-'}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                      ₹{fee.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 capitalize">
                        {fee.frequency}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        fee.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {fee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(fee)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this extra fee?')) {
                              delete_(fee._id).unwrap().catch(err => alert(err.message));
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
                );
              })}
            </tbody>
          </table>
          {extraFees.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus size={48} className="mx-auto" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No extra fees configured</p>
              <p className="text-gray-400 text-sm mt-1">Click "Add Extra Fee" to add transport, books, etc.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BillingExtraFeeManager;
