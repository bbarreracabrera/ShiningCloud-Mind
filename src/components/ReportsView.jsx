import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, History, User, FileSignature, CheckCircle } from 'lucide-react';
import { Card } from './UIComponents';
import { PatientSelect } from './SystemModals';
import { getLocalDate } from '../constants';

export default function ReportsView({
    themeMode, patientRecords, getPatient, savePatientData, notify, generatePDF
}) {
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [activeTemplate, setActiveTemplate] = useState('asistencia');
    const [reportContent, setReportContent] = useState('');
    const [viewMode, setViewMode] = useState('nuevo'); // 'nuevo' o 'historial'
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => { setViewMode('nuevo'); setHasUnsavedChanges(false); }, [selectedPatientId]);

    const patient = selectedPatientId ? getPatient(selectedPatientId) : null;
    const reportsHistory = patient?.clinical?.reports || [];

    // --- PLANTILLAS PREDEFINIDAS ---
    const TEMPLATES = {
        asistencia: "CERTIFICADO DE ASISTENCIA\n\nPor la presente certifico que {nombre_paciente}, RUT {rut_paciente}, se encuentra actualmente en proceso psicoterapéutico activo, asistiendo de manera regular a sus sesiones clínicas.\n\nSe extiende el presente certificado a petición del interesado para los fines que estime convenientes.",
        derivacion: "INFORME DE DERIVACIÓN CLÍNICA\n\nPaciente: {nombre_paciente}\nRUT: {rut_paciente}\n\nEstimado/a profesional:\nDerivo a usted a paciente individualizado/a para evaluación y manejo por su especialidad.\n\nMotivo de derivación y apreciaciones clínicas:\n[Describa aquí los síntomas, hipótesis diagnóstica o razones de la derivación]\n\nSin otro particular, le saluda atentamente.",
        resumen: "RESUMEN DE PROCESO TERAPÉUTICO\n\nNombre: {nombre_paciente}\nRUT: {rut_paciente}\n\n1. Motivo de Consulta Inicial:\n[Describir brevemente cómo llegó el paciente]\n\n2. Objetivos Terapéuticos Trabajados:\n[Describir los focos de intervención]\n\n3. Apreciación Clínica y Estado Actual:\n[Describir avances, pronóstico o indicaciones]"
    };

    const TEMPLATE_NAMES = {
        asistencia: "Certificado de Asistencia",
        derivacion: "Informe de Derivación",
        resumen: "Resumen Clínico"
    };

    // Función para autocompletar la plantilla con los datos del paciente
    const handleSelectTemplate = (templateKey, currentPatient = patient) => {
        setActiveTemplate(templateKey);
        if (!currentPatient) {
            setReportContent("Por favor, seleccione un consultante primero.");
            return;
        }

        let text = TEMPLATES[templateKey];
        const nombre = currentPatient.personal?.legalName || currentPatient.name || '___________';
        const rut = currentPatient.personal?.rut || '___________';

        text = text.replace(/{nombre_paciente}/g, nombre);
        text = text.replace(/{rut_paciente}/g, rut);
        
        setReportContent(text);
    };

    // Al cambiar de paciente, actualizamos el texto automáticamente
    const handlePatientSelect = (pId) => {
        setSelectedPatientId(pId);
        const p = getPatient(pId);
        handleSelectTemplate(activeTemplate, p);
    };

    const handleSaveReport = async () => {
        if (!reportContent.trim()) return;
        
        const newReport = {
            id: Date.now(),
            type: TEMPLATE_NAMES[activeTemplate],
            date: getLocalDate(),
            content: reportContent
        };

        const updatedReports = [newReport, ...reportsHistory];
        
        await savePatientData(selectedPatientId, {
            ...patient,
            clinical: {
                ...patient.clinical,
                reports: updatedReports
            }
        });
        
        notify("Informe guardado en el historial del consultante");
        setHasUnsavedChanges(false);
        setViewMode('historial');
    };

    return (
        <div className="space-y-8 animate-in fade-in h-full flex flex-col pb-10 max-w-6xl mx-auto">
            
            {/* --- ENCABEZADO --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 border-b border-[#DFD2C4]/50 shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={14} className="text-[#A3968B]"/>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#9A8F84]">Documentación</p>
                    </div>
                    <h2 className="text-4xl font-black text-[#312923] tracking-tighter">Informes Clínicos</h2>
                </div>
                
                {/* TABS NUEVO / HISTORIAL */}
                <div className="flex bg-[#FDFBF7] p-1.5 rounded-2xl border border-[#DFD2C4]/60 shadow-sm w-fit">
                    <button
                        onClick={() => setViewMode('nuevo')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'nuevo' ? 'bg-[#312923] text-white shadow-md' : 'text-[#9A8F84] hover:text-[#312923]'}`}
                    >
                        <FileSignature size={14}/> Redactar
                    </button>
                    <button
                        onClick={() => {
                            if (hasUnsavedChanges && viewMode === 'nuevo') {
                                if (!window.confirm('Tienes cambios sin guardar. ¿Salir de todas formas?')) return;
                            }
                            setViewMode('historial');
                        }}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'historial' ? 'bg-[#5B6651] text-white shadow-md' : 'text-[#9A8F84] hover:text-[#312923]'}`}
                    >
                        <History size={14}/> Historial
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* --- COLUMNA IZQUIERDA: SELECTOR --- */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-[2rem] border border-[#DFD2C4]/60 bg-white p-6 shadow-sm">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#5B6651] ml-1 mb-3 block">1. Consultante</label>
                        <PatientSelect theme={themeMode} patients={patientRecords} placeholder="Buscar Consultante..." onSelect={(p) => handlePatientSelect(p.id)} />
                        
                        {patient && (
                            <div className="mt-4 p-4 bg-[#FDFBF7] border border-[#DFD2C4]/50 rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#CBAAA2]/10 text-[#CBAAA2] flex items-center justify-center font-black">
                                    {patient.personal?.legalName?.charAt(0) || <User size={16}/>}
                                </div>
                                <div>
                                    <p className="font-black text-sm text-[#312923]">{patient.personal?.legalName || 'Sin Nombre'}</p>
                                    <p className="text-[10px] font-bold text-[#9A8F84] mt-0.5">RUT: {patient.personal?.rut || 'No registrado'}</p>
                                </div>
                            </div>
                        )}
                    </Card>

                    {viewMode === 'nuevo' && (
                        <Card className="rounded-[2rem] border border-[#DFD2C4]/60 bg-white p-6 shadow-sm">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#5B6651] ml-1 mb-3 block">2. Tipo de Documento</label>
                            <div className="flex flex-col gap-2">
                                {Object.keys(TEMPLATE_NAMES).map(key => (
                                    <button 
                                        key={key}
                                        onClick={() => handleSelectTemplate(key)}
                                        className={`p-3 rounded-xl text-xs font-bold text-left transition-all border ${activeTemplate === key ? 'bg-[#5B6651]/5 border-[#5B6651]/30 text-[#5B6651]' : 'bg-transparent border-transparent text-[#9A8F84] hover:bg-[#FDFBF7] hover:border-[#DFD2C4]/50 hover:text-[#312923]'}`}
                                    >
                                        {TEMPLATE_NAMES[key]}
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* --- COLUMNA DERECHA: EDITOR O HISTORIAL --- */}
                <div className="lg:col-span-8">
                    {viewMode === 'nuevo' ? (
                        <Card className="rounded-[2.5rem] border border-[#DFD2C4]/60 bg-[#FDFBF7] p-8 shadow-sm flex flex-col h-full min-h-[500px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-lg text-[#312923] flex items-center gap-2">
                                    Vista Previa y Edición
                                </h3>
                                {patient && <span className="text-[9px] bg-white border border-[#DFD2C4] px-3 py-1 rounded-full font-black text-[#A3968B] uppercase tracking-widest">Autocompletado Activo</span>}
                            </div>
                            
                            <textarea 
                                className="flex-1 w-full bg-white border border-[#DFD2C4] rounded-2xl p-6 text-sm text-[#312923] font-medium leading-relaxed outline-none focus:border-[#5B6651] transition-all resize-none shadow-inner custom-scrollbar"
                                value={reportContent}
                                onChange={e => { setReportContent(e.target.value); setHasUnsavedChanges(true); }}
                                placeholder="Selecciona un paciente para comenzar a redactar..."
                                disabled={!patient}
                            />

                            <div className="pt-6 mt-auto flex justify-end gap-3 border-t border-[#DFD2C4]/50">
                                <button 
                                    onClick={handleSaveReport}
                                    disabled={!patient || !reportContent.trim()}
                                    className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${!patient || !reportContent.trim() ? 'bg-[#DFD2C4]/30 text-[#9A8F84] cursor-not-allowed' : 'bg-[#312923] text-white hover:bg-[#1a1512] shadow-md hover:-translate-y-0.5'}`}
                                >
                                    <CheckCircle size={16}/> Guardar en Historial
                                </button>
                            </div>
                        </Card>
                    ) : (
                        <Card className="rounded-[2.5rem] border border-[#DFD2C4]/60 bg-white p-8 shadow-sm h-full min-h-[500px]">
                            <h3 className="font-black text-lg text-[#312923] mb-6 flex items-center gap-2 border-b border-[#DFD2C4]/50 pb-4">
                                <History className="text-[#A3968B]"/> Documentos Previos
                            </h3>

                            {!patient ? (
                                <div className="text-center py-20 opacity-50">
                                    <User size={48} className="mx-auto text-[#9A8F84] mb-4"/>
                                    <p className="text-sm font-bold text-[#9A8F84]">Selecciona un consultante para ver sus informes.</p>
                                </div>
                            ) : reportsHistory.length === 0 ? (
                                <div className="text-center py-20 bg-[#FDFBF7] border border-dashed border-[#DFD2C4] rounded-3xl">
                                    <p className="text-xs font-bold text-[#9A8F84] uppercase tracking-widest">No hay informes emitidos aún</p>
                                </div>
                            ) : (
                                <div className="space-y-4 custom-scrollbar overflow-y-auto max-h-[400px] pr-2">
                                    {reportsHistory.map(rep => (
                                        <div key={rep.id} className="p-5 bg-[#FDFBF7] border border-[#DFD2C4]/60 rounded-2xl hover:border-[#A3968B] transition-all group">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                                <div>
                                                    <p className="font-black text-[#312923]">{rep.type}</p>
                                                    <p className="text-[10px] font-bold text-[#9A8F84] uppercase tracking-widest mt-1">Emitido el: {rep.date}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => generatePDF('report', rep)} 
                                                        className="px-4 py-2 bg-white border border-[#DFD2C4] text-[#312923] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#312923] hover:text-white transition-all flex items-center gap-2 shadow-sm"
                                                    >
                                                        <Download size={14}/> PDF
                                                    </button>
                                                    <button 
                                                        onClick={async () => {
                                                            if(window.confirm("¿Eliminar este informe del historial?")) {
                                                                const filtered = reportsHistory.filter(r => r.id !== rep.id);
                                                                await savePatientData(selectedPatientId, {
                                                                    ...patient, clinical: { ...patient.clinical, reports: filtered }
                                                                });
                                                                notify("Informe eliminado");
                                                            }
                                                        }} 
                                                        className="p-2 text-[#DFD2C4] hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-[#6B615A] mt-4 line-clamp-2 italic bg-white p-3 rounded-xl border border-[#DFD2C4]/30">"{rep.content}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}