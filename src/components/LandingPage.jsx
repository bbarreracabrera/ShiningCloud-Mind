import React, { useState, useEffect } from 'react';
import { Cloud, ShieldCheck, Smartphone, CheckCircle2, ArrowRight, Activity, Wallet, FileEdit, Users, Calendar, Tag } from 'lucide-react';
import LegalText from './LegalText';

export default function LandingPage({ onLoginClick, onRegisterClick }) {
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const PAYMENT_LINK = "https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=df4b41b056fc40e8b0aa1c73c5fdd775";

    useEffect(() => {
        if (window.location.hash.includes('type=recovery')) {
            onLoginClick();
        }
    }, [onLoginClick]);

    return (
        <div className="min-h-screen bg-white text-soft-dark font-sans selection:bg-sage-green selection:text-white overflow-x-hidden">

            {/* --- NAVEGACIÓN --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pastel-pink/60">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                        <div className="w-9 h-9 bg-sage-green rounded-xl shadow-sm flex items-center justify-center">
                            <Cloud className="text-white" size={20} strokeWidth={2.5} />
                        </div>
                        <span className="font-black text-xl tracking-tighter text-soft-dark">ShiningCloud<span className="text-sage-green">Mind</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onRegisterClick} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest bg-sage-green hover:bg-sage-green/90 text-white rounded-full transition-all shadow-sm">
                            Crear cuenta gratis
                        </button>
                        <button onClick={onLoginClick} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest bg-white hover:bg-warm-white text-soft-dark border border-pastel-pink rounded-full transition-all shadow-sm hover:border-sage-green">
                            Ingresar
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO 100VH --- */}
            <div className="min-h-screen flex items-center" style={{ background: 'linear-gradient(135deg, #fadadd 0%, #f9f7f4 50%, #ffffff 100%)' }}>
                <div className="max-w-7xl mx-auto px-6 w-full pt-24 pb-16 flex flex-col md:flex-row items-center gap-12 md:gap-16">

                    {/* Texto */}
                    <div className="flex-1 text-center md:text-left z-10">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sage-green/30 bg-white text-sage-green text-[10px] font-bold uppercase tracking-[0.18em] mb-8 shadow-sm">
                            🇨🇱 Hecho para psicólogos chilenos
                        </span>

                        <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6 text-soft-dark leading-[1.02]">
                            La consulta clínica<br />
                            <span className="text-sage-green italic">ordenada por fin.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed font-medium">
                            Agenda, fichas, notas clínicas y pagos en un solo lugar. Pensado para la práctica real, en español, sin complicaciones.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <button onClick={onRegisterClick} className="group px-8 py-4 bg-sage-green text-white font-bold rounded-full transition-all hover:bg-sage-green/90 hover:shadow-xl hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-3 text-[11px] tracking-widest uppercase">
                                Crear cuenta gratis <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={onLoginClick} className="px-8 py-4 bg-white text-soft-dark font-bold rounded-full transition-all hover:bg-warm-white hover:border-sage-green hover:shadow-md border border-pastel-pink text-[11px] tracking-widest uppercase">
                                Ya tengo cuenta
                            </button>
                        </div>

                        <p className="text-[10px] text-gray-400 font-medium mt-6 md:text-left text-center">Sin tarjeta de crédito. Primer mes gratis.</p>
                    </div>

                    {/* Tarjeta Decorativa — Ficha Clínica */}
                    <div className="flex-1 flex justify-center md:justify-end w-full relative z-10">
                        <div className="relative w-full max-w-sm md:max-w-md">

                            {/* Badge flotante */}
                            <div className="absolute -top-5 -left-4 flex gap-2.5 items-center px-5 py-2.5 bg-white text-soft-dark border border-pastel-pink rounded-full text-[11px] font-bold shadow-lg z-20">
                                <div className="w-2 h-2 rounded-full bg-sage-green animate-pulse"></div>
                                Nota guardada automáticamente
                            </div>

                            {/* Tarjeta principal */}
                            <div className="bg-white rounded-[2.5rem] border border-pastel-pink/60 p-8 shadow-2xl shadow-pastel-pink/30">
                                {/* Header de ficha */}
                                <div className="flex items-center justify-between mb-6 pb-5 border-b border-pastel-pink/50">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ficha Clínica</p>
                                        <p className="text-base font-black text-soft-dark">María González P.</p>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">Sesión #12 · 20 Abr 2026</p>
                                    </div>
                                    <div className="w-11 h-11 rounded-2xl bg-sage-green/10 border border-sage-green/20 flex items-center justify-center">
                                        <Activity size={20} className="text-sage-green" />
                                    </div>
                                </div>

                                {/* Nota de evolución */}
                                <div className="mb-5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nota de Evolución</p>
                                    <div className="space-y-2">
                                        <div className="h-2.5 bg-warm-white rounded-full w-full"></div>
                                        <div className="h-2.5 bg-warm-white rounded-full w-5/6"></div>
                                        <div className="h-2.5 bg-warm-white rounded-full w-4/6"></div>
                                        <div className="h-2.5 bg-pastel-pink/40 rounded-full w-full"></div>
                                        <div className="h-2.5 bg-pastel-pink/40 rounded-full w-3/4"></div>
                                    </div>
                                </div>

                                {/* Próxima sesión */}
                                <div className="flex items-center gap-2 mb-5 bg-warm-white rounded-2xl p-3 border border-pastel-pink/40">
                                    <Calendar size={14} className="text-gray-400 shrink-0" />
                                    <p className="text-xs text-gray-500 font-medium">Próxima sesión: <span className="font-bold text-soft-dark">Vie 24 Abr · 11:00</span></p>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-sage-green/10 text-sage-green text-[10px] font-bold rounded-full border border-sage-green/20">#ansiedad</span>
                                    <span className="px-3 py-1 bg-water-blue/15 text-water-blue text-[10px] font-bold rounded-full border border-water-blue/20">#familia</span>
                                    <span className="px-3 py-1 bg-pastel-pink text-gray-500 text-[10px] font-bold rounded-full border border-pastel-pink">#adultos</span>
                                </div>
                            </div>

                            {/* Badge inferior flotante */}
                            <div className="absolute -bottom-4 -right-4 bg-soft-dark text-white px-4 py-2.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-2">
                                <Users size={12} /> 24 pacientes activos
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BENTO GRID --- */}
            <div id="features" className="max-w-7xl mx-auto px-6 py-28 border-t border-pastel-pink/50">
                <div className="text-center mb-16">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sage-green mb-3">Funcionalidades</p>
                    <h2 className="text-3xl md:text-5xl font-black text-soft-dark tracking-tight mb-4">Clínicamente útil.<br />Visualmente hermosa.</h2>
                    <p className="text-gray-400 font-medium text-lg">No tan médica. No tan fría. No gringa.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* BENTO 1: Notas */}
                    <div className="md:col-span-2 min-h-[280px] bg-soft-dark rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group shadow-xl shadow-soft-dark/15">
                        <div className="absolute -right-8 -bottom-8 opacity-[0.07] transform group-hover:scale-110 transition-transform duration-700">
                            <FileEdit size={260} strokeWidth={1} className="text-white" />
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                            <Activity className="text-sage-green" size={28} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">Registro de Sesiones Flexible</h3>
                            <p className="text-gray-300 font-medium leading-relaxed max-w-md">Nota clínica estructurada pero sin encorsetarte. Agrega etiquetas (#colegio, #duelo, #pareja) para buscar historiales en segundos. Sin formularios rígidos.</p>
                        </div>
                    </div>

                    {/* BENTO 2: Pagos */}
                    <div className="md:col-span-1 min-h-[280px] bg-white border border-pastel-pink/60 rounded-[2.5rem] p-10 flex flex-col justify-between hover:border-sage-green/40 transition-colors shadow-sm group">
                        <div className="w-14 h-14 rounded-2xl bg-sage-green/10 flex items-center justify-center mb-6 border border-sage-green/20 group-hover:bg-sage-green/20 transition-colors">
                            <Wallet className="text-sage-green" size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-soft-dark mb-3 tracking-tight">Pagos al Día</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">Cuánto paga cada paciente, historial de adeudos y resumen mensual real. Sin contabilidad compleja ni Excel.</p>
                        </div>
                    </div>

                    {/* BENTO 3: Multiplataforma */}
                    <div className="md:col-span-1 min-h-[280px] bg-warm-white border border-pastel-pink/60 rounded-[2.5rem] p-10 flex flex-col justify-between hover:border-water-blue/40 transition-colors shadow-inner group">
                        <div className="w-14 h-14 rounded-2xl bg-water-blue/20 flex items-center justify-center mb-6 border border-water-blue/30 group-hover:bg-water-blue/30 transition-colors">
                            <Smartphone className="text-water-blue" size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-soft-dark mb-3 tracking-tight">Sin papel. Sin cuadernos.</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">Agenda, fichas y link de videollamada siempre contigo. Funciona en celular, tablet o computador.</p>
                        </div>
                    </div>

                    {/* BENTO 4: Seguridad */}
                    <div className="md:col-span-2 min-h-[280px] bg-sage-green rounded-[2.5rem] p-10 flex flex-col justify-center relative overflow-hidden group shadow-xl shadow-sage-green/25">
                        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                            <div className="w-20 h-20 shrink-0 rounded-[2rem] bg-white flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                                <ShieldCheck className="text-sage-green" size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">Privacidad y Encuadre Clínico</h3>
                                <p className="text-white/80 font-medium leading-relaxed max-w-md">Fichas protegidas, firmas de consentimiento informado digital y datos seguros para respetar la intimidad de tus pacientes.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- PARA QUIÉN ES --- */}
            <div className="bg-soft-dark py-28">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sage-green mb-4">Para ti si...</p>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-16">Hecha para ti si...</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        {[
                            {
                                icon: <Users size={24} className="text-sage-green" />,
                                text: "Tienes consulta independiente o un pequeño equipo y necesitas organizarte sin gastar una fortuna."
                            },
                            {
                                icon: <FileEdit size={24} className="text-sage-green" />,
                                text: "Llevas fichas en papel, Word o Excel y ya no aguantas buscar entre carpetas al inicio de cada sesión."
                            },
                            {
                                icon: <Activity size={24} className="text-sage-green" />,
                                text: "Quieres más tiempo para tus pacientes y menos horas perdidas en tareas administrativas."
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col gap-5 hover:bg-white/8 transition-colors">
                                <div className="w-12 h-12 rounded-2xl bg-sage-green/15 border border-sage-green/20 flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <p className="text-white/80 font-medium leading-relaxed text-sm">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- PRECIOS --- */}
            <div id="pricing" className="bg-pastel-pink/30 border-y border-pastel-pink/50 py-28">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sage-green mb-4">Precio</p>
                    <h2 className="text-3xl md:text-5xl font-black text-soft-dark mb-4 tracking-tight">Un solo plan. Cero letras chicas.</h2>
                    <p className="text-gray-500 mb-16 max-w-lg mx-auto text-lg font-medium">
                        El precio de una sesión ordena todo tu mes.
                    </p>

                    <div className="max-w-md mx-auto relative">
                        <div className="absolute -inset-3 bg-sage-green/15 rounded-[44px] blur-2xl"></div>

                        <div className="relative bg-white p-10 md:p-12 rounded-[2.5rem] border border-pastel-pink/60 shadow-2xl shadow-pastel-pink/20">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage-green bg-sage-green/10 px-4 py-1.5 rounded-full inline-block border border-sage-green/20 mb-6">Consulta Independiente</h3>

                            {/* Badge primer mes gratis */}
                            <div className="inline-flex items-center gap-1.5 bg-sage-green text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 shadow-sm">
                                <CheckCircle2 size={12} /> Primer mes gratis
                            </div>

                            <div className="flex items-baseline justify-center gap-1 mb-10">
                                <span className="text-6xl md:text-7xl font-black tracking-tighter text-soft-dark">$9.990</span>
                                <span className="text-gray-400 font-bold text-sm self-end mb-2">CLP/mes</span>
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
                                        <CheckCircle2 size={20} className="text-sage-green shrink-0 mt-0.5" /> {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="space-y-5">
                                <label className="flex items-start gap-3 cursor-pointer text-left bg-warm-white p-5 rounded-2xl border border-pastel-pink/50 hover:border-sage-green/40 transition-colors shadow-sm">
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
                                    className={`w-full py-5 font-bold rounded-2xl transition-all text-[11px] uppercase tracking-widest flex justify-center items-center gap-2 ${
                                        acceptedTerms
                                        ? "bg-soft-dark text-white hover:bg-opacity-90 shadow-lg hover:-translate-y-0.5"
                                        : "bg-pastel-pink text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    Iniciar Suscripción <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL DE TÉRMINOS --- */}
            {showTerms && (
                <div className="fixed inset-0 bg-soft-dark/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white border border-pastel-pink rounded-[2.5rem] w-full max-w-3xl max-h-[85vh] flex flex-col relative shadow-2xl animate-in zoom-in-95">
                        <div className="p-8 border-b border-pastel-pink/50 flex justify-between items-center bg-warm-white rounded-t-[2.5rem]">
                            <div>
                                <h2 className="text-2xl font-black text-soft-dark tracking-tight">Marco Legal y Privacidad</h2>
                                <p className="text-[10px] text-sage-green font-bold uppercase tracking-widest mt-1">ShiningCloud Mind</p>
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
            <footer className="py-16 bg-white border-t border-pastel-pink/50">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-sage-green rounded-xl flex items-center justify-center">
                            <Cloud size={16} className="text-white" />
                        </div>
                        <span className="font-black text-sm tracking-tight text-soft-dark">ShiningCloud<span className="text-sage-green">Mind</span></span>
                    </div>

                    <p className="text-gray-400 text-xs font-medium">
                        © {new Date().getFullYear()} ShiningCloud Mind Chile · <a href="mailto:contacto@shiningcloud.cl" className="hover:text-sage-green transition-colors">contacto@shiningcloud.cl</a>
                    </p>

                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <button onClick={() => setShowTerms(true)} className="hover:text-sage-green transition-colors">Términos</button>
                        <span>·</span>
                        <button onClick={() => setShowTerms(true)} className="hover:text-sage-green transition-colors">Privacidad</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
