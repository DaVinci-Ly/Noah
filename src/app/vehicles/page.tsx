"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { getStatusBadge } from "@/lib/status-helper";
import {
  Car,
  Search,
  Plus,
  Filter,
  User,
  ArrowUpRight,
  ExternalLink,
  Phone,
} from "lucide-react";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === "ALL"
          ? `/api/vehicles${search ? `?search=${encodeURIComponent(search)}` : ""}`
          : `/api/vehicles?status=${statusFilter}${
              search ? `&search=${encodeURIComponent(search)}` : ""
            }`;
      const res = await fetch(url);
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles();
  };

  const tabs = [
    { key: "ALL", label: "جميع السيارات" },
    { key: "PENDING_APPROVAL", label: "بانتظار الموافقة" },
    { key: "WON", label: "رست (فوز)" },
    { key: "SHIPPED", label: "في الشحن البحري" },
    { key: "DELIVERED", label: "تم التسليم" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              إدارة السيارات والمعاملات
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              سجل كل سيارة يربط المزاد، الموافقة، الشحن، الحسابات المالية، والمستندات
            </p>
          </div>

          <Link
            href="/vehicles/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سيارة جديدة</span>
          </Link>
        </div>

        {/* Filter Tabs & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b md:border-b-0 pb-3 md:pb-0 border-slate-100">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="رقم اللوت / الهيكل / اسم الزبون..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
            >
              بحث
            </button>
          </form>
        </div>

        {/* List of Vehicles */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              جاري تحميل بيانات السيارات...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-12 text-center">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">لا توجد سيارات مطابقة</h3>
              <p className="text-xs text-slate-400 mt-1">
                جرب تغيير خيارات البحث أو قم بإضافة سيارة جديدة
              </p>
              <Link
                href="/vehicles/new"
                className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-xl mt-4"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سيارة الآن</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {vehicles.map((car) => {
                const badge = getStatusBadge(car.status);
                const client = car.order?.client;
                return (
                  <div
                    key={car.id}
                    className="p-4 md:p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Car Header & Specs */}
                    <div className="flex items-start md:items-center gap-4">
                      {/* Image Thumbnail */}
                      <div className="w-24 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                        {car.mainImageUrl ? (
                          <img
                            src={car.mainImageUrl}
                            alt={car.model}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Car className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded font-mono en-num">
                          {car.auctionName}
                        </span>
                      </div>

                      {/* Details */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/vehicles/${car.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 text-lg transition-colors"
                          >
                            {car.year} {car.make} {car.model}
                          </Link>
                          {car.conditionHighlight && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {car.conditionHighlight}
                            </span>
                          )}
                          {car.primaryDamage && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              {car.primaryDamage}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                          <span>
                            اللوت:{" "}
                            <strong className="text-slate-800 font-mono en-num">
                              {car.lotNumber}
                            </strong>
                          </span>
                          {car.vin && (
                            <span>
                              الهيكل:{" "}
                              <strong className="text-slate-700 font-mono en-num">
                                {car.vin}
                              </strong>
                            </span>
                          )}
                          {car.mileage && (
                            <span>
                              العداد:{" "}
                              <strong className="text-slate-700 en-num">
                                {car.mileage.toLocaleString()} ميل
                              </strong>
                            </span>
                          )}
                        </div>

                        {/* Client details */}
                        {client && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold">{client.name}</span>
                            <span className="text-slate-400 en-num font-mono">
                              ({client.phone})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side status & action */}
                    <div className="flex items-center justify-between lg:justify-end gap-5 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                      {/* Badge */}
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${badge.bgLight} ${badge.color}`}
                      >
                        {badge.label}
                      </span>

                      {/* Pricing info */}
                      <div className="text-left">
                        <div className="font-extrabold text-slate-900 en-num text-base">
                          $
                          {(
                            car.actualPurchasePrice ||
                            car.estTotal ||
                            0
                          ).toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {car.actualPurchasePrice ? "شراء فعلي" : "تقديري"}
                        </div>
                      </div>

                      {/* View Button */}
                      <Link
                        href={`/vehicles/${car.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
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
