import React, { useState } from 'react';

const calcPaid = (rec) => {
    if (rec.payments?.length > 0) {
        return rec.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    }
    return Number(rec.paid) || 0;
};
import * as XLSX from 'xlsx'; 
import { Wallet, FileSpreadsheet, TrendingDown, MessageCircle, Box, Plus, Trash2, ArrowUpRight, ArrowDownRight, User, Brain, Calculator, Printer, CheckCircle } from 'lucide-react';
import { Card, InputField } from './UIComponents';
import { PatientSelect } from './SystemModals';
import { getLocalDate } from '../constants'; 
import { supabase } from '../supabase';

export default function FinanceCenter({ 
    themeMode, t, financialRecords, setFinancialRecords, 
    patientRecords, saveToSupabase, notify, userRole, session, clinicOwner
}) {
    // --- ESTADOS LOCALES ---
    const [financeTab, setFinanceTab] = useState('resumen');
    
    // Gastos
    const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Materiales y Test', date: getLocalDate(), patientRef: '' });
    
    // Creador de Planes (Antes QuoteView)
    const [quoteItems, setQuoteItems] = useState([]);
    const [newQuoteItem, setNewQuoteItem] = useState({ name: '', price: '' });
    const [selectedPlanPatientId, setSelectedPlanPatientId] = useState(null);

    // --- CÁLCULOS FINANCIEROS ADAPTADOS A PSICOLOGÍA ---
    const incomeRecords = financialRecords.filter(f => !f.type || f.type === 'income');
    const expenseRecords = financialRecords.filter(f => f.type === 'expense');

    const totalCollected = incomeRecords.reduce((acc, rec) => acc + calcPaid(rec), 0);

    const totalExpenses = expenseRecords.reduce((a, b) => a + (Number(b.amount) || 0), 0);
    const netProfit = totalCollected - totalExpenses;

    const totalDebt = incomeRecords.reduce((acc, rec) => {
        const paid = calcPaid(rec);
        const total = Number(rec.total) || 0;
        const pending = total - paid;
        return pending > 0 ? acc + pending : acc;
    }, 0);

    // --- EXPORTACIÓN A EXCEL ---
    const exportToExcel = () => {
        const formattedData = financialRecords.map(record => {
            const isIncome = record.type === 'income' || !record.type;
            let incomeAmount = 0;
            let pendingAmount = 0;
            
            if (isIncome) {
                incomeAmount = calcPaid(record);
                pendingAmount = (Number(record.total) || 0) - incomeAmount;
                if(pendingAmount < 0) pendingAmount = 0;
            }
            const expenseAmount = !isIncome ? Number(record.amount) : 0;

            return {
                "Fecha": record.date || getLocalDate(),
                "Tipo de Movimiento": isIncome ? 'Ingreso (Pago Sesión)' : 'Egreso (Gasto)',
                "Descripción": record.description || record.treatment || 'Sesión de Terapia',
                "Categoría": record.category || (isIncome ? 'Atención Clínica' : 'General'),
                "Consultante Asociado": record.patientName || record.patientRef || '---',
                "Ingresos Real ($)": isIncome ? incomeAmount : 0,
                "Saldo Pendiente ($)": pendingAmount,
                "Egresos ($)": !isIncome ? expenseAmount : 0,
            };
        });

        formattedData.push({ "Fecha": "", "Tipo de Movimiento": "", "Descripción": "", "Categoría": "", "Consultante Asociado": "", "Ingresos Real ($)": "", "Saldo Pendiente ($)": "", "Egresos ($)": "" });
        formattedData.push({ 
            "Fecha": "RESUMEN", 
            "Tipo de Movimiento": "", 
            "Descripción": "", 
            "Categoría": "", 
            "Consultante Asociado": "TOTALES:", 
            "Ingresos Real ($)": totalCollected, 
            "Saldo Pendiente ($)": totalDebt,
            "Egresos ($)": totalExpenses 
        });
        formattedData.push({ 
            "Fecha": "", 
            "Tipo de Movimiento": "", 
            "Descripción": "", 
            "Categoría": "", 
            "Consultante Asociado": "UTILIDAD NETA:", 
            "Ingresos Real ($)": netProfit, 
            "Saldo Pendiente ($)": "",
            "Egresos ($)": "" 
        });

        const ws = XLSX.utils.json_to_sheet(formattedData);
        ws['!cols'] = [{ wch: 12 }, { wch: 22 }, { wch: 35 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 15 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Flujo de Caja Clínica");
        XLSX.writeFile(wb, `Reporte_Financiero_Psicologia_${getLocalDate()}.xlsx`);
        notify("📊 Reporte Excel generado con éxito");
    };

    // --- ACCIÓN DE ABONAR/PAGAR SESIÓN ---
    const handleQuickPayment = async (record, pending) => {
        const monto = window.prompt(`Registrar pago para ${record.patientName}.\nSaldo Pendiente: $${pending.toLocaleString()}\n\nIngresa el monto a abonar:`, pending);
        if (monto === null) return;
        const abono = Number(monto);
        if (isNaN(abono) || abono <= 0) { notify('Ingresa un monto válido mayor a 0'); return; }
        if (abono > pending) { notify('El monto no puede superar el saldo pendiente'); return; }

        const newPayment = { id: Date.now().toString(), amount: abono, date: getLocalDate(), method: 'Transferencia/Efectivo' };
        const updatedRecord = { ...record, payments: [...(record.payments || []), newPayment] };

        setFinancialRecords(financialRecords.map(f => f.id === record.id ? updatedRecord : f));
        await saveToSupabase('financial_records', record.id, updatedRecord);
        notify(`Pago de$${abono.toLocaleString()} registrado con éxito.`);
    };

    // Obtenemos teléfono para enviar mensajes automáticos
    const getPhoneByPatientName = (name) => {
        if (!name) return '';
        const found = Object.values(patientRecords).find(p => p.personal?.legalName === name);
        return found?.personal?.phone || '';
    };

    const sendWhatsAppLocal = (phone, text) => {
        if (!phone) return alert("El consultante no tiene teléfono registrado.");
        let cleanPhone = phone.replace(/\D/g, ''); 
        if (cleanPhone.length === 8 || cleanPhone.length === 9) cleanPhone = `56${cleanPhone}`;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="space-y-8 animate-in fade-in h-full flex flex-col custom-scrollbar pb-10 max-w-7xl mx-auto">
            
            {/* --- ENCABEZADO --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 border-b border-[#DFD2C4]/50 shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet size={14} className="text-[#5B6651]"/>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A8F84]">Control de Caja</p>
                    </div>
                    <h2 className="text-4xl font-black text-[#312923] tracking-tighter">Centro Financiero</h2>
                </div>
                <button 
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-5 py-3 bg-white border border-[#DFD2C4] hover:bg-[#FDFBF7] text-[#312923] text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                >
                    <FileSpreadsheet size={16}/> Exportar Excel
                </button>
            </div>

            {/* --- NAVEGACIÓN (TABS) --- */}
            <div className="flex bg-[#FDFBF7] p-1.5 rounded-2xl border border-[#DFD2C4]/60 shadow-sm shrink-0 overflow-x-auto hide-scrollbar">
                {[
                    { id: 'resumen', label: 'Resumen Global', color: 'bg-[#312923]' },
                    { id: 'ingresos', label: 'Cobro de Sesiones', color: 'bg-[#5B6651]' },
                    { id: 'deudores', label: 'Adeudos Pendientes', color: 'bg-[#CBAAA2]' },
                    { id: 'gastos', label: 'Gastos Operativos', color: 'bg-[#9A8F84]' },
                    { id: 'planes', label: 'Planes y Paquetes', color: 'bg-[#A3968B]' } // NUEVA PESTAÑA
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setFinanceTab(tab.id)}
                        className={`flex-1 min-w-[140px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            financeTab === tab.id 
                            ? `${tab.color} text-white shadow-md` 
                            : 'text-[#9A8F84] hover:text-[#312923] hover:bg-[#DFD2C4]/20'
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
                            <Card className="rounded-[2rem] border border-[#DFD2C4]/50 p-6 flex flex-col justify-between bg-white shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-[#5B6651]/10 text-[#5B6651] rounded-2xl"><ArrowUpRight size={20}/></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#9A8F84]">Recaudado Real</span>
                                </div>
                                <h2 className="text-4xl font-black text-[#312923] tracking-tighter">${totalCollected.toLocaleString()}</h2>
                            </Card>

                            <Card className="rounded-[2rem] border border-[#DFD2C4]/50 p-6 flex flex-col justify-between bg-white shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-red-50 text-red-400 rounded-2xl"><ArrowDownRight size={20}/></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#9A8F84]">Egresos Operativos</span>
                                </div>
                                <h2 className="text-4xl font-black text-[#312923] tracking-tighter">${totalExpenses.toLocaleString()}</h2>
                            </Card>

                            <Card className="rounded-[2rem] border border-[#DFD2C4]/50 p-6 flex flex-col justify-between bg-white shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Plus size={20}/></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#9A8F84]">Por Cobrar (Deuda)</span>
                                </div>
                                <h2 className="text-4xl font-black text-[#312923] tracking-tighter">${totalDebt.toLocaleString()}</h2>
                            </Card>
                        </div>

                        <div className={`relative overflow-hidden rounded-[2.5rem] py-16 text-center shadow-sm border transition-all duration-500 ${
                            netProfit >= 0 ? 'bg-gradient-to-br from-[#FDFBF7] to-[#DFD2C4]/20 border-[#DFD2C4] text-[#312923]' : 'bg-red-50 border-red-100 text-red-500'
                        }`}>
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #A3968B 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#DFD2C4]/50 text-[#5B6651]">
                                    <Wallet size={32} />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60 mb-3">Utilidad Neta del Periodo</p>
                                <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-4">${netProfit.toLocaleString()}</h2>
                                <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${netProfit >= 0 ? 'bg-white border-[#5B6651]/20 text-[#5B6651]' : 'bg-white border-red-200 text-red-500'}`}>
                                    {netProfit >= 0 ? 'Balance Positivo' : 'Balance en Negativo'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 2: COBROS (INGRESOS) --- */}
                {financeTab === 'ingresos' && (
                    <div className="space-y-4 animate-in slide-in-from-bottom">
                        {incomeRecords.length === 0 ? (
                            <div className="text-center py-20 flex flex-col items-center">
                                <Brain className="text-[#DFD2C4] mb-4" size={48} />
                                <p className="text-[#9A8F84] font-bold text-sm">Aún no hay cobros de sesiones registrados.</p>
                            </div>
                        ) : (
                            incomeRecords.map(h => {
                                const paid = calcPaid(h);
                                const pending = (Number(h.total) || 0) - paid;
                                
                                return (
                                    <div key={h.id} onClick={() => pending > 0 ? handleQuickPayment(h, pending) : null} className={`group flex flex-col md:flex-row justify-between md:items-center p-6 bg-white rounded-3xl border transition-all ${pending > 0 ? 'border-[#CBAAA2]/60 hover:border-[#CBAAA2] cursor-pointer hover:shadow-md' : 'border-[#DFD2C4]/40 opacity-80 cursor-default'}`}>
                                        <div className="flex items-center gap-5 mb-4 md:mb-0">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${pending <= 0 ? 'bg-[#5B6651]/10 text-[#5B6651]' : 'bg-[#CBAAA2]/10 text-[#CBAAA2]'}`}>
                                                {h.patientName ? h.patientName.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <p className="font-black text-[#312923] text-lg">{h.patientName || 'Consultante Anónimo'}</p>
                                                <p className="text-[10px] font-bold text-[#9A8F84] uppercase tracking-widest mt-1">
                                                    {h.date} • {h.description || 'Sesión Psicológica'} • Costo Total: ${(Number(h.total)||0).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right flex md:block justify-between items-end md:items-start pl-17 md:pl-0">
                                            <p className={`font-black text-2xl tracking-tighter ${pending <= 0 ? 'text-[#5B6651]' : 'text-[#CBAAA2]'}`}>
                                                {pending <= 0 ? 'PAGADO' : `FALTAN $${pending.toLocaleString()}`}
                                            </p>
                                            {pending > 0 && <span className="text-[9px] font-black text-[#9A8F84] uppercase tracking-widest bg-[#FDFBF7] px-3 py-1 rounded-full border border-[#DFD2C4]/50 md:mt-2 inline-block transition-colors group-hover:bg-[#CBAAA2] group-hover:text-white group-hover:border-[#CBAAA2]">Abonar / Pagar</span>}
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
                        <div className="p-8 bg-gradient-to-r from-[#CBAAA2]/10 to-transparent rounded-[2rem] border border-[#CBAAA2]/30 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-[#CBAAA2] font-black text-2xl tracking-tight">Adeudos Pendientes</h3>
                                <p className="text-xs text-[#9A8F84] font-bold mt-1 uppercase tracking-widest">Sesiones o Planes sin pago completo</p>
                            </div>
                            <div className="text-left md:text-right w-full md:w-auto mt-4 md:mt-0">
                                <span className="text-[10px] font-black text-[#9A8F84] uppercase tracking-[0.2em] block mb-1">Capital por Recuperar</span>
                                <h2 className="text-5xl font-black text-[#CBAAA2] tracking-tighter">${totalDebt.toLocaleString()}</h2>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {incomeRecords.filter(h => {
                                return (Number(h.total) || 0) - calcPaid(h) > 0;
                            }).map(h => {
                                const paid = calcPaid(h);
                                const pending = (Number(h.total) || 0) - paid;
                                return (
                                    <div key={h.id} className="p-6 bg-white rounded-3xl border border-[#DFD2C4]/60 hover:border-[#CBAAA2]/50 hover:shadow-sm transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <div className="w-14 h-14 rounded-full bg-[#FDFBF7] border border-[#DFD2C4]/50 flex items-center justify-center text-[#9A8F84]"><User size={24}/></div>
                                            <div>
                                                <p className="font-black text-[#312923] text-lg">{h.patientName}</p>
                                                <p className="text-[10px] text-[#9A8F84] font-bold uppercase tracking-widest mt-1">Registrado el: {h.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full md:w-auto justify-between border-t md:border-t-0 border-[#DFD2C4]/40 pt-4 md:pt-0">
                                            <div className="text-left md:text-right">
                                                <span className="text-[9px] font-black text-[#9A8F84] uppercase tracking-widest block">Deuda Activa</span>
                                                <p className="font-black text-[#CBAAA2] text-3xl tracking-tighter">${pending.toLocaleString()}</p>
                                            </div>
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button 
                                                    onClick={()=>handleQuickPayment(h, pending)} 
                                                    className="flex-1 md:flex-none flex justify-center items-center gap-2 px-5 py-3 bg-[#FDFBF7] border border-[#DFD2C4]/60 text-[#5B6651] hover:bg-[#5B6651] hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                                                >
                                                    Pagar
                                                </button>
                                                <button 
                                                    onClick={()=>{ sendWhatsAppLocal(getPhoneByPatientName(h.patientName), `Hola ${h.patientName}, me comunico para recordar amablemente que registras un saldo pendiente de honorarios de $${pending.toLocaleString()}. ¿Deseas que te envíe los datos de transferencia? Saludos cordiales.`); }} 
                                                    className="flex-1 md:flex-none flex justify-center items-center gap-2 px-5 py-3 bg-white border border-[#DFD2C4] text-[#312923] hover:bg-[#312923] hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                                                >
                                                    <MessageCircle size={16}/> Cobrar
                                                </button>
                                            </div>
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
                        <Card className="rounded-[2.5rem] border border-[#DFD2C4]/60 p-8 bg-[#FDFBF7] shadow-sm">
                            <h3 className="font-black text-[#312923] text-xl mb-6 flex items-center gap-2">
                                <Plus className="text-[#5B6651]" size={24}/> Registrar Nuevo Egreso
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#9A8F84] uppercase tracking-widest ml-2">Descripción del Gasto</label>
                                    <InputField theme={themeMode} placeholder="Ej: Test WISC-V, Zoom, Arriendo box..." value={newExpense.description} onChange={e=>setNewExpense({...newExpense, description:e.target.value})}/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#9A8F84] uppercase tracking-widest ml-2">Categoría Administrativa</label>
                                    <select 
                                        className="w-full h-[52px] bg-white border border-[#DFD2C4] rounded-2xl px-4 text-xs font-bold text-[#312923] outline-none focus:border-[#5B6651] transition-all shadow-sm"
                                        value={newExpense.category} 
                                        onChange={e=>setNewExpense({...newExpense, category:e.target.value})}
                                    >
                                        <option value="Materiales y Test">Materiales, Test y Baterías</option>
                                        <option value="Supervisión Clínica">Supervisión Clínica / Terapia prop.</option>
                                        <option value="Suscripciones">Software y Suscripciones (Zoom, etc)</option>
                                        <option value="Arriendo">Arriendo de Consulta</option>
                                        <option value="Marketing">Publicidad y Marketing</option>
                                        <option value="Otros">Otros Egresos</option>
                                    </select>
                                </div>
                                
                                {newExpense.category === 'Materiales y Test' && (
                                    <div className="col-span-1 md:col-span-2 p-6 bg-white border border-[#DFD2C4]/60 rounded-3xl animate-in zoom-in-95 shadow-sm">
                                        <label className="text-[10px] font-black text-[#5B6651] uppercase tracking-widest block mb-3">Asociar gasto a un Consultante (Para cálculo de rentabilidad real)</label>
                                        <PatientSelect theme={themeMode} patients={patientRecords} onSelect={(p) => setNewExpense({...newExpense, patientRef: p.personal?.legalName || p.name})} placeholder="Busca al paciente evaluado..." />
                                        {newExpense.patientRef && <p className="text-[10px] mt-4 font-black text-white bg-[#5B6651] inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-sm">✓ Gasto asociado a: {newExpense.patientRef}</p>}
                                    </div>
                                )}
                                
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#9A8F84] uppercase tracking-widest ml-2">Monto del Egreso</label>
                                    <InputField theme={themeMode} type="number" placeholder="$ 0" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense, amount:e.target.value})}/> 
                                </div>

                                <div className="flex items-end">
                                    <button 
                                        onClick={async()=>{ 
                                            if(newExpense.description && newExpense.amount){ 
                                                const id = Date.now().toString(); 
                                                const ex = {...newExpense, id, type: 'expense', amount: Number(newExpense.amount)};
                                                setFinancialRecords([...financialRecords, ex]); 
                                                await saveToSupabase('financial_records', id, ex); 
                                                setNewExpense({description:'', amount:'', category:'Materiales y Test', date: getLocalDate(), patientRef:''}); 
                                                notify("Egreso registrado correctamente"); 
                                            } else {
                                                alert("Por favor completa la descripción y el monto.");
                                            }
                                        }}
                                        className="w-full h-[52px] bg-[#312923] text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5"
                                    >
                                        <Plus size={18}/> Aplicar Egreso
                                    </button>
                                </div>
                            </div>
                        </Card>
                        
                        <div className="grid gap-3">
                            {expenseRecords.length === 0 ? (
                                <div className="text-center py-10 opacity-40 text-[10px] font-black uppercase tracking-widest text-[#9A8F84]">No hay egresos registrados este mes</div>
                            ) : (
                                [...expenseRecords].reverse().map(ex => (
                                    <div key={ex.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 rounded-3xl bg-white border border-[#DFD2C4]/40 hover:border-[#DFD2C4] hover:shadow-sm transition-all group gap-4">
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <div className={`p-4 rounded-2xl ${ex.category==='Materiales y Test' ? 'bg-[#5B6651]/10 text-[#5B6651]' : 'bg-[#FDFBF7] border border-[#DFD2C4]/50 text-[#9A8F84]'}`}>
                                                {ex.category==='Materiales y Test' ? <Box size={20}/> : <TrendingDown size={20}/>}
                                            </div>
                                            <div>
                                                <p className="font-black text-[#312923] text-lg">{ex.description}</p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <p className="text-[10px] font-bold text-[#9A8F84] uppercase tracking-widest">{ex.date} • {ex.category}</p>
                                                    {ex.patientRef && <span className="text-[9px] bg-[#5B6651]/10 border border-[#5B6651]/20 text-[#5B6651] px-2 py-0.5 rounded-full font-black">PAC: {ex.patientRef}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6 border-t md:border-t-0 border-[#DFD2C4]/30 pt-3 md:pt-0">
                                            <span className="font-black text-red-400 text-2xl tracking-tighter">-${Number(ex.amount).toLocaleString()}</span>
                                            <button 
                                                onClick={async()=>{ 
                                                    if(!window.confirm("¿Estás seguro de eliminar este registro de egreso?")) return;
                                                    const filtered = financialRecords.filter(f=>f.id!==ex.id); 
                                                    setFinancialRecords(filtered); 
                                                    await supabase.from('financial_records').delete().eq('id', ex.id); 
                                                    notify("Registro de Egreso Eliminado"); 
                                                }} 
                                                className="p-3 rounded-xl text-[#9A8F84] hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all md:opacity-0 md:group-hover:opacity-100"
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

                {/* --- TAB 5: PLANES Y PAQUETES (EL NUEVO COTIZADOR DE PSICOLOGÍA) --- */}
                {financeTab === 'planes' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in slide-in-from-bottom">
                        <Card className="lg:col-span-7 space-y-6 rounded-[2.5rem] border border-[#DFD2C4]/60 bg-white p-8 shadow-sm">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#5B6651] ml-2 mb-2 block">1. Seleccionar Consultante</label>
                                <PatientSelect theme={themeMode} patients={patientRecords} placeholder="Buscar Consultante..." onSelect={(p) => {
                                    setSelectedPlanPatientId(p.id);
                                }} />
                            </div>
                            
                            {selectedPlanPatientId && (
                                <div className="animate-in fade-in space-y-5 pt-6 border-t border-[#DFD2C4]/40">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#5B6651] ml-2 block">2. Agregar Servicios al Plan</label>
                                    
                                    <div className="relative">
                                        <input 
                                            list="servicios-psico"
                                            className="w-full outline-none font-bold text-sm p-4 rounded-2xl border border-[#DFD2C4] bg-[#FDFBF7] text-[#312923] focus:border-[#5B6651] transition-all shadow-sm"
                                            placeholder="Ej: Evaluación WISC-V, Pack 4 Sesiones Mensuales..."
                                            value={newQuoteItem.name}
                                            onChange={e => setNewQuoteItem({...newQuoteItem, name: e.target.value})}
                                        />
                                        <datalist id="servicios-psico">
                                            <option value="Proceso de Psicodiagnóstico Clínico (Completo)" />
                                            <option value="Aplicación Test WISC-V + Informe" />
                                            <option value="Aplicación Test ADOS-2" />
                                            <option value="Pack 4 Sesiones Mensuales (Individual)" />
                                        </datalist>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#A3968B]">$</span>
                                            <input 
                                                type="number" 
                                                className="w-full outline-none font-black text-lg pl-8 p-3.5 rounded-2xl border border-[#DFD2C4] bg-[#FDFBF7] text-[#5B6651] focus:border-[#5B6651] transition-all shadow-inner" 
                                                placeholder="Valor del servicio" 
                                                value={newQuoteItem.price} 
                                                onChange={e=>setNewQuoteItem({...newQuoteItem, price:e.target.value})}
                                            />
                                        </div>
                                        <button 
                                            onClick={()=>{
                                                if(newQuoteItem.name && newQuoteItem.price) {
                                                    setQuoteItems([...quoteItems, { id: Date.now(), name: newQuoteItem.name, price: Number(newQuoteItem.price) }]);
                                                    setNewQuoteItem({name:'', price:''});
                                                }
                                            }}
                                            className="px-8 py-3.5 bg-[#312923] text-white rounded-2xl hover:bg-[#1a1512] hover:-translate-y-0.5 transition-all flex items-center justify-center shadow-lg shadow-[#312923]/20"
                                        >
                                            <Plus size={20}/>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Card>

                        <div className="lg:col-span-5 space-y-6">
                            <Card className="rounded-[2.5rem] border border-[#DFD2C4]/60 bg-[#FDFBF7] p-8 shadow-sm flex flex-col h-full min-h-[400px]">
                                <h3 className="font-black text-xl text-[#312923] mb-6 border-b border-[#DFD2C4]/50 pb-4 flex items-center gap-2">
                                    <Calculator className="text-[#A3968B]"/> Plan de Honorarios
                                </h3>
                                
                                <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 mb-6">
                                    {quoteItems.length === 0 ? (
                                        <div className="text-center py-10 opacity-60">
                                            <p className="text-xs font-bold text-[#9A8F84] uppercase tracking-widest">No hay servicios agregados al plan.</p>
                                        </div>
                                    ) : (
                                        quoteItems.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#DFD2C4]/60 shadow-sm group hover:border-[#A3968B] transition-colors">
                                                <span className="font-bold text-sm text-[#312923]">{item.name}</span>
                                                <div className="flex items-center gap-3 border-l border-[#DFD2C4]/40 pl-3">
                                                    <span className="font-black text-[#5B6651] whitespace-nowrap">${item.price.toLocaleString()}</span>
                                                    <button onClick={()=>setQuoteItems(quoteItems.filter(i=>i.id !== item.id))} className="p-1.5 rounded-lg text-[#DFD2C4] hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="pt-6 border-t border-[#DFD2C4]/60 mt-auto">
                                    <div className="flex justify-between items-end mb-6">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#9A8F84]">Inversión Total</span>
                                        <h3 className="text-4xl font-black text-[#312923] tracking-tighter">${quoteItems.reduce((acc, item) => acc + item.price, 0).toLocaleString()}</h3>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            disabled={quoteItems.length===0} 
                                            onClick={async ()=>{ 
                                                const total = quoteItems.reduce((acc, item) => acc + item.price, 0);
                                                const id = Date.now().toString(); 
                                                const detalle = quoteItems.map(i => i.name).join(' + ');
                                                
                                                const pat = patientRecords[selectedPlanPatientId];
                                                const patName = pat?.personal?.legalName || pat?.name || 'Consultante';
                                                
                                                const newRecord = {
                                                    id, total: total, paid: 0, payments: [], patientName: patName, 
                                                    date: getLocalDate(), type: 'income', description: detalle,
                                                    patientId: selectedPlanPatientId
                                                };
                                                setFinancialRecords([...financialRecords, newRecord]);
                                                await saveToSupabase('financial_records', id, newRecord); 
                                                
                                                notify("Propuesta guardada. Ya aparece en tus adeudos."); 
                                                setQuoteItems([]);
                                                setSelectedPlanPatientId(null);
                                                setFinanceTab('deudores'); // Te lleva a ver la deuda
                                            }}
                                            className={`py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                                quoteItems.length === 0 
                                                ? 'bg-[#DFD2C4]/30 text-[#9A8F84] cursor-not-allowed' 
                                                : 'bg-[#5B6651] text-white hover:bg-[#4a5442] shadow-lg shadow-[#5B6651]/20 hover:-translate-y-0.5'
                                            }`}
                                        >
                                            <CheckCircle size={18}/> Aprobar Plan (Cargar a Deuda)
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}