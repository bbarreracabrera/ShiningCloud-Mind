import React, { useState, useEffect, useMemo } from 'react';
import { Loader, Search, Cloud, Lock, Mail, ArrowRight, FileText } from 'lucide-react';
import { supabase } from '../supabase';
import { THEMES } from '../constants';
import { InputField, Button, Card } from './UIComponents';
import LegalText from './LegalText';

// --- COMPONENTE DE SEGURIDAD: URLS FIRMADAS PARA BUCKET PRIVADO ---
export const PrivateImage = ({ img, onClick }) => {
    const [signedUrl, setSignedUrl] = useState(null);

    useEffect(() => {
        let isMounted = true; 
        const fetchUrl = async () => {
            if (img.url && img.url.startsWith('http')) {
                if (isMounted) setSignedUrl(img.url);
                return;
            }
            
            const filePath = img.path || img.url; 
            // Apuntamos al bucket correcto de psicología
            const { data, error } = await supabase.storage.from('psychology-files').createSignedUrl(filePath, 3600);
            
            if (isMounted && data) setSignedUrl(data.signedUrl);
            if (error) console.error("Error seguridad imagen:", error);
        };
        fetchUrl();
        return () => { isMounted = false; }; 
    }, [img]);

    if (!signedUrl) return <div className="w-full h-full flex items-center justify-center bg-warm-white rounded-xl border border-pastel-pink/50"><Loader className="animate-spin text-gray-400" size={20}/></div>;

    const isPdf = signedUrl.toLowerCase().includes('.pdf');

    if (isPdf) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-warm-white hover:bg-white border border-pastel-pink/50 transition-colors rounded-xl" onClick={() => window.open(signedUrl, '_blank')}>
                <FileText size={32} className="mb-2 text-sage-green"/>
                <span className="text-[10px] font-bold px-2 text-center text-gray-500 uppercase tracking-widest break-all">Ver PDF</span>
            </div>
        );
    }

    return <img src={signedUrl} className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" onClick={() => onClick(signedUrl)} alt="Archivo" />;
};

// --- PESTAÑA DE TÉRMINOS Y CONDICIONES ---
export const TermsScreen = ({ theme }) => {
    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto w-full animate-fade-in">
            <Card className="p-6 md:p-10 shadow-sm border border-pastel-pink/50">
                <div className="flex items-center gap-4 mb-8 border-b border-pastel-pink/50 pb-6">
                    <div className="w-12 h-12 bg-warm-white border border-pastel-pink text-sage-green rounded-2xl flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-soft-dark">Términos de Uso y Servicio</h2>
                        <p className="text-sm text-gray-400 font-medium mt-1">Última actualización: 28-02-2026</p>
                    </div>
                </div>
                <div className="text-gray-500 leading-relaxed">
                    <LegalText isDarkTheme={false} />
                </div>
            </Card>
        </div>
    );
};

