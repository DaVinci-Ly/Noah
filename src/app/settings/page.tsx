"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Settings,
  Building,
  DollarSign,
  Anchor,
  Phone,
  CheckCircle2,
  Users,
} from "lucide-react";
import { LIBYAN_PORTS } from "@/lib/calculator";

export default function SettingsPage() {
  const [office, setOffice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [defaultCommission, setDefaultCommission] = useState<number>(500);
  const [exchangeRate, setExchangeRate] = useState<number>(7.15);
  const [defaultPort, setDefaultPort] = useState("ميناء الخمس");

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setOffice(data);
          setName(data.name || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
          setDefaultCommission(data.defaultCommission || 500);
          setExchangeRate(data.exchangeRate || 7.15);
          setDefaultPort(data.defaultPort || "ميناء الخمس");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          defaultCommission: Number(defaultCommission),
          exchangeRate: Number(exchangeRate),
          defaultPort,
        }),
      });

      if (res.ok) {
        setSavedMessage("تم حفظ الإعدادات بنجاح!");
        setTimeout(() => setSavedMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>إعدادات المكتب والمنظومة</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            تخصيص اسم المكتب، أرقام التواصل، سعر صرف الدولار بالسوق الموازي، والعمولة الافتراضية
          </p>
        </div>

        {savedMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Office Branding */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-600" />
              <span>بيانات وهوية المكتب</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                اسم المكتب (يظهر في الترويسة والإيصالات)
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  رقم هاتف المكتب الرئيسي
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono en-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  عنوان المكتب في ليبيا
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Rates and Commissions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>الأسعار والعملات الافتراضية</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  سعر صرف الدولار (بالدينار الليبي)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-extrabold text-emerald-700 en-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  عمولة المكتب الافتراضية ($)
                </label>
                <input
                  type="number"
                  required
                  value={defaultCommission}
                  onChange={(e) => setDefaultCommission(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 en-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ميناء الوصول الافتراضي
                </label>
                <select
                  value={defaultPort}
                  onChange={(e) => setDefaultPort(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
                >
                  {LIBYAN_PORTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? "جاري الحفظ..." : "حفظ الإعدادات"}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
