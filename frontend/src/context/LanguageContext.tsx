import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface Translations {
  [key: string]: {
    en: string;
    ta: string;
  };
}

export const translations: Translations = {
  // Navigation & Common
  hospitalName: { en: 'St. Mary Multispeciality Hospital', ta: 'செயிண்ட் மேரி பல்நோக்கு மருத்துவமனை' },
  home: { en: 'Home', ta: 'முகப்பு' },
  doctors: { en: 'Doctors', ta: 'மருத்துவர்கள்' },
  about: { en: 'About Us', ta: 'எங்களைப் பற்றி' },
  contact: { en: 'Contact', ta: 'தொடர்பு' },
  login: { en: 'Login', ta: 'உள்நுழை' },
  register: { en: 'Register', ta: 'பதிவு செய்' },
  dashboard: { en: 'Dashboard', ta: 'முகப்பு பலகை' },
  logout: { en: 'Logout', ta: 'வெளியேறு' },
  myAppointments: { en: 'My Appointments', ta: 'எனது முன்பதிவுகள்' },
  bookAppointment: { en: 'Book an Appointment', ta: 'முன்பதிவு செய்' },
  notifications: { en: 'Notifications', ta: 'அறிவிப்புகள்' },
  myProfile: { en: 'My Profile', ta: 'எனது சுயவிவரம்' },
  save: { en: 'Save', ta: 'சேமி' },
  cancel: { en: 'Cancel', ta: 'ரத்து செய்' },
  reschedule: { en: 'Reschedule', ta: 'மறுதேதியிடல்' },
  edit: { en: 'Edit', ta: 'திருத்து' },
  status: { en: 'Status', ta: 'நிலை' },
  active: { en: 'Active', ta: 'செயலில்' },
  inactive: { en: 'Inactive', ta: 'செயலற்றது' },
  confirmed: { en: 'Confirmed', ta: 'உறுதி செய்யப்பட்டது' },
  pending: { en: 'Pending', ta: 'நிலுவையில்' },
  cancelled: { en: 'Cancelled', ta: 'ரத்து செய்யப்பட்டது' },
  completed: { en: 'Completed', ta: 'முடிவடைந்தது' },
  loading: { en: 'Loading...', ta: 'ஏற்றுகிறது...' },
  actions: { en: 'Actions', ta: 'செயல்கள்' },
  search: { en: 'Search', ta: 'தேடு' },
  viewDetails: { en: 'View Details', ta: 'விவரங்களைப் பார்க்க' },

  // Hero Section
  heroTitle: { en: 'Your Health, Our Priority', ta: 'உங்கள் நல்வாழ்வு, எங்கள் முன்னுரிமை' },
  heroSubtitle: { en: 'Book appointments with experienced doctors easily and conveniently.', ta: 'அனுபவம் வாய்ந்த மருத்துவர்களுடன் எளிதாகவும் வசதியாகவும் முன்பதிவு செய்யுங்கள்.' },
  exploreDoctors: { en: 'Explore Doctors', ta: 'மருத்துவர்களைக் காண்க' },

  // Sections
  howItWorks: { en: 'How Appointment Booking Works', ta: 'முன்பதிவு எவ்வாறு செயல்படுகிறது' },
  step1Title: { en: '1. Choose a Doctor', ta: '1. மருத்துவரைத் தேர்ந்தெடுக்கவும்' },
  step1Desc: { en: 'Select an experienced specialist matching your health needs.', ta: 'உங்கள் உடல்நலத் தேவைக்கேற்ற சிறந்த மருத்துவரைத் தேர்வு செய்யவும்.' },
  step2Title: { en: '2. Select Date & Slot', ta: '2. தேதி மற்றும் நேரத்தைத் தேர்வு செய்க' },
  step2Desc: { en: 'Pick a convenient working day and available consultation time.', ta: 'உங்களுக்கு வசதியான தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுக்கவும்.' },
  step3Title: { en: '3. Instant Confirmation', ta: '3. உடனடி உறுதிப்படுத்தல்' },
  step3Desc: { en: 'Receive instant confirmation and reminders on your dashboard.', ta: 'உங்கள் முன்பதிவு உடனடியாக உறுதிசெய்யப்பட்டு அறிவிப்புகள் பெறப்படும்.' },

  specializations: { en: 'Available Specializations', ta: 'கிடைக்கும் மருத்துவ பிரிவுகள்' },
  featuredDoctors: { en: 'Featured Doctors', ta: 'முன்னணி மருத்துவர்கள்' },
  contactUs: { en: 'Contact Us', ta: 'எங்களைத் தொடர்பு கொள்ள' },
  hospitalAddress: { en: '124 Healthcare Avenue, Medical City, Chennai - 600001', ta: '124 ஹெல்த்கேர் அவென்யூ, மெடிக்கல் சிட்டி, சென்னை - 600001' },
  hospitalPhone: { en: '+91 44 2855 0000', ta: '+91 44 2855 0000' },
  emergency: { en: '24/7 Emergency Line', ta: '24/7 அவசர கால உதவி' },

  // Auth
  patientLoginTitle: { en: 'Patient Sign In', ta: 'நோயாளி உள்நுழைவு' },
  doctorLoginTitle: { en: 'Doctor Portal Sign In', ta: 'மருத்துவர் உள்நுழைவு' },
  adminLoginTitle: { en: 'Hospital Administration Sign In', ta: 'நிர்வாக உள்நுழைவு' },
  phone: { en: 'Phone Number', ta: 'தொலைபேசி எண்' },
  password: { en: 'Password', ta: 'கடவுச்சொல்' },
  confirmPassword: { en: 'Confirm Password', ta: 'கடவுச்சொல்லை உறுதிப்படுத்துக' },
  fullName: { en: 'Full Name', ta: 'முழு பெயர்' },
  email: { en: 'Email Address', ta: 'மின்னஞ்சல் முகவரி' },
  preferredLanguage: { en: 'Preferred Language', ta: 'விருப்ப மொழி' },
  noAccount: { en: "Don't have an account? Register here", ta: 'கணக்கு இல்லையா? இங்கே பதிவு செய்க' },
  hasAccount: { en: 'Already registered? Sign in here', ta: 'ஏற்கனவே பதிவு செய்துள்ளீர்களா? இங்கே உள்நுழையவும்' },

  // Booking Flow
  bookingTitle: { en: 'Book Doctor Appointment', ta: 'மருத்துவர் சந்திப்பு முன்பதிவு' },
  selectDoctor: { en: 'Step 1: Select Doctor', ta: 'படி 1: மருத்துவரைத் தேர்ந்தெடுக்கவும்' },
  selectDate: { en: 'Step 2: Select Date', ta: 'படி 2: தேதியைத் தேர்ந்தெடுக்கவும்' },
  selectSlot: { en: 'Step 3: Select Time Slot', ta: 'படி 3: நேரத்தைத் தேர்ந்தெடுக்கவும்' },
  reasonForVisit: { en: 'Step 4: Reason for Visit', ta: 'படி 4: சந்திப்பிற்கான காரணம்' },
  reviewBooking: { en: 'Step 5: Review & Confirm', ta: 'படி 5: சரிபார்த்து உறுதி செய்க' },
  consultationFee: { en: 'Consultation Fee', ta: 'ஆலோசனை கட்டணம்' },
  confirmBookingBtn: { en: 'Confirm Appointment', ta: 'முன்பதிவை உறுதி செய்' },
  bookingSuccess: { en: 'Appointment Booked Successfully!', ta: 'முன்பதிவு வெற்றிகரமாக முடிந்தது!' },
  noSlotsAvailable: { en: 'No available slots on this date. Doctor is not scheduled or slots are full.', ta: 'இந்த தேதியில் நேரம் கிடைக்கவில்லை. மாற்று தேதியைத் தேர்வு செய்யவும்.' },

  // Appointments
  upcomingTab: { en: 'Upcoming', ta: 'வரவிருக்கும்' },
  completedTab: { en: 'Completed', ta: 'முடிவடைந்தவை' },
  cancelledTab: { en: 'Cancelled', ta: 'ரத்து செய்யப்பட்டவை' },
  noAppointments: { en: 'No appointments found in this section.', ta: 'முன்பதிவுகள் எதுவும் இல்லை.' },

  // Admin Portal
  manageDoctors: { en: 'Doctor Management', ta: 'மருத்துவர்கள் நிர்வாகம்' },
  manageSchedules: { en: 'Schedule Management', ta: 'அட்டவணை நிர்வாகம்' },
  managePatients: { en: 'Patient Directory', ta: 'நோயாளிகள் விவரக் குறிப்பேடு' },
  manageAppointments: { en: 'All Appointments', ta: 'அனைத்து முன்பதிவுகள்' },
  voiceCallLogs: { en: 'Voice Call Logs', ta: 'குரல் அழைப்பு பதிவுகள்' },
  addDoctor: { en: 'Add New Doctor', ta: 'புதிய மருத்துவரைச் சேர்க்கவும்' },
  addSchedule: { en: 'Create Schedule Block', ta: 'புதிய நேர அட்டவணையைச் சேர்க்கவும்' },
  specialization: { en: 'Specialization', ta: 'சிறப்பு மருத்துவ துறை' },
  deactivate: { en: 'Deactivate', ta: 'முடக்கு' },
  reactivate: { en: 'Reactivate', ta: 'மீண்டும் இயக்கு' },
  delete: { en: 'Delete', ta: 'நீக்கு' },
  filterByStatus: { en: 'Filter by Status', ta: 'நிலை வாரியாக வடிகட்டவும்' },
  filterByDoctor: { en: 'Filter by Doctor', ta: 'மருத்துவர் வாரியாக வடிகட்டவும்' },
  viewTranscripts: { en: 'View Transcripts', ta: 'உரையாடல் படியெடுப்புகளைக் காண்க' },

};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved === 'ta' ? 'ta' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
