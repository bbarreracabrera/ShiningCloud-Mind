import { useEffect } from 'react';
import { supabase } from '../supabase';

export const useClinicData = ({
    session, setTeam, setUserRole, setClinicOwner, setConfigLocal,
    setPatientRecords, setAppointments, setFinancialRecords, setConfigLoaded
}) => {
    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            if (!session?.user?.id) return;
            if (setUserRole) setUserRole('admin');

            const uid = session.user.id;

            try {
                // 1. Descargar Pacientes
                const { data: patientsData, error: patientsError } = await supabase.from('patients').select('*').eq('user_id', uid);
                if (patientsError) console.error('Error cargando pacientes:', patientsError);
                if (patientsData && isMounted) {
                    const records = {};
                    patientsData.forEach(p => {
                        records[p.id] = {
                            id: p.id,
                            personal: p.personal || { legalName: p.name || '' },
                            anamnesis: p.anamnesis || { motive: '', history: '', family: '' },
                            clinical: p.clinical || { evolution: [], familyMap: {}, mentalExam: {} },
                            consents: p.consents || [],
                            images: p.images || []
                        };
                    });
                    setPatientRecords(records);
                }

                // 2. Descargar Citas (Agenda)
                const { data: apptsData, error: apptsError } = await supabase.from('appointments').select('*').eq('user_id', uid);
                if (apptsError) console.error('Error cargando citas:', apptsError);
                if (apptsData && isMounted) {
                    setAppointments(apptsData);
                }

                // 3. Descargar Finanzas y Pagos
                const { data: finData, error: finError } = await supabase.from('financial_records').select('*').eq('user_id', uid);
                if (finError) console.error('Error cargando finanzas:', finError);
                if (finData && isMounted) {
                    setFinancialRecords(finData);
                }

                // 4. Descargar Configuración de la Consulta
                const { data: settingsData, error: settingsError } = await supabase
                    .from('settings')
                    .select('data')
                    .eq('user_id', uid)
                    .maybeSingle();
                if (settingsError) console.error('Error cargando configuración:', settingsError);
                if (isMounted) {
                    if (settingsData?.data) {
                        let configToSet = settingsData.data;
                        if (!configToSet.email && session?.user?.email) {
                            configToSet = { ...configToSet, email: session.user.email };
                            supabase.from('settings')
                                .update({ data: configToSet })
                                .eq('user_id', uid)
                                .then(({ error }) => {
                                    if (error) console.error('Error auto-update email:', error);
                                });
                        }
                        setConfigLocal(configToSet);
                    }
                    if (setConfigLoaded) setConfigLoaded(true);
                }
            } catch (error) {
                console.error("Error descargando los datos de la clínica:", error);
                if (isMounted && setConfigLoaded) setConfigLoaded(true); // desbloquear onboarding aunque falle
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [session, setPatientRecords, setAppointments, setFinancialRecords, setUserRole, setConfigLocal, setConfigLoaded]);
};