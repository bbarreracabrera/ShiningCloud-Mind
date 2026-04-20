import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Brain } from 'lucide-react';

export default function AgendaView({ appointments, onOpenModal }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

    const statusColors = {
        agendado:   'border-l-[#9A8F84] bg-[#FDFBF7] text-[#6B615A] hover:bg-white border border-[#DFD2C4]/50 shadow-sm',
        confirmado: 'border-l-[#5B6651] bg-[#5B6651]/10 text-[#312923] hover:bg-[#5B6651]/20 border border-[#5B6651]/20 shadow-md',
        espera:     'border-l-[#D9A05B] bg-[#D9A05B]/10 text-[#8B6B3D] hover:bg-[#D9A05B]/20 border border-[#D9A05B]/30', 
        atendiendo: 'border-l-[#8B9DA3] bg-[#8B9DA3]/10 text-[#4A5A60] hover:bg-[#8B9DA3]/20 border border-[#8B9DA3]/30', 
        no_asistio: 'border-l-[#CBAAA2] bg-[#CBAAA2]/10 text-[#312923] hover:bg-[#CBAAA2]/20 border border-[#CBAAA2]/30'
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in pb-4">
            
            {/* --- ENCABEZADO DE LA AGENDA --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 mb-4 border-b border-[#DFD2C4]/50 shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Brain size={14} className="text-[#A3968B]"/>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#9A8F84]">Agenda de Sesiones</p>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-[#312923] tracking-tighter capitalize">
                        {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </h2>
                </div>

                <div className="flex flex-col items-end gap-4">
                    <div className="flex flex-wrap items-center justify-end gap-4">
                        <div className="hidden lg:flex gap-4 text-[9px] font-black uppercase tracking-widest text-[#9A8F84] bg-white px-5 py-3 rounded-2xl border border-[#DFD2C4]/50 shadow-sm">
                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#DFD2C4]"></div>Agendado</span>
                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#5B6651]"></div>Confirmado</span>
                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#8B9DA3]"></div>En Sesión</span>
                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#CBAAA2]"></div>No Asistió</span>
                        </div>

                        <div className="flex items-center p-1.5 bg-white rounded-2xl border border-[#DFD2C4]/60 shadow-sm">
                            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }} className="p-2 rounded-xl hover:bg-[#FDFBF7] text-[#9A8F84] transition-colors"><ChevronLeft size={18}/></button>
                            <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-[#312923]">Hoy</button>
                            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }} className="p-2 rounded-xl hover:bg-[#FDFBF7] text-[#9A8F84] transition-colors"><ChevronRight size={18}/></button>
                        </div>

                        <button 
                            onClick={() => onOpenModal({patient_name: '', treatment: 'Psicoterapia Individual (Adultos)', date: '', time: '', duration: 60, status: 'agendado', id: null})} 
                            className="flex items-center gap-2 px-6 py-3.5 bg-[#312923] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            <Plus size={16}/> Nueva Sesión
                        </button>
                    </div>
                </div>
            </div>
            
            {/* --- GRILLA PRINCIPAL --- */}
            <div className="flex-1 overflow-auto rounded-[2rem] border border-[#DFD2C4]/60 bg-white shadow-xl custom-scrollbar relative">
                <div className="grid grid-cols-8 min-w-[900px]">
                    <div className="p-2 border-b border-r border-[#DFD2C4]/40 bg-white/95 sticky top-0 z-30 flex items-center justify-center rounded-tl-[2rem]">
                        <span className="text-[9px] font-black text-[#9A8F84] uppercase tracking-widest">Hora</span>
                    </div>
                    
                    {Array.from({length: 7}, (_, i) => {
                        const d = new Date(currentDate); 
                        d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1) + i); 
                        const isToday = d.toDateString() === new Date().toDateString();
                        return (
                            <div key={i} className={`py-3 px-2 border-b border-r border-[#DFD2C4]/40 text-center sticky top-0 z-20 bg-white/95 backdrop-blur-md ${isToday ? 'border-b-2 border-b-[#5B6651]' : ''}`}>
                                <p className={`text-[9px] font-black uppercase tracking-widest ${isToday ? 'text-[#5B6651]' : 'text-[#9A8F84]'}`}>{dayNames[i]}</p>
                                <div className={`w-9 h-9 mx-auto flex items-center justify-center rounded-full text-lg font-black mt-1 ${isToday ? 'bg-[#5B6651] text-white' : 'text-[#312923] bg-[#FDFBF7]'}`}>{d.getDate()}</div>
                            </div>
                        );
                    })}
                    
                    {Array.from({length: 13}, (_, i) => 8 + i).map(h => ( 
                        <React.Fragment key={h}>
                            <div className="border-r border-b border-[#DFD2C4]/40 text-[11px] font-black text-[#A3968B] text-center h-[72px] flex items-start justify-center pt-2 bg-[#FDFBF7]">{h}:00</div>
                            {Array.from({length: 7}, (_, i) => {
                                const d = new Date(currentDate); 
                                d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1) + i); 
                                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                const hourAppts = appointments.filter(a => a.date === dateStr && parseInt(a.time.split(':')[0]) === h); 
                                
                                return (
                                    <div key={i} className="border-b border-r border-[#DFD2C4]/30 relative h-[72px] hover:bg-[#FDFBF7] cursor-pointer" onClick={() => onOpenModal({patient_name: '', treatment: 'Psicoterapia Individual (Adultos)', date: dateStr, time: `${String(h).padStart(2, '0')}:00`, duration: 60, status: 'agendado'})}>
                                        {hourAppts.map((appt, idx) => (
                                            <div key={idx} onClick={(e) => { e.stopPropagation(); onOpenModal(appt); }} className={`absolute left-1 right-1 rounded-xl border-l-[4px] p-2 z-10 overflow-hidden transition-all hover:z-30 ${statusColors[appt.status] || statusColors.agendado}`} style={{ top: `${(parseInt(appt.time.split(':')[1]) || 0) / 60 * 100}%`, height: `${(appt.duration || 60) / 60 * 100}%` }}>
                                                {/* VARIABLE CORREGIDA PARA MOSTRAR NOMBRE */}
                                                <p className="text-[10px] font-black truncate">{appt.patient_name || appt.name || 'Sin Nombre'}</p>
                                                <p className="text-[8px] font-bold opacity-70 truncate uppercase tracking-tighter">{appt.treatment}</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}