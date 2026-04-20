import React from 'react';
import { X, Trash2, MessageCircle, Brain } from 'lucide-react';
import { Card, Button } from './UIComponents';
import { PatientSelect } from './SystemModals';
import { supabase } from '../supabase';

export default function ApptModal({
    themeMode, newAppt, setNewAppt, setModal, patientRecords, setPatientRecords,
    getPatient, savePatientData, notify, appointments, setAppointments,
    saveToSupabase, sendWhatsApp, getPatientPhone, session
}) {
    return (
        <div className="fixed inset-0 z-[100] bg-[#312923]/40 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl p-8 space-y-6 bg-white/95 border-[#DFD2C4]/50 rounded-[2.5rem] animate-in zoom-in-95 duration-200">
                
                <div className="flex justify-between items-center border-b border-[#DFD2C4]/40 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#5B6651]/10 flex items-center justify-center text-[#5B6651]"><Brain size={20}/></div>
                        <div>
                            <h3 className="font-black text-2xl text-[#312923] tracking-tight">{newAppt.id ? 'Detalle de Sesión' : 'Agendar Sesión'}</h3>
                                {newAppt.id && <p className="text-[10px] font-black text-[#9A8F84] uppercase tracking-widest">Consultante: {newAppt.patient_name || newAppt.name || 'Sin Nombre'}</p>}                        </div>
                    </div>
                    <button onClick={() => setModal(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#FDFBF7] text-[#9A8F84] border border-transparent hover:border-[#DFD2C4]/50 transition-all"><X size={20}/></button>
                </div>
                
                {!newAppt.id && (
                    <div className="bg-[#FDFBF7] p-5 rounded-3xl border border-[#DFD2C4]/50 shadow-sm">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#5B6651] mb-3 block">Seleccionar Consultante</label>
                        <PatientSelect theme={themeMode} patients={patientRecords} placeholder="Buscar o crear ficha..." onSelect={(p) => {
                            const name = p.id === 'new' ? p.name : (p.personal?.legalName || p.name);
                            if (p.id === 'new') {
                                const id = "pac_" + Date.now();
                                savePatientData(id, { id, name, personal: { legalName: name } });
                                notify("Nueva ficha terapéutica creada");
                            }
                            setNewAppt({...newAppt, patient_name: name});
                        }} />
                    </div>
                )}
                
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#9A8F84] ml-1">Motivo de Consulta / Tipo de Sesión</label>
                        <select 
                            className="w-full p-3.5 rounded-2xl border border-[#DFD2C4] bg-[#FDFBF7] text-sm font-bold text-[#312923] outline-none focus:border-[#5B6651]" 
                            value={newAppt.treatment || 'Psicoterapia Individual (Adultos)'} 
                            onChange={e => setNewAppt({...newAppt, treatment: e.target.value})}
                        >
                            <option value="Psicoterapia Individual (Adultos)">Psicoterapia Individual (Adultos)</option>
                            <option value="Psicoterapia Infanto-Juvenil">Psicoterapia Infanto-Juvenil</option>
                            <option value="Terapia de Pareja">Terapia de Pareja</option>
                            <option value="Terapia Familiar">Terapia Familiar</option>
                            <option value="Evaluación Psicodiagnóstica">Evaluación Psicodiagnóstica</option>
                            <option value="Orientación Vocacional">Orientación Vocacional</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#9A8F84] ml-1">Fecha</label>
                            <input type="date" className="w-full p-3.5 rounded-2xl border border-[#DFD2C4] bg-[#FDFBF7] text-sm font-bold text-[#312923] outline-none focus:border-[#5B6651]" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})}/>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#9A8F84] ml-1">Hora Inicio</label>
                            <input type="time" className="w-full p-3.5 rounded-2xl border border-[#DFD2C4] bg-[#FDFBF7] text-sm font-bold text-[#312923] outline-none focus:border-[#5B6651]" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})}/>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#9A8F84] ml-1">Duración</label>
                            <select className="w-full p-3.5 rounded-2xl border border-[#DFD2C4] bg-[#FDFBF7] text-sm font-bold text-[#312923] outline-none focus:border-[#5B6651]" value={newAppt.duration || 60} onChange={e => setNewAppt({...newAppt, duration: Number(e.target.value)})}>
                                <option value={45}>45 minutos</option>
                                <option value={60}>1 Hora</option>
                                <option value={90}>1.5 Horas</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#9A8F84] ml-1">Estado</label>
                            <select className="w-full p-3.5 rounded-2xl border border-[#DFD2C4] bg-[#FDFBF7] text-sm font-bold text-[#312923] outline-none focus:border-[#5B6651]" value={newAppt.status || 'agendado'} onChange={e => setNewAppt({...newAppt, status: e.target.value})}>
                                <option value="agendado">⚪ Agendado</option>
                                <option value="confirmado">🟢 Confirmado</option>
                                <option value="espera">🟡 En Sala de Espera</option>
                                <option value="atendiendo">🔵 En Sesión</option>
                                <option value="no_asistio">🔴 No Asistió</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-[#DFD2C4]/40">
                    {newAppt.id && (
                        <button className="px-5 py-3.5 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-500 transition-all flex items-center justify-center" onClick={async () => {
                            await supabase.from('appointments').delete().eq('id', newAppt.id);
                            setAppointments(appointments.filter(a => a.id !== newAppt.id));
                            setModal(null);
                            notify("Sesión eliminada de la agenda");
                        }}><Trash2 size={20}/></button>
                    )}
                    <button className="flex-1 px-5 py-3.5 bg-[#5B6651] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:-translate-y-0.5 transition-all" onClick={async () => {
                        if(!newAppt.patient_name) {
                            alert("Por favor, selecciona o crea un consultante.");
                            return;
                        }
                        if(!newAppt.date || !newAppt.time) {
                            alert("Por favor, define la fecha y la hora.");
                            return;
                        }
                        const id = newAppt.id || "appt_" + Date.now();
                        const data = {...newAppt, id, user_id: session?.user?.id};
                        await saveToSupabase('appointments', id, data);
                        setAppointments(newAppt.id ? appointments.map(a => a.id === id ? data : a) : [...appointments, data]);
                        setModal(null);
                        notify(newAppt.id ? "Sesión actualizada" : "Sesión agendada exitosamente");
                    }}>
                        {newAppt.id ? 'GUARDAR CAMBIOS' : 'AGENDAR SESIÓN'}
                    </button>
                </div>

                {newAppt.id && (
                    <button 
                        onClick={() => sendWhatsApp(getPatientPhone(newAppt.patient_name), `Hola ${newAppt.patient_name}, le confirmo su sesión de psicología para el ${newAppt.date.split('-').reverse().join('/')} a las ${newAppt.time}. ¿Me confirma su asistencia?`)} 
                        className="w-full flex items-center justify-center gap-2 text-[11px] bg-[#5B6651]/5 text-[#5B6651] py-3 rounded-xl font-black uppercase tracking-widest border border-transparent hover:border-[#5B6651]/20 transition-all"
                    >
                        <MessageCircle size={16} /> Enviar Recordatorio por WhatsApp
                    </button>
                )}
            </Card>
        </div>
    );
}