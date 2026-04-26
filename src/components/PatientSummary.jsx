import React, { useMemo } from 'react';
import { Calendar, DollarSign, FileText, Activity } from 'lucide-react';

export default function PatientSummary({ patient, appointments = [], financialRecords = [], selectedPatientId }) {
    const summary = useMemo(() => {
        const patientName = patient?.personal?.legalName || '';

        const patientAppts = appointments.filter(
            a => a.patient_name === patientName || a.patient_id === selectedPatientId
        );

        const now = new Date();
        const completed = patientAppts.filter(a =>
            a.status === 'realizado' || a.status === 'asistio' ||
            new Date(a.date + 'T' + (a.time || '00:00')) < now
        );

        const upcoming = patientAppts
            .filter(a => new Date(a.date + 'T' + (a.time || '00:00')) >= now)
            .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

        const lastSession = completed
            .sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time))[0];

        const daysSinceLast = lastSession
            ? Math.floor((Date.now() - new Date(lastSession.date)) / (1000 * 60 * 60 * 24))
            : null;

        const patientFinance = financialRecords.filter(
            f => f.patientName === patientName || f.patientRef === selectedPatientId
        );

        const totalAdeudado = patientFinance.reduce((sum, rec) => {
            const total = Number(rec.total) || 0;
            const paid = (rec.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0) || (Number(rec.paid) || 0);
            return sum + Math.max(0, total - paid);
        }, 0);

        const totalPagos = patientFinance.reduce((sum, rec) => sum + (rec.payments?.length || 0), 0);

        const evolutions = patient?.clinical?.evolution || [];
        const lastNote = evolutions.length > 0 ? evolutions[0] : null;

        return { sessionsCount: completed.length, daysSinceLast, totalAdeudado, totalPagos, nextAppt: upcoming[0], lastNote };
    }, [patient, appointments, financialRecords, selectedPatientId]);

    const cardClass = "bg-white rounded-2xl border border-[#DFD2C4]/50 p-4 flex flex-col gap-1 shadow-sm";
    const labelClass = "text-[9px] font-bold uppercase tracking-widest text-[#9A8F84]";
    const valueClass = "text-xl font-black text-[#312923]";
    const subClass = "text-[11px] text-[#9A8F84] font-medium";

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className={cardClass}>
                <div className="flex items-center gap-2">
                    <Activity size={13} className="text-[#5B6651]" />
                    <span className={labelClass}>Sesiones</span>
                </div>
                <span className={valueClass}>{summary.sessionsCount}</span>
                <span className={subClass}>
                    {summary.daysSinceLast !== null
                        ? `Última: hace ${summary.daysSinceLast} días`
                        : 'Sin sesiones aún'}
                </span>
            </div>

            <div className={cardClass}>
                <div className="flex items-center gap-2">
                    <DollarSign size={13} className={summary.totalAdeudado > 0 ? 'text-[#CBAAA2]' : 'text-[#5B6651]'} />
                    <span className={labelClass}>Estado de Pago</span>
                </div>
                <span className={`${valueClass} ${summary.totalAdeudado > 0 ? 'text-[#CBAAA2]' : 'text-[#5B6651]'}`}>
                    {summary.totalAdeudado > 0
                        ? `$${summary.totalAdeudado.toLocaleString('es-CL')}`
                        : 'Al día'}
                </span>
                <span className={subClass}>{summary.totalPagos} pagos registrados</span>
            </div>

            <div className={cardClass}>
                <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-[#A3968B]" />
                    <span className={labelClass}>Próxima Sesión</span>
                </div>
                {summary.nextAppt ? (
                    <>
                        <span className={valueClass}>
                            {new Date(summary.nextAppt.date + 'T00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className={subClass}>{summary.nextAppt.time}</span>
                    </>
                ) : (
                    <>
                        <span className={`${valueClass} text-[#DFD2C4]`}>—</span>
                        <span className={subClass}>Sin agendar</span>
                    </>
                )}
            </div>

            <div className={cardClass}>
                <div className="flex items-center gap-2">
                    <FileText size={13} className="text-[#A3968B]" />
                    <span className={labelClass}>Última Nota</span>
                </div>
                {summary.lastNote ? (
                    <>
                        <span className={`${valueClass} text-sm`}>
                            {summary.lastNote.date || 'Reciente'}
                        </span>
                        <span className={`${subClass} truncate`}>
                            {(summary.lastNote.text || '').substring(0, 50)}{(summary.lastNote.text || '').length > 50 ? '...' : ''}
                        </span>
                    </>
                ) : (
                    <>
                        <span className={`${valueClass} text-[#DFD2C4]`}>—</span>
                        <span className={subClass}>Sin notas aún</span>
                    </>
                )}
            </div>
        </div>
    );
}
