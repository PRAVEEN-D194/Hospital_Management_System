import React, { useState, useEffect } from 'react';
import { patientAdminService } from '../../services/patientAdminService';
import { Patient } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Search, ShieldAlert, CheckCircle2, X, Trash2, UserCheck, UserX } from 'lucide-react';

export const ManagePatientsPage: React.FC = () => {
  const { t } = useLanguage();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientAdminService.getAllPatients();
      setPatients(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load patients list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDeactivate = async (patient: Patient) => {
    if (!window.confirm(`Are you sure you want to deactivate patient account for ${patient.full_name}?`)) {
      return;
    }
    try {
      setError(null);
      await patientAdminService.deactivatePatient(patient.patient_id);
      setSuccess(`Patient ${patient.full_name} has been deactivated.`);
      fetchPatients();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to deactivate patient.');
    }
  };

  const handleDelete = async (patient: Patient) => {
    if (!window.confirm(`Are you sure you want to permanently delete patient ${patient.full_name}? This cannot be undone.`)) {
      return;
    }
    try {
      setError(null);
      await patientAdminService.deletePatient(patient.patient_id);
      setSuccess(`Patient record deleted.`);
      fetchPatients();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Cannot delete patient with existing appointment or notification records. Consider deactivating instead.');
    }
  };

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(term) ||
      p.phone.includes(term) ||
      (p.email && p.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('managePatients')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review registered hospital patients, communication preferences, and account statuses.
        </p>
      </div>

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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs text-gray-500">
          Total Patients: {filteredPatients.length}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">{t('loading')}</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No patients match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Patient Name</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Language</th>
                  <th className="px-6 py-3">{t('status')}</th>
                  <th className="px-6 py-3">Registered On</th>
                  <th className="px-6 py-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.patient_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                      #{patient.patient_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {patient.full_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {patient.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      <span className="uppercase text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {patient.preferred_language}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {t('inactive')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {patient.is_active && (
                        <button
                          onClick={() => handleDeactivate(patient)}
                          className="text-amber-700 hover:text-amber-800 text-xs font-medium px-2 py-1 border border-amber-300 rounded hover:bg-amber-50"
                        >
                          {t('deactivate')}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(patient)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5 inline mr-1" />
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
    </div>
  );
};