// --- EL BUSCADOR INTELIGENTE (Pacientes) ---
export const PatientSelect = ({ theme, patients, onSelect, placeholder = "Buscar Paciente..." }) => {
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [dbResults, setDbResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (query.length < 2) {
            setDbResults([]);
            return;
        }
        
        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            
            // Consulta segura que no genera Error 400
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .ilike('id', `%${query}%`)
                .limit(10); 
            
            if (error) {
                console.error("Error buscando en Supabase:", error);
            }

            if (data) {
                // Adaptado para leer la data sin importar el formato de la columna
                const formatted = data.map(r => ({ ...(r.data || r), id: r.id }));
                setDbResults(formatted);
            }
            setIsSearching(false);
        }, 500); 

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const combinedResults = useMemo(() => { 
        if (!query) return []; 
        const local = Object.values(patients).filter(p => p.personal?.legalName?.toLowerCase().includes(query.toLowerCase())); 
        const all = [...local, ...dbResults];
        const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
        return unique;
    }, [query, patients, dbResults]);
    
    return (
        <div className="relative w-full z-20">
            <InputField icon={Search} placeholder={placeholder} value={query} onChange={e => { setQuery(e.target.value); setShowResults(true); }} onFocus={() => setShowResults(true)} />
            {showResults && query && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-pastel-pink/50 max-h-48 overflow-y-auto shadow-xl bg-white custom-scrollbar z-50">
                    {isSearching && <div className="p-4 text-xs text-gray-400 font-medium text-center flex items-center justify-center gap-2"><Loader size={14} className="animate-spin"/> Buscando en base de datos...</div>}
                    
                    {!isSearching && combinedResults.length > 0 ? combinedResults.map(p => (
                        <div key={p.id} onClick={() => { onSelect(p); setQuery(p.personal?.legalName); setShowResults(false); }} className="p-4 hover:bg-warm-white cursor-pointer border-b border-pastel-pink/30 last:border-0 flex justify-between items-center group transition-colors">
                            <p className="font-bold text-sm text-soft-dark group-hover:text-sage-green">{p.personal?.legalName}</p>
                            {!patients[p.id] && <span className="text-[9px] bg-pastel-pink/30 text-gray-500 border border-pastel-pink px-2 py-0.5 rounded-full font-black tracking-widest">NUBE</span>}
                        </div>
                    )) : !isSearching && (
                        <div className="p-4 text-sm text-gray-500 text-center">
                            No encontrado. <button className="underline cursor-pointer font-bold ml-1 text-sage-green hover:text-soft-dark transition-colors" onClick={(e)=>{ e.preventDefault(); onSelect({id:'new', name: query}); setShowResults(false); }}>Crear "{query}"</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- PANTALLA DE AUTENTICACIÓN ---
export const AuthScreen = () => {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [loading, setLoading] = useState(false); 
    const [msg, setMsg] = useState('');
   
    const MP_SUBSCRIPTION_LINK = "TU_LINK_DE_PAGO_AQUI";
    const urlParams = new URLSearchParams(window.location.search);
    const vieneDePago = urlParams.get('pago') === 'exitoso';
    const [isSignUp, setIsSignUp] = useState(vieneDePago);
  
    const handleAuth = async (e) => { 
        e.preventDefault(); 
        setLoading(true); 
        setMsg(''); 
        try { 
            if (isSignUp) { 
                const { error } = await supabase.auth.signUp({ email, password }); 
                if (error) throw error; 
                setMsg('¡Consulta creada! Iniciando sesión...'); 
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
                window.history.replaceState({}, document.title, window.location.pathname);
            } else { 
                const { error } = await supabase.auth.signInWithPassword({ email, password }); 
                if (error) throw error; 
            } 
        } catch (error) { 
            setMsg(error.message); 
        } finally { 
            setLoading(false); 
        } 
    };
  
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!email) {
            setMsg('Por favor, ingresa tu correo electrónico abajo.');
            return;
        }
        setLoading(true);
        setMsg('Enviando correo...');
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin, 
        });
        if (error) setMsg("Error: " + error.message);
        else setMsg("¡Te enviamos un enlace al correo!");
        setLoading(false);
    };
   
    return (
        <div className="fixed inset-0 bg-pastel-pink flex items-center justify-center p-4 sm:p-6 z-[100] overflow-y-auto selection:bg-sage-green selection:text-white">
            
            {/* Elementos Decorativos de Fondo */}
            <div className="fixed top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-sage-green/20 blur-[100px] pointer-events-none"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-water-blue/20 blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500 py-4">    
                
                <Card className="w-full px-8 py-8 sm:px-10 sm:py-10 shadow-xl bg-white/95 backdrop-blur-xl border-pastel-pink/50 flex flex-col items-center">
                    
                    <div className="w-16 h-16 bg-sage-green rounded-2xl flex items-center justify-center shadow-lg shadow-sage-green/20 mb-5 border border-sage-green/40">
                        <Cloud className="text-white" size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black text-soft-dark tracking-tight mb-1 text-center">ShiningCloud<span className="text-sage-green">Psico</span></h1>
                    
                    {vieneDePago ? (
                        <div className="text-center mb-6">
                            <p className="text-sage-green text-xs font-bold bg-sage-green/10 px-4 py-2 rounded-full border border-sage-green/20 inline-block mb-2">
                                ¡Suscripción confirmada! 💳
                            </p>
                            <p className="text-gray-500 text-xs font-medium">Crea tu contraseña para entrar al sistema.</p>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm font-medium mb-8 text-center tracking-wide">Acceso a Consulta Digital</p>
                    )}
      
                    <form onSubmit={handleAuth} className="space-y-4 w-full">
                        
                        {msg && (
                            <div className="p-3 bg-warm-white border border-pastel-pink text-soft-dark text-xs rounded-xl text-center font-bold">
                                {msg}
                            </div>
                        )}
                        
                        <InputField 
                            icon={Mail}
                            type="email" 
                            placeholder="correo@consulta.cl" 
                            value={email} 
                            onChange={e=>setEmail(e.target.value)} 
                            required 
                            label="Correo Electrónico"
                        />
                        
                        <InputField 
                            icon={Lock}
                            type="password" 
                            placeholder="Mínimo 6 caracteres" 
                            value={password} 
                            onChange={e=>setPassword(e.target.value)} 
                            required 
                            minLength={6} 
                            label="Contraseña"
                        />
                        
                        {!isSignUp && (
                            <div className="flex justify-end pt-1">
                                <button type="button" onClick={handleResetPassword} disabled={loading} className="text-[11px] font-bold text-sage-green hover:text-soft-dark transition-colors underline-offset-4 hover:underline">
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        )}
                        
                        <div className="pt-2">
                            <Button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full py-3.5 text-sm tracking-widest uppercase shadow-md hover:-translate-y-0.5"
                                variant="primary"
                            >
                                {loading ? 'Procesando...' : (isSignUp ? 'Crear Mi Consulta' : 'Entrar al Sistema')}
                                {!loading && <ArrowRight size={18} className="ml-2"/>}
                            </Button>
                        </div>
                    </form>
                </Card>
  
                {!vieneDePago && (
                    <div className="mt-6 text-center">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                            ¿Aún no tienes cuenta?
                        </p>
                        <button 
                            onClick={(e) => { e.preventDefault(); window.location.href = MP_SUBSCRIPTION_LINK; }} 
                            className="px-6 py-2.5 rounded-full border border-pastel-pink text-gray-500 hover:bg-white hover:text-sage-green hover:border-sage-green transition-all text-xs font-bold uppercase tracking-widest shadow-sm bg-warm-white"
                        >
                            Probar 30 días gratis
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};