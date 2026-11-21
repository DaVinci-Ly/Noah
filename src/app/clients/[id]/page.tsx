"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { getStatusBadge } from "@/lib/status-helper";
import {
  User,
  Phone,
  MessageSquare,
  Car,
  Plus,
  ArrowRight,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = params.id as string;
  const router = useRouter();

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  const fetchClient = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      const list = await res.json();
      const found = list.find((c: any) => c.id === clientId);
      setClient(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-slate-400">جاري تحميل ملف العميل...</div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout>
        <div className="p-12 text-center">
          <h2 className="text-lg font-bold text-slate-800">العميل غير موجود</h2>
          <Link href="/clients" className="text-blue-600 font-semibold text-sm mt-3 inline-block">
            العودة للزبائن
          </Link>
        </div>
      </AppLayout>
    );
  }

  const allVehicles: any[] = [];
  client.orders?.forEach((o: any) => {
    if (o.vehicles) {
      allVehicles.push(...o.vehicles);
    }
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
              {client.name.slice(0, 1)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono en-num font-bold">{client.phone}</span>
                </span>
                <span>•</span>
                <span>{client.city || "طرابلس"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/218${client.phone.replace(/^0+/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>واتساب</span>
            </a>

            <Link
              href="/vehicles/new"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>طلب سيارة للزبون</span>
            </Link>
          </div>
        </div>

        {/* Client's Vehicles History */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              سجل سيارات وطلبات الزبون ({allVehicles.length})
            </h3>
          </div>

          {allVehicles.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              لم تسجل أي سيارات لهذا الزبون حتى الآن
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {allVehicles.map((car) => {
                const badge = getStatusBadge(car.status);
                return (
                  <div
                    key={car.id}
                    className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        {car.mainImageUrl ? (
                          <img
                            src={car.mainImageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Car className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div>
                        <Link
                          href={`/vehicles/${car.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 text-sm"
                        >
                          {car.year} {car.make} {car.model}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>
                            لوت: <strong className="font-mono en-num text-slate-700">{car.lotNumber}</strong>
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bgLight} ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-left font-mono en-num font-bold text-sm text-slate-900">
                        ${(car.actualPurchasePrice || car.estTotal || 0).toLocaleString()}
                      </div>
                      <Link
                        href={`/vehicles/${car.id}`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
                      >
                        <span>فتح الملف</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
