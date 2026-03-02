import { useEffect, useState } from "react";
import { 
  Search, 
  MapPin,
  ArrowUpRight,
  Filter,
  X,
  LayoutGrid,
  Kanban,
  Loader2,
  Download,
  AlertCircle,
  Mic,
  Trophy,
  Zap,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { clsx } from "clsx";
import { generatePDF } from "../utils/pdfGenerator";
import { LeadCard, Lead } from "../components/LeadCard";

const STATUSES = ['New', 'Contacted', 'In Progress', 'Closed'];

export function Dashboard() {
  const { language } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [leadToUpdate, setLeadToUpdate] = useState<Lead | null>(null);
  const [newScore, setNewScore] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'pipeline'>('grid');

  useEffect(() => {
    const storedLeads = JSON.parse(localStorage.getItem('leads') || '[]');
    
    // Migration: Ensure all leads have history and ID
    const migratedLeads = storedLeads.map((lead: any) => {
      const migratedLead = { ...lead };
      if (!migratedLead.history) {
        migratedLead.history = [{ date: lead.date, score: lead.score }];
      }
      if (!migratedLead.id) {
        migratedLead.id = Date.now() + Math.random(); // Ensure unique ID if missing
      }
      return migratedLead;
    });

    // Sort by date desc
    setLeads(migratedLeads.sort((a: Lead, b: Lead) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const updateStatus = (id: number, newStatus: string) => {
    const updatedLeads = leads.map(lead => 
      String(lead.id) === String(id) ? { ...lead, status: newStatus } : lead
    );
    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
  };

  const deleteLead = (id: number) => {
    if (window.confirm(language === 'es' ? '¿Estás seguro de que quieres eliminar este lead?' : 'Are you sure you want to delete this lead?')) {
      const updatedLeads = leads.filter(lead => String(lead.id) !== String(id));
      setLeads(updatedLeads);
      localStorage.setItem('leads', JSON.stringify(updatedLeads));
    }
  };

  const handleUpdateMetrics = (lead: Lead) => {
    setLeadToUpdate(lead);
    setNewScore(lead.score);
    setIsUpdateModalOpen(true);
  };

  const saveNewMetric = () => {
    if (!leadToUpdate) return;

    const updatedLeads = leads.map(lead => {
      if (String(lead.id) === String(leadToUpdate.id)) {
        const newHistory = [...lead.history, { date: new Date().toISOString(), score: newScore }];
        // Sort history by date
        newHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return {
          ...lead,
          score: newScore, // Update current score
          history: newHistory
        };
      }
      return lead;
    });

    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
    setIsUpdateModalOpen(false);
    setLeadToUpdate(null);
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('leadId', String(id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      updateStatus(Number(leadId), status);
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.business.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgScore = leads.length > 0 
    ? Math.round(leads.reduce((acc, curr) => acc + curr.score, 0) / leads.length) 
    : 0;

  const handleDownloadPDF = async () => {
    if (!selectedLead) return;
    setGeneratingPdf(true);
    const success = await generatePDF('audit-report-modal', `audit-report-${selectedLead.business.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`);
    if (!success) {
      alert(language === 'es' ? 'Error al generar el PDF. Por favor intente de nuevo.' : 'Error generating PDF. Please try again.');
    }
    setGeneratingPdf(false);
  };

  return (
    <div className="space-y-8 relative pb-20">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{language === 'es' ? 'Pipeline de Leads' : 'Leads Pipeline'}</h1>
          <p className="text-slate-500 mt-1">{language === 'es' ? 'Gestiona tus oportunidades y monitoriza el progreso semanal' : 'Manage opportunities and monitor weekly progress'}</p>
        </div>
        <Link to="/audit" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
          <MapPin size={20} />
          {language === 'es' ? 'Nueva Auditoría' : 'New Audit'}
        </Link>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label={language === 'es' ? 'Total Leads' : 'Total Leads'}
          value={leads.length}
          icon={Search}
          color="blue"
        />
        <StatCard 
          label={language === 'es' ? 'Puntuación Media' : 'Avg. Score'}
          value={avgScore}
          suffix="/100"
          icon={MapPin}
          color="purple"
        />
        <StatCard 
          label={language === 'es' ? 'Tasa de Conversión' : 'Conversion Rate'}
          value={`${leads.length > 0 ? Math.round((leads.filter(l => l.status === 'Closed').length / leads.length) * 100) : 0}%`}
          icon={ArrowUpRight}
          color="green"
        />
      </div>

      {/* Controls & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={language === 'es' ? 'Buscar leads...' : 'Search leads...'}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium whitespace-nowrap">
            <Filter size={18} />
            <span className="hidden sm:inline">{language === 'es' ? 'Filtrar' : 'Filter'}</span>
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('grid')}
            className={clsx(
              "p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium",
              viewMode === 'grid' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <LayoutGrid size={18} />
            {language === 'es' ? 'Cuadrícula' : 'Grid'}
          </button>
          <button 
            onClick={() => setViewMode('pipeline')}
            className={clsx(
              "p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium",
              viewMode === 'pipeline' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Kanban size={18} />
            {language === 'es' ? 'Pipeline' : 'Pipeline'}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <LeadCard 
                key={lead.id} 
                lead={lead} 
                onUpdateStatus={updateStatus}
                onUpdateMetrics={handleUpdateMetrics}
                onViewReport={setSelectedLead}
                onDelete={deleteLead}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              {language === 'es' ? 'No hay leads que coincidan con tu búsqueda.' : 'No leads match your search.'}
            </div>
          )}
        </div>
      ) : (
        /* Pipeline View */
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0">
          {STATUSES.map(status => {
            const statusLeads = filteredLeads.filter(l => l.status === status);
            return (
              <div 
                key={status} 
                className="min-w-[320px] flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col max-h-[calc(100vh-300px)] transition-colors hover:bg-slate-100/50"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-slate-50/95 backdrop-blur-sm rounded-t-2xl z-10 pointer-events-none">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <div className={clsx(
                      "w-3 h-3 rounded-full",
                      status === 'New' ? "bg-blue-500" :
                      status === 'Contacted' ? "bg-purple-500" :
                      status === 'In Progress' ? "bg-yellow-500" :
                      "bg-green-500"
                    )} />
                    {status}
                  </h3>
                  <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-400 border border-slate-100">
                    {statusLeads.length}
                  </span>
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-4">
                  {statusLeads.length > 0 ? (
                    statusLeads.map(lead => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className="cursor-move active:cursor-grabbing transition-transform active:scale-[0.98]"
                      >
                        <LeadCard 
                          lead={lead} 
                          compact={true}
                          onUpdateStatus={updateStatus}
                          onUpdateMetrics={handleUpdateMetrics}
                          onViewReport={setSelectedLead}
                          onDelete={deleteLead}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="h-32 flex items-center justify-center text-slate-300 text-sm italic border-2 border-dashed border-slate-200 rounded-xl">
                      {language === 'es' ? 'Vacío' : 'Empty'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Update Metrics Modal */}
      {isUpdateModalOpen && leadToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {language === 'es' ? 'Actualizar Métricas' : 'Update Metrics'}
              </h3>
              <button onClick={() => setIsUpdateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {language === 'es' ? 'Nueva Puntuación Gemini' : 'New Gemini Score'}
                </label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-lg font-bold"
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                {language === 'es' 
                  ? 'Esta acción añadirá un nuevo punto de datos al historial del cliente para la fecha de hoy.' 
                  : 'This action will add a new data point to the client history for today.'}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button 
                  onClick={saveNewMetric}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  {language === 'es' ? 'Guardar' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 border-b border-slate-100 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedLead.business}</h2>
                <p className="text-slate-500 text-sm">
                  {language === 'es' ? 'Informe de Auditoría Generado el ' : 'Audit Report Generated on '}
                  {new Date(selectedLead.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDownloadPDF}
                  disabled={generatingPdf}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 font-medium text-sm"
                >
                  {generatingPdf ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                  {language === 'es' ? 'Descargar PDF' : 'Download PDF'}
                </button>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>
            </div>
            
            <div id="audit-report-modal" className="p-8 space-y-8">
              {!selectedLead.report ? (
                <div className="text-center py-12 text-slate-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  {language === 'es' ? 'No hay datos detallados para este lead.' : 'No detailed data available for this lead.'}
                </div>
              ) : (
                <>
                  {/* Score & Hook */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                      <div className="text-5xl font-black text-slate-900 mb-2">{selectedLead.score}</div>
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Gemini Score</div>
                    </div>
                    <div className="md:col-span-2 bg-blue-50 rounded-2xl p-6 border border-blue-100">
                      <h3 className="font-bold text-blue-900 text-lg mb-2">{selectedLead.report.lead_magnet_hook?.headline}</h3>
                      <p className="text-blue-700">{selectedLead.report.lead_magnet_hook?.subheadline}</p>
                      {selectedLead.report.lead_magnet_hook?.estimated_lost_revenue && (
                        <div className="mt-4 inline-block bg-white px-4 py-2 rounded-lg font-bold text-red-500 shadow-sm">
                          {language === 'es' ? 'Pérdida Est.: ' : 'Est. Loss: '}
                          {selectedLead.report.lead_magnet_hook.estimated_lost_revenue}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Voice Search */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <Mic className="text-indigo-600" size={20} />
                        </div>
                        <h3 className="font-bold text-slate-900">{language === 'es' ? 'Búsqueda por Voz' : 'Voice Search'}</h3>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl font-bold text-slate-900">{selectedLead.report.gemini_maps_diagnosis?.voice_search_readiness?.score}%</span>
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold uppercase text-slate-600">
                          {selectedLead.report.gemini_maps_diagnosis?.voice_search_readiness?.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm">
                        {selectedLead.report.gemini_maps_diagnosis?.voice_search_readiness?.reason}
                      </p>
                    </div>

                    {/* Competitor Gap */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-50 rounded-lg">
                          <Trophy className="text-orange-600" size={20} />
                        </div>
                        <h3 className="font-bold text-slate-900">{language === 'es' ? 'Competencia' : 'Competitor'}</h3>
                      </div>
                      <div className="mb-2 font-bold text-slate-900">
                        {selectedLead.report.gemini_maps_diagnosis?.competitor_gap?.main_competitor}
                      </div>
                      <p className="text-slate-600 text-sm">
                        {selectedLead.report.gemini_maps_diagnosis?.competitor_gap?.why_they_win}
                      </p>
                    </div>
                  </div>

                  {/* Improvement Plan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100">
                      <h3 className="font-bold text-yellow-900 mb-4 flex items-center gap-2">
                        <Zap size={18} />
                        {language === 'es' ? 'Acciones Inmediatas' : 'Immediate Actions'}
                      </h3>
                      <ul className="space-y-3">
                        {selectedLead.report.gemini_maps_diagnosis?.improvement_plan?.immediate_actions?.map((action: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-yellow-800 text-sm">
                            <span className="font-bold opacity-50">{i + 1}.</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                      <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <Target size={18} />
                        {language === 'es' ? 'Estrategia' : 'Strategy'}
                      </h3>
                      <ul className="space-y-3">
                        {selectedLead.report.gemini_maps_diagnosis?.improvement_plan?.long_term_strategy?.map((action: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-blue-800 text-sm">
                            <span className="font-bold opacity-50">{i + 1}.</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, suffix, icon: Icon, color }: any) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color as keyof typeof colors]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900">
          {value}<span className="text-sm text-slate-400 font-normal ml-1">{suffix}</span>
        </p>
      </div>
    </div>
  );
}
