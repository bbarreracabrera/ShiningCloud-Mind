import React, { useState } from 'react';
import { Network, Users, Plus, Trash2, Save } from 'lucide-react';
import { InputField, Button } from './UIComponents';

export default function FamilyMapTab({ 
    getPatient, selectedPatientId, savePatientData, notify 
}) {
    const patient = getPatient(selectedPatientId);
    const familyData = patient.clinical?.familyMap || { members: [], dynamics: '' };
    
    const [newMember, setNewMember] = useState({ name: '', relation: '', age: '', notes: '' });

    const handleDynamicsChange = (val) => {
        savePatientData(selectedPatientId, {
            ...patient, clinical: { ...patient.clinical, familyMap: { ...familyData, dynamics: val } }
        });
    };

    const addMember = () => {
        if (!newMember.name || !newMember.relation) return;
        const updatedMembers = [...(familyData.members || []), { ...newMember, id: Date.now() }];
        savePatientData(selectedPatientId, {
            ...patient, clinical: { ...patient.clinical, familyMap: { ...familyData, members: updatedMembers } }
        });
        setNewMember({ name: '', relation: '', age: '', notes: '' });
    };

    const removeMember = (id) => {
        const updatedMembers = familyData.members.filter(m => m.id !== id);
        savePatientData(selectedPatientId, {
            ...patient, clinical: { ...patient.clinical, familyMap: { ...familyData, members: updatedMembers } }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto pb-10">
            <div className="border-b border-[#DFD2C4]/50 pb-4">
                <h2 className="text-2xl font-black text-[#312923] tracking-tight flex items-center gap-3">
                    <div className="p-2.5 bg-[#5B6651]/10 text-[#5B6651] rounded-xl"><Network size={22} /></div>
                    Estructura Familiar
                </h2>
                <p className="text-[10px] font-bold text-[#9A8F84] uppercase tracking-widest mt-2 ml-1">Genograma y Dinámicas</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel de Miembros */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-[#DFD2C4]/50 rounded-[2rem] p-6 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase text-[#5B6651] flex items-center gap-2 mb-4"><Users size={14}/> Composición Familiar</h3>
                        
                        {/* Lista de Miembros */}
                        <div className="space-y-3 mb-6">
                            {(familyData.members || []).length === 0 ? (
                                <p className="text-xs text-[#9A8F84] text-center py-4 bg-[#FDFBF7] rounded-xl border border-dashed border-[#DFD2C4]">No hay familiares registrados.</p>
                            ) : (
                                familyData.members.map(m => (
                                    <div key={m.id} className="flex items-center justify-between p-4 bg-[#FDFBF7] border border-[#DFD2C4]/60 rounded-2xl hover:border-[#CBAAA2] transition-colors group">
                                        <div>
                                            <p className="font-black text-sm text-[#312923]">{m.name} <span className="text-[#9A8F84] font-medium text-xs">({m.age} años)</span></p>
                                            <p className="text-[10px] font-bold text-[#5B6651] uppercase tracking-widest mt-0.5">{m.relation}</p>
                                            {m.notes && <p className="text-xs text-[#6B615A] mt-1">{m.notes}</p>}
                                        </div>
                                        <button onClick={() => removeMember(m.id)} className="p-2 text-[#9A8F84] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Agregar Miembro */}
                        <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#DFD2C4]/50 space-y-3">
                            <h4 className="text-[10px] font-bold uppercase text-[#9A8F84]">Agregar Familiar</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <input className="p-3 rounded-xl border border-[#DFD2C4] text-xs font-bold outline-none focus:border-[#5B6651]" placeholder="Nombre" value={newMember.name} onChange={e=>setNewMember({...newMember, name: e.target.value})} />
                                <input className="p-3 rounded-xl border border-[#DFD2C4] text-xs font-bold outline-none focus:border-[#5B6651]" placeholder="Parentesco (ej. Madre)" value={newMember.relation} onChange={e=>setNewMember({...newMember, relation: e.target.value})} />
                                <input className="p-3 rounded-xl border border-[#DFD2C4] text-xs font-bold outline-none focus:border-[#5B6651]" placeholder="Edad" value={newMember.age} onChange={e=>setNewMember({...newMember, age: e.target.value})} />
                                <input className="p-3 rounded-xl border border-[#DFD2C4] text-xs font-bold outline-none focus:border-[#5B6651]" placeholder="Ocupación / Notas" value={newMember.notes} onChange={e=>setNewMember({...newMember, notes: e.target.value})} />
                            </div>
                            <Button variant="secondary" onClick={addMember} className="w-full text-[10px] py-3 mt-2"><Plus size={14} className="mr-1"/> Añadir a la red</Button>
                        </div>
                    </div>
                </div>

                {/* Panel de Dinámicas */}
                <div className="space-y-6">
                    <div className="bg-[#FDFBF7] border border-[#DFD2C4]/50 rounded-[2rem] p-6 shadow-sm h-full flex flex-col">
                        <h3 className="text-[10px] font-black uppercase text-[#5B6651] flex items-center gap-2 mb-4">Dinámica y Relaciones</h3>
                        <textarea 
                            className="w-full flex-1 min-h-[250px] bg-white border border-[#DFD2C4] rounded-2xl p-4 text-sm font-medium text-[#312923] outline-none focus:border-[#5B6651] resize-none" 
                            placeholder="Describa patrones de interacción, alianzas, conflictos, límites familiares..."
                            value={familyData.dynamics || ''}
                            onChange={(e) => handleDynamicsChange(e.target.value)}
                        />
                        <div className="mt-4 p-4 bg-white/50 border border-dashed border-[#DFD2C4] rounded-xl text-center">
                            <p className="text-[10px] font-bold text-[#9A8F84]">💡 Para diagramas visuales (Genogramas dibujados), captura una foto y súbela en la pestaña "Archivos".</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}