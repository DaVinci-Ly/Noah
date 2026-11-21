"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import {
  getStatusBadge,
  STATUS_LIST,
  VEHICLE_STATUSES,
} from "@/lib/status-helper";
import {
  Car,
  Clock,
  DollarSign,
  Ship,
  FileText,
  User,
  ArrowRight,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  Calendar,
  Anchor,
  Edit,
  Truck,
  ShieldAlert,
} from "lucide-react";

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "bidding" | "shipping" | "finance" | "timeline"
  >("overview");

  // Status Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Financial Entry Modal
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [finType, setFinType] = useState("CLIENT_PAYMENT");
  const [finAmount, setFinAmount] = useState<number | "">("");
  const [finCurrency, setFinCurrency] = useState("USD");
  const [finReceipt, setFinReceipt] = useState("");
  const [finNote, setFinNote] = useState("");
  const [finSaving, setFinSaving] = useState(false);

  // Actual purchase update
  const [actualPrice, setActualPrice] = useState<number | "">("");
  const [invoiceNum, setInvoiceNum] = useState("");
  const [updatingActual, setUpdatingActual] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [vehicleId]);

  const fetchVehicle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`);
      const data = await res.json();
      if (data && !data.error) {
        setVehicle(data);
        setNewStatus(data.status);
        if (data.actualPurchasePrice) setActualPrice(data.actualPurchasePrice);
        if (data.auctionInvoiceNum) setInvoiceNum(data.auctionInvoiceNum);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus, note: statusNote }),
      });
      if (res.ok) {
        setShowStatusModal(false);
        setStatusNote("");
        fetchVehicle();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddFinancial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finAmount) return;
    setFinSaving(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/financial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: finType,
          amount: Number(finAmount),
          currency: finCurrency,
          receiptNumber: finReceipt,
          note: finNote,
        }),
      });
      if (res.ok) {
        setShowFinanceModal(false);
        setFinAmount("");
        setFinReceipt("");
        setFinNote("");
        fetchVehicle();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFinSaving(false);
    }
  };

  const handleSaveActualBidding = async () => {
    setUpdatingActual(true);
    try {
      await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actualPurchasePrice: Number(actualPrice) || null,
          auctionInvoiceNum: invoiceNum,
          status: "WON",
        }),
      });
      fetchVehicle();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingActual(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-slate-400">
          جاري تحميل ملف السيارة...
        </div>
      </AppLayout>
    );
  }

  if (!vehicle) {
    return (
      <AppLayout>
        <div className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-800">السيارة غير موجودة</h2>
          <Link
            href="/vehicles"
            className="text-blue-600 font-semibold text-sm mt-3 inline-block"
          >
            العودة لقائمة السيارات
          </Link>
        </div>
      </AppLayout>
    );
  }

  const badge = getStatusBadge(vehicle.status);
  const client = vehicle.order?.client;
  const shipping = vehicle.shippingDetail;
  const financialRecords = vehicle.financialRecords || [];
  const statusLogs = vehicle.statusLogs || [];

  // الحسابات المالية الإجمالية
  const totalCost = vehicle.actualPurchasePrice
    ? (vehicle.actualPurchasePrice || 0) +
      (vehicle.estAuctionFees || 0) +
      (vehicle.estTowingFee || 0) +
      (vehicle.estShippingFee || 0) +
      (vehicle.estCustomsFee || 0) +
      (vehicle.estCommission || 500)
    : vehicle.estTotal || 0;

  const totalPaidByClient = financialRecords
    .filter((f: any) => f.type === "CLIENT_PAYMENT")
    .reduce((sum: number, curr: any) => sum + curr.amount, 0);

  const totalPaidByOffice = financialRecords
    .filter(
      (f: any) =>
        f.type === "AUCTION_PAYMENT" ||
        f.type === "TOWING_FEE" ||
        f.type === "SHIPPING_FEE" ||
        f.type === "CUSTOMS_FEE" ||
        f.type === "OTHER_EXPENSE"
    )
    .reduce((sum: number, curr: any) => sum + curr.amount, 0);

  const remainingOnClient = Math.max(0, totalCost - totalPaidByClient);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4">
            {/* Image Thumbnail */}
            <div className="w-24 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
              {vehicle.mainImageUrl ? (
                <img
                  src={vehicle.mainImageUrl}
                  alt={vehicle.model}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Car className="w-8 h-8" />
                </div>
              )}
              <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded font-mono en-num">
                {vehicle.auctionName}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h2>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-opacity hover:opacity-90 ${badge.bgLight} ${badge.color}`}
                >
                  <span>{badge.label}</span>
                  <Edit className="w-3 h-3 opacity-60" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span>
                  اللوت:{" "}
                  <strong className="text-slate-800 font-mono en-num">
                    {vehicle.lotNumber}
                  </strong>
                </span>
                {vehicle.vin && (
                  <span>
                    الهيكل:{" "}
                    <strong className="text-slate-700 font-mono en-num">
                      {vehicle.vin}
                    </strong>
                  </span>
                )}
                {vehicle.auctionUrl && (
                  <a
                    href={vehicle.auctionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
                  >
                    <span>صفحة المزاد</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <button
              onClick={() => setShowFinanceModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              <span>تسجيل دفعة / مصروف</span>
            </button>

            <button
              onClick={() => setShowStatusModal(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <Clock className="w-4 h-4 text-blue-600" />
              <span>تحديث الحالة</span>
            </button>
          </div>
        </div>

        {/* Financial Quick Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">التكلفة الإجمالية</span>
            <span className="text-base font-extrabold text-slate-900 en-num block mt-0.5">
              ${totalCost.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
            <span className="text-blue-700 font-semibold block">ما دفعه العميل</span>
            <span className="text-base font-extrabold text-blue-800 en-num block mt-0.5">
              ${totalPaidByClient.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
            <span className="text-amber-800 font-semibold block">سدده المكتب</span>
            <span className="text-base font-extrabold text-amber-900 en-num block mt-0.5">
              ${totalPaidByOffice.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
            <span className="text-rose-700 font-semibold block">المتبقي على العميل</span>
            <span className="text-base font-extrabold text-rose-800 en-num block mt-0.5">
              ${remainingOnClient.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 col-span-2 lg:col-span-1">
            <span className="text-emerald-700 font-semibold block">عمولة المكتب</span>
            <span className="text-base font-extrabold text-emerald-800 en-num block mt-0.5">
              ${(vehicle.estCommission || 500).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-sm font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>نظرة عامة والسيارة</span>
          </button>

          <button
            onClick={() => setActiveTab("bidding")}
            className={`px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
              activeTab === "bidding"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>المزايدة والموافقة</span>
          </button>

          <button
            onClick={() => setActiveTab("shipping")}
            className={`px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
              activeTab === "shipping"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>النقل والشحن لليبيا</span>
          </button>

          <button
            onClick={() => setActiveTab("finance")}
            className={`px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
              activeTab === "finance"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>سجل الدفعات والمالية ({financialRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
              activeTab === "timeline"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>السجل الزمني والمستندات</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Specs & Damage */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image banner */}
              {vehicle.mainImageUrl && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <img
                    src={vehicle.mainImageUrl}
                    alt={vehicle.model}
                    className="w-full max-h-96 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* Specs Grid */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
                  المواصفات الفنية المعتمدة
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">الماركة والموديل</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {vehicle.make} {vehicle.model}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">سنة الصنع</span>
                    <span className="font-bold text-slate-800 text-sm en-num">
                      {vehicle.year}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">نوع الهيكل</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {vehicle.bodyClass || "Sedan"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">المحرك</span>
                    <span className="font-bold text-slate-800 text-sm en-num">
                      {vehicle.engine || "غير محدد"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">نظام الدفع</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {vehicle.driveType || "FWD"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">العداد بالأميال</span>
                    <span className="font-bold text-slate-800 text-sm en-num">
                      {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} ميل` : "غير مدخل"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Damage & Condition Highlights */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  <span>حالة السيارة والأضرار بالمزاد</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-emerald-700 font-semibold block mb-1">
                      حالة التشغيل (Highlights)
                    </span>
                    <span className="font-extrabold text-emerald-900 text-sm">
                      {vehicle.conditionHighlight || "Run and Drive"}
                    </span>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <span className="text-rose-700 font-semibold block mb-1">
                      الضرر الرئيسي
                    </span>
                    <span className="font-extrabold text-rose-900 text-sm">
                      {vehicle.primaryDamage || "لا يوجد ضرر مسجل"}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-600 font-semibold block mb-1">
                      نوع الملكية (Title)
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {vehicle.titleType || "Salvage Certificate"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Client Info */}
            <div className="space-y-6">
              {client && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>بيانات العميل / الزبون</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">الاسم</span>
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors"
                      >
                        {client.name}
                      </Link>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">رقم الهاتف</span>
                      <a
                        href={`tel:${client.phone}`}
                        className="font-mono text-slate-800 en-num font-bold text-sm hover:underline"
                      >
                        {client.phone}
                      </a>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">المدينة</span>
                      <span className="font-semibold text-slate-700">
                        {client.city || "طرابلس"}
                      </span>
                    </div>

                    {client.notes && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-400 block mb-0.5">ملاحظات الزبون</span>
                        <p className="text-slate-600 italic">{client.notes}</p>
                      </div>
                    )}

                    {/* WhatsApp Action */}
                    <div className="pt-3">
                      <a
                        href={`https://wa.me/218${client.phone.replace(/^0+/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl transition-colors text-xs"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>مراسلة عبر الواتساب</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Auction Link Box */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 rounded-2xl space-y-3">
                <span className="text-xs text-slate-400 block">مصدر المزاد</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-white">
                    مزاد {vehicle.auctionName}
                  </span>
                  <span className="font-mono text-sm text-amber-400 en-num">
                    #{vehicle.lotNumber}
                  </span>
                </div>
                {vehicle.auctionUrl && (
                  <a
                    href={vehicle.auctionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/15"
                  >
                    <span>فتح رابط السيارة بالمزاد ↗</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bidding & Approval */}
        {activeTab === "bidding" && (
          <div className="space-y-6">
            {/* Approval Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>موافقة العميل والحد الأقصى للمزايدة</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-blue-700 font-semibold block mb-1">
                    الحد الأقصى المعتمد للمزايدة
                  </span>
                  <span className="text-2xl font-extrabold text-blue-900 en-num">
                    ${(vehicle.maxBidApproved || 0).toLocaleString()}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1">توثيق الموافقة</span>
                  <p className="text-slate-800 font-medium text-sm">
                    {vehicle.approvalNote || "تمت الموافقة من العميل"}
                  </p>
                </div>
              </div>
            </div>

            {/* Estimated vs Actual Cost Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">
                  مقارنة التكلفة التقديرية مقابل الفعلية
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تظهر الفروقات تلقائياً لضمان الشفافية مع العميل
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-3.5">البند</th>
                      <th className="p-3.5">التقديري (المعتمد)</th>
                      <th className="p-3.5">الفعلي (المسجل)</th>
                      <th className="p-3.5">الفارق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-800">
                        سعر السيارة في المزاد
                      </td>
                      <td className="p-3.5 font-mono en-num text-slate-600">
                        ${(vehicle.estPurchasePrice || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono en-num font-bold text-slate-900">
                        ${(vehicle.actualPurchasePrice || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono en-num">
                        {vehicle.actualPurchasePrice ? (
                          <span
                            className={
                              vehicle.actualPurchasePrice <= (vehicle.estPurchasePrice || 0)
                                ? "text-emerald-600 font-bold"
                                : "text-rose-600 font-bold"
                            }
                          >
                            {(
                              vehicle.actualPurchasePrice - (vehicle.estPurchasePrice || 0)
                            ).toLocaleString()}
                            $
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-800">رسوم المزاد</td>
                      <td className="p-3.5 font-mono en-num text-slate-600">
                        ${(vehicle.estAuctionFees || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono en-num font-bold text-slate-900">
                        ${(vehicle.estAuctionFees || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono en-num">0$</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-800">
                        النقل الداخلي (Towing)
                      </td>
                      <td className="p-3.5 font-mono en-num text-slate-600">
                        ${(vehicle.estTowingFee || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono en-num font-bold text-slate-900">
                        ${(vehicle.estTowingFee || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono en-num">0$</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-800">
                        الشحن البحري لليبيا
                      </td>
                      <td className="p-3.5 font-mono en-num text-slate-600">
                        ${(vehicle.estShippingFee || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono en-num font-bold text-slate-900">
                        ${(vehicle.estShippingFee || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono en-num">0$</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-semibold text-slate-800">عمولة المكتب</td>
                      <td className="p-3.5 font-mono en-num text-slate-600">
                        ${(vehicle.estCommission || 500).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono en-num font-bold text-slate-900">
                        ${(vehicle.estCommission || 500).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono en-num">0$</td>
                    </tr>
                    <tr className="bg-slate-50/80 font-bold text-sm">
                      <td className="p-3.5 text-slate-900">الإجمالي الكلي</td>
                      <td className="p-3.5 font-mono en-num text-slate-700">
                        ${(vehicle.estTotal || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono en-num text-blue-800">
                        ${totalCost.toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono en-num">
                        {vehicle.actualPurchasePrice ? (
                          <span
                            className={
                              totalCost <= (vehicle.estTotal || 0)
                                ? "text-emerald-700 font-bold"
                                : "text-rose-700 font-bold"
                            }
                          >
                            {(totalCost - (vehicle.estTotal || 0)).toLocaleString()}$
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Won Car Record Box */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                تسجيل بيانات الرسو وفاتورة الشراء
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    سعر الشراء الفعلي بعد الرسو ($)
                  </label>
                  <input
                    type="number"
                    value={actualPrice}
                    onChange={(e) =>
                      setActualPrice(e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="مثال: 9300"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 en-num"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم فاتورة المزاد (Invoice Number)
                  </label>
                  <input
                    type="text"
                    value={invoiceNum}
                    onChange={(e) => setInvoiceNum(e.target.value)}
                    placeholder="COP-2026-9812"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono en-num"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveActualBidding}
                  disabled={updatingActual || !actualPrice}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {updatingActual ? "جاري الحفظ..." : "حفظ سعر الرسو وتحديث الحالة إلى (رست)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Shipping & Logistics */}
        {activeTab === "shipping" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                <Ship className="w-5 h-5 text-blue-600" />
                <span>تفاصيل الشحن والنقل البحري لليبيا</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                {/* 1. الساحة والنقل الداخلي */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-sm mb-3">
                    <Truck className="w-4 h-4 text-slate-600" />
                    <span>النقل الداخلي الأمريكي</span>
                  </span>
                  <div>
                    <span className="text-slate-400 block">ساحة المزاد والولاية:</span>
                    <span className="font-semibold text-slate-800">
                      {shipping?.auctionYard || "غير محدد"} ({shipping?.auctionState || "GA"})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">شركة النقل الداخلي:</span>
                    <span className="font-semibold text-slate-800">
                      {shipping?.towingCompany || "غير مدخلة"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ميناء الشحن (أمريكا):</span>
                    <span className="font-semibold text-slate-800">
                      {shipping?.originPort || "Savannah, GA"}
                    </span>
                  </div>
                </div>

                {/* 2. الشحن البحري والحاوية */}
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5 text-sm mb-3">
                    <Ship className="w-4 h-4 text-blue-600" />
                    <span>الشحن البحري</span>
                  </span>
                  <div>
                    <span className="text-blue-600 block">الخط الملاحي:</span>
                    <span className="font-semibold text-blue-900">
                      {shipping?.shippingCompany || "Grimaldi / Sallaum"}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600 block">رقم الحاوية (Container):</span>
                    <span className="font-mono font-bold text-blue-900 en-num">
                      {shipping?.containerNumber || "لم تحدد بعد"}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600 block">رقم البوليصة (B/L):</span>
                    <span className="font-mono font-bold text-blue-900 en-num">
                      {shipping?.billOfLading || "لم تصدر بعد"}
                    </span>
                  </div>
                </div>

                {/* 3. ميناء الوصول والتخليص */}
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm mb-3">
                    <Anchor className="w-4 h-4 text-emerald-600" />
                    <span>الوصول والتخليص بليبيا</span>
                  </span>
                  <div>
                    <span className="text-emerald-700 block">ميناء الوصول:</span>
                    <span className="font-bold text-emerald-900 text-sm">
                      {shipping?.destinationPort || "ميناء الخمس"}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">المخلص الجمركي:</span>
                    <span className="font-semibold text-emerald-900">
                      {shipping?.customsBroker || "غير محدد"}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">تاريخ الوصول المتوقع (ETA):</span>
                    <span className="font-semibold text-emerald-900 en-num">
                      {shipping?.eta
                        ? new Date(shipping.eta).toLocaleDateString("en-GB")
                        : "غير محدد"}
                    </span>
                  </div>
                </div>
              </div>

              {shipping?.trackingUrl && (
                <div className="pt-2">
                  <a
                    href={shipping.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-blue-600 text-white font-bold text-xs py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <span>تتبع مسار الشحنة على الخط الملاحي ↗</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Financial Ledger */}
        {activeTab === "finance" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    سجل الحركات المالية والدفعات
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    توثيق كل دفعة من العميل، وسداد المزاد، والنقل، والشحن
                  </p>
                </div>
                <button
                  onClick={() => setShowFinanceModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة حركة مالية</span>
                </button>
              </div>

              {financialRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  لا توجد حركات مالية مسجلة بعد لهذه السيارة
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">النوع</th>
                        <th className="p-3.5">المبلغ</th>
                        <th className="p-3.5">رقم الإيصال</th>
                        <th className="p-3.5">البيان / ملاحظات</th>
                        <th className="p-3.5">المسؤول</th>
                        <th className="p-3.5">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {financialRecords.map((item: any) => {
                        const isIncome = item.type === "CLIENT_PAYMENT";
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/70">
                            <td className="p-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                  isIncome
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-slate-100 text-slate-800 border border-slate-200"
                                }`}
                              >
                                {item.type === "CLIENT_PAYMENT"
                                  ? "دفعة من العميل"
                                  : item.type === "AUCTION_PAYMENT"
                                  ? "سداد المزاد"
                                  : item.type === "TOWING_FEE"
                                  ? "نقل داخلي"
                                  : item.type === "SHIPPING_FEE"
                                  ? "شحن بحري"
                                  : item.type === "OFFICE_COMMISSION"
                                  ? "عمولة المكتب"
                                  : "مصروف إضافي"}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold font-mono en-num text-sm">
                              <span
                                className={
                                  isIncome ? "text-emerald-700" : "text-slate-800"
                                }
                              >
                                {isIncome ? "+" : "-"}${item.amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono en-num text-slate-600">
                              {item.receiptNumber || "-"}
                            </td>
                            <td className="p-3.5 text-slate-700">{item.note || "-"}</td>
                            <td className="p-3.5 text-slate-500">
                              {item.recordedBy || "-"}
                            </td>
                            <td className="p-3.5 text-slate-400 font-mono en-num">
                              {new Date(item.entryDate).toLocaleDateString("en-GB")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Timeline & Documents */}
        {activeTab === "timeline" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>السجل الزمني لتطور حالة المعاملة</span>
            </h3>

            {statusLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                لا توجد تحديثات مسجلة بعد
              </p>
            ) : (
              <div className="relative border-r-2 border-slate-200 pr-5 space-y-6 mr-2">
                {statusLogs.map((log: any) => {
                  const logBadge = getStatusBadge(log.newStatus);
                  return (
                    <div key={log.id} className="relative">
                      {/* Dot */}
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white absolute -right-[27px] top-1 shadow-sm" />

                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${logBadge.bgLight} ${logBadge.color}`}
                        >
                          {logBadge.label}
                        </span>
                        <span className="text-[11px] text-slate-400 en-num font-mono">
                          {new Date(log.createdAt).toLocaleString("en-GB")}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium">{log.note}</p>
                      {log.changedBy && (
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          المسؤول: {log.changedBy}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Change Status */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              تحديث مرحلة وحالة السيارة
            </h3>

            <form onSubmit={handleStatusChange} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  الحالة الجديدة
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
                >
                  {STATUS_LIST.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ملاحظات التحديث
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="مثال: تم إبحار الباخرة من ميناء سافانا..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={statusUpdating}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {statusUpdating ? "جاري التحديث..." : "تأكيد التحديث"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Financial Entry */}
      {showFinanceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>تسجيل حركة مالية / دفعة</span>
            </h3>

            <form onSubmit={handleAddFinancial} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  نوع الحركة
                </label>
                <select
                  value={finType}
                  onChange={(e) => setFinType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
                >
                  <option value="CLIENT_PAYMENT">دفعة من العميل (وارد)</option>
                  <option value="AUCTION_PAYMENT">سداد فاتورة المزاد (مصروف)</option>
                  <option value="TOWING_FEE">نقل داخلي Towing (مصروف)</option>
                  <option value="SHIPPING_FEE">شحن بحري لليبيا (مصروف)</option>
                  <option value="CUSTOMS_FEE">تخليص جمركي (مصروف)</option>
                  <option value="OFFICE_COMMISSION">عمولة المكتب (أرباح)</option>
                  <option value="OTHER_EXPENSE">مصروف آخر</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    المبلغ
                  </label>
                  <input
                    type="number"
                    required
                    value={finAmount}
                    onChange={(e) =>
                      setFinAmount(e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="1000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-extrabold text-slate-900 en-num"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    العملة
                  </label>
                  <select
                    value={finCurrency}
                    onChange={(e) => setFinCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
                  >
                    <option value="USD">دولار أمريكي ($)</option>
                    <option value="LYD">دينار ليبي (د.ل)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  رقم الإيصال / السند (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="REC-1049"
                  value={finReceipt}
                  onChange={(e) => setFinReceipt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono en-num"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  البيان والملاحظة
                </label>
                <input
                  type="text"
                  placeholder="دفعة نقدية كاش..."
                  value={finNote}
                  onChange={(e) => setFinNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFinanceModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={finSaving || !finAmount}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {finSaving ? "جاري الحفظ..." : "تسجيل الحركة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
