import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  es: {
    // Sidebar
    dashboard: "Panel",
    audit: "Auditoría",
    reports: "Informes",
    settings: "Configuración",
    billing: "Facturación",
    logout: "Cerrar Sesión",
    free: "Gratis",
    
    // Dashboard
    welcome: "Bienvenido de nuevo",
    welcome_subtitle: "Optimiza tu contenido para recomendaciones de IA con los insights de Radar Local",
    refresh: "Actualizar",
    analyze_url: "Analizar URL",
    analyze_url_desc: "Análisis completo de preparación para LLM de cualquier sitio web",
    start_analysis: "Iniciar Análisis",
    site_audit: "Auditoría del Sitio",
    site_audit_desc: "Rastreo multipágina y análisis profundo del sitio",
    start_audit: "Iniciar Auditoría",
    paste_text: "Pegar Texto",
    paste_text_desc: "Análisis directo de cualquier contenido de texto para optimización IA",
    paste_content: "Pegar Contenido",
    new_project: "Nuevo Proyecto",
    new_project_desc: "Organiza análisis de contenido relacionados en proyectos",
    create_project: "Crear Proyecto",
    llm_score: "Puntuación LLM",
    overall_avg: "Promedio general",
    simulation: "Cobertura Simulación",
    content_appears: "Contenido aparece en respuestas IA",
    competitors: "Competidores",
    tracked: "Total competidores rastreados",
    gap_opps: "Oportunidades de Brecha",
    high_relevance: "Preguntas de alta relevancia",
    projects_overview: "Resumen de Proyectos",
    view_all: "Ver todo",
    no_projects: "Aún no hay proyectos",
    create_projects_desc: "Crea proyectos para organizar tus análisis de contenido.",
    create_first_project: "Crear Primer Proyecto",
    recent_audits: "Auditorías Recientes",
    no_audits: "Aún no hay auditorías",
    start_analyzing: "Comienza a analizar tu contenido para ver resultados aquí",
    create_first_analysis: "Crear Primer Análisis",

    // Audit Page
    new_audit: "Nueva Auditoría",
    audit_subtitle: "Analiza tu contenido para optimización SEO y GEO",
    analyze_tab: "Analizar URL",
    paste_tab: "Pegar Texto",
    site_tab: "Auditoría Sitio",
    url_placeholder: "https://ejemplo.com",
    text_placeholder: "Pega tu contenido aquí...",
    analyze_btn: "Analizar",
    analyzing: "Analizando...",
    seo_score: "Puntuación SEO",
    seo_desc: "Optimización tradicional para motores de búsqueda",
    geo_score: "Puntuación GEO",
    geo_desc: "Optimización para Motores Generativos (IA)",
    reviews_reputation: "Reseñas y Reputación",
    avg_rating: "Valoración Media",
    total_reviews: "Total Reseñas",
    content_audit: "Auditoría de Contenido",
    main_h1: "Encabezado Principal (H1)",
    detected_services: "Servicios Detectados",
    no_services: "No se detectaron servicios",
    suggestions: "Sugerencias",
    schema_analysis: "Análisis de Schema Markup",
    schema_detected: "Schema Detectado",
    no_schema: "No se detectó Schema",
    entity_clarity: "Claridad de Entidad",
    entity_clarity_desc: "Qué tan bien entiende la IA quién eres y qué haces.",
    missing_data_desc: "Información faltante que impide que la IA te recomiende con confianza.",
    issues_opps: "Problemas y Oportunidades",
    missing_ai: "Falta para IA",
    strengths: "Fortalezas",
    rec_actions: "Acciones Recomendadas",
    seo_package: "Paquete SEO",
    geo_package: "Paquete GEO (Listo para IA)",
    generate_proposal: "Generar Propuesta",
    listen_report: "Escuchar Informe",
    playing_report: "Reproduciendo Informe...",
    export_pdf: "Exportar PDF",
    
    // Chatbot
    chat_title: "Asistente Radar Local",
    chat_subtitle: "Impulsado por Gemini 3.1 Pro",
    chat_welcome: "¡Hola! Soy tu asistente de Radar Local. Pregúntame cualquier cosa sobre tu auditoría o estrategias SEO/GEO.",
    chat_placeholder: "Pregunta sobre tu auditoría...",
    chat_error: "Lo siento, encontré un error. Por favor intenta de nuevo.",
    
    // Live Voice
    voice_title: "Modo de Voz en Vivo",
    voice_listening: "Escuchando...",
    voice_connecting: "Conectando con Gemini...",
    voice_end: "Terminar Sesión",
  },
  en: {
    // Sidebar
    dashboard: "Dashboard",
    audit: "Audit",
    reports: "Reports",
    settings: "Settings",
    billing: "Billing",
    logout: "Log Out",
    free: "Free",

    // Dashboard
    welcome: "Welcome back",
    welcome_subtitle: "Optimize your content for AI recommendations with Radar Local's insights",
    refresh: "Refresh",
    analyze_url: "Analyze URL",
    analyze_url_desc: "Comprehensive LLM readiness analysis for any website",
    start_analysis: "Start Analysis",
    site_audit: "Site Audit",
    site_audit_desc: "Multi-page crawling and deep site analysis",
    start_audit: "Start Audit",
    paste_text: "Paste Text",
    paste_text_desc: "Direct analysis of any text content for AI optimization",
    paste_content: "Paste Content",
    new_project: "New Project",
    new_project_desc: "Organize related content analyses in projects",
    create_project: "Create Project",
    llm_score: "LLM Ready Score",
    overall_avg: "Overall average",
    simulation: "Simulation Coverage",
    content_appears: "Content appears in AI answers",
    competitors: "Competitors",
    tracked: "Total competitors tracked",
    gap_opps: "Gap Opportunities",
    high_relevance: "High-relevance questions",
    projects_overview: "Projects Overview",
    view_all: "View all",
    no_projects: "No Projects Yet",
    create_projects_desc: "Create projects to organize your content analyses.",
    create_first_project: "Create Your First Project",
    recent_audits: "Recent URL Audits",
    no_audits: "No URL audits yet",
    start_analyzing: "Start analyzing your content to see results here",
    create_first_analysis: "Create First Analysis",

    // Audit Page
    new_audit: "New Audit",
    audit_subtitle: "Analyze your content for SEO and GEO optimization",
    analyze_tab: "Analyze URL",
    paste_tab: "Paste Text",
    site_tab: "Site Audit",
    url_placeholder: "https://example.com",
    text_placeholder: "Paste your content here...",
    analyze_btn: "Analyze",
    analyzing: "Analyzing...",
    seo_score: "SEO Score",
    seo_desc: "Traditional Search Engine Optimization",
    geo_score: "GEO Score",
    geo_desc: "Generative Engine Optimization (AI)",
    reviews_reputation: "Reviews & Reputation",
    avg_rating: "Average Rating",
    total_reviews: "Total Reviews",
    content_audit: "Content Audit",
    main_h1: "Main Heading (H1)",
    detected_services: "Detected Services",
    no_services: "No services detected",
    suggestions: "Suggestions",
    schema_analysis: "Schema Markup Analysis",
    schema_detected: "Schema Detected",
    no_schema: "No Schema Detected",
    entity_clarity: "Entity Clarity",
    entity_clarity_desc: "How well AI understands who you are and what you do.",
    missing_data_desc: "Missing information that prevents AI from confidently recommending you.",
    issues_opps: "Issues & Opportunities",
    missing_ai: "Missing for AI",
    strengths: "Strengths",
    rec_actions: "Recommended Actions",
    seo_package: "SEO Package",
    geo_package: "GEO Package (AI-Ready)",
    generate_proposal: "Generate Proposal",
    listen_report: "Listen to Report",
    playing_report: "Playing Report...",
    export_pdf: "Export PDF",

    // Chatbot
    chat_title: "Radar Local Assistant",
    chat_subtitle: "Powered by Gemini 3.1 Pro",
    chat_welcome: "Hi! I'm your Radar Local assistant. Ask me anything about your audit or SEO/GEO strategies.",
    chat_placeholder: "Ask about your audit...",
    chat_error: "Sorry, I encountered an error. Please try again.",

    // Live Voice
    voice_title: "Live Voice Mode",
    voice_listening: "Listening...",
    voice_connecting: "Connecting to Gemini...",
    voice_end: "End Session",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es'); // Default to Spanish

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
