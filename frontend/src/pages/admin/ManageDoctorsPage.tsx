import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { Doctor } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Search, Edit2, ShieldAlert, CheckCircle2, XCircle, Trash2, X } from 'lucide-react';

export const ManageDoctorsPage: React.FC = () => {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    specialization: '',
    phone: '',
    email: '',
    password: '',
    consultation_fee: 500,
  });

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all doctors including inactive
      const data = await doctorService.getDoctors(showActiveOnly);
      setDoctors(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [showActiveOnly]);

  const handleOpenAddModal = () => {
    setFormData({
      full_name: '',
      specialization: '',
      phone: '',
      email: '',
      password: '',
      consultation_fee: 500,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      full_name: doctor.full_name,
      specialization: doctor.specialization,
      phone: doctor.phone,
      email: doctor.email || '',
      password: '', // Leave blank unless updating
      consultation_fee: doctor.consultation_fee,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await doctorService.createDoctor({
        full_name: formData.full_name,
        specialization: formData.specialization,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        consultation_fee: Number(formData.consultation_fee),
      });
      setSuccess('Doctor profile created successfully.');
      setIsAddModalOpen(false);
      fetchDoctors();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create doctor.');
    }
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    try {
      setError(null);
      const payload: Partial<Doctor> = {
        full_name: formData.full_name,
        specialization: formData.specialization,
        phone: formData.phone,
        email: formData.email || undefined,
        consultation_fee: Number(formData.consultation_fee),
      };
      await doctorService.updateDoctor(selectedDoctor.doctor_id, payload);
      setSuccess('Doctor profile updated successfully.');
      setIsEditModalOpen(false);
      fetchDoctors();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update doctor.');
    }
  };

  const handleToggleActive = async (doctor: Doctor) => {
    try {
      setError(null);
      if (doctor.is_active) {
        if (!window.confirm(`Are you sure you want to deactivate Dr. ${doctor.full_name}?`)) return;
        await doctorService.deactivateDoctor(doctor.doctor_id);
        setSuccess(`Dr. ${doctor.full_name} has been deactivated.`);
      } else {
        await doctorService.reactivateDoctor(doctor.doctor_id);
        setSuccess(`Dr. ${doctor.full_name} has been reactivated.`);
      }
      fetchDoctors();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Action failed.');
    }
  };

  const handleDeleteDoctor = async (doctor: Doctor) => {
    if (!window.confirm(`Are you sure you want to permanently delete Dr. ${doctor.full_name}? This action cannot be undone if the doctor has existing appointment records.`)) {
      return;
    }
    try {
      setError(null);
      await doctorService.deleteDoctor(doctor.doctor_id);
      setSuccess(`Doctor ${doctor.full_name} removed.`);
      fetchDoctors();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Cannot delete doctor with existing appointments or records. Try deactivating instead.');
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.phone.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('manageDoctors')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Register new physicians, edit clinic assignments, and manage medical staff availability.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addDoctor')}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center justify-between">
          <div className="flex items-center">
            <ShieldAlert className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, specialization, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <label className="text-sm text-gray-600 flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mr-2"
            />
            Show active only
          </label>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">{t('loading')}</div>
        ) : filteredDoctors.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No doctors found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">Doctor</th>
                  <th className="px-6 py-3">{t('specialization')}</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Fee (₹)</th>
                  <th className="px-6 py-3">{t('status')}</th>
                  <th className="px-6 py-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDoctors.map((doc) => (
                  <tr key={doc.doctor_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      Dr. {doc.full_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {doc.specialization}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {doc.phone}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {doc.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                      ₹{doc.consultation_fee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doc.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {t('inactive')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(doc)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleToggleActive(doc)}
                        className={`text-xs font-medium px-2 py-1 border rounded ${
                          doc.is_active
                            ? 'text-amber-700 border-amber-300 hover:bg-amber-50'
                            : 'text-green-700 border-green-300 hover:bg-green-50'
                        }`}
                      >
                        {doc.is_active ? t('deactivate') : t('reactivate')}
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Doctor */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">{t('addDoctor')}</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Doctor Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Specialization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology, Neurology, General Medicine"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Portal Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Initial password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Consultation Fee (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData({ ...formData, consultation_fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Create Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Doctor */}
      {isEditModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Edit Doctor: Dr. {selectedDoctor.full_name}</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Doctor Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Specialization *
                </label>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Consultation Fee (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={formData.consultation_fee}
                  onChange={(e) => setFormData({ ...formData, consultation_fee: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

