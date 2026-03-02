import { Calendar, ChevronDown, Eye, Plus, TrendingDown, TrendingUp, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useLanguage } from "../context/LanguageContext";

interface LeadHistory {
  date: string;
  score: number;
}

export interface Lead {
  id: number;
  business: string;
  score: number;
  status: string;
  date: string;
  report?: any;
  history: LeadHistory[];
}

interface LeadCardProps {
  lead: Lead;
  compact?: boolean;
  onUpdateStatus: (id: number, status: string) => void;
  onUpdateMetrics: (lead: Lead) => void;
  onViewReport: (lead: Lead) => void;
  onDelete: (id: number) => void;
}

const STATUSES = ['New', 'Contacted', 'In Progress', 'Closed'];

export function LeadCard({ 
  lead, 
  compact = false, 
  onUpdateStatus, 
  onUpdateMetrics, 
  onViewReport, 
  onDelete 
}: LeadCardProps) {
  const { language } = useLanguage();
  const previousScore = lead.history.length > 1 ? lead.history[lead.history.length - 2].score : lead.score;
  const trend = lead.score - previousScore;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(lead.id);
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onUpdateMetrics(lead);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onViewReport(lead);
  };

  return (
    <div className={clsx(
      "bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col",
      compact ? "p-4 mb-4" : "p-6"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 mr-2">
          <h3 className="font-bold text-slate-900 text-lg line-clamp-1" title={lead.business}>{lead.business}</h3>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Calendar size={12} />
            {new Date(lead.date).toLocaleDateString()}
          </div>
        </div>
        
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <select
            value={lead.status}
            onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
            className={clsx(
              "appearance-none pl-2.5 pr-6 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1",
              lead.status === 'New' ? "bg-blue-50 text-blue-700 border-blue-100 focus:ring-blue-500" :
              lead.status === 'Contacted' ? "bg-purple-50 text-purple-700 border-purple-100 focus:ring-purple-500" :
              lead.status === 'In Progress' ? "bg-yellow-50 text-yellow-700 border-yellow-100 focus:ring-yellow-500" :
              "bg-green-50 text-green-700 border-green-100 focus:ring-green-500"
            )}
          >
            {STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <ChevronDown size={10} className={clsx(
            "absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none",
            lead.status === 'New' ? "text-blue-700" :
            lead.status === 'Contacted' ? "text-purple-700" :
            lead.status === 'In Progress' ? "text-yellow-700" :
            "text-green-700"
          )} />
        </div>
      </div>

      <div className="flex items-end gap-4 mb-6">
        <div>
          <div className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">Gemini Score</div>
          <div className="text-4xl font-black text-slate-900 flex items-center gap-2">
            {lead.score}
            {trend !== 0 && (
              <span className={clsx("text-sm font-bold px-1.5 py-0.5 rounded flex items-center", trend > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                {trend > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {Math.abs(trend)}
              </span>
            )}
          </div>
        </div>
        
        {/* Sparkline Chart */}
        <div className="flex-1 h-16 min-w-0 w-full relative">
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lead.history}>
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <YAxis domain={[0, 100]} hide />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <button 
          onClick={handleUpdate}
          className="flex-1 py-2 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          title={language === 'es' ? 'Actualizar Métricas' : 'Update Metrics'}
        >
          <Plus size={16} />
          <span className={compact ? "hidden xl:inline" : "inline"}>{language === 'es' ? 'Actualizar' : 'Update'}</span>
        </button>
        <button 
          onClick={handleView}
          className="flex-1 py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          title={language === 'es' ? 'Ver Informe' : 'View Report'}
        >
          <Eye size={16} />
          <span className={compact ? "hidden xl:inline" : "inline"}>{language === 'es' ? 'Informe' : 'Report'}</span>
        </button>
        <button 
          onClick={handleDelete}
          className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
          title={language === 'es' ? 'Eliminar Lead' : 'Delete Lead'}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
