"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  Car,
  MapPin,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Client Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("طرابلس");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, city, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إضافة الزبون");

      setShowAddModal(false);
      setName("");
      setPhone("");
      setNotes("");
      fetchClients();
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setSaving(false);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              دليل الزبائن والعملاء
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              ملف رقمي دائم لكل زبون يجمع طلباته، سياراته، ودفعاته عبر الزمن
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة زبون جديد</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="بحث بالاسم أو رقم الهاتف أو المدينة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Grid of Clients */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            جاري تحميل قائمة الزبائن...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">لا يوجد زبائن مسجلين</h3>
            <p className="text-xs text-slate-400 mt-1">
              أضف أول زبون للبدء في فتح طلبات السيارات
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-xl"
            >
              + إضافة زبون
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              const ordersCount = client.orders?.length || 0;
              const totalVehicles =
                client.orders?.reduce(
                  (acc: number, o: any) => acc + (o.vehicles?.length || 0),
                  0
                ) || 0;

              return (
                <div
                  key={client.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors"
                      >
                        {client.name}
                      </Link>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {client.city || "طرابلس"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a
                          href={`tel:${client.phone}`}
                          className="font-mono en-num font-bold text-slate-700 hover:underline"
                        >
                          {client.phone}
                        </a>
                      </div>
                      {client.notes && (
                        <p className="text-slate-500 line-clamp-2 italic pt-1">
                          {client.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Car className="w-4 h-4 text-blue-600" />
                      <span>
                        <strong className="text-slate-900 en-num font-bold">
                          {totalVehicles}
                        </strong>{" "}
                        سيارات
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/218${client.phone.replace(/^0+/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="مراسلة واتساب"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 py-1 px-2.5 rounded-lg flex items-center gap-1"
                      >
                        <span>الملف</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add Client */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>إضافة زبون جديد</span>
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddClient} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    اسم الزبون بالكامل
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: عبد الحكيم الطاهر الشيباني"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    رقم الهاتف (للاتصال والواتساب)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0910000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm en-num"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    المدينة
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="طرابلس">طرابلس</option>
                    <option value="بنغازي">بنغازي</option>
                    <option value="مصراتة">مصراتة</option>
                    <option value="الخمس">الخمس</option>
                    <option value="الزاوية">الزاوية</option>
                    <option value="طبرق">طبرق</option>
                    <option value="سبها">سبها</option>
                    <option value="سرت">سرت</option>
                    <option value="أخرى">مدينة أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ملاحظات عن تفضيلات الزبون (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="يفضل سيارات تويوتا أو كيا، زبون تاجر..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {saving ? "جاري الحفظ..." : "حفظ الزبون"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
