import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export const generatePDF = (type, data = null, context = {}) => {
    if ((!context || !context.config) && type !== 'receipt') {
        console.error('generatePDF: contexto inválido', context);
        return;
    }

    // Desestructuración segura con valores por defecto para evitar errores de "undefined"
    const {
        themeMode,
        config = {},
        selectedPatientId,
        getPatient,
        sessionData,
        patientRecords,
        prescription,
        notify,
        logAction
    } = context;

    const patient = getPatient ? getPatient(selectedPatientId) : null;

    if (!patient && type !== 'rx' && type !== 'report' && type !== 'receipt') {
        console.error('generatePDF: paciente no encontrado para tipo', type);
        return;
    }

    try {
        const doc = new jsPDF();
        
        // --- PALETA DE COLORES BOUTIQUE (RGB) ---
        const ESPRESSO = [49, 41, 35];     // Texto principal y Headers
        const OLIVE = [91, 102, 81];       // Acentos y Totales
        const TAUPE = [163, 150, 139];     // Textos secundarios
        const LIGHT_TAUPE = [223, 210, 196]; // Bordes
        const VANILLA = [253, 251, 247];   // Fondos

        // 1. BARRA SUPERIOR
        doc.setFillColor(...ESPRESSO); 
        doc.rect(0, 0, 210, 4, 'F'); 

        // 2. LOGO (Con manejo de errores para evitar bloqueos)
        if (config.logo) {
            try { 
                doc.addImage(config.logo, 'PNG', 15, 12, 25, 25, '', 'FAST'); 
            } catch (e) { 
                console.warn("Logo incompatible o no disponible"); 
            }
        }

        // 3. INFORMACIÓN DEL CENTRO (Header derecho)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...ESPRESSO);
        doc.text(config.name?.toUpperCase() || "SHININGCLOUD | MIND", 195, 18, { align: 'right' });
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...TAUPE);
        doc.text(`RUT: ${config.rut || 'No registrado'}`, 195, 23, { align: 'right'});
        doc.text(`Registro SIS: ${config.rnpi || 'No registrado'}`, 195, 27, { align: 'right' });
        doc.text(`${config.address || 'Dirección no registrada'}`, 195, 31, { align: 'right' });

        // Línea divisoria
        doc.setDrawColor(...LIGHT_TAUPE);
        doc.setLineWidth(0.5);
        doc.line(15, 42, 195, 42);

        // 4. DATOS DEL CONSULTANTE
        const pData = (type === 'consent') ? getPatient(selectedPatientId) : (data || (sessionData?.patientId ? patientRecords[sessionData.patientId] : null));
        const pName = pData?.personal?.legalName || (sessionData?.patientName || 'Consultante No Registrado');
        const pRut = pData?.personal?.rut || pData?.personal?.documentId || '---';
        const pAge = pData?.personal?.age ? `${pData.personal.age} años` : '---';
        const currentDate = new Date().toLocaleDateString('es-CL');

        // 5. CAJA DE DATOS DEL CONSULTANTE
        doc.setFillColor(...VANILLA);
        doc.setDrawColor(...LIGHT_TAUPE);
        doc.roundedRect(15, 47, 180, 20, 2, 2, 'FD'); 

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...TAUPE);
        doc.text("CONSULTANTE", 20, 54);
        doc.text("RUT", 110, 54);
        doc.text("EDAD", 145, 54);
        doc.text("FECHA", 168, 54);

        doc.setFontSize(11);
        doc.setTextColor(...ESPRESSO);
        doc.text(pName.toUpperCase(), 20, 61);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(pRut, 110, 61);
        doc.text(pAge, 145, 61);
        doc.text(currentDate, 168, 61);

        // ==========================================
        // 6. CONTENIDO SEGÚN TIPO DE DOCUMENTO
        // ==========================================
        
        if (type === 'rx') {
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("INDICACIONES TERAPÉUTICAS", 15, 85);
            doc.setFontSize(20);
            doc.setTextColor(...OLIVE);
            doc.text("Ψ", 15, 98); 

            autoTable(doc, {
                startY: 105,
                head: [['INDICACIÓN / SUGERENCIA', 'DETALLES']],
                body: prescription.map(p => [p.name.toUpperCase(), p.dosage]),
                theme: 'plain',
                styles: { fontSize: 10, cellPadding: 6 },
                headStyles: { fontStyle: 'bold', textColor: ESPRESSO },
                columnStyles: { 0: { fontStyle: 'bold', width: 85 } }
            });

            // Firma del Profesional
            const finalY = doc.lastAutoTable.finalY + 40;
            doc.line(130, finalY, 185, finalY);
            doc.setFontSize(8);
            doc.text("FIRMA DEL PROFESIONAL", 157.5, finalY + 5, { align: 'center' });
        } 
        
        else if (type === 'consent' && data) { 
            doc.setFontSize(16); 
            doc.setFont("helvetica", "bold");
            doc.text(data.type.replace(/_/g, ' ').toUpperCase(), 105, 85, { align: 'center' }); 
            
            doc.setFontSize(10); 
            doc.setFont("helvetica", "normal");
            const splitText = doc.splitTextToSize(data.text || '', 170);
            doc.text(splitText, 20, 100, { align: 'justify', maxWidth: 170 }); 
            
            // --- INTEGRACIÓN DE FIRMA DIGITAL ---
            if (data.signatureData) { 
                try { 
                    doc.addImage(data.signatureData, 'PNG', 80, 220, 50, 30); 
                } catch(e) { 
                    console.warn("Error insertando firma en PDF"); 
                } 
                
                doc.setDrawColor(...TAUPE);
                doc.line(75, 255, 135, 255);
                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                doc.text("Firma del Consultante", 105, 260, { align: 'center' });
            } 
        }

        else if (type === 'report' && data) {
            // Título del informe
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...ESPRESSO);
            doc.text((data.type || 'INFORME CLÍNICO').toUpperCase(), 105, 78, { align: 'center' });

            // Fecha de emisión
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...TAUPE);
            doc.text(`Fecha de emisión: ${data.date || currentDate}`, 105, 86, { align: 'center' });

            // Separador fino
            doc.setDrawColor(...LIGHT_TAUPE);
            doc.setLineWidth(0.3);
            doc.line(15, 92, 195, 92);

            // Cuerpo del informe — paginación automática
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...ESPRESSO);
            const lines = doc.splitTextToSize(data.content || '', 170);
            const lineHeight = 6;
            const pageMaxY = 275;
            let currentY = 102;
            let pageNum = 1;

            for (const line of lines) {
                if (currentY > pageMaxY) {
                    doc.addPage();
                    pageNum++;
                    currentY = 30;
                    // Mini encabezado en páginas adicionales
                    doc.setFontSize(8);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(...TAUPE);
                    doc.text(`${(data.type || 'INFORME CLÍNICO').toUpperCase()} — Pág. ${pageNum}`, 195, 15, { align: 'right' });
                    doc.setDrawColor(...LIGHT_TAUPE);
                    doc.setLineWidth(0.3);
                    doc.line(15, 18, 195, 18);
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(...ESPRESSO);
                }
                doc.text(line, 20, currentY);
                currentY += lineHeight;
            }

            // Firma del profesional — posición dinámica
            const maxYBeforeNewPage = 240;
            if (currentY > maxYBeforeNewPage) {
                doc.addPage();
                currentY = 40;
            }
            const sigY = Math.max(currentY + 30, 248);
            doc.setDrawColor(...TAUPE);
            doc.line(120, sigY, 190, sigY);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...TAUPE);
            doc.text("Firma y Timbre del Profesional", 155, sigY + 5, { align: 'center' });
            if (config.name) {
                doc.setFont("helvetica", "normal");
                doc.text(config.name, 155, sigY + 10, { align: 'center' });
            }
            if (config.rut) doc.text(`RUT: ${config.rut}`, 155, sigY + 14, { align: 'center' });
        }

        else if (type === 'receipt' && data) {
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...ESPRESSO);
            doc.text("RECIBO DE PAGO", 105, 80, { align: 'center' });

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...TAUPE);
            doc.text(`N° ${data.id || 'S/N'}`, 105, 88, { align: 'center' });
            doc.text(`Fecha: ${data.date || currentDate}`, 105, 94, { align: 'center' });

            doc.setDrawColor(...LIGHT_TAUPE);
            doc.line(15, 100, 195, 100);

            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("RECIBÍ DE:", 20, 115);
            doc.setFont("helvetica", "normal");
            doc.text(data.patientName || 'Paciente', 20, 122);

            doc.setFont("helvetica", "bold");
            doc.text("POR CONCEPTO DE:", 20, 138);
            doc.setFont("helvetica", "normal");
            doc.text(data.description || 'Sesión psicológica', 20, 145);

            doc.setFontSize(28);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...ESPRESSO);
            const amount = Number(data.amount || 0).toLocaleString('es-CL');
            doc.text(`$${amount}`, 105, 175, { align: 'center' });

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...TAUPE);
            doc.text("(Pesos Chilenos)", 105, 182, { align: 'center' });

            if (data.method) {
                doc.setFontSize(9);
                doc.text(`Método de pago: ${data.method}`, 20, 200);
            }

            doc.setDrawColor(...TAUPE);
            doc.line(120, 248, 190, 248);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("Firma del Profesional", 155, 253, { align: 'center' });
            if (config.name) {
                doc.setFont("helvetica", "normal");
                doc.text(config.name, 155, 258, { align: 'center' });
            }
            if (config.rut) doc.text(`RUT: ${config.rut}`, 155, 262, { align: 'center' });
        }

        // 7. PIE DE PÁGINA (Marca de agua)
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(180, 180, 180);
        doc.text(`Generado por ShiningCloud Mind el ${new Date().toLocaleString('es-CL')}`, 105, 285, { align: 'center' });

        // GUARDADO
        const cleanName = pName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save(`${type}_${cleanName}.pdf`); 
        
        if (notify) notify("PDF generado exitosamente");
        if (logAction && selectedPatientId) logAction('GENERATE_PDF', { type }, selectedPatientId);

    } catch (e) { 
        console.error("Error en el motor PDF:", e); 
        alert("No se pudo generar el PDF. Revisa la consola."); 
    }
};