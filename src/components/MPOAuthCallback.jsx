import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Cloud, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function MPOAuthCallback() {
    const [status, setStatus] = useState('loading'); // loading | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const exchange = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const userId = params.get('state');

            if (!code || !userId) {
                setStatus('error');
                setMessage('Parámetros inválidos en el callback.');
                return;
            }

            try {
                const { data, error } = await supabase.functions.invoke('mp-oauth-exchange', {
                    body: { code, userId, redirectUri: `${window.location.origin}/oauth/mercadopago/callback` }
                });

                if (error || !data?.success) {
                    throw new Error(data?.error || 'Error al intercambiar el código OAuth.');
                }

                setStatus('success');
                // Redirigir a settings después de 2 segundos
                setTimeout(() => {
                    window.location.href = `${window.location.origin}/?tab=settings&mp=conectado`;
                }, 2000);
            } catch (err) {
                setStatus('error');
                setMessage(err.message);
            }
        };

        exchange();
    }, []);

    return (
        <div className="min-h-screen bg-warm-white flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 bg-sage-green rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
                <Cloud className="text-white" size={24} />
            </div>
            <div className="w-full max-w-sm bg-white rounded-[2.5rem] border border-pastel-pink/50 shadow-xl p-8 text-center">
                {status === 'loading' && (
                    <div className="py-6">
                        <Loader className="animate-spin text-sage-green mx-auto mb-3" size={32} />
                        <p className="text-sm text-gray-400 font-medium">Conectando tu cuenta de MercadoPago...</p>
                    </div>
                )}
                {status === 'success' && (
                    <div className="py-4">
                        <CheckCircle size={48} className="text-sage-green mx-auto mb-4" />
                        <h2 className="text-xl font-black text-soft-dark mb-2">¡Cuenta conectada!</h2>
                        <p className="text-sm text-gray-400">Tu cuenta de MercadoPago fue vinculada. Redirigiendo...</p>
                    </div>
                )}
                {status === 'error' && (
                    <div className="py-4">
                        <XCircle size={48} className="text-pastel-pink mx-auto mb-4" />
                        <h2 className="text-xl font-black text-soft-dark mb-2">Error al conectar</h2>
                        <p className="text-sm text-gray-400">{message}</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-4 px-6 py-2 bg-soft-dark text-white font-bold rounded-xl text-sm"
                        >
                            Volver
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
