import React, { useRef, useEffect } from 'react';
import { Joyride, STATUS, EVENTS, ACTIONS } from 'react-joyride';

export default function WelcomeTour({ run, onComplete, setActiveTab, setMobileMenuOpen }) {
    const completedRef = useRef(false);

    useEffect(() => {
        if (run) {
            completedRef.current = false;
        }
    }, [run]);
    const steps = [
        {
            target: 'body',
            placement: 'center',
            title: '¡Bienvenida a ShiningCloud Mind! 🌸',
            content: 'Te guiaré por las funciones principales en menos de 2 minutos. Puedes cerrar el tour en cualquier momento.',
            disableBeacon: true,
        },
        {
            target: '[data-tour="dashboard"]',
            title: 'Dashboard',
            content: 'Aquí ves tus ingresos, egresos del mes, las sesiones de hoy y notas pendientes por escribir.',
            placement: 'auto',
        },
        {
            target: '[data-tour="agenda"]',
            title: 'Agenda Semanal',
            content: 'Visualiza tus citas en formato calendario. Haz clic en cualquier hora para agendar una nueva sesión.',
            placement: 'auto',
        },
        {
            target: '[data-tour="pacientes"]',
            title: 'Fichas Clínicas',
            content: 'Crea pacientes, escribe evoluciones, sube imágenes, mantén anamnesis y consentimientos firmados.',
            placement: 'auto',
        },
        {
            target: '[data-tour="informes"]',
            title: 'Informes',
            content: 'Genera informes clínicos en PDF — derivaciones, certificados, informes psicológicos. Quedan firmados con tus datos.',
            placement: 'auto',
        },
        {
            target: '[data-tour="finanzas"]',
            title: 'Pagos & Caja',
            content: 'Registra cobros, abonos y genera recibos PDF para tus pacientes. Lleva control de quien debe.',
            placement: 'auto',
        },
        {
            target: '[data-tour="ajustes"]',
            title: 'Configuración',
            content: 'Conecta MercadoPago para recibir pagos online, configura tus horarios y obtén tu link de reservas público.',
            placement: 'auto',
        },
        {
            target: 'body',
            placement: 'center',
            title: '¡Listo para empezar! ✨',
            content: 'Ya conoces lo principal. Ahora es tu turno. Si tienes dudas, puedes repetir el tour desde Ajustes.',
        }
    ];

    const handleCallback = (data) => {
        const { action, index, status, type, lifecycle } = data;

        console.log('🎯 TOUR EVENT:', { type, action, status, lifecycle });

        // Al iniciar el tour, abrir sidebar en móvil para que los targets sean visibles
        if (type === EVENTS.TOUR_START && setMobileMenuOpen) {
            if (window.innerWidth < 768) {
                setMobileMenuOpen(true);
            }
        }

        // Cambiar tab al avanzar/retroceder
        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
            const tabsByStep = {
                1: 'dashboard', 2: 'agenda', 3: 'ficha',
                4: 'informes', 5: 'finance', 6: 'settings',
            };
            if (setActiveTab && tabsByStep[nextIndex] !== undefined) {
                setActiveTab(tabsByStep[nextIndex]);
            }
        }

        const isEnd =
            status === STATUS.FINISHED ||
            status === STATUS.SKIPPED ||
            type === EVENTS.TOUR_END ||
            action === ACTIONS.CLOSE;

        if (isEnd && !completedRef.current) {
            completedRef.current = true;
            console.log('🟢 TOUR TERMINA — llamando onComplete (1 vez)');
            if (setMobileMenuOpen) setMobileMenuOpen(false);
            if (onComplete) onComplete();
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            scrollToFirstStep
            disableScrolling={true}
            scrollOffset={100}
            callback={handleCallback}
            locale={{
                back: 'Atrás',
                close: 'Cerrar',
                last: 'Finalizar',
                next: 'Siguiente',
                skip: 'Saltar tour',
            }}
            styles={{
                options: {
                    primaryColor: '#5B6651',
                    backgroundColor: '#ffffff',
                    textColor: '#312923',
                    arrowColor: '#ffffff',
                    overlayColor: 'rgba(49, 41, 35, 0.5)',
                    zIndex: 10000,
                },
                tooltip: {
                    borderRadius: 16,
                    fontSize: 14,
                },
                buttonNext: {
                    backgroundColor: '#5B6651',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '10px 20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                },
                buttonBack: {
                    color: '#9A8F84',
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                },
                buttonSkip: {
                    color: '#9A8F84',
                    fontSize: 11,
                },
            }}
        />
    );
}
