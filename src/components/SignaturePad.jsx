import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Trash2, CheckCircle, X } from 'lucide-react';
import { Card, Button } from './UIComponents';

export default function SignaturePad({ onSave, onCancel, patientName }) {
    const sigCanvas = useRef({});

    const clear = () => sigCanvas.current.clear();

    const save = () => {
        if (sigCanvas.current.isEmpty()) {
            alert("Por favor, el consultante debe firmar antes de guardar.");
            return;
        }
        // Extraemos la firma como una imagen Base64 de alta calidad
        const signatureData = sigCanvas.current.getCanvas().toDataURL('image/png');
        onSave(signatureData);
    };

    return (
        <div className="fixed inset-0 z-[150] bg-soft-dark/40 backdrop-blur-md flex items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-white p-8 rounded-[2.5rem] shadow-2xl border-pastel-pink/50 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-soft-dark tracking-tighter">Firma de Consentimiento</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-sage-green mt-1">Consultante: {patientName}</p>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-warm-white rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* AREA DE FIRMA */}
                <div className="border-2 border-dashed border-pastel-pink rounded-3xl bg-warm-white overflow-hidden mb-6">
                    <SignatureCanvas 
                        ref={sigCanvas}
                        penColor='#312923'
                        canvasProps={{
                            className: "signature-canvas w-full h-64 cursor-crosshair"
                        }}
                    />
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={clear}
                        className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-pastel-pink text-gray-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                    >
                        <Trash2 size={16} /> Limpiar
                    </button>
                    
                    <Button 
                        onClick={save}
                        className="flex-1 py-4 flex items-center justify-center gap-2 text-[10px] tracking-[0.2em]"
                    >
                        <CheckCircle size={16} /> Confirmar y Guardar Firma
                    </Button>
                </div>

                <p className="text-[9px] text-center text-gray-400 font-bold mt-6 uppercase tracking-widest">
                    Esta firma digital tiene validez legal vinculada a la ficha clínica.
                </p>
            </Card>
        </div>
    );
}