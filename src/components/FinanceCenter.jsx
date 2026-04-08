import React, { useState } from 'react';
import * as XLSX from 'xlsx'; 
import { Wallet, FileSpreadsheet, TrendingDown, MessageCircle, Box, Plus, Trash2, ArrowUpRight, ArrowDownRight, User } from 'lucide-react';
import { Card, Button, InputField } from './UIComponents';
import { PatientSelect } from './SystemModals';
import { getLocalDate } from '../constants'; 
import { supabase } from '../supabase';

export default function FinanceCenter({ 
    themeMode, t, financialRecords, setFinancialRecords, 
    incomeRecords, expenseRecords, totalCollected, totalExpenses, totalDebt, netProfit,
    patientRecords, saveToSupabase, notify, onOpenAbonoModal, sendWhatsApp, getPatientPhone, financeTab, setFinanceTab
}) {
    const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Materiales y Test', date: getLocalDate(), patientRef: '' });

    const exportToExcel = () => {
        const formattedData = financialRecords.map(record => {
            const isIncome = record.type === 'income';
            
            let incomeAmount = 0;
            if (isIncome) {
                incomeAmount = (record.payments || []).reduce((s,p) => s + p.amount, 0) + (record.paid && !record.payments ? record.paid : 0);
            }
            
            const expenseAmount = !isIncome ? Number(record.amount) : 0;

            return {
                "Fecha": record.date || getLocalDate(),
                "Tipo de Movimiento": isIncome ? 'Ingreso (Pago Sesión)' : 'Egreso (Gasto)',
                "Descripción": record.description || record.treatment || 'Sin descripción',
                "Categoría": record.category || (isIncome ? 'Atención Clínica' : 'General'),
                "Paciente Asociado": record.patientName || record.patientRef || '---',
                "Ingresos ($)": isIncome ? incomeAmount : 0,
                "Egresos ($)": !isIncome ? expenseAmount : 0,
            };
        });

        formattedData.push({ "Fecha": "", "Tipo de Movimiento": "", "Descripción": "", "Categoría": "", "Paciente Asociado": "", "Ingresos ($)": "", "Egresos ($)": "" });
        formattedData.push({ 
            "Fecha": "RESUMEN", 
            "Tipo de Movimiento": "", 
            "Descripción": "", 
            "Categoría": "", 
            "Paciente Asociado": "TOTALES:", 
            "Ingresos ($)": totalCollected, 
            "Egresos ($)": totalExpenses 
        });
        formattedData.push({ 
            "Fecha": "", 
            "Tipo de Movimiento": "", 
            "Descripción": "", 
            "Categoría": "", 
            "Paciente Asociado": "UTILIDAD NETA:", 
            "Ingresos ($)": netProfit, 
            "Egresos ($)": "" 
        });

        const ws = XLSX.utils.json_to_sheet(formattedData);
        
        const colWidths = [
            { wch: 12 }, { wch: 22 }, { wch: 45 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Flujo de Caja");
        XLSX.writeFile(wb, `Reporte_Financiero_ShiningCloud_Psico_${getLocalDate()}.xlsx`);
        
        notify("📊 Reporte Excel generado con éxito");
    };

    return (
        <div className="space-y-8 animate-in fade-in h-full flex flex-col custom-scrollbar pb-10">
            
            {/* --- ENCABEZADO --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 border-b border-pastel-pink/50 shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet size={14} className="text-sage-green"/>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pagos & Finanzas</p>
                    </div>
                    <h2 className="text-4xl font-black text-soft-dark tracking-tighter">Centro Financiero</h2>
                </div>
                <button 
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-5 py-3 bg-white border border-pastel-pink hover:bg-warm-white text-soft-dark text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm"
                >
                    <FileSpreadsheet size={16}/> Exportar Excel
                </button>
            </div>

            {/* --- NAVEGACIÓN (TABS) --- */}
            <div className="flex bg-warm-white p-1.5 rounded-2xl border border-pastel-pink/60 shadow-inner shrink-0">
                {[
                    { id: 'resumen', label: 'Resumen', color: 'bg-soft-dark' },
                    { id: 'ingresos', label: 'Pagos y Caja', color: 'bg-sage-green' },
                    { id: 'deudores', label: 'Adeudos', color: 'bg-rose-400' },
                    { id: 'gastos', label: 'Gastos Operativos', color: 'bg-gray-400' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setFinanceTab(tab.id)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            financeTab === tab.id 
                            ? `${tab.color} text-white shadow-md` 
                            : 'text-gray-500 hover:text-soft-dark'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {/* --- TAB 1: RESUMEN --- */}
                {financeTab === 'resumen' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="rounded-[2rem] border border-pastel-pink/50 p-6 flex flex-col justify-between bg-white">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-sage-green/10 text-sage-green rounded-2xl"><ArrowUpRight size={20}/></div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Recaudado</span>
                                </div>
                                <h2 className="text-3xl font-black text-soft-dark tracking-tighter">${totalCollected.toLocaleString()}</h2>
                            </Card>

                            <Card className="rounded-[2rem] border border-pastel-pink/50 p-6 flex flex-col justify-between bg-white">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-red-50 text-red-400 rounded-2xl"><ArrowDownRight size={20}/></div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Egresos</span>
                                </div>
                                <h2 className="text-3xl font-black text-soft-dark tracking-tighter">${totalExpenses.toLocaleString()}</h2>
                            </Card>

                            <Card className="rounded-[2rem] border border-pastel-pink/50 p-6 flex flex-col justify-between bg-white">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Plus size={20}/></div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Deuda Pacientes</span>
                                </div>
                                <h2 className="text-3xl font-black text-soft-dark tracking-tighter">${totalDebt.toLocaleString()}</h2>
                            </Card>
                        </div>

                        <div className={`relative overflow-hidden rounded-[2.5rem] py-12 text-center shadow-sm border transition-all duration-500 ${
                            netProfit >= 0 ? 'bg-gradient-to-br from-warm-white to-water-blue/20 border-sage-green/30 text-soft-dark' : 'bg-red-50 border-red-100 text-red-500'
                        }`}>
                            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fadadd 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                            <div className="relative z-10">
                                <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-60 mb-3">Utilidad Real del Periodo</p>
                                <h2 className="text-7xl font-black tracking-tighter mb-4">${netProfit.toLocaleString()}</h2>
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${netProfit >= 0 ? 'bg-sage-green/20 text-sage-green' : 'bg-red-100 text-red-500'}`}>
                                    {netProfit >= 0 ? 'Balance Positivo' : 'Balance en Negativo'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 2: INGRESOS --- */}
                {financeTab === 'ingresos' && (
                    <div className="space-y-4 animate-in slide-in-from-bottom">
                        {incomeRecords.length === 0 ? (
                            <div className="text-center py-20 opacity-40 font-bold">No hay registros de ingresos.</div>
                        ) : (
                            incomeRecords.map(h => {
                                const paid = (h.payments || []).reduce((s,p)=>s+p.amount,0) + (h.paid && !h.payments ? h.paid : 0);
                                const pending = (h.total || 0) - paid; 
                                return (
                                    <div key={h.id} onClick={()=>onOpenAbonoModal(h, pending)} className="group flex justify-between items-center p-6 bg-white rounded-3xl border border-pastel-pink/50 hover:border-sage-green hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${pending <= 0 ? 'bg-sage-green/10 text-sage-green' : 'bg-amber-50 text-amber-600'}`}>
                                                {h.patientName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-soft-dark text-lg">{h.patientName}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{h.date} • Total: ${h.total?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-black text-lg ${pending <= 0 ? 'text-sage-green' : 'text-amber-500'}`}>
                                                {pending <= 0 ? 'PAGADO' : `PENDIENTE: $${pending.toLocaleString()}`}
                                            </p>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Click para abonar</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* --- TAB 3: DEUDORES --- */}
                {financeTab === 'deudores' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom">
                        <div className="p-8 bg-red-50 rounded-[2rem] border border-red-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-red-500 font-black text-xl tracking-tight">Pacientes con Adeudos</h3>
                                <p className="text-xs text-red-400 font-medium mt-1">Saldos de sesiones pendientes por cobrar</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] block mb-1">Total por Recuperar</span>
                                <h2 className="text-4xl font-black text-red-500 tracking-tighter">${totalDebt.toLocaleString()}</h2>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {incomeRecords.filter(h => {
                                const paid = (h.payments || []).reduce((s,p)=>s+p.amount,0) + (h.paid && !h.payments ? h.paid : 0);
                                return (h.total || 0) - paid > 0;
                            }).map(h => {
                                const paid = (h.payments || []).reduce((s,p)=>s+p.amount,0) + (h.paid && !h.payments ? h.paid : 0);
                                const pending = (h.total || 0) - paid; 
                                return (
                                    <div key={h.id} className="p-6 bg-white rounded-3xl border border-red-100 hover:shadow-sm transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-400 font-black"><User size={20}/></div>
                                            <div>
                                                <p className="font-black text-soft-dark">{h.patientName}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Atención: {h.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 w-full md:w-auto justify-between">
                                            <div className="text-right">
                                                <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest block">Saldo</span>
                                                <p className="font-black text-red-500 text-2xl tracking-tighter">${pending.toLocaleString()}</p>
                                            </div>
                                            <button 
                                                onClick={()=>{ sendWhatsApp(getPatientPhone(h.patientName), `Hola ${h.patientName}, me comunico para recordar amablemente que nuestra última sesión registra un saldo pendiente de $${pending.toLocaleString()}. ¿Deseas que te envíe los datos de transferencia?`); }} 
                                                className="flex items-center gap-2 px-6 py-3 bg-white border border-red-200 text-red-500 hover:bg-red-50 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                                            >
                                                <MessageCircle size={16}/> Recordar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- TAB 4: GASTOS --- */}
                {financeTab === 'gastos' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom">
                        <Card className="rounded-[2.5rem] border border-pastel-pink/60 p-8 bg-warm-white shadow-sm">
                            <h3 className="font-bold text-soft-dark text-xl mb-6 flex items-center gap-2">
                                <Plus className="text-sage-green"/> Registrar Nuevo Egreso
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Descripción</label>
                                    <InputField theme={themeMode} placeholder="Ej: Protocolo ADOS, Zoom, Arriendo..." value={newExpense.description} onChange={e=>setNewExpense({...newExpense, description:e.target.value})}/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Categoría</label>
                                    <select 
                                        className="w-full h-[52px] bg-white border border-pastel-pink/70 rounded-2xl px-4 text-xs font-bold text-soft-dark outline-none focus:border-sage-green transition-all"
                                        value={newExpense.category} 
                                        onChange={e=>setNewExpense({...newExpense, category:e.target.value})}
                                    >
                                        <option value="Materiales y Test">Materiales y Test</option>
                                        <option value="Supervisión Clínica">Supervisión Clínica</option>
                                        <option value="Suscripciones">Software y Suscripciones</option>
                                        <option value="Arriendo">Arriendo de Consulta</option>
                                        <option value="Marketing">Publicidad y Marketing</option>
                                        <option value="Otros">Otros Egresos</option>
                                    </select>
                                </div>
                                
                                {newExpense.category === 'Materiales y Test' && (
                                    <div className="col-span-1 md:col-span-2 p-5 bg-white border border-pastel-pink/60 rounded-3xl animate-in zoom-in-95">
                                        <label className="text-[10px] font-bold text-sage-green uppercase tracking-widest block mb-3">Vincular a Paciente (Opcional, para cálculo de rentabilidad)</label>
                                        <PatientSelect theme={themeMode} patients={patientRecords} onSelect={(p) => setNewExpense({...newExpense, patientRef: p.personal.legalName})} placeholder="Busca al paciente evaluado..." />
                                        {newExpense.patientRef && <p className="text-[10px] mt-3 font-bold text-white bg-sage-green inline-flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm">✓ Asociado a: {newExpense.patientRef}</p>}
                                    </div>
                                )}
                                
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Monto del Gasto</label>
                                    <InputField theme={themeMode} type="number" placeholder="$ 00.000" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense, amount:e.target.value})}/> 
                                </div>

                                <div className="flex items-end">
                                    <button 
                                        onClick={async()=>{ 
                                            if(newExpense.description && newExpense.amount){ 
                                                const id = Date.now().toString(); 
                                                const ex = {...newExpense, id, type: 'expense', amount: Number(newExpense.amount)};
                                                setFinancialRecords([...financialRecords, ex]); 
                                                await saveToSupabase('financials', id, ex); 
                                                setNewExpense({description:'', amount:'', category:'Materiales y Test', date: getLocalDate(), patientRef:''}); 
                                                notify("Gasto registrado con éxito"); 
                                            } 
                                        }}
                                        className="w-full h-[52px] bg-soft-dark text-white font-bold uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"
                                    >
                                        <Plus size={18}/> Guardar Egreso
                                    </button>
                                </div>
                            </div>
                        </Card>
                        
                        <div className="grid gap-3">
                            {expenseRecords.length === 0 ? (
                                <div className="text-center py-10 opacity-40 text-xs font-bold uppercase tracking-widest">No hay egresos este mes</div>
                            ) : (
                                [...expenseRecords].reverse().map(ex => (
                                    <div key={ex.id} className="flex justify-between items-center p-5 rounded-3xl bg-white border border-pastel-pink/40 hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${ex.category==='Materiales y Test' ? 'bg-sage-green/10 text-sage-green' : 'bg-warm-white text-gray-400'}`}>
                                                {ex.category==='Materiales y Test' ? <Box size={20}/> : <TrendingDown size={20}/>}
                                            </div>
                                            <div>
                                                <p className="font-bold text-soft-dark">{ex.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{ex.date} • {ex.category}</p>
                                                    {ex.patientRef && <span className="text-[9px] bg-water-blue/20 text-water-blue px-2 py-0.5 rounded-full font-bold">PAC: {ex.patientRef}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="font-black text-red-400 text-xl tracking-tighter">-${Number(ex.amount).toLocaleString()}</span>
                                            <button 
                                                onClick={async()=>{ 
                                                    const filtered = financialRecords.filter(f=>f.id!==ex.id); 
                                                    setFinancialRecords(filtered); 
                                                    await supabase.from('financials').delete().eq('id', ex.id); 
                                                    notify("Egreso Eliminado"); 
                                                }} 
                                                className="p-2.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}