import React from 'react';
import { DollarSign, TrendingDown, BarChart2, PieChart, ArrowRight, Clock, CalendarClock, User, Wallet, Plus, Calendar, FileEdit, FileText, Tag } from 'lucide-react';
import { Card, Button, SimpleLineChart } from '../components/UIComponents';
export default function DashboardView({
    config, userRole, themeMode, t,
    totalCollected, totalExpenses, netProfit, chartData, todaysAppointments,
    setActiveTab, setFinanceTab, setModal, setSelectedPatientId, setQuoteMode,
    appointments = [], sendWhatsApp, getPatientPhone, buildReminder
}) {
    const today = new Date();

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const pendingNotes = appointments
        .filter(a => {
            if (!a.date) return false;
            const d = new Date(a.date + 'T12:00:00');
            return d < today && d >= sevenDaysAgo
                && a.status !== 'no_asistio'
                && a.status !== 'agendado';
        })
        .map(a => ({
            patientName: a.patient_name || a.name || 'Consultante',
            date: a.date,
            tags: [a.treatment ? `#${a.treatment.toLowerCase().split(' ')[0]}` : '#sesión']
        }));
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('es-CL', dateOptions);

    return (
        <div className="space-y-8 animate-in fade-in custom-scrollbar pb-10">
            
            {/* --- ENCABEZADO CÁLIDO --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-pastel-pink/50 pb-6 bg-gradient-to-r from-transparent to-warm-white rounded-3xl p-2">
                <div className="ml-14 md:ml-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-sage-green"/>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{formattedDate}</p>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-soft-dark tracking-tighter">Hola, {config?.name?.split(' ')[0] || 'Doc'} 👋</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={()=>setModal('appt')} className="px-5 py-3 rounded-xl border border-pastel-pink bg-white text-soft-dark text-[11px] font-bold uppercase tracking-widest hover:bg-warm-white transition-all flex items-center gap-2 shadow-sm">
                        <CalendarClock size={16} className="text-sage-green"/> Agendar
                    </button>
                    <button onClick={()=>{setActiveTab('ficha'); setSelectedPatientId(null);}} className="px-5 py-3 rounded-xl bg-sage-green text-white text-[11px] font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-md shadow-sage-green/20">
                        <Plus size={16}/> Nuevo Paciente
                    </button>
                </div>
            </div>
            
            {/* --- MÉTRICAS FINANCIERAS (Simplificadas y Suaves) --- */}
            {userRole === 'admin' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Tarjeta Ingresos */}
                    <Card className="rounded-[2rem] border border-pastel-pink/30 bg-white shadow-sm hover:shadow-md transition-shadow p-6">
                        <div className="flex justify-between mb-6 items-start">
                            <div className="p-3 bg-sage-green/10 rounded-2xl text-sage-green"><DollarSign size={24} strokeWidth={2.5}/></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-warm-white px-3 py-1 rounded-full">Ingresos</span>
                        </div>
                        <h2 className="text-4xl font-black text-soft-dark tracking-tighter">${totalCollected?.toLocaleString() || '0'}</h2>
                        <p className="text-[11px] font-medium text-gray-400 mt-2">Mes actual</p>
                    </Card>
                    
                    {/* Tarjeta Egresos */}
                    <Card className="rounded-[2rem] border border-pastel-pink/30 bg-white shadow-sm hover:shadow-md transition-shadow p-6">
                        <div className="flex justify-between mb-6 items-start">
                            <div className="p-3 bg-pastel-pink/30 rounded-2xl text-rose-400"><TrendingDown size={24} strokeWidth={2.5}/></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-warm-white px-3 py-1 rounded-full">Egresos</span>
                        </div>
                        <h2 className="text-4xl font-black text-soft-dark tracking-tighter">${totalExpenses?.toLocaleString() || '0'}</h2>
                        <p className="text-[11px] font-medium text-gray-400 mt-2">Suscripciones y arriendo</p>
                    </Card>
                    
                    {/* Tarjeta Balance (Estilo Acuarela) */}
                    <div className="col-span-1 md:col-span-2 relative overflow-hidden text-soft-dark shadow-sm rounded-[2rem] p-8 border border-sage-green/30 bg-gradient-to-br from-warm-white to-water-blue/20">
                        <div className="absolute -right-10 -bottom-10 opacity-10 text-sage-green transform rotate-12">
                            <Wallet size={200} strokeWidth={1}/>
                        </div>
                        <div className="relative z-10 flex flex-col justify-center h-full">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Balance del Mes</span>
                            </div>
                            <h2 className="text-6xl font-black mt-2 tracking-tighter text-soft-dark">${netProfit?.toLocaleString() || '0'}</h2>
                            <p className="text-xs font-medium text-gray-500 mt-4 uppercase tracking-widest border-t border-sage-green/20 pt-4 w-fit">Salud financiera de la consulta</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EL CORAZÓN CLÍNICO: NOTAS E INFORMES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Panel de Notas Pendientes */}
                <Card className="p-6 rounded-[2rem] border border-pastel-pink/50 shadow-sm bg-white">
                    <div className="flex justify-between items-end mb-6 border-b border-pastel-pink/30 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-warm-white text-rose-400 rounded-2xl border border-pastel-pink shadow-sm"><FileEdit size={24}/></div>
                            <div>
                                <h3 className="font-bold text-soft-dark text-xl tracking-tight">Notas por Escribir</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Evoluciones pendientes</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                       {pendingNotes.length === 0 ? (
                            <div className="p-4 bg-warm-white rounded-xl border border-sage-green/30 text-center">
                                <p className="text-xs font-bold text-sage-green">✅ ¡Al día! No hay notas pendientes.</p>
                            </div>
                        ) : (
                            pendingNotes.map((note, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-warm-white border border-pastel-pink/50 hover:border-sage-green transition-colors cursor-pointer">
                                    <div>
                                        <span className="text-sm font-bold text-soft-dark">{note.patientName}</span>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Tag size={10} className="text-sage-green"/>
                                            <span className="text-[9px] font-bold text-sage-green uppercase tracking-widest">{note.tags[0]}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-medium text-gray-500">{note.date}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button className="mt-4 w-full py-3 bg-white border border-pastel-pink rounded-xl text-[10px] font-bold uppercase tracking-widest text-soft-dark hover:bg-warm-white transition-all flex items-center justify-center gap-2">
                        Ir a Registros <ArrowRight size={14}/>
                    </button>
                </Card>

                {/* Panel de Accesos a Informes */}
                <Card className="p-6 rounded-[2rem] border border-pastel-pink/50 shadow-sm bg-white">
                    <div className="flex justify-between items-end mb-6 border-b border-pastel-pink/30 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-warm-white text-water-blue rounded-2xl border border-water-blue/30 shadow-sm"><FileText size={24}/></div>
                            <div>
                                <h3 className="font-bold text-soft-dark text-xl tracking-tight">Informes Rápidos</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Plantillas predefinidas</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setActiveTab('informes')} className="p-4 border border-pastel-pink/50 rounded-xl hover:bg-warm-white hover:border-sage-green text-left transition-all">
                            <p className="text-sm font-bold text-soft-dark">Informe Escolar</p>
                            <p className="text-[9px] text-gray-400 uppercase mt-1">Autocompletar</p>
                        </button>
                        <button onClick={() => setActiveTab('informes')} className="p-4 border border-pastel-pink/50 rounded-xl hover:bg-warm-white hover:border-sage-green text-left transition-all">
                            <p className="text-sm font-bold text-soft-dark">Derivación Psiquiatría</p>
                            <p className="text-[9px] text-gray-400 uppercase mt-1">Plantilla médica</p>
                        </button>
                        <button onClick={() => setActiveTab('informes')} className="p-4 border border-pastel-pink/50 rounded-xl hover:bg-warm-white hover:border-sage-green text-left transition-all">
                            <p className="text-sm font-bold text-soft-dark">Certificado Asistencia</p>
                            <p className="text-[9px] text-gray-400 uppercase mt-1">Generar PDF</p>
                        </button>
                        <button onClick={() => setActiveTab('informes')} className="p-4 border border-pastel-pink/50 rounded-xl bg-sage-green/5 hover:bg-sage-green/10 text-left transition-all flex items-center justify-center">
                            <p className="text-sm font-bold text-sage-green flex gap-2"><Plus size={16}/> Nueva Plantilla</p>
                        </button>
                    </div>
                </Card>
            </div>
            
            {/* --- GRÁFICOS --- */}
            {userRole === 'admin' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 flex flex-col p-6 rounded-[2rem] border border-pastel-pink/50 shadow-sm bg-white">
                        <div className="flex justify-between items-end mb-8 border-b border-pastel-pink/30 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-warm-white text-gray-400 rounded-2xl border border-pastel-pink/50"><BarChart2 size={24}/></div>
                                <div>
                                    <h3 className="font-bold text-soft-dark text-xl tracking-tight">Flujo de Pacientes</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Últimos 6 meses</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[200px]">
                            {/* Aquí va tu componente de gráfico existente */}
                            <SimpleLineChart data={chartData} />
                        </div>
                    </Card>

                    <Card className="flex flex-col justify-center items-center text-center p-8 bg-warm-white border border-pastel-pink/50 rounded-[2rem] shadow-inner">
                        <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 border border-pastel-pink/50 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-t-sage-green border-r-pastel-pink border-b-water-blue border-l-warm-white"></div>
                            <PieChart size={32} className="text-soft-dark"/>
                        </div>
                        <h3 className="font-bold text-xl text-soft-dark tracking-tight">Tipo de Sesiones</h3>
                        <p className="text-xs text-gray-500 mt-4 font-medium leading-relaxed">La mayoría de tus atenciones este mes corresponden a <span className="text-sage-green font-bold">Infanto-Juvenil</span> y <span className="text-rose-400 font-bold">Terapia Individual</span>.</p>
                    </Card>
                </div>
            )}

            {/* --- AGENDA Y ACCESOS RÁPIDOS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Agenda */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-3 border-b border-pastel-pink/30 pb-4">
                        <div className="p-2 bg-warm-white rounded-xl border border-pastel-pink/50"><Clock className="text-sage-green" size={20} strokeWidth={2.5}/></div>
                        <div>
                            <h3 className="font-bold text-2xl text-soft-dark tracking-tight">Agenda de Hoy</h3>
                        </div>
                    </div>
                    
                    <div className="space-y-3 pt-2">
                        {todaysAppointments?.length === 0 || !todaysAppointments ? (
                            <div className="p-10 border-2 border-dashed border-pastel-pink bg-warm-white/50 rounded-[2rem] text-center flex flex-col items-center gap-5">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-pastel-pink/50"><CalendarClock className="text-sage-green" size={32}/></div>
                                <div>
                                    <h4 className="font-bold text-soft-dark text-lg">Tu agenda está libre</h4>
                                    <p className="text-xs text-gray-400 mt-2 font-medium">No tienes pacientes agendados para el día de hoy.</p>
                                </div>
                            </div>
                        ) : (
                            todaysAppointments.map(a => (
                                <div key={a.id} className="flex items-center gap-5 p-4 rounded-2xl bg-white border border-pastel-pink/50 shadow-sm hover:border-sage-green transition-all cursor-pointer group">
                                    <div className="px-5 py-3 rounded-xl font-black text-sage-green bg-sage-green/10 text-xl tracking-tighter">
                                        {a.time}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-soft-dark text-lg group-hover:text-sage-green transition-colors">{a.patient_name || a.name}</h4>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-1">{a.treatment || 'Sesión Psicológica'}</p>
                                        {buildReminder && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const phone = getPatientPhone(a.patient_name || a.name);
                                                    if (!phone) { alert('El paciente no tiene teléfono registrado'); return; }
                                                    sendWhatsApp(phone, buildReminder(a));
                                                }}
                                                className="text-[10px] text-sage-green hover:underline mt-1"
                                            >
                                                📱 Recordar
                                            </button>
                                        )}
                                    </div>
                                    <div className="w-10 h-10 bg-warm-white rounded-full flex items-center justify-center text-gray-400 group-hover:bg-sage-green group-hover:text-white transition-colors border border-pastel-pink/50 group-hover:border-transparent">
                                        <ArrowRight size={18}/>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Accesos Rápidos */}
                <div className="space-y-4">
                    <div className="border-b border-pastel-pink/30 pb-4">
                        <h3 className="font-bold text-2xl text-soft-dark tracking-tight">Accesos</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <button onClick={()=>setModal('appt')} className="flex flex-col items-center justify-center gap-3 p-6 bg-white hover:bg-sage-green text-soft-dark hover:text-white rounded-[2rem] border border-pastel-pink/50 transition-all shadow-sm group">
                            <div className="w-12 h-12 rounded-full bg-warm-white group-hover:bg-white/20 flex items-center justify-center transition-colors"><CalendarClock size={20}/></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Agendar</span>
                        </button>
                        
                        <button onClick={()=>{setActiveTab('ficha'); setSelectedPatientId(null);}} className="flex flex-col items-center justify-center gap-3 p-6 bg-white hover:bg-water-blue text-soft-dark hover:text-white rounded-[2rem] border border-pastel-pink/50 transition-all shadow-sm group">
                            <div className="w-12 h-12 rounded-full bg-warm-white group-hover:bg-white/20 flex items-center justify-center transition-colors"><User size={20}/></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Paciente</span>
                        </button>
                        
                        <button onClick={()=>{setActiveTab('informes');}} className="flex flex-col items-center justify-center gap-3 p-6 bg-white hover:bg-pastel-pink text-soft-dark hover:text-white rounded-[2rem] border border-pastel-pink/50 transition-all shadow-sm group">
                            <div className="w-12 h-12 rounded-full bg-warm-white group-hover:bg-white/20 flex items-center justify-center transition-colors"><FileText size={20}/></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Informes</span>
                        </button>
                        
                        <button onClick={()=>{setActiveTab('history');}} className="flex flex-col items-center justify-center gap-3 p-6 bg-white hover:bg-gray-400 text-soft-dark hover:text-white rounded-[2rem] border border-pastel-pink/50 transition-all shadow-sm group">
                            <div className="w-12 h-12 rounded-full bg-warm-white group-hover:bg-white/20 flex items-center justify-center transition-colors"><Wallet size={20}/></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Pagos</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}