import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './supabase'; 
import { getLocalDate, THEMES } from './constants';

// --- ICONS ---
import { ArrowLeft, Menu, ArrowRight } from 'lucide-react';

// --- COMPONENTS & VIEWS ---
import { Card } from './components/UIComponents';
import { PatientSelect, AuthScreen, TermsScreen } from './components/SystemModals'; 
import LandingPage from "./components/LandingPage";
import DashboardView from './pages/DashboardView'; 
import FinanceCenter from './components/FinanceCenter'; 
import SettingsView from './components/SettingsView'; 
import QuoteView from './components/QuoteView'; 
import AgendaView from './components/AgendaView'; 
import Sidebar from './components/layout/Sidebar'; 
import PatientWorkspace from './components/PatientWorkspace'; 

// --- MODALS ---
import ApptModal from './components/ApptModal';
import AbonoModal from './components/AbonoModal';
import RecoveryModal from './components/RecoveryModal';

// --- UTILS & HOOKS ---
import { generatePDF } from './utils/pdfGenerator';
import { uploadPatientImage } from './utils/uploadHandlers';
import { useClinicData } from './hooks/useClinicData';

export default function App() {
  // ==========================================
  // 1. ESTADOS GLOBALES (STATE)
  // ==========================================
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [themeMode, setThemeMode] = useState('light'); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  
  // Data Core
  const [config, setConfigLocal] = useState({ logo: null, hourlyRate: 35000, name: "Psicóloga Independiente" });
  const [patientRecords, setPatientRecords] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [financialRecords, setFinancialRecords] = useState([]); 
  const [team, setTeam] = useState([]); 
  const [userRole, setUserRole] = useState('admin');
  const [clinicOwner, setClinicOwner] = useState('');

  // Formularios y Vistas
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientTab, setPatientTab] = useState('personal');
  const [activeFormType, setActiveFormType] = useState('general');
  const [viewingForm, setViewingForm] = useState(null);
  
  // --- VARIABLES FALTANTES AGREGADAS AQUÍ ---
  const [newEvolution, setNewEvolution] = useState('');
  const [consentTemplate, setConsentTemplate] = useState('psicoterapia_adultos');
  const [consentText, setConsentText] = useState('');
  // ------------------------------------------

  // Estados para Modales (Agenda y Pagos)
  const [newAppt, setNewAppt] = useState({ name: '', treatment: 'Psicoterapia Individual (Adultos)', date: '', time: '', duration: 60, status: 'agendado', id: null }); 
  const [paymentInput, setPaymentInput] = useState({ amount: '', method: 'Transferencia', date: getLocalDate(), receiptNumber: '' });
  const [selectedFinancialRecord, setSelectedFinancialRecord] = useState(null);
  
  // Otros
  const [uploading, setUploading] = useState(false);
  const [activeFolder, setActiveFolder] = useState('Documentos');
  const [selectedImg, setSelectedImg] = useState(null);
  const [financeTab, setFinanceTab] = useState('resumen');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // ==========================================
  // 2. INICIALIZACIÓN
  // ==========================================
  const notify = (m) => toast.success(m, { 
      style: { borderRadius: '12px', background: '#fadadd', color: '#4a4a4b', border: '1px solid rgba(250,218,221,0.5)', fontWeight: 'bold', fontSize: '13px' },
      iconTheme: { primary: '#a5bda3', secondary: '#fff' }
  });

  useEffect(() => { document.title = "ShiningCloud | Psico"; }, []);
  
  useClinicData({
      session, setTeam, setUserRole, setClinicOwner, setConfigLocal,
      setPatientRecords, setAppointments, setFinancialRecords
  });

  // ==========================================
  // 3. FUNCIONES DE BASE DE DATOS CORE
  // ==========================================
  const logAction = useCallback(async (action, details, patientId = null) => {
    // Lógica de logs 
  }, [session, clinicOwner]);

  const saveToSupabase = async (t, id, d) => { 
      try {
          const payload = { id: id.toString(), data: d };
          
          // Si estamos guardando un paciente, intentamos guardar también su nombre suelto para el buscador
          if (t === 'patients') {
              payload.name = d.personal?.legalName || 'Consultante';
          }
          
          const { error } = await supabase.from(t).upsert(payload);
          
          // Si da error porque la base de datos no tiene la columna "name", lo forzamos a guardar solo en "data"
          if (error && error.message.includes('column "name"')) {
              await supabase.from(t).upsert({ id: id.toString(), data: d });
          } else if (error) {
              console.error(`Error guardando en ${t}:`, error);
          }
      } catch (err) {
          console.error("Error guardando en Supabase:", err);
      }
  };
  
  const getPatient = useCallback((id) => {
      const base = { 
        id, 
        personal: { legalName: id }, 
        anamnesis: { motive: '', history: '', family: '' }, 
        clinical: { evolution: [], tests: [] }, 
        consents: [], 
        images: [] 
      };
      const existing = patientRecords[id];
      if (!existing) return base;
      return { ...base, ...existing, anamnesis: { ...base.anamnesis, ...(existing.anamnesis || {}) }, clinical: existing.clinical || base.clinical, personal: existing.personal || base.personal };
  }, [patientRecords]);

  const savePatientData = useCallback(async (id, d) => { 
      setPatientRecords(prev => ({...prev, [id]: d})); 
      await saveToSupabase('patients', id, d);
  }, [clinicOwner, session]);

  // Utilidades Generales
  const sendWhatsApp = (phone, text) => {
      if (!phone) return alert("El consultante no tiene teléfono registrado.");
      let cleanPhone = phone.replace(/\D/g, ''); 
      if (cleanPhone.length === 8 || cleanPhone.length === 9) cleanPhone = `56${cleanPhone}`;
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getPatientPhone = (name) => {
      if (!name) return '';
      const foundEntry = Object.values(patientRecords).find(p => p.personal?.legalName === name);
      return foundEntry?.personal?.phone || '';
  };

  // ==========================================
  // 4. DATOS DERIVADOS (Dashboard Alerts)
  // ==========================================
  const incomeRecords = financialRecords.filter(f => !f.type || f.type === 'income');
  const expenseRecords = financialRecords.filter(f => f.type === 'expense');
  const totalCollected = incomeRecords.reduce((acc, rec) => { const paymentsSum = (rec.payments || []).reduce((s, p) => s + Number(p.amount), 0); return acc + (paymentsSum > 0 ? paymentsSum : (Number(rec.paid) || 0)); }, 0);
  const totalExpenses = expenseRecords.reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const netProfit = totalCollected - totalExpenses;
  
  const todaysAppointments = appointments.filter(a => a.date === getLocalDate()).sort((a,b) => a.time.localeCompare(b.time));
  
  const chartData = useMemo(() => {
    return [];
  }, [incomeRecords]);


  // ==========================================
  // 5. RENDERIZADO VISUAL
  // ==========================================
//   if (!session) {
//       if (!showLogin) return <LandingPage onLoginClick={() => setShowLogin(true)} />;
//       return <AuthScreen />;
//   }
  
  const t = THEMES[themeMode] || THEMES.dark;
  const isWorkspaceActive = (activeTab === 'ficha' && selectedPatientId !== null) || activeTab === 'agenda';

  return (
    <div className={`min-h-screen flex bg-pastel-pink text-soft-dark transition-all duration-500 font-sans`}>
      <Toaster position="bottom-center" reverseOrder={false} />
      
      {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-soft-dark/30 backdrop-blur-sm md:hidden" onClick={()=>setMobileMenuOpen(false)}></div>}
      
      <Sidebar 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
          config={config} 
          session={session}
          userRole={userRole}
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          setSelectedPatientId={setSelectedPatientId} 
          supabase={supabase}
          isWorkspaceActive={isWorkspaceActive} 
      />

      <main className={`flex-1 p-6 md:p-10 h-screen overflow-y-auto transition-all duration-300 ${isWorkspaceActive ? 'md:ml-20' : 'md:ml-[250px]'}`}>
        
        {/* --- VISTAS PRINCIPALES --- */}
        {activeTab === 'dashboard' && <DashboardView config={config} userRole={userRole} themeMode={themeMode} t={t} totalCollected={totalCollected} totalExpenses={totalExpenses} netProfit={netProfit} chartData={chartData} todaysAppointments={todaysAppointments} setActiveTab={setActiveTab} setModal={setModal} setSelectedPatientId={setSelectedPatientId} />}
        
        {/* 🌟 VISTA AGENDA DESCOMENTADA */}
        {activeTab === 'agenda' && <AgendaView appointments={appointments} onOpenModal={(appt) => { setNewAppt(appt); setModal('appt'); }} />}
        
        {/* {activeTab === 'history' && <FinanceCenter ... />} */}

        {/* --- SELECCIÓN DE PACIENTE --- */}
        {activeTab === 'ficha' && !selectedPatientId && (
            <div className="space-y-4 animate-in slide-in-from-bottom">
                <div className="flex gap-2">
                    <PatientSelect theme={themeMode} patients={patientRecords} placeholder="Buscar o Crear Consultante..." onSelect={(p) => {
                        if (p.id === 'new') {
                            let nombreReal = p.name;
                            if (!nombreReal || nombreReal.trim() === "") { nombreReal = window.prompt("Confirma el nombre del nuevo consultante:"); if (!nombreReal) return; }
                            const newId = "pac_" + Date.now().toString();
                            const newPatient = getPatient(newId);
                            newPatient.id = newId; newPatient.personal.legalName = nombreReal;
                            savePatientData(newId, newPatient);
                            setSelectedPatientId(newId);
                            notify("Consultante Creado Exitosamente");
                        } else {
                            setSelectedPatientId(p.id);
                        }
                    }} />
                </div>
                <div className="grid gap-3">
                    {Object.keys(patientRecords).map(k => (
                        <Card key={k} onClick={() => setSelectedPatientId(k)} className="cursor-pointer py-5 px-6 flex justify-between items-center group">
                            <span className="font-bold capitalize text-soft-dark group-hover:text-sage-green">{patientRecords[k]?.personal?.legalName || 'Consultante sin nombre'}</span>
                            <div className="w-8 h-8 rounded-full bg-warm-white flex items-center justify-center text-gray-400 group-hover:bg-pastel-pink transition-colors">
                                <ArrowRight size={16}/>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )}
        
        {/* --- FICHA DEL PACIENTE (PatientWorkspace) --- */}
        {activeTab === 'ficha' && selectedPatientId && (
            <PatientWorkspace 
                selectedPatientId={selectedPatientId} 
                setSelectedPatientId={setSelectedPatientId}
                patientTab={patientTab} 
                setPatientTab={setPatientTab}
                patientRecords={patientRecords} 
                getPatient={getPatient} 
                savePatientData={savePatientData}
                
                // Props de Anamnesis
                activeFormType={activeFormType}
                setActiveFormType={setActiveFormType}
                viewingForm={viewingForm}
                setViewingForm={setViewingForm}
                
                // Props Globales
                userRole={userRole} 
                themeMode={themeMode} 
                session={session} 
                clinicOwner={clinicOwner} 
                setActiveTab={setActiveTab}
                
                // Props de otras pestañas
                newEvolution={newEvolution}
                setNewEvolution={setNewEvolution}
                activeFolder={activeFolder}
                setActiveFolder={setActiveFolder}
                uploading={uploading}
                consentTemplate={consentTemplate}
                setConsentTemplate={setConsentTemplate}
                consentText={consentText}
                setConsentText={setConsentText}
                modal={modal}
                setModal={setModal}
                
                // Funciones y Utilidades
                logAction={logAction}
                notify={notify}
                sendWhatsApp={sendWhatsApp}
                setSelectedImg={setSelectedImg}
                handleImageUpload={(file) => uploadPatientImage(file, { 
                    selectedPatientId, setUploading, getPatient, activeFolder, savePatientData, notify, logAction 
                })}
                handleGeneratePDF={(type, data) => generatePDF(type, data, config)}
                
                // Props de IA (Voz)
                isListening={false}
                voiceStatus={null}
                toggleVoice={() => alert("Asistente de voz en desarrollo")}
            />
        )}
      </main>

      {/* --- MODALES --- */}
      {/* 🌟 MODAL AGENDA DESCOMENTADO */}
      {modal === 'appt' && (
          <ApptModal 
              themeMode={themeMode} newAppt={newAppt} setNewAppt={setNewAppt} setModal={setModal} 
              patientRecords={patientRecords} setPatientRecords={setPatientRecords} 
              getPatient={getPatient} savePatientData={savePatientData} 
              notify={notify} appointments={appointments} setAppointments={setAppointments} 
              saveToSupabase={saveToSupabase} sendWhatsApp={sendWhatsApp} getPatientPhone={getPatientPhone}
          />
      )}
      
    </div>
  );
}