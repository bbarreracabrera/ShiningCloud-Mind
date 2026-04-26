import React, { useState } from 'react';
import { supabase } from '../supabase';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (password !== confirm) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        setSuccess(true);
        setTimeout(() => { window.location.href = '/'; }, 2000);
    };

    return (
        <div className="min-h-screen bg-pastel-pink flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-pastel-pink/50 p-8 w-full max-w-md shadow-xl">
                <h1 className="text-2xl font-black text-soft-dark mb-2">Nueva contraseña</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Ingresa tu nueva contraseña para acceder a tu cuenta.
                </p>

                {success ? (
                    <div className="bg-sage-green/10 border border-sage-green/30 rounded-2xl p-4">
                        <p className="font-bold text-sage-green">¡Contraseña actualizada!</p>
                        <p className="text-sm text-gray-500 mt-1">Redirigiendo al inicio...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                                Nueva contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-pastel-pink rounded-2xl bg-warm-white outline-none focus:border-sage-green transition-colors"
                                placeholder="Mínimo 6 caracteres"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                                Confirmar contraseña
                            </label>
                            <input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className="w-full p-3 border border-pastel-pink rounded-2xl bg-warm-white outline-none focus:border-sage-green transition-colors"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-sage-green text-white font-bold rounded-2xl hover:bg-opacity-90 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
