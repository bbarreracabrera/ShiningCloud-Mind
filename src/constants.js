// src/constants.js

export const CONSENT_TEMPLATES = {
    psicoterapia_adultos: {
        title: 'Consentimiento Informado - Psicoterapia Adultos',
        text: `CONSENTIMIENTO INFORMADO PARA PSICOTERAPIA

1. Naturaleza de la Terapia: La psicoterapia es un proceso colaborativo diseñado para ayudarle a abordar problemas psicológicos, emocionales o conductuales. Los resultados varían según el paciente y no se pueden garantizar.

2. Confidencialidad: Toda la información compartida durante las sesiones es estrictamente confidencial. Las únicas excepciones legales y éticas al secreto profesional incluyen:
- Riesgo inminente y grave para la vida del paciente (riesgo suicida).
- Riesgo inminente y grave para la vida de terceros (riesgo homicida).
- Sospecha de abuso o negligencia infantil, de ancianos o personas dependientes.
- Orden judicial expresa.

3. Encuadre y Asistencia: Las sesiones tienen una duración aproximada de 45-50 minutos. En caso de no poder asistir, el paciente debe cancelar con al menos 24 horas de anticipación. De lo contrario, la sesión será cobrada en su totalidad.

Al firmar este documento, declaro que he leído, comprendido y aceptado los términos expuestos para dar inicio al proceso psicoterapéutico.`
    },
    psicoterapia_infantil: {
        title: 'Consentimiento Informado - Psicoterapia Infantil/Adolescente',
        text: `CONSENTIMIENTO INFORMADO PARA PSICOTERAPIA DE MENORES

1. Naturaleza de la Terapia: Autorizo al menor a mi cargo a recibir evaluación y tratamiento psicológico. Entiendo que la terapia infantil/adolescente requiere la participación activa de los padres o cuidadores principales.

2. Confidencialidad del Menor: Para asegurar un espacio seguro, el terapeuta mantendrá la confidencialidad de lo conversado con el menor. A los padres se les informará sobre los temas generales trabajados, el progreso y las pautas de manejo, pero no los detalles específicos (salvo en caso de riesgo inminente para la vida o integridad del menor).

3. Limitaciones Legales: En caso de separación de los padres, este consentimiento requiere la autorización del tutor legal. El terapeuta no actuará como perito en juicios de custodia o divorcio.

4. Asistencia: Las cancelaciones deben realizarse con 24 horas de anticipación; de lo contrario, se cobrará la sesión.

Firma del Padre, Madre o Tutor Legal en conformidad.`
    },
    evaluacion_psicodiagnostica: {
        title: 'Consentimiento - Evaluación Psicodiagnóstica',
        text: `CONSENTIMIENTO PARA EVALUACIÓN PSICODIAGNÓSTICA Y APLICACIÓN DE TESTS

1. Objetivo: El propósito de esta evaluación es obtener información sobre el funcionamiento psicológico, cognitivo o emocional del paciente, para orientar un plan de tratamiento o responder a una derivación.

2. Procedimiento: El proceso consta de entrevistas clínicas y la posible aplicación de pruebas psicométricas estandarizadas (tests proyectivos o cognitivos).

3. Entrega de Resultados: Al finalizar la evaluación, el terapeuta realizará una sesión de devolución para explicar los resultados y hará entrega de un informe escrito si corresponde.

4. Confidencialidad: Los resultados y protocolos de los tests son de uso estrictamente clínico y confidencial, sujetos a las mismas excepciones del secreto profesional establecidas por la ley.

Declaro estar informado/a y accedo voluntariamente al proceso de evaluación.`
    }
};

export const ANAMNESIS_TAGS = [
  'Ansiedad', 'Depresión', 'Estrés', 'Duelo', 'Trauma', 
  'TDAH', 'TEA', 'Autoestima', 'Ideación Suicida', 
  'Dinámica Familiar', 'Problemas Escolares', 'Toma Fármacos'
];

// Mantenemos este objeto para que no rompa tu código heredado, 
// pero usamos nuestra nueva paleta de colores de Tailwind.
export const THEMES = {
  light: { 
    bg: 'bg-pastel-pink', 
    text: 'text-soft-dark', 
    card: 'bg-white border-pastel-pink shadow-sm', 
    accent: 'text-sage-green', 
    accentBg: 'bg-sage-green', 
    inputBg: 'bg-warm-white focus-within:bg-white focus-within:border-sage-green', 
    subText: 'text-gray-400', 
    gradient: 'bg-gradient-to-br from-sage-green to-water-blue', 
    buttonSecondary: 'bg-warm-white border-pastel-pink text-soft-dark' 
  },
  // Redirigimos los otros al mismo diseño para evitar errores de cambio de tema
  dark: { bg: 'bg-pastel-pink', text: 'text-soft-dark' },
  blue: { bg: 'bg-pastel-pink', text: 'text-soft-dark' }
};

// --- ELIMINADOS: TEETH_UPPER, TEETH_LOWER, TEETH_PED (Ya no los necesitamos) ---

export const DEFAULT_CATALOG = [
    { name: 'Primera Entrevista / Evaluación Inicial', price: 35000 },
    { name: 'Psicoterapia Individual (Adulto)', price: 35000 },
    { name: 'Psicoterapia Infanto-Juvenil', price: 35000 },
    { name: 'Entrevista a Padres / Apoderados', price: 35000 },
    { name: 'Terapia de Pareja', price: 45000 },
    { name: 'Terapia Familiar', price: 50000 },
    { name: 'Sesión de Supervisión Clínica', price: 30000 },
    { name: 'Evaluación Psicodiagnóstica (Batería Completa)', price: 150000 },
    { name: 'Aplicación Test WISC-V', price: 120000 },
    { name: 'Aplicación Test ADOS-2', price: 150000 },
    { name: 'Elaboración de Informe Escolar', price: 20000 },
    { name: 'Elaboración de Informe Clínico / Derivación', price: 30000 }
];

// --- FUNCIONES UTILITARIAS (Mantenidas intactas porque son geniales) ---

export const getLocalDate = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzoffset).toISOString().split('T')[0];
};

export const formatRUT = (rut) => {
    if (!rut) return '';
    let cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (cleanRut.length <= 1) return cleanRut;
    let result = cleanRut.slice(-1);
    let body = cleanRut.slice(0, -1);
    let formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedBody}-${result}`;
};