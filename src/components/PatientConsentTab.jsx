import React, { useState } from 'react';
import { FileSignature, Download, Trash2, CheckCircle, FileText, AlertCircle } from 'lucide-react';

export default function PatientConsentTab({
    getPatient, selectedPatientId, savePatientData,
    modal, setModal, generatePDF
}) {
    const patient = getPatient(selectedPatientId);
    const consents = patient.consents || [];

    // Estados locales (Antes estaban en App.jsx)
    const [consentTemplate, setConsentTemplate] = useState('psicoterapia_adultos');
    const [consentText, setConsentText] = useState('');

    const templates = {
        psicoterapia_adultos: "Consentimiento Informado para Psicoterapia (Adultos):\n\nPor el presente documento, consiento libre y voluntariamente a participar en un proceso de psicoterapia con [Nombre del Terapeuta]. Entiendo que el proceso implica hablar de aspectos personales y emocionales que pueden generar incomodidad temporal. Fui informado de las tarifas, duración de sesiones y políticas de cancelación. Comprendo que la confidencialidad es un pilar ético y legal, con las excepciones legales correspondientes (riesgo vital para sí mismo o terceros).",
        evaluacion_psicodiagnostica: "Consentimiento para Evaluación Psicodiagnóstica:\n\nAutorizo la aplicación de pruebas, test psicológicos y entrevistas clínicas para fines diagnósticos. Entiendo que los resultados serán manejados con estricta confidencialidad y que tengo derecho a recibir una sesión de devolución y un informe escrito con los resultados.",
        psicoterapia_infantil: "Consentimiento Informado para Psicoterapia Infanto-Juvenil:\n\nComo madre/padre o tutor legal, autorizo el proceso psicoterapéutico de mi hijo/a. Entiendo que la terapia requiere mi participación activa y reuniones periódicas con el terapeuta. Se respetará la privacidad del menor, informándome solo de situaciones de riesgo inminente.",
        terapia_pareja: "Consentimiento para Terapia de Pareja:\n\nAmbas partes consienten a participar en terapia conjunta. Entendemos que el paciente es 'la relación' y que el terapeuta mantiene una postura de neutralidad. Los secretos individuales no están protegidos si interfieren con el proceso terapéutico conjunto."
    };

    return (
        <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto pb-10">
            
            {/* --- ENCABEZADO --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[#DFD2C4]/50 pb-4">
                <div>
                    <h2 className="text-2xl font-black text-[#312923] tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-[#312923]/10 text-[#312923] rounded-xl">
                            <FileSignature size={22} />
                        </div>
                        Acuerdos y Consentimientos
                    </h2>
                    <p className="text-[10px] font-bold text-[#9A8F84] uppercase tracking-widest mt-2 ml-1">
                        Documentos éticos y legales del encuadre terapéutico
                    </p>
                </div>
                
                {/* --- BOTÓN MÁGICO DE FIRMA --- */}
                <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-signature-pad'))}
                    className="flex items-center gap-2 px-6 py-3.5 bg-[#5B6651] hover:bg-[#4a5442] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all hover:-translate-y-0.5"
                >
                    <FileSignature size={16}/> Pedir Firma Digital
                </button>
            </div>

            {/* --- PANEL DE REDACCIÓN DE NUEVO CONSENTIMIENTO --- */}
            <div className="bg-white border border-[#DFD2C4]/60 rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-[10px] font-black uppercase text-[#5B6651] flex items-center gap-2 mb-6">
                    <FileText size={14} className="text-[#A3968B]"/> Redactar Nuevo Documento
                </h3>
                
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9A8F84] uppercase tracking-widest ml-1">Plantilla Base</label>
                        <select 
                            className="w-full p-4 rounded-2xl border border-[#DFD2C4] bg-[#FDFBF7] text-sm font-bold text-[#312923] outline-none focus:border-[#5B6651] transition-all shadow-sm"
                            value={consentTemplate}
                            onChange={(e) => {
                                setConsentTemplate(e.target.value);
                                setConsentText(templates[e.target.value]);
                            }}
                        >
                            <option value="psicoterapia_adultos">Psicoterapia Individual (Adultos)</option>
                            <option value="evaluacion_psicodiagnostica">Evaluación Psicodiagnóstica</option>
                            <option value="psicoterapia_infantil">Psicoterapia Infanto-Juvenil (Padres)</option>
                            <option value="terapia_pareja">Terapia de Pareja</option>
                        </select>
                    </div>

                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-bold text-[#9A8F84] uppercase tracking-widest ml-1">Texto del Acuerdo (Editable)</label>
                        <textarea 
                            className="w-full min-h-[180px] p-5 rounded-2xl border border-[#DFD2C4] bg-[#FDFBF7] text-sm text-[#312923] font-medium leading-relaxed outline-none focus:border-[#5B6651] transition-all custom-scrollbar resize-none shadow-inner"
                            value={consentText}
                            onChange={(e) => setConsentText(e.target.value)}
                        />
                        <div className="absolute top-8 right-3 flex items-center gap-1.5 text-[9px] font-black text-[#5B6651] uppercase tracking-widest bg-[#5B6651]/5 px-2 py-1 rounded-lg">
                            <AlertCircle size={10} /> Editable
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button 
                            className="bg-[#312923] text-white px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg"
                            onClick={() => {
                                const newDoc = { id: Date.now(), type: consentTemplate, text: consentText, date: new Date().toLocaleDateString('es-CL'), signed: false };
                                savePatientData(selectedPatientId, { ...patient, consents: [newDoc, ...consents] });
                                setConsentText(''); 
                            }}
                            disabled={!consentText.trim()}
                        >
                            <CheckCircle size={16}/> Guardar y Habilitar Firma
                        </button>
                    </div>
                </div>
            </div>

            {/* --- LISTA DE DOCUMENTOS --- */}
            <div className="space-y-4 pt-4">
                <h3 className="text-[10px] font-black uppercase text-[#9A8F84] tracking-widest ml-1">Documentos del Consultante</h3>
                
                {consents.length === 0 ? (
                    <div className="text-center py-10 bg-[#FDFBF7] border border-dashed border-[#DFD2C4] rounded-3xl">
                        <p className="text-xs font-bold text-[#9A8F84] uppercase tracking-widest">No hay documentos generados</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {consents.map(doc => (
                            <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-[#DFD2C4]/60 rounded-2xl hover:shadow-sm hover:border-[#DFD2C4] transition-all group gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.signed ? 'bg-[#5B6651]/10 text-[#5B6651]' : 'bg-[#CBAAA2]/10 text-[#CBAAA2]'}`}>
                                        <FileSignature size={20}/>
                                    </div>
                                    <div>
                                        <p className="font-black text-[#312923] text-sm uppercase tracking-tight">
                                            {doc.type.replace(/_/g, ' ')}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-[#9A8F84] uppercase tracking-widest">{doc.date}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${doc.signed ? 'border-[#5B6651]/30 text-[#5B6651] bg-[#5B6651]/5' : 'border-[#CBAAA2]/30 text-[#CBAAA2] bg-[#CBAAA2]/5'}`}>
                                                {doc.signed ? '✓ Firmado' : 'Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    {!doc.signed && (
                                        <button 
                                            className="px-4 py-2 bg-[#5B6651] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90"
                                            onClick={() => {
                                                const updated = consents.map(c => c.id === doc.id ? { ...c, signed: true } : c);
                                                savePatientData(selectedPatientId, { ...patient, consents: updated });
                                            }}
                                        >
                                            Marcar Firmado
                                        </button>
                                    )}
                                    <button onClick={() => generatePDF('consent', doc)} className="p-2.5 rounded-xl bg-[#FDFBF7] text-[#9A8F84] border border-[#DFD2C4]/50 hover:bg-white hover:text-[#312923] hover:border-[#312923]/30 transition-all">
                                        <Download size={16}/>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if(window.confirm("¿Seguro de eliminar este documento?")) {
                                                savePatientData(selectedPatientId, { ...patient, consents: consents.filter(c => c.id !== doc.id) });
                                            }
                                        }} 
                                        className="p-2.5 rounded-xl bg-[#FDFBF7] text-[#9A8F84] border border-[#DFD2C4]/50 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}