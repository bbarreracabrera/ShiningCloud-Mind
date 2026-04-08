import React from 'react';
import { Brain, Save, Eye, MessageSquare, Activity, Compass } from 'lucide-react';
import { InputField, Button } from './UIComponents';

export default function MentalExamTab({ 
    getPatient, selectedPatientId, savePatientData, notify 
}) {
    const patient = getPatient(selectedPatientId);
    const exam = patient.clinical?.mentalExam || {};

    const handleChange = (field, value) => {
        savePatientData(selectedPatientId, {
            ...patient,
            clinical: {
                ...patient.clinical,
                mentalExam: { ...exam, [field]: value }
            }
        });
    };

    const handleSave = () => {
        if(typeof notify === 'function') notify("Examen Mental actualizado correctamente");
    };

    return (
        <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto pb-10">
            <div className="border-b border-[#DFD2C4]/50 pb-4 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-[#312923] tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-[#CBAAA2]/10 text-[#CBAAA2] rounded-xl"><Brain size={22} /></div>
                        Examen Mental
                    </h2>
                    <p className="text-[10px] font-bold text-[#9A8F84] uppercase tracking-widest mt-2 ml-1">Evaluación psicológica transversal</p>
                </div>
                <Button variant="primary" onClick={handleSave} className="bg-[#5B6651] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:-translate-y-0.5 transition-all">
                    <Save size={14}/> Guardar Cambios
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 bg-[#FDFBF7] p-6 rounded-[2rem] border border-[#DFD2C4]/50">
                    <h3 className="text-[10px] font-black uppercase text-[#5B6651] flex items-center gap-2 mb-4"><Eye size={14}/> Apariencia y Actitud</h3>
                    <InputField textarea label="Descripción Física y Autocuidado" value={exam.apariencia || ''} onChange={e => handleChange('apariencia', e.target.value)} placeholder="Vestimenta, higiene, biotipo..." />
                    <InputField textarea label="Actitud hacia el entrevistador" value={exam.actitud || ''} onChange={e => handleChange('actitud', e.target.value)} placeholder="Colaborador, suspicaz, hostil, seductor..." />
                    <InputField textarea label="Psicomotricidad" value={exam.psicomotricidad || ''} onChange={e => handleChange('psicomotricidad', e.target.value)} placeholder="Tranquilo, inquieto, lentificado, tics..." />
                </div>

                <div className="space-y-4 bg-[#FDFBF7] p-6 rounded-[2rem] border border-[#DFD2C4]/50">
                    <h3 className="text-[10px] font-black uppercase text-[#5B6651] flex items-center gap-2 mb-4"><Compass size={14}/> Conciencia y Orientación</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Nivel de Conciencia" value={exam.conciencia || ''} onChange={e => handleChange('conciencia', e.target.value)} placeholder="Lúcido, obnubilado..." />
                        <InputField label="Orientación (T-E-P)" value={exam.orientacion || ''} onChange={e => handleChange('orientacion', e.target.value)} placeholder="Auto y alopsíquica" />
                    </div>
                    <InputField textarea label="Atención y Memoria" value={exam.cognicion || ''} onChange={e => handleChange('cognicion', e.target.value)} placeholder="Fijación, conservación, evocación..." />
                </div>

                <div className="space-y-4 bg-[#FDFBF7] p-6 rounded-[2rem] border border-[#DFD2C4]/50">
                    <h3 className="text-[10px] font-black uppercase text-[#5B6651] flex items-center gap-2 mb-4"><MessageSquare size={14}/> Pensamiento y Lenguaje</h3>
                    <InputField textarea label="Curso y Velocidad del Pensamiento" value={exam.cursoPensamiento || ''} onChange={e => handleChange('cursoPensamiento', e.target.value)} placeholder="Bradipsiquia, taquipsiquia, fuga de ideas..." />
                    <InputField textarea label="Contenido del Pensamiento" value={exam.contenidoPensamiento || ''} onChange={e => handleChange('contenidoPensamiento', e.target.value)} placeholder="Ideación suicida, delirios, obsesiones..." />
                    <InputField textarea label="Lenguaje" value={exam.lenguaje || ''} onChange={e => handleChange('lenguaje', e.target.value)} placeholder="Tono, volumen, disartria, neologismos..." />
                </div>

                <div className="space-y-4 bg-[#FDFBF7] p-6 rounded-[2rem] border border-[#DFD2C4]/50">
                    <h3 className="text-[10px] font-black uppercase text-[#5B6651] flex items-center gap-2 mb-4"><Activity size={14}/> Afectividad y Sensopercepción</h3>
                    <InputField textarea label="Ánimo y Afecto" value={exam.afecto || ''} onChange={e => handleChange('afecto', e.target.value)} placeholder="Eutímico, deprimido, expansivo, aplanado..." />
                    <InputField textarea label="Sensopercepción" value={exam.sensopercepcion || ''} onChange={e => handleChange('sensopercepcion', e.target.value)} placeholder="Sin alteraciones, alucinaciones (auditivas, visuales)..." />
                    <InputField textarea label="Juicio y Autocrítica (Insight)" value={exam.juicio || ''} onChange={e => handleChange('juicio', e.target.value)} placeholder="Conservado, desviado, nula conciencia de enfermedad..." />
                </div>
            </div>
        </div>
    );
}