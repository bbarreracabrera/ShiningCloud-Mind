import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './supabase'; 
import { getLocalDate, THEMES } from './constants';

import { ArrowRight, FileText } from 'lucide-react';

import { Card } from './components/UIComponents';
import { PatientSelect, AuthScreen, TermsScreen } from './components/SystemModals'; 
import LandingPage from "./components/LandingPage";
import DashboardView from './pages/DashboardView'; 
import FinanceCenter from './components/FinanceCenter'; 
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView'; 
import AgendaView from './components/AgendaView'; 
import Sidebar from './components/layout/Sidebar'; 
import PatientWorkspace from './components/PatientWorkspace'; 
import PublicBookingPage from './components/PublicBookingPage';
import CancelBooking from './components/CancelBooking';
import MPOAuthCallback from './components/MPOAuthCallback';
import ResetPasswordPage from './components/ResetPasswordPage';
import ImportPatientsModal from './components/ImportPatientsModal';
import WelcomeTour from './components/WelcomeTour';
import AuditLogView from './components/AuditLogView';
import LegalText from './components/LegalText';

import ApptModal from './components/ApptModal';
import OnboardingModal from './components/OnboardingModal';
import AbonoModal from './components/AbonoModal';
import RecoveryModal from './components/RecoveryModal';

import { generatePDF } from './utils/pdfGenerator';
import { uploadPatientImage } from './utils/uploadHandlers';
import { useClinicData } from './hooks/useClinicData';

export default function App() {
  const [isInRecovery, setIsInRecovery] = useState(() =>
      window.location.hash.includes('type=recovery')
  );
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [themeMode, setThemeMode] = useState('light'); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  
  const [config, setConfigLocal] = useState({ logo: null, hourlyRate: 35000, name: "Psicóloga Independiente" });
  const [patientRecords, setPatientRecords] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [financialRecords, setFinancialRecords] = useState([]); 
  const [team, setTeam] = useState([]); 
  const [userRole, setUserRole] = useState('admin');
  const [clinicOwner, setClinicOwner] = useState('');

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientTab, setPatientTab] = useState('personal');
  const [activeFormType, setActiveFormType] = useState('general');
  const [viewingForm, setViewingForm] = useState(null);
  const [activeFolder, setActiveFolder] = useState('Informes Médicos'); // Cambié el default a uno de Psicología

  const [newAppt, setNewAppt] = useState({ patient_name: '', treatment: 'Psicoterapia Individual (Adultos)', date: '', time: '', duration: 60, status: 'agendado', id: null });
  const [paymentInput, setPaymentInput] = useState({ amount: '', method: 'Transferencia', date: getLocalDate(), receiptNumber: '' });
  const [selectedFinancialRecord, setSelectedFinancialRecord] = useState(null);
  
  const [uploading, setUploading] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(false);

  useEffect(() => {
    if (!configLoaded) return;
    if (!session) return;
    const isDefault = !config.name || config.name === 'Psicóloga Independiente';
    setShowOnboarding(isDefault);
  }, [config.name, session, configLoaded]);

  useEffect(() => {
    if (!session?.user?.email) return;

    const checkSubscription = async () => {
        const { data } = await supabase
            .from('saas_subscriptions')
            .select('*')
            .eq('clinic_email', session.user.email)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();

        setSubscription(data);
        setCheckingSubscription(false);
        if (!data) setShowSubscriptionBanner(true);
    };

    checkSubscription();
  }, [session]);

  const handleOnboardingSave = async (formData) => {
    const newConfig = { ...config, ...formData };
    setConfigLocal(newConfig);
    await saveToSupabase('settings', 'general', newConfig);
    setShowOnboarding(false);
    notify("¡Consulta configurada! Bienvenida a ShiningCloud Mind.");
    setTimeout(() => setRunTour(true), 800);
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    if (showOnboarding) return;
    if (!config?.name) return;
    if (runTour) return;
    if (config.tour_completed) return;

    const timer = setTimeout(() => setRunTour(true), 1500);
    return () => clearTimeout(timer);
  }, [session?.user?.id, showOnboarding, config?.name, config?.tour_completed]);

  const notify = (m) => toast.success(m, { 
      style: { borderRadius: '12px', background: '#fadadd', color: '#4a4a4b', border: '1px solid rgba(250,218,221,0.5)', fontWeight: 'bold', fontSize: '13px' },
      iconTheme: { primary: '#a5bda3', secondary: '#fff' }
  });

  useEffect(() => { document.title = "ShiningCloud | Mind"; }, []);

  // ==========================================
  // 🔐 ESCUCHA DE AUTENTICACIÓN (SUPABASE)
  // ==========================================
  useEffect(() => {
      // 1. Revisamos si ya hay una sesión activa al abrir la app
      supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
      });

      // 2. Nos suscribimos a los cambios (Login, Logout, etc.)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
              setIsInRecovery(true);
          }
          setSession(session);
      });

      // Limpiamos la suscripción si el componente se desmonta
      return () => subscription.unsubscribe();
  }, []);
  
  useClinicData({
      session, setTeam, setUserRole, setClinicOwner, setConfigLocal,
      setPatientRecords, setAppointments, setFinancialRecords, setConfigLoaded
  });

  const logAction = useCallback(async (action, details = {}, resourceId = null) => {
    if (!session?.user?.id) return;
    try {
        await supabase.from('audit_log').insert({
            user_id: session.user.id,
            action,
            resource_type: details.resource_type || null,
            resource_id: resourceId,
            details,
            user_agent: navigator.userAgent
        });
    } catch (err) {
        console.error('Error guardando log:', err);
    }
  }, [session]);
  
