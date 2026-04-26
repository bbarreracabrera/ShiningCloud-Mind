import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Brain } from 'lucide-react';

export default function AgendaView({ appointments, onOpenModal, sendWhatsApp, getPatientPhone, buildReminder }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const [selectedDay, setSelectedDay] = useState(todayStr);

    const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

    const statusColors = {
        agendado:   'border-l-[#9A8F84] bg-[#FDFBF7] text-[#6B615A] hover:bg-white border border-[#DFD2C4]/50 shadow-sm',
        confirmado: 'border-l-[#5B6651] bg-[#5B6651]/10 text-[#312923] hover:bg-[#5B6651]/20 border border-[#5B6651]/20 shadow-md',
        espera:     'border-l-[#D9A05B] bg-[#D9A05B]/10 text-[#8B6B3D] hover:bg-[#D9A05B]/20 border border-[#D9A05B]/30',
        atendiendo: 'border-l-[#8B9DA3] bg-[#8B9DA3]/10 text-[#4A5A60] hover:bg-[#8B9DA3]/20 border border-[#8B9DA3]/30',
        no_asistio: 'border-l-[#CBAAA2] bg-[#CBAAA2]/10 text-[#312923] hover:bg-[#CBAAA2]/20 border border-[#CBAAA2]/30'
    };

    // Calcular los 7 días de la semana centrados en currentDate
    const getWeekDays = () => Array.from({ length: 7 }, (_, i) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1) + i);
        return d;
    });

    const toDateStr = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in pb-4">

            {/* --- ENCABEZADO --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 pb-6 mb-4 border-b border-[#DFD2C4]/50 shrink-0">
                <div className="ml-14 md:ml-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Brain size={14} className="text-[#A3968B]"/>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#9A8F84]">Agenda de Sesiones</p>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-[#312923] tracking-tighter capitalize">
                        {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </h2>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3">
                    <div className="flex items-center p-1.5 bg-white rounded-2xl border border-[#DFD2C4]/60 shadow-sm">
                        <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }} className="p-2 rounded-xl hover:bg-[#FDFBF7] text-[#9A8F84] transition-colors"><ChevronLeft size={18}/></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#312923]">Hoy</button>
                        <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }} className="p-2 rounded-xl hover:bg-[#FDFBF7] text-[#9A8F84] transition-colors"><ChevronRight size={18}/></button>
                    </div>

                    <button
                        onClick={() => onOpenModal({ patient_name: '', treatment: 'Psicoterapia Individual (Adultos)', date: selectedDay, time: '09:00', duration: 60, status: 'agendado', id: null })}
                        className="hidden md:flex items-center gap-2 px-6 py-3.5 bg-[#312923] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                        <Plus size={16}/> Nueva Sesión
                    </button>
                </div>
            </div>

            {/* ============================================
                VISTA MÓVIL — lista por día
            ============================================ */}
            <div className="md:hidden flex-1 flex flex-col gap-4 overflow-auto">
                {/* Tabs de días */}
                <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
                    {getWeekDays().map((d, i) => {
                        const dateStr = toDateStr(d);
                        const isToday = d.toDateString() === new Date().toDateString();
                        const isSelected = dateStr === selectedDay;
                        const hasAppts = appointments.some(a => a.date === dateStr);
                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDay(dateStr)}
                                className={`flex flex-col items-center px-3 py-2 rounded-2xl shrink-0 transition-all border relative ${
                                    isSelected
                                        ? 'bg-[#312923] text-white border-[#312923]'
                                        : isToday
                                            ? 'bg-sage-green/10 text-[#312923] border-sage-green/30'
                                            : 'bg-white text-[#9A8F84] border-[#DFD2C4]/50'
                                }`}
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest">{dayNames[i]}</span>
                                <span className="text-base font-black">{d.getDate()}</span>
                                {hasAppts && <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-sage-green'}`}/>}
                            </button>
                        );
                    })}
                </div>

                {/* Lista de citas */}
                <div className="flex-1 overflow-auto space-y-3 pb-20">
                    {(() => {
                        const dayAppts = appointments
                            .filter(a => a.date === selectedDay)
                            .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

                        if (dayAppts.length === 0) {
                            return (
                                <div className="text-center py-14">
                                    <p className="text-3xl mb-3">📅</p>
                                    <p className="font-bold text-[#312923]">Sin sesiones este día</p>
                                    <p className="text-sm text-[#9A8F84] mt-1">Toca el botón + para agendar</p>
                                </div>
                            );
                        }

                        return dayAppts.map((appt, idx) => (
                            <div
                                key={idx}
                                onClick={() => onOpenModal(appt)}
                                className={`p-4 rounded-2xl border-l-4 cursor-pointer ${statusColors[appt.status] || statusColors.agendado}`}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm truncate">{appt.patient_name || 'Sin Nombre'}</p>
                                        <p className="text-xs opacity-70 mt-0.5 truncate">{appt.treatment}</p>
                                    </div>
                                    <span className="text-sm font-black shrink-0 tabular-nums">{appt.time}</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const phone = getPatientPhone(appt.patient_name);
                                        if (!phone) { alert('El paciente no tiene teléfono registrado'); return; }
                                        sendWhatsApp(phone, buildReminder(appt));
                                    }}
                                    className="text-[10px] text-[#5B6651] hover:underline mt-2 font-bold"
                                >
                                    📱 Recordar
                                </button>
                            </div>
                        ));
                    })()}
                </div>

                {/* FAB móvil */}
                <button
                    onClick={() => onOpenModal({ patient_name: '', treatment: 'Psicoterapia Individual (Adultos)', date: selectedDay, time: '09:00', duration: 60, status: 'agendado', id: null })}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-[#312923] text-white rounded-full shadow-xl flex items-center justify-center z-20"
                >
                    <Plus size={24}/>
                </button>
            </div>

            {/* ============================================
                VISTA DESKTOP — grilla semanal
            ============================================ */}
            <div className="hidden md:block md:flex-1 overflow-auto rounded-[2rem] border border-[#DFD2C4]/60 bg-white shadow-xl custom-scrollbar relative">
                {appointments.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center py-20 text-center z-10 pointer-events-none">
                        <p className="text-2xl mb-2">📅</p>
                        <p className="font-bold text-soft-dark">Sin sesiones esta semana</p>
                        <p className="text-sm text-gray-400 mt-1">Haz clic en "Nueva sesión" para agendar</p>
                    </div>
                )}
                <div className="grid grid-cols-8 min-w-[900px]">
                    <div className="p-2 border-b border-r border-[#DFD2C4]/40 bg-white/95 sticky top-0 z-30 flex items-center justify-center rounded-tl-[2rem]">
                        <span className="text-[9px] font-black text-[#9A8F84] uppercase tracking-widest">Hora</span>
                    </div>

                    {getWeekDays().map((d, i) => {
                        const isToday = d.toDateString() === new Date().toDateString();
                        return (
                            <div key={i} className={`py-3 px-2 border-b border-r border-[#DFD2C4]/40 text-center sticky top-0 z-20 bg-white/95 backdrop-blur-md ${isToday ? 'border-b-2 border-b-[#5B6651]' : ''}`}>
                                <p className={`text-[9px] font-black uppercase tracking-widest ${isToday ? 'text-[#5B6651]' : 'text-[#9A8F84]'}`}>{dayNames[i]}</p>
                                <div className={`w-9 h-9 mx-auto flex items-center justify-center rounded-full text-lg font-black mt-1 ${isToday ? 'bg-[#5B6651] text-white' : 'text-[#312923] bg-[#FDFBF7]'}`}>{d.getDate()}</div>
                            </div>
                        );
                    })}

                    {Array.from({ length: 13 }, (_, i) => 8 + i).map(h => (
                        <React.Fragment key={h}>
                            <div className="border-r border-b border-[#DFD2C4]/40 text-[11px] font-black text-[#A3968B] text-center h-[72px] flex items-start justify-center pt-2 bg-[#FDFBF7]">{h}:00</div>
                            {getWeekDays().map((d, i) => {
                                const dateStr = toDateStr(d);
                                const hourAppts = appointments.filter(a => a.date === dateStr && parseInt((a.time || '00:00').split(':')[0]) === h);
                                return (
                                    <div key={i} className="border-b border-r border-[#DFD2C4]/30 relative h-[72px] hover:bg-[#FDFBF7] cursor-pointer" onClick={() => onOpenModal({ patient_name: '', treatment: 'Psicoterapia Individual (Adultos)', date: dateStr, time: `${String(h).padStart(2, '0')}:00`, duration: 60, status: 'agendado' })}>
                                        {hourAppts.map((appt, idx) => (
                                            <div key={idx} onClick={(e) => { e.stopPropagation(); onOpenModal(appt); }} className={`absolute left-1 right-1 rounded-xl border-l-[4px] p-2 z-10 overflow-hidden transition-all hover:z-30 ${statusColors[appt.status] || statusColors.agendado}`} style={{ top: `${(parseInt(appt.time.split(':')[1]) || 0) / 60 * 100}%`, height: `${(appt.duration || 60) / 60 * 100}%` }}>
                                                <p className="text-[10px] font-black truncate">{appt.patient_name || appt.name || 'Sin Nombre'}</p>
                                                <p className="text-[8px] font-bold opacity-70 truncate uppercase tracking-tighter">{appt.treatment}</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const phone = getPatientPhone(appt.patient_name);
                                                        if (!phone) { alert('El paciente no tiene teléfono registrado'); return; }
                                                        sendWhatsApp(phone, buildReminder(appt));
                                                    }}
                                                    className="text-[8px] text-[#5B6651] hover:underline mt-0.5 leading-none"
                                                >
                                                    📱 Recordar
                                                </button>
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
