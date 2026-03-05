import { Lead } from "../components/LeadCard";

export const generateEntityProfileMarkdown = (lead: Lead): string => {
  const isUrl = (text: string) => text.startsWith('http') || text.startsWith('www');
  const businessName = isUrl(lead.business) ? "[Nombre del Negocio]" : lead.business;
  const webUrl = isUrl(lead.business) ? lead.business : "[URL Web]";
  
  // Extract potential data from report if available, otherwise use placeholders
  const diagnosis = lead.report?.gemini_maps_diagnosis || {};
  const competitor = diagnosis.competitor_gap?.main_competitor || "[Competidor Principal]";
  const missingData = diagnosis.missing_data_points?.join(", ") || "[No especificado]";
  
  return `# PERFIL DE ENTIDAD LOCAL

## 1. Identificación Básica (NAP)
- **Nombre Comercial:** ${businessName}
- **Dirección Física:** [Calle, Ciudad, Código Postal]
- **Teléfono:** [+34 XXX XXX XXX]
- **URL Web:** ${webUrl}
- **URL Google Maps:** [https://maps.google.com/...]

## 2. Presencia en Google Business Profile (GBP)
- **Categoría Principal:** [Ej: Clínica Médica]
- **Categorías Secundarias:** [Ej: Centro de depilación láser]
- **Nota Media (Reviews):** [Ej: 4.2]
- **Total de Reseñas:** [Ej: 120]
- **Última publicación en GBP:** [Fecha]

## 3. Extracción de Contenido Web (Resumen)
- **H1 de la Home:** [Texto del H1]
- **Servicios Principales Listados:** [${missingData.includes('Menú') ? 'No detectados' : 'Servicios detectados'}]
- **Menciones de Doctores/Staff:** [Nombres detectados]

## 4. Estructura de Datos (Schema)
- **JSON-LD Detectado:** [No]
- **Tipo de Schema:** [LocalBusiness / Ninguno]
- **Estado de Auditoría:** ${diagnosis.entity_clarity === 'High' || diagnosis.entity_clarity === 'Alta' ? 'Entidad Clara' : 'Entidad Confusa (Requiere Schema)'}
`;
};
