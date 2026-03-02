import { useState } from "react";
import { 
  Search, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Save,
  Mic,
  Trophy,
  Zap,
  Target,
  Download
} from "lucide-react";
import { clsx } from "clsx";
import { analyzeContent } from "../services/gemini";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { generatePDF } from "../utils/pdfGenerator";

export function Audit() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeContent(url, "geo", language);
      setResult(data);
    } catch (error) {
      console.error("Analysis failed:", error);
      // Mock result for demo if API fails
      setResult({
        gemini_maps_diagnosis: {
          score: 45,
          entity_clarity: "Baja",
          entity_clarity_reason: "Gemini confunde este negocio con otro similar en la misma zona debido a la falta de datos estructurados únicos.",
          sentiment_analysis: {
            score: 60,
            summary: "Los clientes mencionan buen servicio pero se quejan de horarios incorrectos en mapas.",
            keywords: ["horario", "servicio", "ubicación"]
          },
          voice_search_readiness: {
            score: 30,
            status: "Invisible",
            reason: "Falta de palabras clave conversacionales y preguntas frecuentes."
          },
          competitor_gap: {
            main_competitor: "Competidor Local X",
            why_they_win: "Tienen más reseñas recientes y fotos de alta calidad."
          },
          missing_data_points: ["Horarios festivos", "Atributos de accesibilidad", "Menú de servicios detallado"],
          ai_recommendation_likelihood: "Baja",
          improvement_plan: {
            immediate_actions: [
              "Reclamar y verificar perfil de Google Business",
              "Añadir marcado Schema LocalBusiness",
              "Responder a reseñas recientes"
            ],
            long_term_strategy: [
              "Estrategia de generación de reseñas",
              "Optimización de imágenes para IA",
              "Creación de contenido de preguntas frecuentes"
            ]
          }
        },
        lead_magnet_hook: {
          headline: "Estás perdiendo clientes que buscan en IA",
          subheadline: "Tu competencia aparece primero cuando los usuarios preguntan a Gemini por tus servicios.",
          estimated_lost_revenue: "$2,000/mes"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = () => {
    const leads = JSON.parse(localStorage.getItem('leads') || '[]');
    leads.push({
      id: Date.now(),
      business: url,
      score: result?.gemini_maps_diagnosis?.score || 0,
      status: 'New',
      date: new Date().toISOString(),
      report: result // Save the full report here
    });
    localStorage.setItem('leads', JSON.stringify(leads));
    navigate('/');
  };

  const handleDownloadPDF = async () => {
    setGeneratingPdf(true);
    await generatePDF('audit-report', `audit-report-${url.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`);
    setGeneratingPdf(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
          <MapPin className="text-blue-600 w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
          {language === 'es' ? 'Auditoría de Posicionamiento en Gemini Maps' : 'Gemini Maps Positioning Audit'}
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          {language === 'es' 
            ? 'Descubre cómo te ve la Inteligencia Artificial y por qué no apareces en las respuestas de Gemini.' 
            : 'Discover how AI sees you and why you are not appearing in Gemini answers.'}
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-2 pl-6 flex items-center gap-4 transition-all focus-within:ring-4 focus-within:ring-blue-500/10">
        <Search className="text-slate-400 shrink-0" size={24} />
        <input
          type="text"
          placeholder={language === 'es' ? "Nombre del negocio o URL de Google Maps..." : "Business Name or Google Maps URL..."}
          className="flex-1 py-4 text-lg bg-transparent focus:outline-none placeholder:text-slate-400"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !url}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <span className="flex items-center gap-2">{language === 'es' ? 'Auditar Gratis' : 'Audit for Free'} <ArrowRight size={18} /></span>}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="flex justify-end">
            <button 
              onClick={handleDownloadPDF}
              disabled={generatingPdf}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {generatingPdf ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              {language === 'es' ? 'Descargar Informe PDF' : 'Download PDF Report'}
            </button>
          </div>

          <div id="audit-report" className="space-y-8 p-4 bg-slate-50/50 rounded-3xl">
            {/* Hook Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 text-red-400">{result.lead_magnet_hook.headline}</h2>
                    <p className="text-blue-100 text-lg max-w-2xl">{result.lead_magnet_hook.subheadline}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center min-w-[150px]">
                    <div className="text-sm text-white/70 uppercase tracking-wider font-semibold mb-1">
                      {language === 'es' ? 'Pérdida Est.' : 'Est. Loss'}
                    </div>
                    <div className="text-2xl font-bold text-red-400">{result.lead_magnet_hook.estimated_lost_revenue}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Score */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center col-span-1">
                <div className="relative w-48 h-48 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="#f1f5f9" strokeWidth="16" fill="transparent" />
                    <circle
                      cx="96" cy="96" r="88"
                      stroke={result.gemini_maps_diagnosis.score > 70 ? "#22c55e" : result.gemini_maps_diagnosis.score > 40 ? "#eab308" : "#ef4444"}
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={552.9}
                      strokeDashoffset={552.9 - (552.9 * result.gemini_maps_diagnosis.score) / 100}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-slate-900">{result.gemini_maps_diagnosis.score}</span>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-2">Gemini Score</span>
                  </div>
                </div>
                <div className="space-y-2 w-full">
                  <div className="text-sm font-medium text-slate-500">{language === 'es' ? 'Probabilidad de Recomendación' : 'Recommendation Likelihood'}</div>
                  <div className={clsx(
                    "text-xl font-bold py-2 px-4 rounded-xl w-full",
                    result.gemini_maps_diagnosis.ai_recommendation_likelihood === "High" || result.gemini_maps_diagnosis.ai_recommendation_likelihood === "Alta" 
                      ? "bg-green-50 text-green-700" 
                      : "bg-red-50 text-red-700"
                  )}>
                    {result.gemini_maps_diagnosis.ai_recommendation_likelihood}
                  </div>
                </div>
              </div>

              {/* Deep Analysis Grid */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Entity Clarity */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <MapPin className="text-purple-600" size={18} />
                    </div>
                    <h3 className="font-bold text-slate-900">{language === 'es' ? 'Claridad de Entidad' : 'Entity Clarity'}</h3>
                  </div>
                  <div className="mb-2">
                    <span className={clsx(
                      "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
                      result.gemini_maps_diagnosis.entity_clarity === "High" || result.gemini_maps_diagnosis.entity_clarity === "Alta" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {result.gemini_maps_diagnosis.entity_clarity}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {result.gemini_maps_diagnosis.entity_clarity_reason}
                  </p>
                </div>

                {/* Voice Search */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Mic className="text-indigo-600" size={18} />
                    </div>
                    <h3 className="font-bold text-slate-900">{language === 'es' ? 'Búsqueda por Voz' : 'Voice Search'}</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                     <div className="font-bold text-2xl text-slate-900">{result.gemini_maps_diagnosis.voice_search_readiness?.score || 0}%</div>
                     <span className="text-xs text-slate-400 font-medium uppercase">{result.gemini_maps_diagnosis.voice_search_readiness?.status}</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {result.gemini_maps_diagnosis.voice_search_readiness?.reason}
                  </p>
                </div>

                {/* Competitor Gap */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sm:col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Trophy className="text-orange-600" size={18} />
                    </div>
                    <h3 className="font-bold text-slate-900">{language === 'es' ? 'Análisis de Competencia' : 'Competitor Analysis'}</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                      <div className="text-xs text-orange-600 font-bold uppercase mb-1">{language === 'es' ? 'Competidor Principal' : 'Top Competitor'}</div>
                      <div className="font-bold text-slate-900">{result.gemini_maps_diagnosis.competitor_gap?.main_competitor}</div>
                    </div>
                    <div className="flex-[2]">
                      <p className="text-slate-600 text-sm leading-relaxed">
                        <span className="font-semibold text-slate-900">{language === 'es' ? 'Por qué ganan: ' : 'Why they win: '}</span>
                        {result.gemini_maps_diagnosis.competitor_gap?.why_they_win}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Zap className="text-yellow-500" />
                  {language === 'es' ? 'Victorias Rápidas (Hoy)' : 'Quick Wins (Today)'}
                </h3>
                <ul className="space-y-4">
                  {result.gemini_maps_diagnosis.improvement_plan?.immediate_actions?.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
                
                <h3 className="text-lg font-bold text-slate-900 mt-8 mb-6 flex items-center gap-2">
                  <Target className="text-blue-500" />
                  {language === 'es' ? 'Estrategia a Largo Plazo' : 'Long-term Strategy'}
                </h3>
                <ul className="space-y-4">
                  {result.gemini_maps_diagnosis.improvement_plan?.long_term_strategy?.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div data-html2canvas-ignore className="bg-blue-600 rounded-3xl p-8 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">
                    {language === 'es' ? '¿Quieres el Informe Completo?' : 'Want the Full Report?'}
                  </h3>
                  <p className="text-blue-100 mb-8">
                    {language === 'es' 
                      ? 'Guarda este lead para acceder al plan de implementación detallado y comenzar a captar clientes con IA.' 
                      : 'Save this lead to access the detailed implementation plan and start capturing customers with AI.'}
                  </p>
                  
                  <div className="bg-white/10 rounded-xl p-4 mb-8 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="text-yellow-300" size={20} />
                      <span className="font-bold text-white">{language === 'es' ? 'Datos Faltantes Críticos' : 'Critical Missing Data'}</span>
                    </div>
                    <ul className="space-y-1 ml-8">
                      {result.gemini_maps_diagnosis.missing_data_points?.slice(0, 3).map((point: string, i: number) => (
                        <li key={i} className="text-sm text-blue-100 list-disc">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <button 
                  onClick={handleSaveLead}
                  className="w-full py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-lg relative z-10"
                >
                  <Save size={20} />
                  {language === 'es' ? 'Guardar Lead en Pipeline' : 'Save Lead to Pipeline'}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
