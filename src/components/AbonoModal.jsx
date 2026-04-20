import React from 'react';
import { X, Receipt, Wallet, FileCheck2 } from 'lucide-react';
import { Card, Button, InputField } from './UIComponents';
import { getLocalDate } from '../constants';

export default function AbonoModal({
    themeMode, selectedFinancialRecord, setModal, paymentInput, setPaymentInput,
    financialRecords, setFinancialRecords, saveToSupabase, notify
}) {
    if (!selectedFinancialRecord) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#312923]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md shadow-2xl p-8 space-y-6 bg-white/95 border-[#DFD2C4]/50 rounded-[2.5rem]">
                
                {/* --- HEADER DEL MODAL --- */}
                <div className="flex justify-between items-start border-b border-[#DFD2C4]/40 pb-5">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#5B6651]/10 flex items-center justify-center text-[#5B6651] mt-1 shrink-0">
                            <Wallet size={20}/>
                        </div>
                        <div>
                            <h3 className="font-black text-2xl text-[#312923] tracking-tight leading-none">{selectedFinancialRecord.patientName}</h3>
                            <p className="text-[10px] font-bold text-[#9A8F84] uppercase tracking-widest mt-2">{selectedFinancialRecord.date} • Honorarios</p>
                        </div>
                    </div>
                    <button 
                        onClick={()=>setModal(null)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FDFBF7] text-[#9A8F84] hover:bg-[#DFD2C4]/30 hover:text-[#312923] transition-colors border border-[#DFD2C4]/50"
                    >
                        <X size={20}/>
                    </button>
                </div>

                {/* --- RESUMEN DE SALDOS --- */}
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-4 bg-[#FDFBF7] border border-[#DFD2C4]/40 rounded-2xl">
                        <p className="text-[9px] uppercase font-black text-[#9A8F84] tracking-widest mb-1">Total</p>
                        <p className="font-black text-[#312923]">${(selectedFinancialRecord.total||0).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 border border-emerald-200/50 rounded-2xl">
                        <p className="text-[9px] uppercase font-black text-emerald-600 tracking-widest mb-1">Pagado</p>
                        <p className="font-black text-emerald-600">${((selectedFinancialRecord.payments||[]).reduce((s,p)=>s+p.amount,0) + (selectedFinancialRecord.paid && !selectedFinancialRecord.payments ? selectedFinancialRecord.paid : 0)).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-[#CBAAA2]/10 border border-[#CBAAA2]/30 rounded-2xl relative overflow-hidden">
                        <p className="text-[9px] uppercase font-black text-[#CBAAA2] tracking-widest mb-1">Pendiente</p>
                        <p className="font-black text-[#312923]">
                            ${((selectedFinancialRecord.total||0) - ((selectedFinancialRecord.payments||[]).reduce((s,p)=>s+p.amount,0) + (selectedFinancialRecord.paid && !selectedFinancialRecord.payments ? selectedFinancialRecord.paid : 0))).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* --- ÁREA DE PAGO --- */}
                <div className="space-y-4 bg-[#FDFBF7] p-6 rounded-3xl border border-[#DFD2C4]/50 shadow-inner">
                    <h4 className="font-black text-sm text-[#312923] uppercase tracking-widest flex items-center gap-2">
                        <Receipt size={16} className="text-[#A3968B]"/> Registrar Pago
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-3">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#A3968B]">$</span>
                            <input 
                                type="number" 
                                className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-[#DFD2C4] bg-white focus:border-[#5B6651] outline-none transition-all font-black text-[#312923] shadow-sm"
                                placeholder="Monto a pagar" 
                                value={paymentInput.amount} 
                                onChange={e=>setPaymentInput({...paymentInput, amount:e.target.value})} 
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <select 
                                className="w-full px-4 py-3.5 rounded-xl border border-[#DFD2C4] bg-white focus:border-[#5B6651] outline-none transition-all font-bold text-[#312923] text-xs appearance-none cursor-pointer shadow-sm" 
                                value={paymentInput.method} 
                                onChange={e=>setPaymentInput({...paymentInput, method:e.target.value})}
                            >
                                <option value="Efectivo">💵 Efectivo</option>
                                <option value="Transferencia">🏦 Transferencia</option>
                                <option value="Tarjeta">💳 Tarjeta / Transbank</option>
                            </select>
                            
                            <input 
                                className="w-full px-4 py-3.5 rounded-xl border border-[#DFD2C4] bg-white focus:border-[#5B6651] outline-none transition-all font-bold text-[#312923] text-xs shadow-sm"
                                placeholder="N° Boleta (Opc.)" 
                                value={paymentInput.receiptNumber} 
                                onChange={e=>setPaymentInput({...paymentInput, receiptNumber:e.target.value})} 
                            />
                        </div>
                    </div>

                    <button 
                        className="w-full py-4 bg-[#5B6651] text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#4a5442] shadow-lg shadow-[#5B6651]/20 transition-all hover:-translate-y-0.5 mt-2"
                        onClick={async ()=>{
                            if(!paymentInput.amount) return;
                            const newPayment = { amount: Number(paymentInput.amount), method: paymentInput.method, date: new Date().toLocaleDateString(), receiptNumber: paymentInput.receiptNumber };
                            const currentPayments = selectedFinancialRecord.payments || [];
                            
                            // Lógica legacy por si hay pagos antiguos sin array de payments
                            if (!selectedFinancialRecord.payments && selectedFinancialRecord.paid > 0) {
                                currentPayments.push({ amount: selectedFinancialRecord.paid, method: 'Histórico', date: selectedFinancialRecord.date });
                            }
                            
                            const updatedPayments = [...currentPayments, newPayment];
                            const newTotalPaid = updatedPayments.reduce((s,p)=>s+p.amount, 0);
                            const nr = {...selectedFinancialRecord, paid: newTotalPaid, payments: updatedPayments}; 
                            
                            setFinancialRecords(financialRecords.map(h => h.id === nr.id ? nr : h));
                            await saveToSupabase('financial_records', nr.id, nr);
                            
                            setModal(null); 
                            setPaymentInput({amount:'', method:'Transferencia', date: getLocalDate(), receiptNumber: ''}); // Transferencia como default sugerido
                            notify("Pago Registrado Exitosamente");
                        }}
                    >
                        <FileCheck2 size={16}/> CONFIRMAR PAGO
                    </button>
                </div>

                {/* --- HISTORIAL DE PAGOS --- */}
                <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                    <p className="text-[10px] font-black text-[#9A8F84] uppercase tracking-widest border-b border-[#DFD2C4]/40 pb-2 mb-3">Historial de Transacciones</p>
                    
                    {(selectedFinancialRecord.payments || []).length > 0 ? (
                        selectedFinancialRecord.payments.map((p, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-white border border-[#DFD2C4]/40 rounded-xl shadow-sm hover:border-[#A3968B] transition-colors">
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs text-[#312923]">{p.method}</span>
                                        {p.receiptNumber && <span className="text-[8px] bg-[#DFD2C4]/20 px-2 py-0.5 rounded-full text-[#9A8F84] font-black tracking-wider uppercase border border-[#DFD2C4]/50">Boleta: {p.receiptNumber}</span>}
                                    </div>
                                    <span className="text-[10px] font-bold text-[#A3968B]">{p.date}</span> 
                                </div>
                                <span className="font-black text-[#5B6651]">+${p.amount.toLocaleString()}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs font-bold text-[#A3968B] text-center py-4 bg-[#FDFBF7] rounded-xl border border-dashed border-[#DFD2C4]">No hay pagos registrados aún.</p>
                    )}
                </div>
            </Card>
        </div>
    );
}