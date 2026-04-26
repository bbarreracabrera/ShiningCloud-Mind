import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Shield, Calendar } from 'lucide-react';

export default function AuditLogView({ session }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!session?.user?.id) return;

            const { data } = await supabase
                .from('audit_log')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(100);

            setLogs(data || []);
            setLoading(false);
        };

        fetchLogs();
    }, [session]);

    const actionLabel = (action) => {
        const labels = {
            'patient_created': '👤 Paciente creado',
            'patient_updated': '✏️ Paciente actualizado',
            'patient_viewed': '👁️ Ficha consultada',
            'consent_signed': '✍️ Consentimiento firmado',
            'pdf_generated': '📄 PDF generado',
            'appointment_created': '📅 Cita creada',
            'payment_registered': '💰 Pago registrado'
        };
        return labels[action] || action;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-sage-green" />
                <h2 className="text-2xl font-black text-soft-dark">
                    Registro de Actividad
                </h2>
            </div>

            <p className="text-sm text-gray-500 mb-4">
                Cumplimiento Ley 19.628 — Bitácora de acciones sobre datos sensibles
            </p>

            {loading && <p className="text-gray-400">Cargando...</p>}

            {!loading && logs.length === 0 && (
                <div className="bg-warm-white rounded-2xl p-8 text-center">
                    <p className="text-gray-400">Sin actividad registrada aún</p>
                </div>
            )}

            {!loading && logs.length > 0 && (
                <div className="bg-white rounded-2xl border border-pastel-pink/50 divide-y divide-pastel-pink/30">
                    {logs.map(log => (
                        <div key={log.id} className="p-4 flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-soft-dark">
                                    {actionLabel(log.action)}
                                </p>
                                {log.resource_id && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        ID: {log.resource_id.substring(0, 20)}...
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Calendar size={12} />
                                {new Date(log.created_at).toLocaleString('es-CL')}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
