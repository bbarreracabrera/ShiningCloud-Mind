import React, { useState } from 'react';
import { Cloud, ArrowRight, Brain } from 'lucide-react';
import { formatRUT } from '../constants';

export default function OnboardingModal({ onSave }) {
    const [form, setForm] = useState({
        name: '', rut: '', specialty: '', phone: '', address: ''
    });

    const canSave = form.name.trim() && form.specialty.trim();

    const inputClass = "w-full p-4 rounded-2xl bg-[#FDFBF7] border border-[#DFD2C4] outline-none font-bold text-[#312923] focus:border-[#5B6651] transition-colors shadow-sm";
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-[#9A8F84] ml-1 mb-2 block";

    return (
        <div className="fixed inset-0 z-[200] bg-warm-white flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-sage-green/15 blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-water-blue/15 blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-500 py-8">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-sage-green rounded-2xl flex items-center justify-center shadow-lg shadow-sage-green/20 mb-4 border border-sage-green/40">
                        <Cloud className="text-white" size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black text-soft-dark tracking-tight text-center">
                        Bienvenida a <span className="text-sage-green">ShiningCloud</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-medium mt-2 text-center">
                        Cuéntanos sobre tu consulta para comenzar.
                    </p>
                </div>

                <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-pastel-pink/50 shadow-xl p-8 sm:p-10 space-y-5">

                    <div className="flex items-center gap-2 mb-1">
                        <Brain size={14} className="text-sage-green"/>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Datos Profesionales</p>
                    </div>

                    <div>
                        <label className={labelClass}>
                            Nombre Profesional <span className="text-[#CBAAA2]">*</span>
                        </label>
                        <input
                            className={inputClass}
                            placeholder="Ej: Ps. María González"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            RUT Profesional <span className="text-[#9A8F84] font-normal normal-case">(opcional)</span>
                        </label>
                        <input
                            className={inputClass}
                            placeholder="12.345.678-9"
                            value={form.rut}
                            onChange={e => setForm({ ...form, rut: formatRUT(e.target.value) })}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Especialidad / Enfoque <span className="text-[#CBAAA2]">*</span>
                        </label>
                        <input
                            className={inputClass}
                            placeholder="Ej: Psicología Clínica, Psicoterapia Sistémica..."
                            value={form.specialty}
                            onChange={e => setForm({ ...form, specialty: e.target.value })}
                        />
                    </div>

                    <div className="border-t border-[#DFD2C4]/40 pt-5 space-y-4">
                        <p className={labelClass}>Opcionales — puedes completarlos después en Ajustes</p>

                        <div>
                            <label className={labelClass}>Teléfono / WhatsApp</label>
                            <input
                                className={inputClass}
                                placeholder="+56 9 1234 5678"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Dirección de Consulta</label>
                            <input
                                className={inputClass}
                                placeholder="Av. Ejemplo 123, Oficina 4 (o Modalidad Online)"
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            disabled={!canSave}
                            onClick={() => onSave(form)}
                            className={`w-full py-4 font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all ${
                                canSave
                                    ? 'bg-soft-dark text-white hover:bg-opacity-90 shadow-md hover:-translate-y-0.5'
                                    : 'bg-pastel-pink text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Comenzar <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
