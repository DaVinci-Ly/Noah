"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Users,
  Calculator,
  Settings,
  LogOut,
  Plus,
  Search,
  Menu,
  X,
  TrendingUp,
  Anchor,
  Phone,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [office, setOffice] = useState<{
    name: string;
    phone: string;
    exchangeRate: number;
    defaultPort: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setOffice(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navItems = [
    { label: "لوحة المتابعة", href: "/dashboard", icon: LayoutDashboard },
    { label: "السيارات والمعاملات", href: "/vehicles", icon: Car },
    { label: "الزبائن والعملاء", href: "/clients", icon: Users },
    { label: "حاسبة التكاليف", href: "/calculator", icon: Calculator },
    { label: "إعدادات المكتب", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-200 border-l border-slate-800 shrink-0 select-none">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
                ن
              </span>
              <span className="font-bold text-xl tracking-wide text-white">منظومة نوح</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">
              {office?.name || "مكتب استيراد السيارات"}
            </p>
          </div>
        </div>

        {/* Quick Rate & Port Info */}
        <div className="mx-4 my-3 p-3 rounded-lg bg-slate-800/70 border border-slate-700/50 text-xs">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              سعر الدولار:
            </span>
            <span className="font-bold text-emerald-400 en-num">
              {office?.exchangeRate ? office.exchangeRate.toFixed(2) : "7.15"} د.ل
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <Anchor className="w-3.5 h-3.5 text-blue-400" />
              الميناء الرئيسي:
            </span>
            <span className="text-slate-200 truncate">{office?.defaultPort || "الخمس"}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Add Button */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href="/vehicles/new"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سيارة جديدة</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 py-2 px-3 rounded-lg text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
            ن
          </span>
          <span className="font-bold text-lg">منظومة نوح</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/vehicles/new"
            className="bg-emerald-600 p-2 rounded-lg text-white text-xs flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>سيارة</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2 text-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>سعر الصرف: {office?.exchangeRate || 7.15} د.ل</span>
            <button onClick={handleLogout} className="text-rose-400 py-1">
              خروج
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 py-3 px-6 hidden md:flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-800">
              {office?.name || "مكتب استيراد السيارات والآليات"}
            </h1>
            <div className="flex items-center gap-2 text-xs bg-slate-100 text-slate-600 py-1 px-2.5 rounded-md border border-slate-200">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span className="en-num">{office?.phone || "0912345678"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>الدولار بالسوق الموازي:</span>
              <span className="en-num text-sm font-bold text-emerald-700">
                {office?.exchangeRate ? office.exchangeRate.toFixed(2) : "7.15"} د.ل
              </span>
            </div>

            <Link
              href="/vehicles/new"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة سيارة</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
