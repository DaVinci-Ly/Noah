"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Calculator,
  TrendingUp,
  Ship,
  DollarSign,
  CheckCircle2,
  Copy,
  Printer,
  Sparkles,
  Info,
} from "lucide-react";
import {
  calculateTotalCost,
  LIBYAN_PORTS,
  calculateAuctionFees,
  estimateTowingFee,
  estimateOceanShipping,
} from "@/lib/calculator";

export default function CalculatorPage() {
  const [bidPrice, setBidPrice] = useState<number>(8500);
  const [auctionName, setAuctionName] = useState<"Copart" | "IAA" | "Other">("Copart");
  const [auctionState, setAuctionState] = useState("GA");
  const [destinationPort, setDestinationPort] = useState("ميناء الخمس");
  const [bodyType, setBodyType] = useState<"Sedan" | "SUV" | "Truck" | "Van">("Sedan");
  const [customsEstimate, setCustomsEstimate] = useState<number>(750);
  const [commission, setCommission] = useState<number>(500);
  const [exchangeRate, setExchangeRate] = useState<number>(7.15);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          if (data.exchangeRate) setExchangeRate(data.exchangeRate);
          if (data.defaultCommission) setCommission(data.defaultCommission);
          if (data.defaultPort) setDestinationPort(data.defaultPort);
        }
      });
  }, []);

  const result = calculateTotalCost({
    bidPrice: Number(bidPrice) || 0,
    auctionName,
    auctionState,
    portOfDischarge: destinationPort,
    bodyType,
    commission: Number(commission) || 500,
    customsEstimate: Number(customsEstimate) || 750,
    exchangeRate: Number(exchangeRate) || 7.15,
  });

  const generateSummaryText = () => {
    return `📋 *عرض تكلفة استيراد سيارة من مزاد ${auctionName} لليبيا:*
- سعر المزاد المتوقع: $${result.bidPrice.toLocaleString()}
- رسوم المزاد التقديرية: $${result.auctionFees.toLocaleString()}
- النقل الداخلي (الساحة → الميناء): $${result.towingFee.toLocaleString()}
- الشحن البحري إلى (${destinationPort}): $${result.shippingFee.toLocaleString()}
- الجمرك والتخليص التقديري: $${result.customsEstimate.toLocaleString()}
- عمولة المكتب وأتعابه: $${result.commission.toLocaleString()}
-----------------------------------
💰 *الإجمالي التقديري الواصل:* $${result.totalUSD.toLocaleString()}
🇱🇾 *بالدينار الليبي (سعر الصرف ${exchangeRate}):* ≈ ${result.totalLYD.toLocaleString()} د.ل
*(الأسعار تقريبية بناءً على شرائح المزاد وأسعار الشحن الحالية)*`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-emerald-600" />
              <span>الحاسبة التقديرية لتكلفة الاستيراد لليبيا</span>
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              حساب فوري شامل: سعر المزاد، رسوم البوابة والمشتري، النقل الداخلي، الشحن البحري، والعمولة
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-sm"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>تم النسخ للواتساب!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>نسخ العرض للزبون</span>
              </>
            )}
          </button>
        </div>

        {/* Inputs & Calculation Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 2 Cols: Inputs */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              بيانات ومحددات التكلفة
            </h3>

            {/* Bid Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                سعر المزايدة المتوقع للسيارة ($)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="100"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xl font-extrabold text-blue-700 en-num focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
                <DollarSign className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Auction & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  المزاد
                </label>
                <select
                  value={auctionName}
                  onChange={(e) => setAuctionName(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
                >
                  <option value="Copart">كوبارت (Copart)</option>
                  <option value="IAA">آي آي (IAA)</option>
                  <option value="Other">مزاد آخر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ولاية ساحة المزاد (أمريكا)
                </label>
                <select
                  value={auctionState}
                  onChange={(e) => setAuctionState(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  <option value="GA">جورجيا (GA - قريب من سافانا $350)</option>
                  <option value="FL">فلوريدا (FL - قريب $350)</option>
                  <option value="TX">تكساس (TX - هيوستن $350)</option>
                  <option value="NJ">نيوجيرسي (NJ $350)</option>
                  <option value="NC">كارولاينا الشمالية (NC $350)</option>
                  <option value="OH">أوهايو (OH - داخلي $550)</option>
                  <option value="MI">ميشيغان (MI - داخلي $550)</option>
                  <option value="CA">كاليفورنيا (CA - غرب بعيد $950)</option>
                </select>
              </div>
            </div>

            {/* Port & Body */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ميناء الوصول في ليبيا
                </label>
                <select
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
                >
                  {LIBYAN_PORTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  نوع وحجم السيارة
                </label>
                <select
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="Sedan">سيدان عادية (Sedan)</option>
                  <option value="SUV">دفع رباعي / جيب (SUV)</option>
                  <option value="Truck">نقل / بيك اب (Truck)</option>
                  <option value="Van">فان / حافلة (Van)</option>
                </select>
              </div>
            </div>

            {/* Commission & Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  عمولة المكتب ($)
                </label>
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold en-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  جمرك تقديري ($)
                </label>
                <input
                  type="number"
                  value={customsEstimate}
                  onChange={(e) => setCustomsEstimate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold en-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  سعر الصرف (د.ل للدولار)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-emerald-700 en-num"
                />
              </div>
            </div>
          </div>

          {/* 1 Col: Result Summary */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-md space-y-4">
              <span className="text-xs text-blue-200 block font-semibold">
                التكلفة الإجمالية الواصلة لليبيا
              </span>

              <div className="border-b border-white/10 pb-4">
                <div className="text-3xl font-extrabold text-white en-num">
                  ${result.totalUSD.toLocaleString()}
                </div>
                <div className="text-lg font-bold text-emerald-400 en-num mt-1">
                  ≈ {result.totalLYD.toLocaleString()} د.ل
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>سعر المزاد:</span>
                  <span className="font-mono en-num text-white">
                    ${result.bidPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>رسوم المزاد (تقديري):</span>
                  <span className="font-mono en-num text-white">
                    ${result.auctionFees.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>النقل الداخلي (Towing):</span>
                  <span className="font-mono en-num text-white">
                    ${result.towingFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>الشحن البحري:</span>
                  <span className="font-mono en-num text-white">
                    ${result.shippingFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>التخليص الجمركي:</span>
                  <span className="font-mono en-num text-white">
                    ${result.customsEstimate.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold pt-2 border-t border-white/10">
                  <span>عمولة المكتب:</span>
                  <span className="font-mono en-num">
                    ${result.commission.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="w-full mt-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? "تم النسخ!" : "نسخ ملخص الحساب"}</span>
              </button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                الرسوم المذكورة محسوبة وفق شرائح المشترين في كوبارت و IAA، وتعتمد تكاليف الشحن على متوسطات الخطوط الملاحية لموانئ ليبيا.
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
