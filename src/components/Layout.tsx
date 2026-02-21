import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 pl-64">
      <Sidebar />
      <main className="p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