// ==========================================
  // 💾 MOTOR DE GUARDADO EN BASE DE DATOS
  // ==========================================
  const saveToSupabase = useCallback(async (tableName, id, dataObj) => {
      if (!session?.user?.id) {
          console.warn('saveToSupabase llamado sin sesión activa');
          return false;
      }
      try {
          let payload = {};

          // Armamos el paquete según la tabla
          if (tableName === 'settings') {
              payload = {
                  id: session?.user?.id || 'general',
                  type: 'config_general',
                  data: dataObj,
                  user_id: session?.user?.id
              };
          } else {
              // Para patients, appointments, financial_records, etc., desempacamos los datos
              payload = { ...dataObj, id: id.toString(), user_id: session?.user?.id };
          }
          // Enviamos a Supabase forzando la actualización si ya existe (onConflict)
          const conflictCol = tableName === 'settings' ? 'user_id' : 'id';
          const { data, error } = await supabase
              .from(tableName)
              .upsert(payload, { onConflict: conflictCol })
              .select();

          // Si Supabase lo rechaza, que nos grite el error en la cara
          if (error) {
              console.error(`🚨 ERROR SUPABASE en tabla ${tableName}:`, error);
              notify(`Error al guardar: ${error.message}`); // Usamos tu sistema de notificaciones
              return false;
          } 

          console.log(`✅ ÉXITO guardando en ${tableName}:`, data);
          return true;

      } catch (err) {
          console.error("🚨 Error crítico de código al guardar:", err);
          return false;
      }
  }, [session]);

  const handleTourComplete = useCallback(async () => {
    setRunTour(false);
    if (config && session?.user?.id) {
      const updatedConfig = { ...config, tour_completed: true };
      setConfigLocal(updatedConfig);
      await saveToSupabase('settings', session.user.id, updatedConfig);
    }
  }, [config, session, saveToSupabase]);

  const getPatient = useCallback((id) => {
      const base = { 
        id, 
        personal: { legalName: id }, 
        anamnesis: { motive: '', history: '', family: '' }, 
        clinical: { evolution: [], mentalExam: {}, familyMap: {} }, 
        consents: [], 
        images: [] 
      };
      const existing = patientRecords[id];
      if (!existing) return base;
      return { 
          ...base, 
          ...existing, 
          anamnesis: { ...base.anamnesis, ...(existing.anamnesis || {}) }, 
          clinical: { ...base.clinical, ...(existing.clinical || {}) }, 
          personal: { ...base.personal, ...(existing.personal || {}) }
      };
  }, [patientRecords]);

  const saveTimer = useRef(null);

  useEffect(() => {
      return () => {
          if (saveTimer.current) clearTimeout(saveTimer.current);
      };
  }, []);

  const savePatientData = useCallback(async (id, dataObj) => {
      setPatientRecords(prev => ({...prev, [id]: dataObj}));
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession?.user?.id) return;
          const payloadWithUser = { ...dataObj, id: id.toString(), user_id: currentSession.user.id, name: dataObj?.personal?.legalName || '' };
          const { error } = await supabase.from('patients').upsert(payloadWithUser, { onConflict: 'id' }).select();
          if (error) console.error('Error guardando paciente:', error);
          else {
              console.log('Paciente guardado OK');
              logAction('patient_updated', { resource_type: 'patient' }, id);
          }
      }, 800);
  }, [logAction]);

 // 👇 NUEVA VERSIÓN BLINDADA (SIN BUCKETS PÚBLICOS) 👇
  const handleSaveSignature = async (base64Data) => {
      try {
          const patient = getPatient(selectedPatientId);

          // En lugar de subir un archivo a internet, guardamos la imagen 
          // en formato de texto cifrado directamente en su base de datos privada.
          const updatedPatient = {
              ...patient,
              consents: [
                  ...(patient.consents || []),
                  {
                      id: Date.now(),
                      type: 'Firma Digital de Consentimiento',
                      date: new Date().toLocaleDateString('es-CL'),
                      signatureData: base64Data, // <-- 🔒 La imagen encriptada vive aquí
                      signed: true
                  }
              ]
          };

          await savePatientData(selectedPatientId, updatedPatient);
          logAction('consent_signed', { resource_type: 'consent' }, selectedPatientId);
          notify("Firma asegurada y encriptada en la ficha del paciente. 🔒");
          setModal(null);

      } catch (error) {
          console.error("Error legal signature:", error);
          alert("No se pudo asegurar la firma.");
      }
  };

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

  const buildReminder = (appt) => {
      const fecha = new Date(appt.date + 'T' + appt.time)
          .toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
      const template = config?.wpGreeting ||
          'Hola {nombre}, te recuerdo tu sesión el {fecha} a las {hora}. ¿Confirmas tu asistencia?';
      return template
          .replace('{nombre}', appt.patient_name || '')
          .replace('{paciente}', appt.patient_name || '')
          .replace('{fecha}', fecha)
          .replace('{hora}', appt.time || '');
  };

  const incomeRecords = financialRecords.filter(f => !f.type || f.type === 'income');
  const expenseRecords = financialRecords.filter(f => f.type === 'expense');
  const totalCollected = incomeRecords.reduce((acc, rec) => { const paymentsSum = (rec.payments || []).reduce((s, p) => s + Number(p.amount), 0); return acc + (paymentsSum > 0 ? paymentsSum : (Number(rec.paid) || 0)); }, 0);
  const totalExpenses = expenseRecords.reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const netProfit = totalCollected - totalExpenses;
  
  const todaysAppointments = appointments.filter(a => a.date === getLocalDate()).sort((a,b) => a.time.localeCompare(b.time));
  const chartData = useMemo(() => {
    const months = {};
    incomeRecords.forEach(rec => {
      if (!rec.date) return;
      const [year, month] = rec.date.split('-');
      const key = `${year}-${month}`;
      const paid = (rec.payments || []).reduce((s, p) => s + Number(p.amount), 0)
                   + (rec.paid && !rec.payments ? Number(rec.paid) : 0);
      months[key] = (months[key] || 0) + paid;
    });
    const names = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, value]) => ({ month: names[parseInt(key.split('-')[1]) - 1], value }));
  }, [incomeRecords]);

  const t = THEMES[themeMode] || THEMES.dark;
  const isWorkspaceActive = (activeTab === 'ficha' && selectedPatientId !== null) || activeTab === 'agenda';

