import React, { useEffect } from 'react';
import { FileText, Save, CheckSquare, AlertCircle, History } from 'lucide-react';
import { InputField, Button } from './UIComponents';

export default function PatientAnamnesisTab({
    getPatient, selectedPatientId, savePatientData,
    session, notify, activeFormType, setActiveFormType,
    viewingForm, setViewingForm
}) {
    const p = getPatient(selectedPatientId);
    
    // Simplificamos la estructura de datos
    const anamnesis = p.anamnesis || { drafts: {}, history: [] };
    const drafts = anamnesis.drafts || { general: {} };
    const history = anamnesis.history || [];
    
    useEffect(() => {
        if (!activeFormType && !viewingForm) setActiveFormType('general');
    }, [activeFormType, viewingForm, setActiveFormType]);

    const setDraft = (field, value) => {
        savePatientData(selectedPatientId, { 
            ...p, 
            anamnesis: { 
                ...anamnesis, 
                drafts: { ...drafts, general: { ...drafts.general, [field]: value } } 
            } 
        });
    };

    const saveFinalForm = () => {
        if (!window.confirm("¿Sellar esta Ficha Clínica de Ingreso? El documento pasará al archivo histórico inmutable.")) return;
        
        const newForm = { 
            id: Date.now().toString(), 
            type: 'general', 
            label: 'Ficha Clínica de Ingreso', 
            date: new Date().toLocaleString('es-CL'), 
            author: session?.user?.email || 'Psicólogo/a', 
            data: { ...drafts.general } 
        };
        
        savePatientData(selectedPatientId, { 
            ...p, 
            anamnesis: { 
                ...anamnesis, 
                history: [newForm, ...history], 
                drafts: { ...drafts, general: {} } 
            } 
        });
        
        if(typeof notify === 'function') notify("Ficha Clínica sellada en el historial");
        setViewingForm(newForm); 
    };

    // AQUÍ ESTÁ LA CORRECCIÓN CLAVE
    const activeData = viewingForm ? (viewingForm.data || {}) : (drafts.general || {});
    const isReadOnly = !!viewingForm; // Esto evita que "undefined" rompa la pantalla
    
    return (
        <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto pb-10">
            
            {/* CABECERA: MODO LECTURA O EDICIÓN */}
            {isReadOnly ? (
                <div className="flex items-center justify-between bg-white border border-[#DFD2C4]/50 p-4 rounded-3xl shadow-sm">
                    <button onClick={() => setViewingForm(null)} className="px-4 py-2 bg-[#FDFBF7] hover:bg-[#DFD2C4]/30 rounded-xl text-[10px] font-black text-[#9A8F84] uppercase transition-colors">
                        Volver a Edición
                    </button>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-[#5B6651] uppercase mb-1">Documento Sellado</p>
                        <h2 className="text-lg font-black text-[#312923]">{viewingForm?.label || 'Ficha Histórica'}</h2>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-[#9A8F84] uppercase">{viewingForm?.date}</p>
                        <p className="text-[10px] font-bold text-[#6B615A] uppercase">{viewingForm?.author}</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 border-b border-[#DFD2C4]/40 pb-6">
                    <div className="p-3 bg-[#5B6651]/10 text-[#5B6651] rounded-xl"><FileText size={24} /></div>
                    <div>
                        <h2 className="text-2xl font-black text-[#312923] tracking-tight">Ficha Clínica de Ingreso</h2>
                        <p className="text-[10px] font-bold text-[#9A8F84] uppercase tracking-widest">Borrador en edición</p>
                    </div>
                </div>
            )}

            {/* LIENZO DE LA FICHA (Basado en la lista de tu prima) */}
            <div className="bg-white border border-[#DFD2C4]/40 rounded-[2rem] p-6 md:p-10 shadow-sm space-y-8">
                
                {/* 1. Motivo de Consulta */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-[#9A8F84] border-b border-[#DFD2C4]/50 pb-1">1. Motivo de Consulta</h4>
                    <InputField textarea label="Motivo de Consulta Manifiesto" disabled={isReadOnly} value={activeData.motivoManifiesto || ''} onChange={e=>setDraft('motivoManifiesto', e.target.value)} placeholder="¿Qué trae al consultante hoy? En sus propias palabras o de sus padres." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-[#9A8F84] ml-1">Derivación</label>
                            <select className="w-full p-3.5 rounded-2xl border border-[#DFD2C4]/70 bg-[#FDFBF7] font-bold outline-none text-sm" disabled={isReadOnly} value={activeData.derivacion || ''} onChange={e=>setDraft('derivacion', e.target.value)}>
                                <option value="">Seleccione...</option>
                                <option value="Iniciativa Propia">Iniciativa Propia</option>
                                <option value="Colegio">Colegio</option>
                                <option value="Psiquiatra">Psiquiatra</option>
                                <option value="Otro Profesional">Otro Profesional / Médico</option>
                            </select>
                        </div>
                        <InputField label="Expectativas del Proceso" disabled={isReadOnly} value={activeData.expectativas || ''} onChange={e=>setDraft('expectativas', e.target.value)} placeholder="¿Qué esperan lograr?" />
                    </div>
                </div>

                {/* 2. Antecedentes Clínicos Relevantes */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-[#9A8F84] border-b border-[#DFD2C4]/50 pb-1">2. Antecedentes Clínicos Relevantes</h4>
                    <InputField textarea label="Procesos Psicológicos / Psiquiátricos Previos" disabled={isReadOnly} value={activeData.procesosPrevios || ''} onChange={e=>setDraft('procesosPrevios', e.target.value)} placeholder="Breve detalle si corresponde..." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField textarea label="Diagnósticos Médicos o de Salud Mental" disabled={isReadOnly} value={activeData.diagnosticos || ''} onChange={e=>setDraft('diagnosticos', e.target.value)} />
                        <InputField textarea label="Consumo de Medicamentos Actuales" disabled={isReadOnly} value={activeData.medicamentos || ''} onChange={e=>setDraft('medicamentos', e.target.value)} />
                    </div>
                </div>

                {/* 3. Contexto Vital y Familiar */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-[#9A8F84] border-b border-[#DFD2C4]/50 pb-1">3. Contexto Vital y Familiar</h4>
                    <InputField textarea label="Composición Familiar / Con quién vive" disabled={isReadOnly} value={activeData.composicionFamiliar || ''} onChange={e=>setDraft('composicionFamiliar', e.target.value)} placeholder="Mapeo rápido del entorno..." />
                    <InputField textarea label="Observaciones Generales del Contexto" disabled={isReadOnly} value={activeData.observacionesContexto || ''} onChange={e=>setDraft('observacionesContexto', e.target.value)} placeholder="Dinámicas familiares, situaciones de estrés actuales..." />
                </div>

                {/* 4. Hitos del Desarrollo */}
                <div className="space-y-4 bg-[#FDFBF7] p-6 rounded-[2rem] border border-[#DFD2C4]/50">
                    <h4 className="text-[10px] font-black uppercase text-[#5B6651] border-b border-[#DFD2C4]/50 pb-1 flex items-center gap-2">
                        4. Hitos del Desarrollo (Clave Infanto-Juvenil)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InputField label="Destete" disabled={isReadOnly} value={activeData.hitoDestete || ''} onChange={e=>setDraft('hitoDestete', e.target.value)} placeholder="Edad/Meses" />
                        <InputField label="Control Esfínter" disabled={isReadOnly} value={activeData.hitoEsfinter || ''} onChange={e=>setDraft('hitoEsfinter', e.target.value)} placeholder="Edad/Meses" />
                        <InputField label="Gateo/Caminar" disabled={isReadOnly} value={activeData.hitoMotor || ''} onChange={e=>setDraft('hitoMotor', e.target.value)} placeholder="Edad/Meses" />
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-[#9A8F84] ml-1">Hábitos de Sueño</label>
                            <select className="w-full p-3.5 rounded-2xl border border-[#DFD2C4]/70 bg-white font-bold outline-none text-sm" disabled={isReadOnly} value={activeData.hitoSueno || ''} onChange={e=>setDraft('hitoSueno', e.target.value)}>
                                <option value="">Seleccione...</option>
                                <option value="Duerme solo">Duerme solo/a</option>
                                <option value="Duerme acompañado">Duerme acompañado/a</option>
                                <option value="Colecho">Colecho</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 5. Encuadre y Acuerdos Administrativos */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-[#9A8F84] border-b border-[#DFD2C4]/50 pb-1">5. Encuadre y Acuerdos Administrativos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-[#9A8F84] ml-1">Modalidad</label>
                            <select className="w-full p-3.5 rounded-2xl border border-[#DFD2C4]/70 bg-[#FDFBF7] font-bold outline-none text-sm" disabled={isReadOnly} value={activeData.modalidad || ''} onChange={e=>setDraft('modalidad', e.target.value)}>
                                <option value="">Seleccione...</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Online">Online</option>
                                <option value="Mixta">Mixta</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-[#9A8F84] ml-1">Frecuencia Acordada</label>
                            <select className="w-full p-3.5 rounded-2xl border border-[#DFD2C4]/70 bg-[#FDFBF7] font-bold outline-none text-sm" disabled={isReadOnly} value={activeData.frecuencia || ''} onChange={e=>setDraft('frecuencia', e.target.value)}>
                                <option value="">Seleccione...</option>
                                <option value="Semanal">Semanal</option>
                                <option value="Quincenal">Quincenal</option>
                                <option value="Mensual">Mensual</option>
                                <option value="A demanda">A demanda</option>
                            </select>
                        </div>
                        <InputField label="Arancel por Sesión ($)" disabled={isReadOnly} value={activeData.arancel || ''} onChange={e=>setDraft('arancel', e.target.value)} type="number" placeholder="Ej: 10000" />
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-[#FDFBF7] border border-[#DFD2C4]/50 rounded-2xl">
                        <button 
                            disabled={isReadOnly}
                            onClick={() => setDraft('consentimientoFirmado', !activeData.consentimientoFirmado)} 
                            className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${activeData.consentimientoFirmado ? 'bg-[#5B6651] border-[#5B6651] text-white' : 'bg-white border-[#DFD2C4]'}`}
                        >
                            {activeData.consentimientoFirmado && <CheckSquare size={14} />}
                        </button>
                        <span className="text-sm font-bold text-[#312923]">Consentimiento Informado Firmado</span>
                    </div>
                </div>

                {/* BOTÓN GUARDAR */}
                {!isReadOnly && (
                    <div className="mt-10 flex justify-end border-t border-[#DFD2C4]/40 pt-8">
                        <Button variant="primary" onClick={saveFinalForm} className="flex items-center gap-3 px-8 py-4 bg-[#5B6651] text-white hover:-translate-y-0.5 rounded-2xl font-black uppercase tracking-[0.15em] text-xs">
                            <Save size={18} /> SELLAR FICHA CLÍNICA
                        </Button>
                    </div>
                )}
            </div>

            {/* LISTA HISTORIAL */}
            {!isReadOnly && (
                <div className="pt-8">
                    <div className="flex items-center gap-3 mb-6"><History className="text-[#9A8F84]" size={20}/><h4 className="font-black text-xl text-[#312923]">Archivo Clínico Histórico</h4></div>
                    {history.length === 0 ? (
                        <div className="bg-white border border-[#DFD2C4]/40 rounded-3xl p-10 text-center"><p className="text-sm font-bold text-[#9A8F84]">Aún no hay fichas históricas selladas.</p></div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {history.map(form => (
                                <div key={form.id} onClick={() => setViewingForm(form)} className="p-5 bg-white border border-[#DFD2C4]/50 rounded-[1.5rem] flex items-start gap-4 cursor-pointer hover:border-[#5B6651]">
                                    <div className="p-3 rounded-2xl bg-[#FDFBF7] text-[#5B6651]"><FileText size={20}/></div>
                                    <div className="flex-1"><p className="font-black text-sm text-[#312923]">{form.label}</p><p className="text-[10px] font-bold text-[#9A8F84] mt-1">{form.date}</p></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}