import React, { useState } from 'react';
import { Camera, Shield, Plus, Trash2, Settings, UserPlus, Save, Building2, FileSignature, Percent, Clock, CalendarDays, Link, Copy, Network, Phone, Mail, MessageCircle } from 'lucide-react';
import { Card } from './UIComponents';
import { formatRUT } from '../constants';
import { supabase } from '../supabase';

export default function SettingsView({
    themeMode, t, config, setConfigLocal, logoInputRef, handleLogoUpload,
    userRole, saveToSupabase, notify, team, setTeam, newMember, setNewMember, session
}) {
    const inputClass = "w-full p-4 rounded-2xl bg-[#FDFBF7] border border-[#DFD2C4] outline-none font-bold text-[#312923] focus:border-[#5B6651] transition-colors shadow-sm";
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-[#9A8F84] ml-2 mb-2 block";

    const [saving, setSaving] = useState(false);
    const [newNetwork, setNewNetwork] = useState({ name: '', specialty: '', phone: '' });

    const defaultSchedule = {
        Lunes: { active: true, start1: '09:00', end1: '13:00', start2: '15:00', end2: '19:00' },
        Martes: { active: true, start1: '09:00', end1: '13:00', start2: '15:00', end2: '19:00' },
        Miércoles: { active: true, start1: '09:00', end1: '13:00', start2: '15:00', end2: '19:00' },
        Jueves: { active: true, start1: '09:00', end1: '13:00', start2: '15:00', end2: '19:00' },
        Viernes: { active: true, start1: '09:00', end1: '13:00', start2: '15:00', end2: '19:00' },
        Sábado: { active: false, start1: '09:00', end1: '14:00', start2: '', end2: '' },
        Domingo: { active: false, start1: '', end1: '', start2: '', end2: '' }
    };

    const schedule = config.schedule || defaultSchedule;
    const networks = config.networks || []; 

    const handleScheduleChange = (day, field, value) => {
        const updatedSchedule = { ...schedule, [day]: { ...schedule[day], [field]: value } };
        setConfigLocal({ ...config, schedule: updatedSchedule });
    };

    const handleAddNetwork = () => {
        if (!newNetwork.name) return notify("El nombre del profesional/centro es obligatorio");
        const updatedNetworks = [...networks, { ...newNetwork, id: Date.now().toString() }];
        setConfigLocal({ ...config, networks: updatedNetworks });
        setNewNetwork({ name: '', specialty: '', phone: '' });
        notify("Contacto agregado a la red. Recuerda Guardar Cambios arriba.");
    };

    const handleDeleteNetwork = (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este contacto de tu red?")) {
            const updatedNetworks = networks.filter(n => n.id !== id);
            setConfigLocal({ ...config, networks: updatedNetworks });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in h-full flex flex-col pb-10 max-w-7xl mx-auto">
            
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 border-b border-[#DFD2C4]/50 shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Settings size={14} className="text-[#5B6651]"/>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#9A8F84]">Administración</p>
                    </div>
                    <h2 className="text-4xl font-black text-[#312923] tracking-tighter">Ajustes de Consulta</h2>
                </div>
                {userRole === 'admin' && (
                    <button
                        disabled={saving}
                        onClick={async () => {
                            setSaving(true);
                            try {
                                const configToSave = { ...config, schedule: config.schedule || defaultSchedule, email: session?.user?.email };
                                await saveToSupabase('settings', 'general', configToSave);
                                notify("Ajustes Guardados con éxito");
                            } finally {
                                setSaving(false);
                            }
                        }}
                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#312923] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-[#1a1512] transition-all shadow-lg shadow-[#312923]/20 hover:-translate-y-0.5 w-full md:w-auto disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                    >
                        <Save size={16}/> {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8">
                {userRole === 'admin' ? (
                    <>
                        {/* --- IDENTIDAD VISUAL --- */}
                        <Card className="rounded-[2.5rem] border border-[#DFD2C4]/60 bg-white p-8 shadow-sm">
                            <h3 className="font-black text-xl text-[#312923] mb-6 flex items-center gap-2">
                                <Camera className="text-[#CBAAA2]"/> Identidad Visual
                            </h3>
                            <div onClick={()=>logoInputRef.current.click()} className="w-full max-w-md p-8 border-2 border-dashed border-[#DFD2C4] bg-[#FDFBF7] rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#A3968B] transition-all shadow-inner group">
                                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload}/>
                                {config.logo ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <img src={config.logo} className="h-24 object-contain drop-shadow-sm transition-transform group-hover:scale-105" alt="Logo Consulta"/>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#9A8F84] bg-white px-4 py-1.5 rounded-full border border-[#DFD2C4]/50 shadow-sm">Cambiar Logo</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-[#A3968B] border border-[#DFD2C4] group-hover:scale-110 transition-transform"><Camera size={28}/></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#5B6651]">Click para subir logo</span>
                                        <p className="text-xs font-bold text-[#9A8F84]">Formato PNG transparente recomendado</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* --- DATOS GENERALES Y LINK PÚBLICO --- */}
                        <Card className="rounded-[2.5rem] border border-[#DFD2C4]/60 bg-white p-8 shadow-sm">
                            <h3 className="font-black text-xl text-[#312923] mb-6 flex items-center gap-2 border-b border-[#DFD2C4]/50 pb-4">
                                <Building2 className="text-[#A3968B]"/> Datos Profesionales
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                <div className="md:col-span-2 p-5 bg-[#FDFBF7] border border-[#DFD2C4]/60 rounded-3xl mb-2">
                                    <div className="flex justify-between items-center mb-2 ml-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#5B6651] block">Link de Reservas (Agenda Online)</label>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex items-center flex-1">
                                            <Link size={16} className="absolute left-4 text-[#A3968B]" />
                                            <span className="absolute left-11 text-[#9A8F84] font-bold text-sm hidden sm:block">?reserva=</span>
                                            <input 
                                                className={`${inputClass} !bg-white sm:pl-[100px] pl-11`} 
                                                placeholder="psicologo-tu-nombre" 
                                                value={config.publicSlug || ''} 
                                                onChange={e => {
                                                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                                                    setConfigLocal({...config, publicSlug: slug});
                                                }} 
                                            />
                                        </div>
                                        <button 
                                            onClick={() => {
                                                if(!config.publicSlug) {
                                                    notify("Primero escribe un nombre para tu enlace.");
                                                    return;
                                                }
                                                const fullLink = `${window.location.origin}/?reserva=${config.publicSlug}`;
                                                navigator.clipboard.writeText(fullLink);
                                                notify("🔗 Enlace copiado al portapapeles");
                                            }}
                                            className="px-6 py-4 bg-[#5B6651] hover:bg-[#4a5442] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
                                        >
                                            <Copy size={16} /> Copiar Link
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-[#9A8F84] font-bold mt-3 ml-2 uppercase tracking-widest">
                                        Pega este enlace en tu Instagram o envíalo por WhatsApp a tus consultantes.
                                    </p>
                                </div>

                                <div><label className={labelClass}>Nombre Consulta / Terapeuta</label><input className={inputClass} placeholder="Ej: Ps. Juan Pérez" value={config.name || ''} onChange={e=>setConfigLocal({...config, name:e.target.value})} /></div>
                                <div><label className={labelClass}>RUT Profesional</label><input className={inputClass} placeholder="12.345.678-9" value={config.rut || ''} onChange={e=>setConfigLocal({...config, rut: formatRUT(e.target.value)})} /></div>
                                <div><label className={labelClass}>Enfoque / Especialidad</label><input className={inputClass} placeholder="Ej: Psicoterapia Sistémica" value={config.specialty || ''} onChange={e=>setConfigLocal({...config, specialty:e.target.value})} /></div>
                                <div><label className={labelClass}>Teléfono / WhatsApp</label><input className={inputClass} placeholder="+56 9 1234 5678" value={config.phone || ''} onChange={e=>setConfigLocal({...config, phone:e.target.value})} /></div>
                                <div className="md:col-span-2"><label className={labelClass}>Dirección Box de Atención (Si aplica)</label><input className={inputClass} placeholder="Av. Siempre Viva 123, Oficina 405 (o Modalidad Online)" value={config.address || ''} onChange={e=>setConfigLocal({...config, address:e.target.value})} /></div>
                            </div>
                        </Card>

                        {/* --- PLANTILLAS DE WHATSAPP --- */}
                        <Card className="rounded-[2.5rem] border border-[#DFD2C4]/60 bg-white p-8 shadow-sm">
                            <h3 className="font-black text-xl text-[#312923] mb-6 flex items-center gap-2 border-b border-[#DFD2C4]/50 pb-4">
                                <MessageCircle className="text-[#5B6651]"/> Plantillas de Comunicación
                            </h3>
                            <p className="text-xs text-[#9A8F84] font-bold mb-4">Configura los mensajes automáticos que se envían por WhatsApp.</p>
                            
                            <div className="bg-[#5B6651]/5 p-4 rounded-2xl border border-[#5B6651]/20 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#5B6651]">Etiquetas automáticas:</span>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="bg-white px-2 py-1 rounded-md text-[10px] font-bold text-[#312923] border border-[#DFD2C4] shadow-sm">{'{paciente}'}</span>
                                    <span className="bg-white px-2 py-1 rounded-md text-[10px] font-bold text-[#312923] border border-[#DFD2C4] shadow-sm">{'{clinica}'}</span>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className={labelClass}>Mensaje de Saludo / Contacto</label>
                                    <textarea 
                                        className={`${inputClass} resize-none h-24`} 
                                        placeholder="Hola {paciente}, me comunico de la consulta de {clinica}..." 
                                        value={config.wpGreeting || 'Hola {paciente}, nos comunicamos de la consulta de {clinica}...'} 
                                        onChange={e=>setConfigLocal({...config, wpGreeting:e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Mensaje de Envío de Presupuesto/Paquete</label>
                                    <textarea 
                                        className={`${inputClass} resize-none h-24`} 
                                        placeholder="Hola {paciente}, te adjuntamos la propuesta de honorarios..." 
                                        value={config.wpBudget || 'Hola {paciente}, te enviamos tu cotización de honorarios psicológicos de {clinica}. ¡Quedamos atentos a tus dudas!'} 
                                        onChange={e=>setConfigLocal({...config, wpBudget:e.target.value})} 
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* --- HORARIOS DE ATENCIÓN --- */}
                        <Card className="rounded-[2.5rem] border border-[#DFD2C4]/60 bg-[#FDFBF7] p-8 shadow-inner">
                            <div className="flex justify-between items-center mb-6 border-b border-[#DFD2C4]/50 pb-4">
                                <div>
                                    <h3 className="font-black text-xl text-[#312923] flex items-center gap-2"><CalendarDays className="text-[#5B6651]"/> Disponibilidad de Agenda</h3>
                                    <p className="text-xs text-[#9A8F84] font-bold mt-1">Configura los bloques en los que atiendes regularmente.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {Object.keys(defaultSchedule).map((day) => (
                                    <div key={day} className={`flex flex-col xl:flex-row items-start xl:items-center gap-4 p-4 rounded-2xl border transition-colors ${schedule[day].active ? 'bg-white border-[#DFD2C4] shadow-sm' : 'bg-transparent border-[#DFD2C4]/40 opacity-60'}`}>
                                        <div className="flex items-center gap-3 w-40 shrink-0">
                                            <div className={`w-10 h-5 rounded-full flex items-center cursor-pointer transition-colors px-0.5 ${schedule[day].active ? 'bg-[#5B6651]' : 'bg-[#DFD2C4]'}`} onClick={() => handleScheduleChange(day, 'active', !schedule[day].active)}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${schedule[day].active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                            <span className={`font-black text-sm ${schedule[day].active ? 'text-[#312923]' : 'text-[#9A8F84]'}`}>{day}</span>
                                        </div>
                                        <div className={`flex flex-wrap md:flex-nowrap items-center gap-3 transition-opacity ${schedule[day].active ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                                            <div className="flex items-center gap-2 bg-[#FDFBF7] px-3 py-2 rounded-xl border border-[#DFD2C4]/50">
                                                <Clock size={12} className="text-[#A3968B]"/><span className="text-[10px] font-black uppercase tracking-widest text-[#9A8F84] mr-1">Mañana:</span>
                                                <input type="time" className="bg-transparent font-bold text-xs text-[#312923] outline-none" value={schedule[day].start1} onChange={(e) => handleScheduleChange(day, 'start1', e.target.value)} />
                                                <span className="text-[#DFD2C4] font-bold">-</span>
                                                <input type="time" className="bg-transparent font-bold text-xs text-[#312923] outline-none" value={schedule[day].end1} onChange={(e) => handleScheduleChange(day, 'end1', e.target.value)} />
                                            </div>
                                            <div className="flex items-center gap-2 bg-[#FDFBF7] px-3 py-2 rounded-xl border border-[#DFD2C4]/50">
                                                <Clock size={12} className="text-[#A3968B]"/><span className="text-[10px] font-black uppercase tracking-widest text-[#9A8F84] mr-1">Tarde:</span>
                                                <input type="time" className="bg-transparent font-bold text-xs text-[#312923] outline-none" value={schedule[day].start2} onChange={(e) => handleScheduleChange(day, 'start2', e.target.value)} />
                                                <span className="text-[#DFD2C4] font-bold">-</span>
                                                <input type="time" className="bg-transparent font-bold text-xs text-[#312923] outline-none" value={schedule[day].end2} onChange={(e) => handleScheduleChange(day, 'end2', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* --- DIRECTORIO DE DERIVACIONES --- */}
                        <Card className="rounded-[2.5rem] border border-[#DFD2C4]/60 bg-white p-8 shadow-sm">
                            <h3 className="font-black text-xl text-[#312923] mb-6 flex items-center gap-2 border-b border-[#DFD2C4]/50 pb-4">
                                <Network className="text-[#A3968B]"/> Red de Derivación y Contactos
                            </h3>
                            <p className="text-xs text-[#9A8F84] font-bold mb-6">Guarda los datos de psiquiatras, neurólogos, o centros a los que derivas consultantes habitualmente.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#FDFBF7] p-5 rounded-3xl border border-[#DFD2C4]/50 mb-8 shadow-inner items-end">
                                <div className="md:col-span-4 space-y-1">
                                    <label className={labelClass}>Nombre Profesional / Centro</label>
                                    <input className="w-full p-3.5 rounded-xl bg-white border border-[#DFD2C4] outline-none font-bold text-sm text-[#312923] focus:border-[#5B6651] transition-colors" placeholder="Dra. María Sánchez" value={newNetwork.name} onChange={e=>setNewNetwork({...newNetwork, name:e.target.value})}/>
                                </div>
                                <div className="md:col-span-4 space-y-1">
                                    <label className={labelClass}>Especialidad</label>
                                    <input className="w-full p-3.5 rounded-xl bg-white border border-[#DFD2C4] outline-none font-bold text-sm text-[#312923] focus:border-[#5B6651] transition-colors" placeholder="Psiquiatra Adultos" value={newNetwork.specialty} onChange={e=>setNewNetwork({...newNetwork, specialty:e.target.value})}/>
                                </div>
                                <div className="md:col-span-4 space-y-1">
                                    <label className={labelClass}>Teléfono o Contacto</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#DFD2C4]" />
                                        <input className="w-full pl-10 pr-3 py-3.5 rounded-xl bg-white border border-[#DFD2C4] outline-none font-bold text-sm text-[#312923] focus:border-[#5B6651] transition-colors" placeholder="+56 9..." value={newNetwork.phone} onChange={e=>setNewNetwork({...newNetwork, phone:e.target.value})}/>
                                    </div>
                                </div>
                                <div className="md:col-span-12 mt-2">
                                    <button 
                                        className="w-full h-[50px] bg-[#312923] hover:bg-[#1a1512] text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
                                        onClick={handleAddNetwork}
                                    >
                                        <Plus size={16}/> Añadir a la Red
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className={labelClass}>Contactos en tu Red ({networks.length})</label>
                                {networks.length === 0 ? (
                                    <p className="text-xs text-[#9A8F84] font-bold py-6 text-center border border-dashed border-[#DFD2C4] rounded-2xl bg-[#FDFBF7]">Tu directorio de derivaciones está vacío.</p>
                                ) : (
                                    networks.map(net => (
                                        <div key={net.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-5 bg-white rounded-2xl border border-[#DFD2C4]/50 hover:border-[#A3968B] transition-all shadow-sm group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#FDFBF7] border border-[#DFD2C4] flex items-center justify-center text-[#9A8F84]"><Network size={18}/></div>
                                                <div>
                                                    <p className="font-black text-[#312923]">{net.name}</p>
                                                    <div className="flex gap-3 mt-1">
                                                        {net.specialty && <span className="text-[10px] font-bold text-[#5B6651] uppercase tracking-widest">{net.specialty}</span>}
                                                        {net.phone && <span className="text-[10px] font-bold text-[#9A8F84]">{net.phone}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteNetwork(net.id)} className="p-2.5 text-[#DFD2C4] hover:bg-red-50 hover:text-red-500 hover:border-red-200 border border-transparent rounded-xl transition-all" title="Eliminar Contacto"><Trash2 size={18}/></button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* --- GESTIÓN DE EQUIPO --- */}
                        <Card className="rounded-[2.5rem] border border-[#DFD2C4]/60 bg-white p-8 shadow-sm">
                            <h3 className="font-black text-xl text-[#312923] mb-6 flex items-center gap-2 border-b border-[#DFD2C4]/50 pb-4"><Shield className="text-[#CBAAA2]"/> Gestión de Accesos y Equipo</h3>
                            <p className="text-xs text-[#9A8F84] font-bold mb-6">Invita a otros profesionales de la salud o secretarias a colaborar en tu plataforma.</p>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#FDFBF7] p-5 rounded-3xl border border-[#DFD2C4]/50 mb-8 shadow-inner items-end">
                                <div className="md:col-span-4 space-y-1"><label className={labelClass}>Nombre Completo</label><input className="w-full p-3.5 rounded-xl bg-white border border-[#DFD2C4] outline-none font-bold text-sm text-[#312923] focus:border-[#5B6651] transition-colors" placeholder="Ps. Laura Gómez" value={newMember.name || ''} onChange={e=>setNewMember({...newMember, name:e.target.value})}/></div>
                                <div className="md:col-span-4 space-y-1"><label className={labelClass}>Correo Electrónico</label><input className="w-full p-3.5 rounded-xl bg-white border border-[#DFD2C4] outline-none font-bold text-sm text-[#312923] focus:border-[#5B6651] transition-colors" placeholder="laura@clinica.com" value={newMember.email || ''} onChange={e=>setNewMember({...newMember, email:e.target.value})}/></div>
                                <div className="md:col-span-4 space-y-1">
                                    <label className={labelClass}>Rol en el Sistema</label>
                                    <select className="w-full p-3.5 rounded-xl bg-white border border-[#DFD2C4] outline-none font-bold text-sm text-[#312923] focus:border-[#5B6651] transition-colors appearance-none cursor-pointer" value={newMember.role || 'psychologist'} onChange={e=>setNewMember({...newMember, role:e.target.value})}>
                                        <option value="admin">Administrador Clínico</option>
                                        <option value="psychologist">Psicólogo / Terapeuta</option>
                                        <option value="secretary">Secretaría / Recepción</option>
                                    </select>
                                </div>
                                <div className="md:col-span-12 mt-2">
                                    <button 
                                        className="w-full h-[50px] bg-[#5B6651] hover:bg-[#4a5442] text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                        onClick={async()=>{ 
                                            if(newMember.email && newMember.name){ 
                                                const id = Date.now().toString(); 
                                                const u = { ...newMember, id, commission: 0 }; 
                                                setTeam([...team, u]); 
                                                await saveToSupabase('team', id, u); 
                                                const { error } = await supabase.auth.signInWithOtp({ email: newMember.email, options: { emailRedirectTo: window.location.origin } });
                                                if(error) { notify("Error enviando invitación: " + error.message); } 
                                                else { setNewMember({name:'', email:'', role:'psychologist', commission: 0}); notify("Usuario agregado e Invitación enviada 📩"); }
                                            } else { alert("Por favor ingresa un nombre y correo electrónico válidos."); }
                                        }}
                                    ><UserPlus size={16}/> Enviar Invitación de Acceso</button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className={labelClass}>Usuarios Registrados en Plataforma</label>
                                {team.map(member => (
                                    <div key={member.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-5 bg-white rounded-2xl border border-[#DFD2C4]/50 hover:border-[#A3968B] transition-all shadow-sm group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#FDFBF7] border border-[#DFD2C4] flex items-center justify-center font-black text-[#312923]">{member.name.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <p className="font-black text-[#312923]">{member.name}</p>
                                                <p className="text-[10px] font-bold text-[#9A8F84] mt-0.5">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                            <span className={`text-[9px] uppercase font-black px-3 py-1.5 rounded-full border tracking-widest ${member.role === 'admin' ? 'bg-[#5B6651]/10 text-[#5B6651] border-[#5B6651]/20' : member.role === 'psychologist' ? 'bg-[#A3968B]/10 text-[#A3968B] border-[#A3968B]/20' : 'bg-[#CBAAA2]/10 text-[#CBAAA2] border-[#CBAAA2]/20'}`}>
                                                {member.role === 'admin' ? 'Administrador' : member.role === 'psychologist' ? 'Profesional' : 'Secretaría'}
                                            </span>
                                            <button onClick={async()=>{ if(window.confirm(`¿Estás seguro de revocar el acceso a ${member.name}?`)){ const f=team.filter(t=>t.id!==member.id); setTeam(f); await supabase.from('team').delete().eq('id', member.id); notify("Acceso Revocado"); } }} className="p-2 text-[#DFD2C4] hover:bg-red-50 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-200" title="Revocar Acceso"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <Shield size={48} className="text-[#A3968B] mb-4"/>
                        <h3 className="font-black text-xl text-[#312923]">Acceso Restringido</h3>
                        <p className="text-sm font-bold mt-2 text-[#9A8F84]">Contacta al administrador para editar la configuración de la consulta.</p>
                    </div>
                )}
            </div>
        </div>
    );
}