import React, { useState } from 'react';
import { X, Download, Upload, CheckCircle2 } from 'lucide-react';

export default function ImportPatientsModal({ onClose, onImport, notify }) {
    const [preview, setPreview] = useState([]);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);

    const downloadTemplate = () => {
        const csv = 'nombre,rut,telefono,email,fecha_nacimiento,motivo_consulta\nMaría González,12345678-9,+56912345678,maria@ejemplo.cl,1990-05-15,Ansiedad\nJuan Pérez,98765432-1,+56987654321,juan@ejemplo.cl,1985-08-22,Terapia de pareja';
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_pacientes.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const parseCSV = (text) => {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        return lines.slice(1).filter(l => l.trim()).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((h, i) => { obj[h] = values[i] || ''; });
            return obj;
        });
    };

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                setPreview(parseCSV(event.target.result));
            } catch {
                notify('Error leyendo el archivo CSV');
            }
        };
        reader.readAsText(f);
    };

    const handleImport = async () => {
        setImporting(true);
        const patients = preview.map(row => ({
            personal: {
                legalName: row.nombre || '',
                rut: row.rut || '',
                phone: row.telefono || '',
                email: row.email || '',
                birthDate: row.fecha_nacimiento || ''
            },
            anamnesis: { motive: row.motivo_consulta || '', history: '', family: '' },
            clinical: { evolution: [], familyMap: {}, mentalExam: {} },
            consents: [],
            images: []
        }));
        const success = await onImport(patients);
        setImporting(false);
        setResult({ count: success, total: patients.length });
    };

    return (
        <div className="fixed inset-0 z-50 bg-soft-dark/40 flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-soft-dark">Importar Pacientes</h2>
                        <p className="text-sm text-gray-400 mt-1">Sube un archivo CSV con tus pacientes</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-soft-dark transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {!result && (
                    <>
                        <button
                            onClick={downloadTemplate}
                            className="w-full mb-4 flex items-center justify-center gap-2 py-3 border border-pastel-pink rounded-2xl text-sage-green font-bold hover:bg-warm-white transition-all"
                        >
                            <Download size={16} /> Descargar plantilla CSV
                        </button>

                        <label className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-pastel-pink rounded-2xl mb-4 cursor-pointer hover:bg-warm-white transition-all text-gray-400">
                            <Upload size={24} />
                            <span className="text-sm font-bold">Seleccionar archivo .csv</span>
                            <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
                        </label>

                        {preview.length > 0 && (
                            <div className="mb-4">
                                <p className="text-sm font-bold text-soft-dark mb-2">
                                    Vista previa ({preview.length} pacientes detectados):
                                </p>
                                <div className="bg-warm-white rounded-2xl p-4 max-h-60 overflow-y-auto custom-scrollbar">
                                    {preview.slice(0, 5).map((p, i) => (
                                        <div key={i} className="text-sm border-b border-pastel-pink/30 py-2 last:border-0">
                                            <strong>{p.nombre}</strong>
                                            {p.rut && ` · RUT: ${p.rut}`}
                                            {p.telefono && ` · ${p.telefono}`}
                                        </div>
                                    ))}
                                    {preview.length > 5 && (
                                        <p className="text-xs text-gray-400 mt-2">...y {preview.length - 5} más</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {preview.length > 0 && (
                            <button
                                onClick={handleImport}
                                disabled={importing}
                                className="w-full py-4 bg-sage-green text-white font-bold rounded-2xl hover:bg-opacity-90 disabled:opacity-50 transition-all"
                            >
                                {importing ? 'Importando...' : `Importar ${preview.length} pacientes`}
                            </button>
                        )}
                    </>
                )}

                {result && (
                    <div className="text-center py-8">
                        <CheckCircle2 size={64} className="text-sage-green mx-auto mb-4" />
                        <h3 className="text-xl font-black text-soft-dark mb-2">¡Importación completada!</h3>
                        <p className="text-gray-500">
                            Se importaron {result.count} de {result.total} pacientes
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-6 px-8 py-3 bg-sage-green text-white font-bold rounded-2xl hover:bg-opacity-90 transition-all"
                        >
                            Cerrar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
