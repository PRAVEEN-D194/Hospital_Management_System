import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { doctorService } from '../../services/doctorService';
import type { Doctor } from '../../types';
import { Search, Stethoscope, Filter, ArrowRight } from 'lucide-react';

export const DoctorsPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const data = await doctorService.getDoctors(true);
        setDoctors(data);
      } catch (err) {
        setError('Failed to load doctors list. Please check connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const specializations = ['All', ...Array.from(new Set(doctors.map((d) => d.specialization)))];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = selectedSpec === 'All' || doc.specialization === selectedSpec;
    return matchesSearch && matchesSpec;
  });

  const bookLink = isAuthenticated && role === 'patient' ? '/patient/book' : '/login';

  return (
    <div className="py-12 bg-white min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Our Medical Specialists
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Browse hospital physicians and schedule your consultation online.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-8">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by doctor name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-white"
            />
          </div>

          {/* Specialization Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
              className="text-xs border border-gray-300 rounded-md py-2 px-3 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec === 'All' ? 'All Specializations' : spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-gray-500">Loading medical doctors...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center text-xs text-red-600">
            {error}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <Stethoscope className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No doctors match your criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or specialty filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div key={doc.doctor_id} className="border border-gray-200 rounded-lg p-5 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base">
                      {doc.full_name.charAt(0)}
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                      Available
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{doc.full_name}</h3>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">{doc.specialization}</p>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-slate-600">
                    <span>Consultation Fee:</span>
                    <span className="font-bold text-slate-900">₹{Number(doc.consultation_fee).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex gap-2">
                  <Link
                    to={`/doctors/${doc.doctor_id}`}
                    className="flex-1 text-center py-2 px-3 text-xs font-medium border border-gray-300 rounded text-slate-700 hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    to={bookLink}
                    className="flex-1 text-center py-2 px-3 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    Book Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
