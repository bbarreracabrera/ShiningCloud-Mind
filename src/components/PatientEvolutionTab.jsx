import React, { useState, useEffect, useRef } from 'react';
import { FileLock, PenTool, Clock, User, Brain } from 'lucide-react';

export default function PatientEvolutionTab({
    getPatient, selectedPatientId, savePatientData, session, logAction, notify
}) {
    const patient = getPatient(selectedPatientId);

    const evolutions = patient.clinical?.evolution || [];

    const [newEvolution, setNewEvolution] = useState('');
    const draftTimer = useRef(null);
    const DRAFT_KEY = `evolution_draft_${selectedPatientId}`;

    // Restaurar borrador al montar o cambiar de paciente
    useEffect(() => {
        setNewEvolution('');
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                const age = Date.now() - parsed.timestamp;
                if (age < 7 * 24 * 60 * 60 * 1000 && parsed.text) {
                    setNewEvolution(parsed.text);
                    if (typeof notify === 'function') notify('Borrador restaurado del último intento');
                }
            } catch (e) {}
        }
    }, [selectedPatientId]);

    // Autoguardar borrador mientras escribe (debounce 2s)
    useEffect(() => {
        if (!newEvolution) return;
        if (draftTimer.current) clearTimeout(draftTimer.current);
        draftTimer.current = setTimeout(() => {
            localStorage.setItem(DRAFT_KEY, JSON.stringify({ text: newEvolution, timestamp: Date.now() }));
        }, 2000);
        return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
    }, [newEvolution]);

    const handleSave = () => {
        if (!newEvolution.trim()) return;

        const n = {
            id: Date.now(),
            text: newEvolution,
            date: new Date().toLocaleString('es-CL'),
            author: session?.user?.email || 'Terapeuta Titular'
        };

        savePatientData(selectedPatientId, {
            ...patient,
            clinical: {
                ...patient.clinical,
                evolution: [n, ...evolutions]
            }
        });

        localStorage.removeItem(DRAFT_KEY);
        setNewEvolution('');
        if (typeof logAction === 'function') {
            logAction('ADD_EVOLUTION', { text_preview: newEvolution.substring(0, 20) }, selectedPatientId);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto pb-10">
            
            {/* --- ENCABEZADO --- */}
            <div className="border-b border-[#DFD2C4]/50 pb-4">
                <h2 className="text-2xl font-black text-[#312923] tracking-tight flex items-center gap-3">
                    <div className="p-2.5 bg-[#CBAAA2]/10 text-[#CBAAA2] rounded-xl">
                        <PenTool size={22} />
                    </div>
                    Notas de Evolución / Sesión
                </h2>
                <p className="text-[10px] font-bold text-[#9A8F84] uppercase tracking-widest mt-2 ml-1">
                    Registro confidencial e inmutable de atenciones
                </p>
            </div>

            {/* --- ÁREA DE REDACCIÓN (NUEVA NOTA DE SESIÓN) --- */}
            <div className="bg-white border border-[#DFD2C4]/60 rounded-[2rem] p-6 shadow-sm relative">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#5B6651] flex items-center gap-2">
                        <Brain size={14} className="text-[#A3968B]"/> Nueva Entrada de Sesión
                    </span>
                </div>
                
                <div className="relative bg-[#FDFBF7] border border-[#DFD2C4]/50 rounded-2xl p-5 focus-within:border-[#5B6651]/50 transition-colors shadow-inner">
                    <textarea 
                        rows="5" 
                        placeholder="Redacte las notas de la sesión de hoy (temáticas abordadas, avances, tareas asignadas, evaluación de riesgo, etc.). Una vez sellado, el registro no podrá modificarse por razones legales y éticas..." 
                        className="bg-transparent outline-none w-full font-medium text-sm text-[#312923] resize-none placeholder:text-[#9A8F84]/60 custom-scrollbar pr-2" 
                        value={newEvolution} 
                        onChange={e => setNewEvolution(e.target.value)} 
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all shadow-lg ${
                            newEvolution.trim() 
                            ? 'bg-[#312923] text-white hover:bg-[#1a1512] shadow-[#312923]/20 hover:-translate-y-0.5' 
                            : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed shadow-none'
                        }`}
                        onClick={handleSave}
                        disabled={!newEvolution.trim()}
                    >
                        <FileLock size={16} /> Firmar y Sellar Nota
                    </button>
                </div>
            </div>

            {/* --- HISTORIAL DE SESIONES (TIMELINE) --- */}
            <div className="pt-6">
                {evolutions.length === 0 ? (
                    <div className="text-center py-12 bg-[#FDFBF7] border-2 border-dashed border-[#DFD2C4] rounded-[2rem]">
                        <Clock className="mx-auto text-[#DFD2C4] mb-3" size={32}/>
                        <p className="text-sm font-bold text-[#9A8F84]">No hay registros de sesiones previas</p>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-[#DFD2C4]/40 ml-4 pl-8 space-y-8 pb-4">
                        {evolutions.map((ev) => (
                            <div key={ev.id} className="relative group">
                                <div className="absolute -left-[41px] top-5 w-4 h-4 bg-white border-4 border-[#CBAAA2] group-hover:border-[#5B6651] rounded-full shadow-sm transition-colors z-10" />
                                <div className="bg-white p-6 rounded-[2rem] border border-[#DFD2C4]/60 shadow-sm hover:shadow-md hover:border-[#5B6651]/30 transition-all">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 border-b border-[#DFD2C4]/40 pb-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-[#5B6651] uppercase tracking-widest bg-[#5B6651]/5 px-3 py-1.5 rounded-lg border border-[#5B6651]/10">
                                            <Clock size={14} />
                                            {ev.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#9A8F84] bg-[#FDFBF7] px-3 py-1.5 rounded-lg border border-[#DFD2C4]/50">
                                            <User size={12} className="text-[#CBAAA2]" />
                                            {ev.author}
                                        </div>
                                    </div>
                                    <p className="text-sm text-[#312923] leading-relaxed whitespace-pre-wrap font-medium">
                                        {ev.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}