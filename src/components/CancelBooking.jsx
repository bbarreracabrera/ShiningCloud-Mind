import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Cloud, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function CancelBooking({ token }) {
    const [appt, setAppt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppt = async () => {
            const { data, error } = await supabase
                .from('appointments')
                .select('id, date, time, patient_name, treatment, status')
                .eq('cancel_token', token)
                .maybeSingle();

            if (error || !data) {
                setError('No encontramos una cita con ese enlace. Puede que ya haya sido cancelada.');
            } else if (data.status === 'no_asistio' || data.status === 'cancelada') {
                setError('Esta cita ya fue cancelada anteriormente.');
            } else {
                setAppt(data);
            }
            setLoading(false);
        };

        fetchAppt();
    }, [token]);

    const handleCancel = async () => {
        setCancelling(true);
        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('cancel_token', token);

        if (error) {
            setError('Hubo un error al cancelar. Intenta de nuevo o contacta al profesional.');
        } else {
            setDone(true);
        }
        setCancelling(false);
    };

    return (
        <div className="min-h-screen bg-pastel-pink flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 bg-sage-green rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
                <Cloud className="text-white" size={24} />
            </div>

            <div className="w-full max-w-sm bg-white rounded-[2.5rem] border border-pastel-pink/50 shadow-xl p-8 text-center">

                {loading && (
                    <div className="py-6">
                        <Loader className="animate-spin text-sage-green mx-auto mb-3" size={32} />
                        <p className="text-sm text-gray-400 font-medium">Buscando tu cita...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="py-4">
                        <XCircle size={48} className="text-pastel-pink mx-auto mb-4" />
                        <p className="font-bold text-soft-dark mb-2">Enlace no válido</p>
                        <p className="text-sm text-gray-400">{error}</p>
                    </div>
                )}

                {!loading && !error && !done && appt && (
                    <>
                        <h2 className="text-xl font-black text-soft-dark mb-1">Cancelar reserva</h2>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-6">Confirma los datos antes de cancelar</p>

                        <div className="bg-warm-white rounded-2xl p-5 border border-pastel-pink/40 text-left mb-6 space-y-2">
                            <p className="text-sm font-bold text-soft-dark">{appt.patient_name}</p>
                            <p className="text-sm text-gray-500">
                                {appt.date.split('-').reverse().join('/')} a las {appt.time}
                            </p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">{appt.treatment}</p>
                        </div>

                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="w-full py-4 bg-soft-dark text-white font-bold rounded-2xl text-sm uppercase tracking-widest hover:bg-opacity-90 transition-all disabled:opacity-60"
                        >
                            {cancelling ? 'Cancelando...' : 'Confirmar cancelación'}
                        </button>

                        <p className="text-[10px] text-gray-400 mt-4">Esta acción no se puede deshacer.</p>
                    </>
                )}

                {done && (
                    <div className="py-4">
                        <CheckCircle size={48} className="text-sage-green mx-auto mb-4" />
                        <h2 className="text-xl font-black text-soft-dark mb-2">Cita cancelada</h2>
                        <p className="text-sm text-gray-400">Tu reserva fue cancelada exitosamente. El profesional ha sido notificado.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
