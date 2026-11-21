import React from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { prisma } from "@/lib/db";
import { getStatusBadge } from "@/lib/status-helper";
import {
  Car,
  Clock,
  AlertTriangle,
  Ship,
  CheckCircle2,
  DollarSign,
  Plus,
  ArrowUpRight,
  TrendingUp,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const office = await prisma.office.findFirst();
  const exchangeRate = office?.exchangeRate || 7.15;

  const vehicles = await prisma.vehicle.findMany({
    include: {
      order: {
        include: {
          client: true,
        },
      },
      shippingDetail: true,
      financialRecords: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // حسابات الإحصائيات
  const totalVehicles = vehicles.length;
  const wonVehicles = vehicles.filter((v) => v.status === "WON");
  const inShippingVehicles = vehicles.filter(
    (v) =>
      v.status === "SHIPPED" ||
      v.status === "IN_TRANSIT_US" ||
      v.status === "PICKED_UP" ||
      v.status === "AT_PORT_US"
  );
  const deliveredVehicles = vehicles.filter((v) => v.status === "DELIVERED");

  // حساب المتبقي على الزبائن
  let totalClientBalanceDue = 0;
  vehicles.forEach((v) => {
    const totalExpected = v.actualPurchasePrice
      ? (v.actualPurchasePrice || 0) +
        (v.estAuctionFees || 0) +
        (v.estTowingFee || 0) +
        (v.estShippingFee || 0) +
        (v.estCustomsFee || 0) +
        (v.estCommission || 500)
      : v.estTotal || 0;

    const paidByClient = v.financialRecords
      .filter((f) => f.type === "CLIENT_PAYMENT")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const due = Math.max(0, totalExpected - paidByClient);
    totalClientBalanceDue += due;
  });

  // تنبيهات عاجلة: سيارات رست وتحتاج سداد في المزاد
  const urgentPaymentCars = vehicles.filter(
    (v) => v.status === "WON" && (!v.financialRecords.some((f) => f.type === "AUCTION_PAYMENT"))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome & Quick Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              لوحة المتابعة اليومية
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              متابعة سيارات المزادات، الشحن البحري لموانئ ليبيا، وسجلات الدفعات
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/calculator"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors border border-slate-200"
            >
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>الحاسبة التقديرية</span>
            </Link>

            <Link
              href="/vehicles/new"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سيارة</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Active */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">إجمالي السيارات</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Car className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 en-num">
                {totalVehicles}
              </span>
              <span className="text-xs text-slate-400 mr-2">سيارة مسجلة</span>
            </div>
          </div>

          {/* Card 2: Won - Urgent */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">سيارات رست (فوز)</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-2xl lg:text-3xl font-extrabold text-amber-600 en-num">
                {wonVehicles.length}
              </span>
              <span className="text-xs text-slate-400 mr-2">بانتظار السداد أو النقل</span>
            </div>
          </div>

          {/* Card 3: In Shipping */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">في الشحن والنقل</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Ship className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-2xl lg:text-3xl font-extrabold text-purple-600 en-num">
                {inShippingVehicles.length}
              </span>
              <span className="text-xs text-slate-400 mr-2">في طريقها لليبيا</span>
            </div>
          </div>

          {/* Card 4: Balance Due */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">مستحقات على الزبائن</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-extrabold text-emerald-600 en-num">
                ${totalClientBalanceDue.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 en-num mt-0.5">
                ≈ {(totalClientBalanceDue * exchangeRate).toLocaleString()} د.ل
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Alerts Banner (if any) */}
        {urgentPaymentCars.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900">
                تنبيه: سيارات رست بانتظار سداد فاتورة المزاد لتفادي غرامات التأخير ({urgentPaymentCars.length})
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                كوبارت والآي آي تفرضان غرامة تأخير بعد يومين من انتهاء المزاد (عادة 50$ أو أكثر).
              </p>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {urgentPaymentCars.map((car) => (
                  <Link
                    key={car.id}
                    href={`/vehicles/${car.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-amber-300 text-amber-900 px-3 py-1 rounded-lg hover:bg-amber-100/50 transition-colors"
                  >
                    <span>{car.year} {car.make} {car.model}</span>
                    <span className="text-slate-400 en-num font-mono">#{car.lotNumber}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Table / Card List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">
                أحدث السيارات والمعاملات
              </h3>
            </div>
            <Link
              href="/vehicles"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>عرض كل السيارات</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {vehicles.map((car) => {
              const badge = getStatusBadge(car.status);
              const client = car.order?.client;
              return (
                <div
                  key={car.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left / Car Info */}
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                      {car.mainImageUrl ? (
                        <img
                          src={car.mainImageUrl}
                          alt={car.model}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Car className="w-6 h-6" />
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono en-num">
                        {car.auctionName}
                      </span>
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/vehicles/${car.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 text-base"
                        >
                          {car.year} {car.make} {car.model}
                        </Link>
                        {car.conditionHighlight && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {car.conditionHighlight}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>
                          رقم اللوت:{" "}
                          <strong className="text-slate-800 font-mono en-num">
                            {car.lotNumber}
                          </strong>
                        </span>
                        {car.vin && (
                          <span>
                            الهيكل:{" "}
                            <strong className="text-slate-700 font-mono en-num">
                              {car.vin.slice(0, 8)}...{car.vin.slice(-4)}
                            </strong>
                          </span>
                        )}
                        {client && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{client.name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right / Status & Price */}
                  <div className="flex items-center justify-between md:justify-end gap-5">
                    {/* Status Badge */}
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${badge.bgLight} ${badge.color}`}
                    >
                      {badge.label}
                    </span>

                    {/* Price */}
                    <div className="text-left">
                      <div className="font-extrabold text-slate-900 en-num text-sm">
                        $
                        {(car.actualPurchasePrice || car.estTotal || 0).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {car.actualPurchasePrice ? "سعر الشراء الفعلي" : "إجمالي تقديري"}
                      </div>
                    </div>

                    {/* View Button */}
                    <Link
                      href={`/vehicles/${car.id}`}
                      className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg transition-colors border border-slate-200"
                    >
                      فتح الملف
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