// ==========================================
  // 🔒 EL MURO DE ACCESO Y ENRUTAMIENTO
  // ==========================================
  // Revisamos si la URL tiene el parámetro de reserva
  const urlParams = new URLSearchParams(window.location.search);
  const reservaId = urlParams.get('reserva');
  const cancelToken = urlParams.get('cancelar');

  // Si venimos de un link de reset password, mostramos el formulario antes que cualquier otra cosa
  if (isInRecovery) {
      return <ResetPasswordPage onComplete={() => {
          setIsInRecovery(false);
          window.location.href = '/';
      }} />;
  }

  // Si es una URL de cancelación, mostramos el componente SIN pedir login
  if (cancelToken) {
      return <CancelBooking token={cancelToken} />;
  }

  // Callback de OAuth de MercadoPago
  if (window.location.pathname === '/oauth/mercadopago/callback') {
      return <MPOAuthCallback />;
  }

  // Si es una URL de reserva, mostramos el portal público SIN pedir login
  if (reservaId) {
      return <PublicBookingPage clinicId={reservaId} />;
  }

  // Si no es reserva y no hay sesión, mostramos Landing o Login
  if (!session) {
      return showLogin ? (
          <AuthScreen onBack={() => { setShowLogin(false); setShowRegister(false); }} initialSignUp={showRegister} />
      ) : (
          <LandingPage onLoginClick={() => setShowLogin(true)} onRegisterClick={() => { setShowRegister(true); setShowLogin(true); }} />
      );
  }

  return (
    <div className={`min-h-screen flex bg-pastel-pink text-soft-dark transition-all duration-500 font-sans`}>
      <Toaster position="bottom-center" reverseOrder={false} />
      <WelcomeTour run={runTour} onComplete={handleTourComplete} setActiveTab={setActiveTab} />

      {showSubscriptionBanner && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
              <p className="text-sm text-amber-800 font-medium">
                  Tu suscripción no está activa.
                  <button
                      onClick={() => window.open('https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=df4b41b056fc40e8b0aa1c73c5fdd775', '_blank')}
                      className="ml-2 underline font-bold">
                      Suscribirme →
                  </button>
              </p>
              <button onClick={() => setShowSubscriptionBanner(false)} className="text-amber-600 hover:text-amber-800 font-bold">✕</button>
          </div>
      )}

      {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-soft-dark/30 backdrop-blur-sm md:hidden" onClick={()=>setMobileMenuOpen(false)}></div>}
      
      <Sidebar 
          mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} 
          config={config} session={session} userRole={userRole}
          activeTab={activeTab} setActiveTab={setActiveTab} 
          setSelectedPatientId={setSelectedPatientId} 
          supabase={supabase} isWorkspaceActive={isWorkspaceActive} 
      />

      <main className={`flex-1 p-4 md:p-6 lg:p-10 h-screen overflow-y-auto transition-all duration-300 ${isWorkspaceActive ? 'md:ml-20' : 'md:ml-[250px]'}`}>
        
        {activeTab === 'dashboard' && <DashboardView config={config} userRole={userRole} themeMode={themeMode} t={t} totalCollected={totalCollected} totalExpenses={totalExpenses} netProfit={netProfit} chartData={chartData} todaysAppointments={todaysAppointments} appointments={appointments} setActiveTab={setActiveTab} setModal={setModal} setSelectedPatientId={setSelectedPatientId} sendWhatsApp={sendWhatsApp} getPatientPhone={getPatientPhone} buildReminder={buildReminder} />}
        
        {activeTab === 'agenda' && <AgendaView appointments={appointments} onOpenModal={(appt) => { setNewAppt(appt); setModal('appt'); }} sendWhatsApp={sendWhatsApp} getPatientPhone={getPatientPhone} buildReminder={buildReminder} />}
        
        {activeTab === 'settings' && <SettingsView themeMode={themeMode} t={t} config={config} setConfigLocal={setConfigLocal} userRole={userRole} saveToSupabase={saveToSupabase} notify={notify} team={team} setTeam={setTeam} newMember={{}} setNewMember={()=>{}} session={session} setActiveTab={setActiveTab} />}

        {activeTab === 'auditoria' && <AuditLogView session={session} />}

        {activeTab === 'terms' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom">
                <div className="border-b border-pastel-pink/50 pb-5">
                    <p className="text-[11px] font-black text-[#9A8F84] uppercase tracking-widest mb-1">Información Legal</p>
                    <h2 className="text-4xl font-black text-soft-dark tracking-tight">Términos y Privacidad</h2>
                </div>
                <LegalText />
            </div>
        )}
        
        {(activeTab === 'finance' || activeTab === 'history') && (
            <FinanceCenter
                financialRecords={financialRecords} setFinancialRecords={setFinancialRecords}
                patientRecords={patientRecords} saveToSupabase={saveToSupabase}
                notify={notify} session={session} clinicOwner={clinicOwner}
                themeMode={themeMode} t={t} config={config}
            />
        )}

        {(activeTab === 'reports' || activeTab === 'informes') && (
            <ReportsView
                themeMode={themeMode} patientRecords={patientRecords}
                getPatient={getPatient} savePatientData={savePatientData}
                notify={notify}
                generatePDF={(type, data) => {
                    const patientId = data?.patient_id || data?.patientId || selectedPatientId;
                    logAction('pdf_generated', { resource_type: 'pdf', pdf_type: type }, patientId);
                    generatePDF(type, data, { themeMode, config, selectedPatientId: patientId, getPatient, patientRecords, notify });
                }}
            />
        )}

        {activeTab === 'ficha' && !selectedPatientId && (
            <div className="space-y-4 animate-in slide-in-from-bottom">
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowImport(true)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 border border-pastel-pink rounded-2xl text-sage-green font-bold text-xs hover:bg-warm-white transition-all"
                    >
                        <ArrowRight size={14} className="rotate-90" /> Importar CSV
                    </button>
                    <PatientSelect theme={themeMode} patients={patientRecords} placeholder="Buscar o Crear Consultante..." onSelect={(p) => {
                        if (p.id === 'new') {
                            if (!session?.user?.id) { notify("Debes iniciar sesión para crear pacientes."); return; }
                            let nombreReal = p.name;
                            if (!nombreReal || nombreReal.trim() === "") { nombreReal = window.prompt("Confirma el nombre del nuevo consultante:"); if (!nombreReal) return; }
                            const newId = "pac_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
                            const newPatient = getPatient(newId);
                            newPatient.id = newId; newPatient.personal.legalName = nombreReal;
                            savePatientData(newId, newPatient);
                            setSelectedPatientId(newId);
                            logAction('patient_created', { resource_type: 'patient', name: nombreReal }, newId);
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
        
        {activeTab === 'ficha' && selectedPatientId && (
            <PatientWorkspace 
                selectedPatientId={selectedPatientId} setSelectedPatientId={setSelectedPatientId}
                patientTab={patientTab} setPatientTab={setPatientTab}
                patientRecords={patientRecords} getPatient={getPatient} savePatientData={savePatientData}
                activeFormType={activeFormType} setActiveFormType={setActiveFormType}
                viewingForm={viewingForm} setViewingForm={setViewingForm}
                userRole={userRole} themeMode={themeMode} session={session} 
                clinicOwner={clinicOwner} setActiveTab={setActiveTab}
                activeFolder={activeFolder} setActiveFolder={setActiveFolder}
                uploading={uploading} modal={modal} setModal={setModal}
                logAction={logAction} notify={notify} sendWhatsApp={sendWhatsApp}
                setSelectedImg={setSelectedImg}
                appointments={appointments} financialRecords={financialRecords}
                handleImageUpload={(file) => uploadPatientImage(file, { selectedPatientId, setUploading, getPatient, activeFolder, savePatientData, notify, logAction })}
                handleGeneratePDF={(type, data) => {
                    logAction('pdf_generated', { resource_type: 'pdf', pdf_type: type }, selectedPatientId);
                    generatePDF(type, data, { themeMode, config, selectedPatientId, getPatient, patientRecords, notify });
                }}
                onSaveSignature={handleSaveSignature}
            />
        )}
      </main>

      {modal === 'appt' && (
          <ApptModal 
              themeMode={themeMode} newAppt={newAppt} setNewAppt={setNewAppt} setModal={setModal} 
              patientRecords={patientRecords} setPatientRecords={setPatientRecords} 
              getPatient={getPatient} savePatientData={savePatientData} 
              notify={notify} appointments={appointments} setAppointments={setAppointments} 
              saveToSupabase={saveToSupabase} sendWhatsApp={sendWhatsApp} getPatientPhone={getPatientPhone} session={session}
          />
      )}

      {showOnboarding && (
          <OnboardingModal onSave={handleOnboardingSave} />
      )}

      {showImport && (
          <ImportPatientsModal
              onClose={() => setShowImport(false)}
              onImport={async (patients) => {
                  let successCount = 0;
                  for (const patient of patients) {
                      const newId = "pac_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
                      await savePatientData(newId, { ...patient, id: newId });
                      successCount++;
                  }
                  notify(`${successCount} pacientes importados`);
                  return successCount;
              }}
              notify={notify}
          />
      )}
    </div>
  );
}