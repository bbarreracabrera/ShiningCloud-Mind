import React from 'react';
import {
    X, Cloud, LogOut, TrendingUp, CalendarClock, User,
    Wallet, FileText, Settings, Shield, Menu
} from 'lucide-react';

export default function Sidebar({
    mobileMenuOpen, setMobileMenuOpen, config, session, userRole,
    activeTab, setActiveTab, setSelectedPatientId, supabase,
    isWorkspaceActive
}) {
    const TOUR_IDS = {
        dashboard: 'dashboard',
        agenda: 'agenda',
        ficha: 'pacientes',
        informes: 'informes',
        history: 'finanzas',
        finance: 'finanzas',
        settings: 'ajustes',
    };

    const getMenuItems = () => {
        const base = [
            { id: 'dashboard', label: 'Inicio', icon: TrendingUp },
            { id: 'agenda', label: 'Agenda', icon: CalendarClock },
            { id: 'ficha', label: 'Pacientes', icon: User },
            { id: 'informes', label: 'Informes', icon: FileText },
        ];

        if (userRole === 'admin' || userRole === 'assistant') {
            base.push({ id: 'history', label: 'Pagos & Caja', icon: Wallet });
        }

        if (userRole === 'admin') {
            base.push({ id: 'settings', label: 'Ajustes', icon: Settings });
        }

        base.push({ id: 'terms', label: 'Legal', icon: Shield });
        return base;
    };

    const sidebarWidth = isWorkspaceActive ? 'w-20' : 'w-64';
    const hideOnCollapse = isWorkspaceActive ? 'hidden' : 'block';
    const centerIcons = isWorkspaceActive ? 'justify-center' : '';

    return (
        <>
            {/* Botón hamburguesa — solo móvil */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-2xl shadow-md flex items-center justify-center border border-pastel-pink"
                onClick={() => setMobileMenuOpen(true)}
            >
                <Menu size={20} className="text-soft-dark" />
            </button>

            {/* Overlay oscuro — solo móvil cuando está abierto */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-soft-dark/40 z-40 backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 ${sidebarWidth}
                transition-all duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                bg-white border-r border-pastel-pink flex flex-col shadow-sm
            `}>
                {/* --- CABECERA Y LOGO --- */}
                <div className={`p-6 border-b border-pastel-pink/50 flex flex-col items-center gap-4 relative bg-warm-white/50 ${isWorkspaceActive ? 'px-2' : ''}`}>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:bg-pastel-pink/50 rounded-full transition-colors"
                    >
                        <X size={20}/>
                    </button>

                    <div className={`rounded-2xl flex items-center justify-center shadow-sm bg-gradient-to-br from-sage-green to-water-blue text-white border border-sage-green/20 transition-all ${isWorkspaceActive ? 'w-10 h-10' : 'w-14 h-14'}`}>
                        {config?.logo ? (
                            <img src={config.logo} className="w-full h-full object-contain rounded-2xl" alt="Logo"/>
                        ) : (
                            <Cloud size={isWorkspaceActive ? 20 : 28} strokeWidth={2.5}/>
                        )}
                    </div>

                    <div className={`text-center ${hideOnCollapse}`}>
                        <h1 className="text-xl font-black tracking-tight text-soft-dark">ShiningCloud</h1>
                        <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-sage-green mt-1">Psicología</p>
                    </div>
                </div>

                {/* --- PERFIL DE USUARIO --- */}
                <div className={`px-4 py-5 ${isWorkspaceActive ? 'px-2' : ''}`}>
                    <div className={`flex items-center gap-3 p-3 rounded-2xl bg-warm-white border border-pastel-pink/50 shadow-sm hover:border-sage-green/50 transition-colors ${centerIcons}`}>
                        <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${userRole === 'admin' ? 'bg-soft-dark' : 'bg-sage-green'}`}>
                            {session?.user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className={`overflow-hidden flex-1 ${hideOnCollapse}`}>
                            <p className="text-xs font-bold text-soft-dark truncate">{session?.user?.email?.split('@')[0] || 'Usuario'}</p>
                            <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${userRole === 'admin' ? 'text-sage-green' : 'text-gray-400'}`}>
                                {userRole === 'admin' ? 'Administrador' : userRole === 'assistant' ? 'Asistente' : 'Psicólogo/a'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- NAVEGACIÓN PRINCIPAL --- */}
                <nav className={`px-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar pb-4 ${isWorkspaceActive ? 'px-2' : ''}`}>
                    {getMenuItems().map(item => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                data-tour={TOUR_IDS[item.id]}
                                title={isWorkspaceActive ? item.label : ''}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    if (item.id !== 'ficha') setSelectedPatientId(null);
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 py-3.5 rounded-2xl font-bold text-xs transition-all duration-200 group ${centerIcons} ${isActive ? 'bg-sage-green/10 text-sage-green border border-sage-green/20' : 'text-gray-500 hover:bg-warm-white hover:text-soft-dark border border-transparent'} ${isWorkspaceActive ? 'px-0' : 'px-4'}`}
                            >
                                <item.icon size={18} className={`shrink-0 transition-transform duration-300 ${isActive ? 'text-sage-green scale-110' : 'text-gray-400 group-hover:text-sage-green group-hover:scale-110'}`}/>
                                <span className={`mt-0.5 ${hideOnCollapse}`}>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* --- BOTÓN SALIR --- */}
                <div className={`p-4 space-y-2 border-t border-pastel-pink/50 bg-warm-white/50 ${isWorkspaceActive ? 'px-2' : ''}`}>
                    <button
                        title={isWorkspaceActive ? "Cerrar Sesión" : ""}
                        onClick={() => supabase?.auth?.signOut()}
                        className={`w-full p-4 rounded-2xl bg-white border border-pastel-pink text-gray-500 font-bold text-xs transition-all hover:bg-pastel-pink/30 hover:text-soft-dark hover:border-pastel-pink flex items-center gap-2 ${centerIcons}`}
                    >
                        <LogOut size={16} className="text-gray-400 shrink-0"/>
                        <span className={hideOnCollapse}>CERRAR SESIÓN</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
