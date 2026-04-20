import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Card, InputField, Button } from './UIComponents';
import { Calendar, Clock, User, Phone, CheckCircle, ArrowLeft, Cloud } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

export default function PublicBookingPage({ clinicId }) {
// ESTADOS DEL SISTEMA
    const [loading, setLoading]= useState(true);
    const [clinicConfig, setClinicConfig]= useState(null);
    
    // ESTADOS DEL FORMULARIO
    const [step, setStep]= useState(1);
    const [formData, setFormData]= useState({ name: '', rut: '', phone: '', reason: '', date: '', time: '' });
    const [honeypot, setHoneypot]= useState('');
    const [availableTimes, setAvailableTimes]= useState([]);
    const [isSubmitting, setIsSubmitting]= useState(false);

    // DÍAS DE LA SEMANA
    const daysMap =['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // 1. Cargar datos de la clínica al entrar
    useEffect(() => {
        const fetchClinic = async () => {
            try {
                // Obtenemos la configuración de la clínica para saber sus horarios
                const { data, error } = await supabase.from('settings').select('data').eq('id', 'general').maybeSingle();
                if (data && data.data) {
                    setClinicConfig(data.data);
                } else {
                    // Fallback temporal por si no hay configuración guardada aún
                    setClinicConfig({ name: `Psic. ${clinicId.replace('-', ' ')}`, schedule: null });
                }
            } catch (err) {
                console.error("Error cargando clínica:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchClinic();
    }, []);

    // 2. Generador de bloques de tiempo (30 o 60 min)
    const generateTimeSlots = (start, end) => {
        if (!start || !end) return [];
        const slots = [];
        let [startHour, startMin]= start.split(':').map(Number);
        const [endHour, endMin]= end.split(':').map(Number);

        let current = new Date();
        current.setHours(startHour, startMin, 0, 0);
        const endLimit = new Date();
        endLimit.setHours(endHour, endMin, 0, 0);

        const SLOT_DURATION_MINS = 60; // En psicología suele ser 60 min

        while (current < endLimit) {
            const startTimeStr = current.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
            slots.push(startTimeStr);
            current.setMinutes(current.getMinutes() + SLOT_DURATION_MINS);
        }
        return slots;
    };

    // 3. Lógica de Colisiones Inteligente
    const handleDateSelect = async (dateStr) => {
        setFormData({ ...formData, date: dateStr, time: '' });
        
        // Si la clínica no ha configurado horarios, generamos unos por defecto de 09:00 a 18:00
        let allSlots = generateTimeSlots('09:00', '18:00');

        if (clinicConfig && clinicConfig.schedule) {
          const dateObj = new Date(`${dateStr}T12:00:00`); 
          const dayName = daysMap[dateObj.getDay()];
          const dayConfig = clinicConfig.schedule[dayName] || clinicConfig.schedule[dayName.toLowerCase()];

            if (!dayConfig || !dayConfig.active) {
                setAvailableTimes([]); 
                return;
            }
            // Agregamos los dos bloques de horario del psicólogo
            allSlots = [...generateTimeSlots(dayConfig.start1, dayConfig.end1), ...generateTimeSlots(dayConfig.start2, dayConfig.end2)];
        }

        try {
            // Buscamos las citas que ya existen ese día usando nuestras columnas ESTRICTAS
            const { data: appts, error } = await supabase
                .from('appointments')
                .select('time, duration')
                .eq('date', dateStr);
            
            if (error) throw error;

            if (appts && appts.length > 0) {
                const toMins = (t) => { 
                    const [h, m]= t.split(':').map(Number); 
                    return (h * 60) + m; 
                };

                // Filtramos las horas que chocan con citas existentes
                allSlots = allSlots.filter(slot => {
                    const slotStart = toMins(slot);
                    const slotEnd = slotStart + 60; 

                    const isOccupied = appts.some(appt => {
                        if (!appt.time) return false;
                        const apptStart = toMins(appt.time);
                        const apptEnd = apptStart + (Number(appt.duration) || 60);
                        return slotStart < apptEnd && slotEnd > apptStart;
                    });
                    return !isOccupied;
                });
            }
        } catch (err) {
            console.error("Error revisando disponibilidad", err);
        }

        setAvailableTimes(allSlots);
    };

    // 4. Guardado simultáneo (Cita + Paciente)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (honeypot !== '') return setStep(4); // Trampa para bots
        
        setIsSubmitting(true);
        try {
            const newApptId = "appt_" + Date.now().toString();
            const newPatientId = `pac_${Date.now().toString()}`;

            // A. Guardamos la cita (Esquema estricto sin dar error 400)
            const { error: apptError } = await supabase.from('appointments').insert({
                id: newApptId,
                date: formData.date,
                time: formData.time,
                patient_name: formData.name,
                treatment: formData.reason || 'Consulta General (Agendado Online)',
                duration: 60,
                status: 'pendiente'
            });
            if (apptError) throw apptError;
            
            // B. Creamos la ficha base del paciente
            const { error: patientError } = await supabase.from('patients').insert({
                id: newPatientId,
                name: formData.name,
                personal: { legalName: formData.name, phone: formData.phone, rut: formData.rut }
            });
            if (patientError) console.error("No se pudo pre-crear el paciente, pero la cita se guardó.", patientError);

            setStep(4);
        } catch (err) {
            toast.error("Hubo un error al agendar tu cita.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-pastel-pink/20"><p className="animate-pulse font-bold text-sage-green tracking-widest uppercase">Cargando Agenda...</p></div>;

    return (
        <div className="min-h-screen bg-pastel-pink flex flex-col items-center justify-center p-4">
            <Toaster position="bottom-center" />
            
            <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 bg-sage-green rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 border border-sage-green/40">
                    <Cloud className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-black text-soft-dark tracking-tighter capitalize">{clinicConfig?.name || `Psic. ${clinicId.replace('-', ' ')}`}</h1>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mt-2">Portal de Reservas</p>
            </div>

            <Card className="w-full max-w-md bg-white shadow-xl p-6 sm:p-8 border-pastel-pink/50">
                
                {/* HONEYPOT (Invisible) */}
                <input type="text" style={{display: 'none'}} value={honeypot} onChange={e=>setHoneypot(e.target.value)} />

                {step === 1 && (
                    <div className="space-y-5 animate-in slide-in-from-right">
                        <h3 className="font-black text-xl text-soft-dark border-b pb-2">Tus Datos</h3>
                        
                        <InputField label="Nombre y Apellido *" icon={User} value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} placeholder="Ej. Camila Silva" required />
                        <InputField label="RUT (Opcional)" value={formData.rut} onChange={e=>setFormData({...formData, rut:e.target.value})} placeholder="12.345.678-9" />
                        <InputField label="Teléfono / WhatsApp *" icon={Phone} type="tel" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} placeholder="+56 9..." required />
                        
                        <Button disabled={!formData.name || !formData.phone} onClick={() => setStep(2)} className="w-full py-4 uppercase tracking-widest text-xs">
                            Continuar
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-5 animate-in slide-in-from-right">
                        <button onClick={() => setStep(1)} className="text-gray-400 hover:text-soft-dark flex items-center gap-1 uppercase tracking-widest text-xs font-bold mb-2"><ArrowLeft size={14}/> Volver</button>
                        
                        <h3 className="font-black text-xl text-soft-dark border-b pb-2">¿Motivo de consulta?</h3>
                        <textarea rows="4" className="w-full p-4 rounded-2xl bg-warm-white border border-pastel-pink/70 outline-none font-medium text-soft-dark text-sm focus:border-sage-green focus:ring-4 focus:ring-sage-green/20 transition-all resize-none" placeholder="Ej: Psicoterapia para ansiedad..." value={formData.reason} onChange={e=>setFormData({...formData, reason:e.target.value})} />
                        
                        <Button onClick={() => setStep(3)} className="w-full py-4 uppercase tracking-widest text-xs">
                            Elegir Fecha
                        </Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-5 animate-in slide-in-from-right">
                        <button onClick={() => setStep(2)} className="text-gray-400 hover:text-soft-dark flex items-center gap-1 uppercase tracking-widest text-xs font-bold mb-2"><ArrowLeft size={14}/> Volver</button>
                        
                        <h3 className="font-black text-xl text-soft-dark border-b pb-2 flex items-center gap-2"><Calendar size={20} className="text-sage-green"/> Disponibilidad</h3>
                        <InputField type="date" value={formData.date} onChange={e=>handleDateSelect(e.target.value)} min={new Date().toISOString().split('T')[0]} />                        
                        {formData.date && (
                            <div className="grid grid-cols-3 gap-2 mt-4 max-h-48 overflow-y-auto p-1">
                                {availableTimes.length === 0 ? (
                                    <p className="col-span-3 text-center py-4 text-gray-500 font-bold text-sm">Sin horarios disponibles.</p>
                                ) : (
                                    availableTimes.map(time => (
                                        <button key={time} onClick={() => setFormData({...formData, time})} className={`py-3 rounded-xl text-sm font-bold transition-all border ${formData.time === time ? 'bg-sage-green text-white border-sage-green shadow-md scale-105' : 'bg-warm-white text-gray-500 border-pastel-pink hover:border-sage-green hover:text-sage-green'}`}>
                                            {time}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        <div className="pt-4">
                            <Button disabled={!formData.date || !formData.time || isSubmitting} onClick={handleSubmit} className="w-full py-4 uppercase tracking-widest text-xs">
                                {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
                            </Button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="text-center py-8 animate-in zoom-in-95">
                        <CheckCircle size={64} className="text-sage-green mx-auto mb-6" />
                        <h3 className="font-black text-2xl text-soft-dark mb-2">¡Hora Solicitada!</h3>
                        <p className="text-sm font-bold text-gray-500">
                            Hemos recibido tu solicitud para el <br/><span className="text-soft-dark text-lg">{formData.date.split('-').reverse().join('/')} a las {formData.time}</span>.
                        </p>
                        <p className="text-xs text-gray-400 mt-6 uppercase tracking-widest">La profesional te contactará para confirmar.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}