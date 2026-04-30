import React from 'react';
import { ShieldAlert, KeyRound } from 'lucide-react';
import { Card } from './UIComponents';

export default function RecoveryModal({ 
    newPasswordInput, setNewPasswordInput, supabase, notify, setModal 
}) {
    const handleUpdate = async () => {
        if (newPasswordInput.length < 6) {
            if(typeof notify === 'function') notify("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        
        // Usamos supabase directamente
        const { error } = await supabase.auth.updateUser({ password: newPasswordInput });
        
        if (error) {
            if(typeof notify === 'function') notify("Error al actualizar: " + error.message);
        } else {
            if(typeof notify === 'function') notify("¡Contraseña actualizada con éxito!");
            setModal(null);
            setNewPasswordInput('');
            window.location.hash = ''; // Limpiamos la URL nativa
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-[#312923]/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
            <Card className="w-full md:max-w-md bg-white/95 border-[#DFD2C4]/50 rounded-t-3xl md:rounded-[2.5rem] max-h-[95vh] md:max-h-[85vh] overflow-y-auto p-8 space-y-6 shadow-2xl">
                
                <div className="flex flex-col items-center text-center pb-2 border-b border-[#DFD2C4]/40">
                    <div className="w-16 h-16 rounded-full bg-[#CBAAA2]/10 flex items-center justify-center text-[#CBAAA2] mb-4 shadow-inner">
                        <ShieldAlert size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-[#312923] tracking-tight">Actualiza tu Contraseña</h2>
                    <p className="text-xs font-bold text-[#9A8F84] mt-2 max-w-[280px]">
                        Por seguridad, debes establecer una nueva clave para tu cuenta antes de continuar en el sistema.
                    </p>
                </div>
                
                <div className="space-y-4 pt-2">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3968B]">
                            <KeyRound size={18} />
                        </span>
                        <input 
                            type="password" 
                            placeholder="Nueva contraseña (mín. 6 caracteres)" 
                            className="w-full pl-11 pr-4 py-4 rounded-2xl bg-[#FDFBF7] border border-[#DFD2C4] focus:border-[#5B6651] focus:ring-4 focus:ring-[#5B6651]/10 outline-none transition-all font-black text-[#312923] shadow-sm placeholder:text-[#9A8F84]/70 placeholder:font-bold"
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                        />
                    </div>
                </div>
                
                <button 
                    onClick={handleUpdate}
                    className="w-full py-4 bg-[#312923] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-[#1a1512] transition-all shadow-lg shadow-[#312923]/20 hover:-translate-y-0.5 mt-2"
                >
                    Guardar Nueva Contraseña
                </button>
            </Card>
        </div>
    );
}