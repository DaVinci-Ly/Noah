"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Lock, ArrowLeft, ShieldCheck, Car } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoPhone: string, demoPin: string) => {
    setPhone(demoPhone);
    setPin(demoPin);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 border border-white/20">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">منظومة نـوح</h1>
          <p className="text-blue-100 text-sm mt-1">
            إدارة مزادات واستيراد السيارات (كوبارت و IAA) في ليبيا
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                رقم الهاتف
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white en-num transition-all"
                />
                <Phone className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                رمز المرور (PIN)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white en-num transition-all"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "جاري الدخول..." : "تسجيل الدخول للنظام"}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-3 text-center">
              دخول سريع لتجربة المنظومة:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo("0912345678", "1234")}
                className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-800 text-center transition-colors font-medium"
              >
                حساب المدير
                <span className="block text-[11px] text-slate-500 font-mono en-num mt-0.5">
                  0912345678
                </span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("0923456789", "1234")}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-center transition-colors font-medium"
              >
                حساب الموظف
                <span className="block text-[11px] text-slate-500 font-mono en-num mt-0.5">
                  0923456789
                </span>
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>نظام محلي آمن لا يتطلب بريد إلكتروني أو رسائل SMS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
