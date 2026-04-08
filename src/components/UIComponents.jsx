import React, { useRef, useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { BarChart2 } from 'lucide-react';

// --- TARJETA BASE ---
export const Card = ({ children, className = "", theme, onClick, ...props }) => { 
    return (
        <div 
            {...props} 
            onClick={onClick}
            // Bordes suaves en rosa pastel y sombra tintada en verde salvia al hacer hover
            className={`p-6 bg-white rounded-[2rem] border border-pastel-pink/50 transition-all duration-300 relative ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-sage-green hover:-translate-y-0.5' : ''} ${className}`}
            style={{ boxShadow: onClick ? '' : '0 10px 25px -5px rgba(165, 189, 163, 0.1)' }}
        >
            {children}
        </div>
    ); 
};

// --- BOTÓN PRINCIPAL ---
export const Button = ({ onClick, children, variant = "primary", className = "", theme, disabled }) => { 
    const styles = { 
        // Botón principal: Verde Salvia
        primary: `bg-sage-green hover:bg-opacity-90 text-white shadow-sm hover:shadow-md`, 
        // Botón secundario: Fondo blanco cálido, texto gris oscuro, hover rosa pastel
        secondary: `bg-warm-white text-soft-dark hover:bg-pastel-pink/30 hover:text-sage-green border border-pastel-pink`,
        // Botón peligro/alerta: Tonos rojos suaves
        danger: `bg-red-50 text-red-500 hover:bg-red-100 border border-red-100/50`,
        // Botón fantasma: Sin fondo, texto suave
        ghost: `bg-transparent text-gray-400 hover:bg-warm-white hover:text-soft-dark`
    }; 
    
    const selectedStyle = styles[variant] || styles.primary;

    return (
        <button 
            disabled={disabled} 
            onClick={onClick} 
            className={`p-3.5 rounded-2xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm ${selectedStyle} ${className}`}
        >
            {children}
        </button>
    ); 
};

// --- INPUT DINÁMICO ---
export const InputField = ({ label, icon: Icon, theme, textarea, className="", ...props }) => { 
    return (
        <div className={`w-full flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-[11px] font-bold uppercase tracking-widest ml-1 text-gray-400">{label}</label>}
            <div className="relative group">
                {/* Icono cambia a Verde Salvia al hacer focus */}
                {Icon && <Icon size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pastel-pink group-focus-within:text-sage-green transition-colors" />}
                {textarea ? 
                    <textarea 
                        {...props} 
                        rows="3" 
                        className={`w-full p-4 ${Icon ? 'pl-11' : 'pl-4'} rounded-2xl border border-pastel-pink/70 bg-warm-white focus:bg-white focus:border-sage-green focus:ring-4 focus:ring-sage-green/20 outline-none transition-all font-medium text-soft-dark resize-none text-sm`}
                    /> : 
                    <input 
                        {...props} 
                        className={`w-full p-4 ${Icon ? 'pl-11' : 'pl-4'} rounded-2xl border border-pastel-pink/70 bg-warm-white focus:bg-white focus:border-sage-green focus:ring-4 focus:ring-sage-green/20 outline-none transition-all font-medium text-soft-dark text-sm`}
                    />
                }
            </div>
        </div>
    ); 
};

// --- PANEL DE FIRMA DIGITAL ---
export const SignaturePad = ({ onSave, onCancel, theme }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    useEffect(() => { 
        const canvas = canvasRef.current; 
        if (canvas) { 
            canvas.width = canvas.offsetWidth; 
            canvas.height = canvas.offsetHeight; 
            const ctx = canvas.getContext('2d'); 
            // La firma ahora es el gris oscuro suave (soft-dark)
            ctx.strokeStyle = '#4a4a4b'; 
            ctx.lineWidth = 3; 
            ctx.lineCap = 'round'; 
            ctx.lineJoin = 'round';
        } 
    }, []);
    
    const startDrawing = (e) => { const ctx = canvasRef.current.getContext('2d'); ctx.beginPath(); const { x, y } = getCoords(e); ctx.moveTo(x, y); setIsDrawing(true); };
    const draw = (e) => { if (!isDrawing) return; const ctx = canvasRef.current.getContext('2d'); const { x, y } = getCoords(e); ctx.lineTo(x, y); ctx.stroke(); };
    const getCoords = (e) => { const rect = canvasRef.current.getBoundingClientRect(); const clientX = e.touches ? e.touches[0].clientX : e.clientX; const clientY = e.touches ? e.touches[0].clientY : e.clientY; return { x: clientX - rect.left, y: clientY - rect.top }; };
    
    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed border-pastel-pink rounded-2xl overflow-hidden bg-warm-white/50 touch-none h-48 relative hover:bg-warm-white transition-colors">
                <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={()=>setIsDrawing(false)} onMouseLeave={()=>setIsDrawing(false)} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={()=>setIsDrawing(false)}/>
                <div className="absolute bottom-3 right-3 text-[10px] font-bold uppercase tracking-widest opacity-40 pointer-events-none text-sage-green">Firme Aquí</div>
            </div>
            <div className="flex gap-3">
                <Button onClick={()=>onSave(canvasRef.current.toDataURL())} variant="primary" className="flex-1">Confirmar Firma</Button>
                <Button onClick={onCancel} variant="ghost" className="px-6">Cancelar</Button>
            </div>
        </div>
    );
};

// --- GRÁFICO FINANCIERO ---
export const SimpleLineChart = ({ data }) => {
    if (!data || data.length === 0 || data.every(d => !d.ingresos || d.ingresos === 0)) {
        return (
            <div className="w-full h-[250px] flex flex-col items-center justify-center text-gray-400 border border-pastel-pink/30 rounded-3xl bg-warm-white/30">
                <BarChart2 size={48} className="mb-4 opacity-50 text-pastel-pink" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Sin datos financieros</p>
                <p className="text-[11px] mt-1 font-medium text-gray-400">Registra pagos de pacientes para ver la gráfica</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                {/* Grilla gris muy clara */}
                <CartesianGrid strokeDasharray="3 3" stroke="#fadadd" opacity={0.5} vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} fontWeight="600" />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} fontWeight="600" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #fadadd', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }} 
                    itemStyle={{ color: '#4a4a4b' }} 
                />
                <Line 
                    type="monotone" 
                    dataKey="ingresos" 
                    // Línea en verde salvia
                    stroke="#a5bda3"
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#ffffff', stroke: '#a5bda3', strokeWidth: 2 }} 
                    activeDot={{ r: 7, fill: '#a5bda3', stroke: '#ffffff', strokeWidth: 3, boxShadow: '0 0 10px rgba(165,189,163,0.5)' }} 
                />
            </LineChart>
        </ResponsiveContainer>
    );
};