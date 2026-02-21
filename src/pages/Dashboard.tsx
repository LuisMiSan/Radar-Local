import { 
  Globe, 
  Search, 
  FileText, 
  Plus, 
  Activity, 
  Database, 
  Users, 
  Zap,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Chatbot } from "../components/Chatbot";

export function Dashboard() {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, LuisMi</h1>
          <p className="text-slate-500 mt-1">Optimize your content for AI recommendations with Aletheo's powerful insights</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500">FREE Plan</span>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Refresh
          </button>
        </div>
      </header>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard 
          title="Analyze URL" 
          description="Comprehensive LLM readiness analysis for any website"
          icon={Globe}
          color="blue"
          action="Start Analysis"
          to="/audit"
        />
        <ActionCard 
          title="Site Audit" 
          description="Multi-page crawling and deep site analysis"
          icon={Activity}
          color="purple"
          action="Start Audit"
          to="/audit"
        />
        <ActionCard 
          title="Paste Text" 
          description="Direct analysis of any text content for AI optimization"
          icon={FileText}
          color="green"
          action="Paste Content"
          to="/audit"
        />
        <ActionCard 
          title="New Project" 
          description="Organize related content analyses in projects"
          icon={Plus}
          color="orange"
          action="Create Project"
          to="/projects"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          value="0%" 
          label="LLM Ready Score" 
          subtext="Overall average"
          icon={Activity}
          iconColor="text-blue-500"
          iconBg="bg-blue-100"
        />
        <StatCard 
          value="0%" 
          label="Simulation Coverage" 
          subtext="Content appears in AI answers"
          icon={Database}
          iconColor="text-purple-500"
          iconBg="bg-purple-100"
        />
        <StatCard 
          value="0" 
          label="Competitors" 
          subtext="Total competitors tracked"
          icon={Users}
          iconColor="text-green-500"
          iconBg="bg-green-100"
        />
        <StatCard 
          value="0" 
          label="Gap Opportunities" 
          subtext="High-relevance questions"
          icon={Search}
          iconColor="text-orange-500"
          iconBg="bg-orange-100"
        />
      </div>

      {/* Projects Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <FileText size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Projects Overview</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-500 hover:text-slate-900">View all</button>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Plus size={16} />
              New Project
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No Projects Yet</h3>
          <p className="text-slate-500 mt-1 mb-6">Create projects to organize your content analyses.</p>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            Create Your First Project
          </button>
        </div>
      </div>

      {/* Recent Audits */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <FileText size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Recent URL Audits</h2>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowRight size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No URL audits yet</h3>
          <p className="text-slate-500 mt-1 mb-6">Start analyzing your content to see results here</p>
          <Link to="/audit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            Create First Analysis
          </Link>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}

function ActionCard({ title, description, icon: Icon, color, action, to }: any) {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    green: "bg-emerald-600 hover:bg-emerald-700",
    orange: "bg-orange-500 hover:bg-orange-600",
  };

  const iconColors = {
    blue: "bg-blue-500/20 text-white",
    purple: "bg-purple-500/20 text-white",
    green: "bg-emerald-500/20 text-white",
    orange: "bg-orange-400/20 text-white",
  };

  return (
    <div className={`rounded-2xl p-6 text-white flex flex-col h-full transition-transform hover:-translate-y-1 ${colors[color as keyof typeof colors]}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${iconColors[color as keyof typeof iconColors]}`}>
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/80 text-sm mb-6 flex-1">{description}</p>
      <Link to={to} className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-center backdrop-blur-sm transition-colors flex items-center justify-center gap-2">
        {action} <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function StatCard({ value, label, subtext, icon: Icon, iconColor, iconBg }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${iconBg} ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="font-medium text-slate-900 mb-1">{label}</div>
      <div className="text-xs text-slate-500">{subtext}</div>
    </div>
  );
}
