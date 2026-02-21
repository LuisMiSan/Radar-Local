import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Settings, 
  CreditCard, 
  LogOut,
  Search,
  Plus,
  Zap,
  Globe,
  MapPin,
  MessageSquare,
  Mic
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: BarChart3, label: "Audit", path: "/audit" },
  { icon: FileText, label: "Reports", path: "/reports" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: CreditCard, label: "Billing", path: "/billing" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          A
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-lg leading-none">Aletheo</h1>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Free</span>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
            LG
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-900 truncate">LuisMi Glez</p>
            <p className="text-xs text-slate-500 truncate">luismigsm@gmail.com</p>
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
        {bottomItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              location.pathname === item.path
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left">
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </div>
  );
}
