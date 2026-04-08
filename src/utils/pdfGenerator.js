import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export const generatePDF = (type, data = null, context) => {
    const { 
        themeMode, config, selectedPatientId, getPatient, sessionData, 
        patientRecords, prescription, notify, logAction 
    } = context;

    try {
        const doc = new jsPDF();
        
        // --- PALETA DE COLORES BOUTIQUE (RGB) ---
        const ESPRESSO = [49, 41, 35];     // Texto principal y Headers
        const OLIVE = [91, 102, 81];       // Acentos y Totales
        const TAUPE = [163, 150, 139];     // Textos secundarios y líneas sutiles
        const LIGHT_TAUPE = [223, 210, 196]; // Bordes de cajas
        const VANILLA = [253, 251, 247];   // Fondos de cajas

        // 1. BARRA SUPERIOR ELEGANTE
        doc.setFillColor(...ESPRESSO); 
        doc.rect(0, 0, 210, 4, 'F'); 

        // 2. LOGO DEL CENTRO
        if (config.logo) {
            try { doc.addImage(config.logo, 'PNG', 15, 12, 25, 25, '', 'FAST'); } 
            catch (e) { console.warn("Logo incompatible"); }
        }

        // 3. INFORMACIÓN DEL CENTRO PSICOLÓGICO (Header derecho)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...ESPRESSO);
        doc.text(config.name?.toUpperCase() || "CENTRO PSICOLÓGICO", 195, 18, { align: 'right' });
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...TAUPE);
        doc.text(`RUT: ${config.rut || 'No registrado'}`, 195, 23, { align: 'right'});
        doc.text(`Registro SIS: ${config.rnpi || 'No registrado'}`, 195, 27, { align: 'right' });
        if (config.university) doc.text(`${config.university}`, 195, 31, { align: 'right' });
        doc.text(`${config.address || 'Dirección no registrada'}`, 195, 35, { align: 'right' });

        // Línea divisoria muy fina
        doc.setDrawColor(...LIGHT_TAUPE);
        doc.setLineWidth(0.5);
        doc.line(15, 42, 195, 42);

        // 4. EXTRACCIÓN DE DATOS DEL CONSULTANTE
        const pData = (type === 'consent') ? getPatient(selectedPatientId) : (data || (sessionData?.patientId ? patientRecords[sessionData.patientId] : null));
        const pName = pData?.personal?.legalName || (sessionData?.patientName || 'Consultante No Registrado');
        const pRut = pData?.personal?.rut || pData?.personal?.documentId || '---';
        const pAge = pData?.personal?.age ? `${pData.personal.age} años` : '---';
        const currentDate = new Date().toLocaleDateString('es-CL');

        // 5. CAJA DE DATOS DEL CONSULTANTE (Fondo Vainilla elegante)
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
        // 6A. INFORME / INDICACIONES TERAPÉUTICAS (Ex Receta)
        // ==========================================
        if (type === 'rx') {
            if (!prescription || prescription.length === 0) { notify("El documento está vacío."); return; }
            
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...ESPRESSO);
            doc.text("INDICACIONES TERAPÉUTICAS", 15, 85);

            // Símbolo psicológico / viñeta elegante en lugar de Rx
            doc.setFontSize(20);
            doc.setTextColor(...OLIVE);
            doc.text("Ψ", 15, 98); // Letra Psi (Símbolo de la Psicología)

            autoTable(doc, {
                startY: 105,
                head: [['INDICACIÓN / SUGERENCIA', 'DETALLES / POSOLOGÍA']],
                body: prescription.map(p => [p.name.toUpperCase(), p.dosage]),
                theme: 'plain',
                styles: { fontSize: 10, cellPadding: 6, textColor: [60,60,60] },
                headStyles: { fontStyle: 'bold', textColor: ESPRESSO, borderBottom: { width: 0.5, color: LIGHT_TAUPE } },
                columnStyles: { 0: { fontStyle: 'bold', textColor: ESPRESSO, width: 85 } },
                bodyStyles: { borderBottom: { width: 0.1, color: [230, 230, 230] } }
            });

            const finalY = doc.lastAutoTable.finalY + 40;
            doc.setDrawColor(...TAUPE);
            doc.setLineWidth(0.5);
            doc.line(130, finalY, 185, finalY);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...ESPRESSO);
            doc.text("FIRMA DEL PROFESIONAL", 157.5, finalY + 5, { align: 'center' });
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...TAUPE);
            doc.text(config.name || '', 157.5, finalY + 9, { align: 'center' });
        } 
        
        // ==========================================
        // 6B. PLAN TERAPÉUTICO (Ex Presupuesto)
        // ==========================================
        else if (type === 'quote') {
            const qItems = data || []; 
            const totalQ = qItems.reduce((sum, item) => sum + Number(item.price), 0);
            
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...ESPRESSO);
            doc.text("PLAN TERAPÉUTICO / HONORARIOS", 15, 85); 

            autoTable(doc, { 
                startY: 95, 
                head: [['SERVICIO / SESIÓN', 'DETALLE', 'VALOR']], 
                body: qItems.map(it => [it.name, it.tooth || '-', `$${Number(it.price).toLocaleString('es-CL')}`]),
                foot: [['', 'TOTAL A PAGAR:', `$${totalQ.toLocaleString('es-CL')}`]],
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 6 },
                headStyles: { fillColor: ESPRESSO, textColor: [255,255,255], fontStyle: 'bold', halign: 'left' },
                footStyles: { fillColor: VANILLA, textColor: OLIVE, fontStyle: 'bold', fontSize: 12 },
                alternateRowStyles: { fillColor: [250, 249, 246] },
                columnStyles: { 
                    0: { halign: 'left' },
                    1: { halign: 'left' },
                    2: { halign: 'right', fontStyle: 'bold' }
                }
            }); 

            const finalY = doc.lastAutoTable.finalY + 15;
            if (finalY < 240) {
                // Caja de Términos
                doc.setFillColor(...VANILLA);
                doc.setDrawColor(...LIGHT_TAUPE);
                doc.roundedRect(15, finalY, 180, 22, 2, 2, 'FD');
                
                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...ESPRESSO);
                doc.text("Condiciones del Plan:", 20, finalY + 7);
                
                doc.setFont("helvetica", "normal");
                doc.setTextColor(...TAUPE);
                doc.text("1. Este plan terapéutico es sugerido y puede ser modificado según la evolución clínica del paciente.", 20, finalY + 12);
                doc.text("2. Los valores tienen una vigencia de 30 días desde la emisión de este documento.", 20, finalY + 17);

                // Firmas
                doc.setDrawColor(...TAUPE);
                doc.setLineWidth(0.5);
                doc.line(30, finalY + 50, 85, finalY + 50); 
                doc.line(125, finalY + 50, 180, finalY + 50); 
                
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...ESPRESSO);
                doc.text("Firma Profesional", 57.5, finalY + 55, { align: 'center' });
                doc.text("Firma Consultante / Apoderado", 152.5, finalY + 55, { align: 'center' });
            }
        }
        
        // ==========================================
        // 6C. CONSENTIMIENTO INFORMADO
        // ==========================================
        else if (type === 'consent' && data) { 
            doc.setFontSize(16); 
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...ESPRESSO);
            doc.text(data.type.toUpperCase(), 105, 85, { align: 'center' }); 
            
            doc.setFontSize(10); 
            doc.setFont("helvetica", "normal");
            doc.setTextColor(50, 50, 50);
            
            const splitText = doc.splitTextToSize(data.text || '', 170);
            doc.text(splitText, 20, 100, { align: 'justify', maxWidth: 170 }); 
            
            if(data.signature) { 
                try { doc.addImage(data.signature, 'PNG', 80, 220, 50, 30); } 
                catch(e) { console.warn("Error en firma digital"); } 
                
                doc.setDrawColor(...TAUPE);
                doc.line(75, 255, 135, 255);
                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                doc.text("Firma del Consultante", 105, 260, { align: 'center' });
            } 
        }

        // ==========================================
        // 7. MARCA DE AGUA INFERIOR
        // ==========================================
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(180, 180, 180);
        doc.text(`Documento clínico generado por ShiningCloud Psychology el ${new Date().toLocaleString('es-CL')}`, 105, 285, { align: 'center' });

        // GUARDADO DEL DOCUMENTO
        const cleanName = pName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save(`${type}_${cleanName}.pdf`); 
        if(typeof notify === 'function') notify("Documento PDF generado con éxito"); 
        if(typeof logAction === 'function' && selectedPatientId) logAction('GENERATE_PDF', { type }, selectedPatientId);

    } catch (e) { 
        console.error(e); 
        alert("Error al generar el documento PDF. Revisa los datos ingresados."); 
    }
};