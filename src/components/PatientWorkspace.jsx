import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, AlertTriangle, User, FileQuestion, Brain, 
    Network, FileText, FileSignature, FolderOpen
} from 'lucide-react';

// --- IMPORTACIÓN DE PESTAÑAS ---
import PatientPersonalTab from './PatientPersonalTab';
import PatientAnamnesisTab from './PatientAnamnesisTab';
import MentalExamTab from './MentalExamTab';   
import FamilyMapTab from './FamilyMapTab';     
import PatientEvolutionTab from './PatientEvolutionTab';
import PatientConsentTab from './PatientConsentTab';
import PatientImagesTab from './PatientImagesTab';
import SignaturePad from './SignaturePad';
import PatientSummary from './PatientSummary';

export default function PatientWorkspace({
    selectedPatientId, setSelectedPatientId, patientTab, setPatientTab, 
    userRole, themeMode, session, clinicOwner, patientRecords, setActiveTab, 
    activeFormType, setActiveFormType, viewingForm, setViewingForm,
    activeFolder, setActiveFolder, uploading, 
    modal, setModal, getPatient, savePatientData, 
    logAction, handleGeneratePDF, handleImageUpload, notify, sendWhatsApp, setSelectedImg, onSaveSignature,
    appointments = [], financialRecords = []
}) {
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    React.useEffect(() => {
        const handleOpen = () => setShowSignaturePad(true);
        window.addEventListener('open-signature-pad', handleOpen);
        return () => window.removeEventListener('open-signature-pad', handleOpen);
    }, []);
    useEffect(() => {
        if (selectedPatientId) {
            logAction('patient_viewed', { resource_type: 'patient' }, selectedPatientId);
        }
    }, [selectedPatientId]);
    const p = getPatient(selectedPatientId);

    // Las 7 Pestañas Clínicas
    const tabButtons = [
        {id:'personal', label:'Datos', icon: User}, 
        {id:'anamnesis', label:'Anamnesis', icon: FileQuestion, restricted: true}, 
        {id:'mental_exam', label:'Examen Mental', icon: Brain, restricted: true}, 
        {id:'family_map', label:'Genograma', icon: Network, restricted: true}, 
        {id:'evolution', label:'Evolución', icon: FileText, restricted: true}, 
        {id:'consent', label:'Documentos', icon: FileSignature}, 
        {id:'images', label:'Archivos', icon: FolderOpen}
    ];

    return (
        <div className="space-y-6 animate-in slide-in-from-right pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col gap-3 border-b border-[#DFD2C4]/50 pb-5">
                <button 
                    onClick={() => setSelectedPatientId(null)} 
                    className="flex items-center gap-2 text-[11px] font-bold text-[#9A8F84] hover:text-[#5B6651] transition-colors w-fit tracking-widest uppercase"
                >
                    <ArrowLeft size={14}/> VOLVER A CONSULTANTES
                </button>
                <div className="flex justify-between items-start">
                    <h2 className="text-4xl font-black text-[#312923] tracking-tight capitalize">{p.personal?.legalName || 'Consultante'}</h2>
                </div>
            </div>

            <PatientSummary
                patient={p}
                appointments={appointments}
                financialRecords={financialRecords}
                selectedPatientId={selectedPatientId}
            />

            {/* --- ALERTAS CLÍNICAS --- */}
            {(() => {
                const criticalConditions = ['Riesgo Suicida', 'Epilepsia', 'Psicosis', 'Alergias graves', 'Trastorno Bipolar', 'Cardiopatía'];
                const activeAlerts = Object.entries(p.anamnesis?.conditions || {}).filter(([k, v]) => v && criticalConditions.includes(k)).map(([k]) => k);
                
                if (activeAlerts.length > 0 || (p.anamnesis?.remote && p.anamnesis.remote.length > 3)) {
                    return (
                        <div className="w-full bg-[#CBAAA2]/10 border-l-[4px] border-[#CBAAA2] p-4 rounded-r-2xl flex items-center gap-4 animate-pulse shadow-sm">
                            <div className="p-2 bg-white rounded-xl shadow-sm"><AlertTriangle className="text-[#CBAAA2] shrink-0" size={24}/></div>
                            <div>
                                <p className="text-[11px] font-black text-[#CBAAA2] uppercase tracking-widest leading-none">Precaución Clínica / Riesgo</p>
                                <p className="text-sm font-bold text-[#312923] mt-1">{activeAlerts.join(' • ')} {(p.anamnesis?.remote) ? `• ${p.anamnesis.remote}` : ''}</p>
                            </div>
                        </div>
                    );
                }
                return null;
            })()}

            {/* --- NAVEGACIÓN DE PESTAÑAS --- */}
            <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 border-b border-[#DFD2C4]/30" style={{ WebkitOverflowScrolling: 'touch' }}>
                {tabButtons.map(b => {
                    if (userRole === 'secretary' && b.restricted) return null;
                    const isActive = patientTab === b.id;
                    return (
                        <button
                            key={b.id}
                            onClick={() => setPatientTab(b.id)}
                            className={`px-3 md:px-5 py-3 rounded-t-2xl text-[10px] md:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 border-b-2 shrink-0 ${
                                isActive ? 'bg-white text-[#5B6651] border-[#5B6651] shadow-[0_-4px_10px_rgba(91,102,81,0.05)]' : 'bg-[#FDFBF7] text-[#9A8F84] border-transparent hover:bg-white hover:text-[#6B615A]'
                            }`}
                        >
                            <b.icon size={13} className={isActive ? 'text-[#5B6651]' : 'text-[#DFD2C4]'}/> {b.label}
                        </button>
                    )
                })}
            </div>

            {/* --- CONTENEDOR DE LA PESTAÑA ACTIVA --- */}
            <div className="bg-white rounded-b-[2rem] rounded-tr-[2rem] p-6 sm:p-8 border border-[#DFD2C4]/40 shadow-sm" style={{ boxShadow: '0 10px 25px -5px rgba(91, 102, 81, 0.05)', marginTop: '-1px' }}>
                
                {patientTab === 'personal' && <PatientPersonalTab getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} sendWhatsApp={sendWhatsApp} />}
                
                {patientTab === 'anamnesis' && <PatientAnamnesisTab getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} session={session} notify={notify} activeFormType={activeFormType} setActiveFormType={setActiveFormType} viewingForm={viewingForm} setViewingForm={setViewingForm} />}
                
                {patientTab === 'mental_exam' && <MentalExamTab getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} notify={notify} />}
                
                {patientTab === 'family_map' && <FamilyMapTab getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} notify={notify} />}              
                
                {patientTab === 'evolution' && <PatientEvolutionTab getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} session={session} logAction={logAction} notify={notify} />}
                
                {patientTab === 'consent' && <PatientConsentTab getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} modal={modal} setModal={setModal} generatePDF={handleGeneratePDF} />}
                
                {patientTab === 'images' && <PatientImagesTab getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} activeFolder={activeFolder} setActiveFolder={setActiveFolder} handleImageUpload={handleImageUpload} uploading={uploading} setSelectedImg={setSelectedImg} notify={notify} />}
                
            </div>
            {/* --- INVOCADOR DEL PAD DE FIRMA --- */}
            {showSignaturePad && (
                <SignaturePad 
                    patientName={p?.personal?.legalName || 'Consultante'}
                    onCancel={() => setShowSignaturePad(false)}
                    onSave={(base64Data) => {
                        onSaveSignature(base64Data);
                        setShowSignaturePad(false);
                    }}
                />
            )}
        </div>
    );
}