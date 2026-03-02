import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut,
  Globe
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { useLanguage } from "../context/LanguageContext";

export function Sidebar() {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  const navItems = [
    { icon: LayoutDashboard, label: language === 'es' ? 'Pipeline de Leads' : 'Leads Pipeline', path: "/" },
    { icon: PlusCircle, label: language === 'es' ? 'Nueva Auditoría' : 'New Audit', path: "/audit" },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
            G
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-none">Gemini Maps</h1>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Audit Tool</span>
          </div>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
            LG
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-900 truncate">LuisMi Glez</p>
            <p className="text-xs text-slate-500 truncate">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              location.pathname === item.path
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-100 space-y-1">
        <button 
          onClick={toggleLanguage}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
        >
          <Globe size={20} />
          {language === 'es' ? 'English' : 'Español'}
        </button>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left">
          <LogOut size={20} />
          {t('logout')}
        </button>
      </div>
    </div>
  );
}
