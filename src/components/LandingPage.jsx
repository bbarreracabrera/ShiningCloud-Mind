import React, { useState, useEffect } from 'react';
import { Cloud, Mic, ShieldCheck, Smartphone, CheckCircle2, ArrowRight, Activity, Wallet, FileEdit } from 'lucide-react';
import LegalText from './LegalText'; // Asegúrate de tener copiado este archivo

export default function LandingPage({ onLoginClick }) {
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    
    // 👇 AQUÍ PONES TU LINK DE MERCADO PAGO / STRIPE
    const PAYMENT_LINK = "TU_LINK_DE_PAGO_AQUI"; 
    
    useEffect(() => {
        if (window.location.hash.includes('type=recovery')) {
            onLoginClick(); 
        }
    }, [onLoginClick]);

    return (
        <div className="min-h-screen bg-pastel-pink text-soft-dark font-sans selection:bg-sage-green selection:text-white overflow-x-hidden">
            
            {/* --- NAVEGACIÓN --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-pastel-pink/80 backdrop-blur-lg border-b border-pastel-pink">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                        <div className="w-8 h-8 bg-sage-green rounded-xl shadow-sm flex items-center justify-center">
                            <Cloud className="text-white" size={18} strokeWidth={2.5} />
                        </div>
                        <span className="font-black text-xl tracking-tighter text-soft-dark">ShiningCloud<span className="text-sage-green font-bold">Psico</span></span>
                    </div>
                    <button onClick={onLoginClick} className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-white hover:bg-warm-white text-soft-dark border border-pastel-pink rounded-full transition-all shadow-sm hover:border-sage-green">
                        Acceso Profesionales
                    </button>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <div className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-8">
                
                <div className="flex-1 text-center md:text-left z-10 relative">
                    <span className="inline-block px-4 py-1.5 rounded-full border border-sage-green/30 bg-white text-sage-green text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">
                        Menos planillas. Más tiempo libre.
                    </span>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-soft-dark leading-[1.05]">
                        La consulta clínica <br />
                        <span className="text-sage-green italic">ordenada por fin.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto md:mx-0 mb-10 leading-relaxed font-medium">
                        Una app pensada específicamente para psicólogos independientes que reúne <strong className="text-soft-dark font-bold">agenda, pacientes, notas clínicas y pagos en un solo lugar</strong>. Adaptada a la práctica real, en español y fácil de usar.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <button onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })} className="group px-8 py-4 bg-soft-dark text-white font-bold rounded-full transition-all hover:bg-opacity-90 hover:shadow-xl hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-3 text-[11px] tracking-widest uppercase">
                            Digitalizar mi consulta <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    </div>
                </div>

                {/* --- VISUAL ABSTRACTO (Reemplaza al Diente) --- */}
                <div className="flex-1 flex justify-center md:justify-end w-full relative z-10 mt-12 md:mt-0">
                    <div className="relative p-8 bg-white rounded-[3rem] border border-pastel-pink/50 group w-full max-w-md" style={{ boxShadow: '0 25px 50px -12px rgba(165, 189, 163, 0.2)' }}>
                        
                        <div className="absolute -top-4 -left-4 md:-left-8 flex gap-3 items-center px-5 py-3 bg-white text-soft-dark border border-pastel-pink rounded-full text-[11px] font-bold shadow-md z-20">
                            <div className="w-2 h-2 rounded-full bg-sage-green animate-pulse"></div>
                            <span>Nota Clínica Evolutiva - <span className="text-sage-green">Guardada</span></span>
                        </div>

                        {/* Falsa Tarjeta de Nota */}
                        <div className="space-y-4">
                            <div className="h-4 bg-warm-white rounded w-1/3"></div>
                            <div className="h-2 bg-pastel-pink rounded w-full"></div>
                            <div className="h-2 bg-pastel-pink rounded w-5/6"></div>
                            <div className="h-2 bg-pastel-pink rounded w-4/6"></div>
                            <div className="pt-4 flex gap-2">
                                <span className="px-2 py-1 bg-sage-green/10 text-sage-green text-[10px] font-bold rounded">#ansiedad</span>
                                <span className="px-2 py-1 bg-water-blue/20 text-water-blue text-[10px] font-bold rounded">#familia</span>
                            </div>
                        </div>
                        
                        <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-water-blue/30 rounded-full blur-3xl pointer-events-none"></div>
                    </div>
                </div>
            </div>

            {/* --- SHOWCASE VISUAL (BENTO GRID ESTILO APPLE) --- */}
            <div id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-pastel-pink">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-soft-dark tracking-tight mb-4">Clínicamente Útil. Visualmente Hermosa.</h2>
                    <p className="text-gray-500 font-medium">No tan médica, no tan fría, no gringa.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
                    
                    {/* BENTO 1: Notas de Sesión */}
                    <div className="md:col-span-2 bg-soft-dark rounded-[2.5rem] p-10 md:p-12 flex flex-col justify-between relative overflow-hidden group shadow-lg shadow-soft-dark/10">
                        <div className="absolute -right-10 -bottom-10 opacity-10 text-warm-white transform group-hover:scale-110 transition-transform duration-700">
                            <FileEdit size={250} strokeWidth={1}/>
                        </div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                                <Activity className="text-sage-green" size={28} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">Registro de Sesiones Flexible</h3>
                            <p className="text-gray-300 font-medium max-w-md leading-relaxed">Nota clínica estructurada pero sin encorsetarte. Agrega etiquetas (tags) como #colegio o #duelo para buscar historiales en segundos.</p>
                        </div>
                    </div>

                    {/* BENTO 2: Flujo Financiero */}
                    <div className="md:col-span-1 bg-white border border-pastel-pink/60 rounded-[2.5rem] p-10 flex flex-col justify-between hover:border-sage-green/50 transition-colors shadow-sm">
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-sage-green/10 flex items-center justify-center mb-6 border border-sage-green/20">
                                <Wallet className="text-sage-green" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-soft-dark mb-3 tracking-tight">Pagos Simples</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">Cuánto paga cada paciente, registro de adeudos y un resumen mensual realista. Sin contabilidad compleja.</p>
                        </div>
                    </div>

                    {/* BENTO 3: Multiplataforma */}
                    <div className="md:col-span-1 bg-warm-white border border-pastel-pink/60 rounded-[2.5rem] p-10 flex flex-col justify-between hover:border-water-blue/50 transition-colors shadow-inner">
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-water-blue/20 flex items-center justify-center mb-6 border border-water-blue/30">
                                <Smartphone className="text-water-blue" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-soft-dark mb-3 tracking-tight">Menos cuadernos</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">Lleva tu agenda, link de videollamadas y pacientes en tu celular, tablet o computador.</p>
                        </div>
                    </div>

                    {/* BENTO 4: Seguridad */}
                    <div className="md:col-span-2 bg-sage-green rounded-[2.5rem] p-10 flex flex-col justify-center relative overflow-hidden group shadow-lg shadow-sage-green/20">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                            <div className="w-20 h-20 shrink-0 rounded-[2rem] bg-white flex items-center justify-center shadow-md transform group-hover:rotate-12 transition-transform duration-500">
                                <ShieldCheck className="text-sage-green" size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Privacidad y Encuadre Clínico</h3>
                                <p className="text-warm-white font-medium leading-relaxed">Fichas inalterables, firmas de consentimiento informado digital y seguridad para proteger la intimidad del paciente.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- PRECIOS SIMPLIFICADOS --- */}
            <div id="pricing" className="bg-white border-y border-pastel-pink/50 py-24">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-soft-dark mb-4 tracking-tight">Un solo plan. Cero letras chicas.</h2>
                    <p className="text-gray-500 mb-16 max-w-xl mx-auto text-lg font-medium">
                        El precio de una sesión paga la herramienta que ordena todo tu mes.
                    </p>

                    <div className="max-w-md mx-auto relative group">
                        {/* Sombra Pastel suave */}
                        <div className="absolute -inset-2 bg-pastel-pink/50 rounded-[40px] blur-xl transition-all"></div>
                        
                        <div className="relative bg-warm-white p-10 md:p-12 rounded-[2.5rem] border border-pastel-pink/50" style={{ boxShadow: '0 25px 50px -12px rgba(250, 218, 221, 0.3)' }}>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage-green bg-white px-4 py-1.5 rounded-full inline-block border border-pastel-pink mb-8 shadow-sm">Consulta Independiente</h3>
                            <div className="flex items-baseline justify-center gap-1 mb-10">
                                <span className="text-6xl font-black tracking-tighter text-soft-dark">$15.000</span>
                                <span className="text-gray-400 font-bold text-sm">CLP/mes</span>
                            </div>
                            
                            <ul className="text-left space-y-4 mb-10">
                                {[
                                    'Agenda con link automático a sesión',
                                    'Fichas Clínicas con Red de Apoyo',
                                    'Registro de Evolución con Tags',
                                    'Módulo Simple de Pagos y Finanzas',
                                    'Plantillas para Informes (PDF)',
                                    'Soporte Prioritario'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-soft-dark">
                                        <CheckCircle2 size={20} className="text-sage-green shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="space-y-6">
                                <label className="flex items-start gap-3 cursor-pointer group text-left bg-white p-5 rounded-2xl border border-pastel-pink/50 hover:border-sage-green/50 transition-colors shadow-sm">
                                    <input 
                                        type="checkbox" 
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="mt-1 w-5 h-5 accent-sage-green rounded border-pastel-pink cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-500 font-medium leading-relaxed">
                                        Acepto los <button onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-sage-green hover:underline font-bold">Términos de Servicio</button> para operar.
                                    </span>
                                </label>

                                <button 
                                    disabled={!acceptedTerms}
                                    onClick={() => window.location.href = PAYMENT_LINK}
                                    className={`w-full py-4 font-bold rounded-2xl transition-all text-[11px] uppercase tracking-widest flex justify-center items-center gap-2 ${
                                        acceptedTerms 
                                        ? "bg-soft-dark text-white hover:bg-opacity-90 shadow-md hover:-translate-y-0.5" 
                                        : "bg-pastel-pink text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    Iniciar Suscripción <ArrowRight size={16}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL DE TÉRMINOS (Mantenido casi igual, solo clases Tailwind) --- */}
            {showTerms && (
                <div className="fixed inset-0 bg-soft-dark/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white border border-pastel-pink rounded-[2.5rem] w-full max-w-3xl max-h-[85vh] flex flex-col relative shadow-2xl animate-in zoom-in-95">
                        <div className="p-8 border-b border-pastel-pink/50 flex justify-between items-center bg-warm-white rounded-t-[2.5rem]">
                            <div>
                                <h2 className="text-2xl font-black text-soft-dark tracking-tight">Marco Legal y Privacidad</h2>
                                <p className="text-[10px] text-sage-green font-bold uppercase tracking-widest mt-1 text-left">ShiningCloud Psico</p>
                            </div>
                            <button onClick={() => setShowTerms(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white text-gray-400 hover:bg-pastel-pink hover:text-soft-dark transition-colors border border-pastel-pink">✕</button>
                        </div>
                        <div className="p-8 overflow-y-auto custom-scrollbar text-left text-soft-dark bg-white">
                            <LegalText />
                        </div>
                        <div className="p-6 md:p-8 border-t border-pastel-pink/50 bg-warm-white rounded-b-[2.5rem]">
                            <button 
                                onClick={() => { setAcceptedTerms(true); setShowTerms(false); }} 
                                className="w-full py-4 bg-sage-green text-white font-bold text-[11px] uppercase tracking-widest rounded-2xl hover:bg-opacity-90 transition-all shadow-md hover:-translate-y-0.5"
                            >
                                Entendido y acepto las condiciones
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FOOTER --- */}
            <footer className="py-12 text-center bg-warm-white border-t border-pastel-pink/50">
                <div className="flex items-center justify-center gap-2 opacity-40 mb-3 text-soft-dark">
                    <Cloud size={16} />
                    <span className="font-black text-sm tracking-widest uppercase">ShiningCloud</span>
                </div>
                <p className="text-gray-400 text-[10px] font-bold px-4 uppercase tracking-widest">
                    © {new Date().getFullYear()} ShiningCloud Psico Chile.
                </p>
            </footer>
        </div>
    );
}