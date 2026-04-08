import React from 'react';
import { 
    ArrowLeft, AlertTriangle, User, FileQuestion, Brain, 
    Network, FileText, FileSignature, FolderOpen,
    Mic, MicOff, Sparkles
} from 'lucide-react';

// --- IMPORTACIÓN DE PESTAÑAS (Adaptadas para Psicología) ---
import PatientPersonalTab from './PatientPersonalTab';
import PatientAnamnesisTab from './PatientAnamnesisTab';
import MentalExamTab from './MentalExamTab';   
import FamilyMapTab from './FamilyMapTab';     
import PatientEvolutionTab from './PatientEvolutionTab';
import PatientConsentTab from './PatientConsentTab';
import PatientImagesTab from './PatientImagesTab';

export default function PatientWorkspace({
    selectedPatientId, setSelectedPatientId, patientTab, setPatientTab, 
    userRole, themeMode, session, clinicOwner, patientRecords, setActiveTab, 
    activeFormType, setActiveFormType, viewingForm, setViewingForm,
    mentalExamData, setMentalExamData, familyMapData, setFamilyMapData,
    catalog, sessionData, setSessionData,
    isListening, voiceStatus, toggleVoice,
    newEvolution, setNewEvolution, activeFolder, setActiveFolder, uploading, 
    consentTemplate, setConsentTemplate, consentText, setConsentText, modal,
    getPatient, savePatientData, setPatientRecords, setModal, setQuoteItems,
    logAction, handleGeneratePDF, handleImageUpload, notify, sendWhatsApp, setSelectedImg
}) {
    const p = getPatient(selectedPatientId);

    // Las 7 Pestañas
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
        <div className="space-y-6 animate-in slide-in-from-right pb-10">
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

            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-[#DFD2C4]/30">
                {tabButtons.map(b => {
                    if (userRole === 'secretary' && b.restricted) return null;
                    const isActive = patientTab === b.id;
                    return (
                        <button 
                            key={b.id} 
                            onClick={() => setPatientTab(b.id)} 
                            className={`px-5 py-3 rounded-t-2xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border-b-2 ${
                                isActive ? 'bg-white text-[#5B6651] border-[#5B6651] shadow-[0_-4px_10px_rgba(91,102,81,0.05)]' : 'bg-[#FDFBF7] text-[#9A8F84] border-transparent hover:bg-white hover:text-[#6B615A]'
                            }`}
                        >
                            <b.icon size={14} className={isActive ? 'text-[#5B6651]' : 'text-[#DFD2C4]'}/> {b.label}
                        </button>
                    )
                })}
            </div>

            <div className="bg-white rounded-b-[2rem] rounded-tr-[2rem] p-6 sm:p-8 border border-[#DFD2C4]/40 shadow-sm" style={{ boxShadow: '0 10px 25px -5px rgba(91, 102, 81, 0.05)', marginTop: '-1px' }}>
                
                {(patientTab === 'mental_exam' || patientTab === 'evolution') && (
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-[#FDFBF7] to-white border border-[#DFD2C4]/60 p-4 rounded-3xl shadow-sm gap-4 mb-8 animate-in fade-in">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl transition-all ${isListening ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-[#5B6651]/10 text-[#5B6651]'}`}><Sparkles size={24} className={isListening ? 'animate-spin-slow' : ''} /></div>
                            <div>
                                <h3 className="text-sm font-black text-[#312923] uppercase tracking-widest flex items-center gap-2">IA Terapéutica<span className="bg-[#CBAAA2]/20 text-[#CBAAA2] px-2 py-0.5 rounded-full text-[9px]">BETA</span></h3>
                                <p className="text-[11px] font-bold text-[#9A8F84] mt-1">{isListening ? "IA Activa. Dicta tus notas..." : "Haz clic en el micrófono para dictar."}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                            {voiceStatus && <span className="text-[11px] font-bold text-[#5B6651] animate-pulse whitespace-nowrap hidden sm:block">{voiceStatus}</span>}
                            <button onClick={toggleVoice} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md shrink-0 ${isListening ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30 animate-pulse' : 'bg-[#312923] text-white hover:bg-[#1a1512] hover:-translate-y-0.5 shadow-[#312923]/20'}`}>
                                {isListening ? <MicOff size={16}/> : <Mic size={16}/>} {isListening ? 'Detener' : 'Dictar'}
                            </button>
                        </div>
                    </div>
                )}

                {patientTab === 'personal' && <PatientPersonalTab getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} sendWhatsApp={sendWhatsApp} />}
                {patientTab === 'anamnesis' && <PatientAnamnesisTab getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} session={session} notify={notify} activeFormType={activeFormType} setActiveFormType={setActiveFormType} viewingForm={viewingForm} setViewingForm={setViewingForm} />}
                {patientTab === 'mental_exam' && <MentalExamTab getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} notify={notify} />}
                {patientTab === 'family_map' && <FamilyMapTab getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} notify={notify} />}              
                {patientTab === 'evolution' && <PatientEvolutionTab newEvolution={newEvolution} setNewEvolution={setNewEvolution} isListening={isListening} toggleVoice={toggleVoice} voiceStatus={voiceStatus} getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} session={session} logAction={logAction} />}
                {patientTab === 'consent' && <PatientConsentTab getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} modal={modal} setModal={setModal} consentTemplate={consentTemplate} setConsentTemplate={setConsentTemplate} consentText={consentText} setConsentText={setConsentText} generatePDF={handleGeneratePDF} />}
                {patientTab === 'images' && <PatientImagesTab getPatient={getPatient} selectedPatientId={selectedPatientId} savePatientData={savePatientData} activeFolder={activeFolder} setActiveFolder={setActiveFolder} handleImageUpload={handleImageUpload} uploading={uploading} setSelectedImg={setSelectedImg} notify={notify} />}
            </div>
        </div>
    );
}