import { useEffect } from 'react';
import { supabase } from '../supabase';

export const useClinicData = ({
    session, setTeam, setUserRole, setClinicOwner, setConfigLocal,
    setPatientRecords, setAppointments, setFinancialRecords
}) => {
    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            if (!session?.user?.id) return;
            if (setUserRole) setUserRole('admin');

            const uid = session.user.id;

            try {
                // 1. Descargar Pacientes
                const { data: patientsData } = await supabase.from('patients').select('*').eq('user_id', uid);
                if (patientsData && isMounted) {
                    const records = {};
                    patientsData.forEach(p => {
                        records[p.id] = p.data || { id: p.id, personal: { legalName: p.name } };
                    });
                    setPatientRecords(records);
                }

                // 2. Descargar Citas (Agenda)
                const { data: apptsData } = await supabase.from('appointments').select('*').eq('user_id', uid);
                if (apptsData && isMounted) {
                    setAppointments(apptsData.map(a => a.data || a));
                }

                // 3. Descargar Finanzas y Pagos
                const { data: finData } = await supabase.from('financial_records').select('*').eq('user_id', uid);
                if (finData && isMounted) {
                    setFinancialRecords(finData.map(f => f.data || f));
                }

                // 4. Descargar Configuración de la Consulta
                const { data: settingsData } = await supabase
                    .from('settings')
                    .select('data')
                    .eq('user_id', uid)
                    .maybeSingle();
                if (settingsData?.data && isMounted) {
                    setConfigLocal(settingsData.data);
                }
            } catch (error) {
                console.error("Error descargando los datos de la clínica:", error);
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [session, setPatientRecords, setAppointments, setFinancialRecords, setUserRole, setConfigLocal]);
};