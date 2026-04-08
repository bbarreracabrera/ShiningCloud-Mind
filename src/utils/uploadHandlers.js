import { supabase } from '../supabase';

// 1. FUNCIÓN PARA SUBIR EL LOGO DEL CENTRO PSICOLÓGICO
export const uploadLogo = async (e, context) => {
    const { setUploading, notify, clinicOwner, session, config, setConfigLocal, saveToSupabase } = context;
    const file = e.target.files[0]; 
    if (!file) return; 
    
    setUploading(true);
    if(typeof notify === 'function') notify("Subiendo logo de ShiningCloud...");
    
    try {
        const fileName = `logo_${clinicOwner || session?.user?.email}_file`;
        const { error: uploadError } = await supabase.storage.from('psychology-logos').upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('psychology-logos').getPublicUrl(fileName);
        const newConfig = { ...config, logo: publicUrl }; 
        setConfigLocal(newConfig); 
        await saveToSupabase('settings', 'general', newConfig); 
        
        if(typeof notify === 'function') notify("Logo Actualizado con éxito"); 
    } catch (err) {
        console.error(err);
        alert("Error subiendo el logo. Verifica los permisos del bucket en Supabase.");
    } finally {
        setUploading(false);
    }
};

// 2. FUNCIÓN PARA SUBIR ARCHIVOS DE CONSULTANTES (AQUÍ ESTÁ LA QUE BUSCA VITE)
export const uploadPatientImage = async (file, context) => {
    const { selectedPatientId, setUploading, getPatient, activeFolder, savePatientData, notify, logAction } = context;
    
    if (!file || !selectedPatientId) {
        console.error("No se detectó el archivo o el consultante", { file, selectedPatientId });
        return; 
    }
    
    setUploading(true);
    if(typeof notify === 'function') notify("Subiendo archivo confidencial..."); 
    
    try {
        const fileName = `${selectedPatientId}_${Date.now()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('psychology-files').upload(fileName, file);
        if (uploadError) throw uploadError;
        
        const p = getPatient(selectedPatientId);
        const updatedImages = [...(p.images || []), { 
            id: Date.now(), 
            path: fileName, 
            url: fileName, 
            date: new Date().toLocaleDateString('es-CL'),
            folder: activeFolder 
        }];
        
        await savePatientData(selectedPatientId, { ...p, images: updatedImages });
        if(typeof notify === 'function') notify(`Archivo guardado exitosamente en ${activeFolder}`);
        if(typeof logAction === 'function') logAction('UPLOAD_FILE', { fileName, folder: activeFolder }, selectedPatientId); 
    } catch (err) { 
        alert(`Error al subir archivo: ${err.message}`); 
    } finally { 
        setUploading(false); 
    }
};