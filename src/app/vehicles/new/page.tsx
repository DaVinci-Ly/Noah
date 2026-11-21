"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  Car,
  Search,
  Sparkles,
  DollarSign,
  Calculator,
  User,
  Plus,
  ArrowRight,
  TrendingUp,
  Ship,
  CheckCircle2,
} from "lucide-react";
import {
  calculateTotalCost,
  LIBYAN_PORTS,
  estimateTowingFee,
  estimateOceanShipping,
} from "@/lib/calculator";

export default function NewVehiclePage() {
  const router = useRouter();

  // Auction Input & Scraper
  const [auctionInput, setAuctionInput] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState("");

  // VIN & NHTSA Decode
  const [vinInput, setVinInput] = useState("");
  const [decodingVin, setDecodingVin] = useState(false);

  // Clients
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [isNewClient, setIsNewClient] = useState(false);

  // Vehicle Form Data
  const [lotNumber, setLotNumber] = useState("");
  const [auctionName, setAuctionName] = useState<"Copart" | "IAA" | "Other">("Copart");
  const [auctionUrl, setAuctionUrl] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [bodyClass, setBodyClass] = useState("Sedan");
  const [engine, setEngine] = useState("");
  const [driveType, setDriveType] = useState("FWD");
  const [mileage, setMileage] = useState<number | "">("");
  const [color, setColor] = useState("");
  const [primaryDamage, setPrimaryDamage] = useState("صدمة أمامية");
  const [secondaryDamage, setSecondaryDamage] = useState("");
  const [conditionHighlight, setConditionHighlight] = useState("Run and Drive");
  const [titleType, setTitleType] = useState("Salvage Certificate");
  const [auctionState, setAuctionState] = useState("GA");
  const [destinationPort, setDestinationPort] = useState("ميناء الخمس");

  // Calculator Form Data
  const [bidPrice, setBidPrice] = useState<number>(7500);
  const [customsEstimate, setCustomsEstimate] = useState<number>(750);
  const [commission, setCommission] = useState<number>(500);
  const [exchangeRate, setExchangeRate] = useState<number>(7.15);
  const [maxBidApproved, setMaxBidApproved] = useState<number>(8000);
  const [approvalNote, setApprovalNote] = useState("موافقة عبر الواتساب على حد 8000$");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // جلب الزبائن وإعدادات المكتب
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data);
          if (data.length > 0) setSelectedClientId(data[0].id);
        }
      });

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

  // الحساب التقديري الحي
  const calcResult = calculateTotalCost({
    bidPrice: Number(bidPrice) || 0,
    auctionName,
    auctionState,
    portOfDischarge: destinationPort,
    bodyType: bodyClass as any,
    commission: Number(commission) || 500,
    customsEstimate: Number(customsEstimate) || 750,
    exchangeRate: Number(exchangeRate) || 7.15,
  });

  // تشغيل الكاشط لجلب بيانات كوبارت / IAA
  const handleScrapeAuction = async () => {
    if (!auctionInput.trim()) return;
    setScraping(true);
    setScrapeMessage("");
    setError("");

    try {
      const res = await fetch("/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: auctionInput }),
      });

      const data = await res.json();
      if (data) {
        if (data.lotNumber) setLotNumber(data.lotNumber);
        if (data.auctionName) setAuctionName(data.auctionName);
        if (data.auctionUrl) setAuctionUrl(data.auctionUrl);
        if (data.make) setMake(data.make);
        if (data.model) setModel(data.model);
        if (data.year) setYear(data.year);
        if (data.vin) {
          setVinInput(data.vin);
          // فك VIN أيضاً لملء المحرك والمواصفات
          triggerVinDecode(data.vin);
        }
        if (data.mileage) setMileage(data.mileage);
        if (data.primaryDamage) setPrimaryDamage(data.primaryDamage);
        if (data.conditionHighlight) setConditionHighlight(data.conditionHighlight);
        if (data.titleType) setTitleType(data.titleType);
        if (data.mainImageUrl) setMainImageUrl(data.mainImageUrl);

        setScrapeMessage(data.message || "تم تجهيز البيانات بنجاح");
      }
    } catch (err: any) {
      setScrapeMessage("تعذر الجلب المباشر، يرجى كتابة البيانات أو استخدام فك VIN");
    } finally {
      setScraping(false);
    }
  };

  // فك VIN عبر وكالة السلامة الأمريكية NHTSA
  const triggerVinDecode = async (vinToDecode?: string) => {
    const v = (vinToDecode || vinInput).trim();
    if (v.length !== 17) {
      setError("رقم الهيكل VIN يجب أن يتكون من 17 حرفاً ورقم");
      return;
    }
    setDecodingVin(true);
    setError("");

    try {
      const res = await fetch(`/api/vin/decode?vin=${encodeURIComponent(v)}`);
      const data = await res.json();
      if (data.success) {
        if (data.make) setMake(data.make);
        if (data.model) setModel(data.model);
        if (data.year) setYear(data.year);
        if (data.bodyClass) setBodyClass(data.bodyClass);
        if (data.engine) setEngine(data.engine);
        if (data.driveType) setDriveType(data.driveType);
        setScrapeMessage("تم فك رقم الهيكل بنجاح من قاعدة بيانات المصنع الرسمية!");
      } else {
        setError(data.message || "فشل فك VIN");
      }
    } catch (err: any) {
      setError("تعذر الاتصال بخدمة فك VIN");
    } finally {
      setDecodingVin(false);
    }
  };

  // حفظ السيارة
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!isNewClient && !selectedClientId) {
      setError("يرجى اختيار العميل");
      setSaving(false);
      return;
    }

    if (isNewClient && (!newClientName || !newClientPhone)) {
      setError("يرجى كتابة اسم وهاتف العميل الجديد");
      setSaving(false);
      return;
    }

    try {
      const payload: any = {
        lotNumber: lotNumber || "بدون لوت",
        vin: vinInput,
        auctionName,
        auctionUrl,
        mainImageUrl,
        make: make || "غير محدد",
        model: model || "غير محدد",
        year: Number(year) || 2022,
        bodyClass,
        engine,
        driveType,
        color,
        mileage: mileage ? Number(mileage) : null,
        primaryDamage,
        secondaryDamage,
        conditionHighlight,
        titleType,
        auctionState,
        destinationPort,

        // الأرقام المالية التقديرية
        estPurchasePrice: calcResult.bidPrice,
        estAuctionFees: calcResult.auctionFees,
        estTowingFee: calcResult.towingFee,
        estShippingFee: calcResult.shippingFee,
        estCustomsFee: calcResult.customsEstimate,
        estCommission: calcResult.commission,
        estTotal: calcResult.totalUSD,
        maxBidApproved: Number(maxBidApproved) || calcResult.bidPrice,
        approvalNote,
      };

      if (isNewClient) {
        payload.clientName = newClientName;
        payload.clientPhone = newClientPhone;
      } else {
        payload.clientId = selectedClientId;
      }

      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل حفظ السيارة");

      router.push(`/vehicles/${data.vehicle.id}`);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Title */}
        <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              إضافة سيارة ومعاملة جديدة
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              جلب تلقائي من كوبارت و IAA، فك VIN مجاني، وحساب فوري لتكاليف المزاد والشحن لليبيا
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 py-2 px-3 rounded-xl flex items-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>رجوع</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl">
            {error}
          </div>
        )}

        {scrapeMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{scrapeMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Box 1: Smart Auto-Fetch / Scraper */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                الجلب التلقائي الذكي من المزاد (كوبارت / IAA)
              </h3>
            </div>
            <p className="text-xs text-blue-200 mb-4">
              الصق رابط سيارة كوبارت أو الآي آي، أو اكتب رقم اللوت، وسيقوم النظام باستخراج بيانات السيارة فوراً
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="مثال: https://www.copart.com/lot/58921473 أو رقم اللوت فقط 58921473"
                value={auctionInput}
                onChange={(e) => setAuctionInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm en-num"
              />
              <button
                type="button"
                onClick={handleScrapeAuction}
                disabled={scraping || !auctionInput.trim()}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>{scraping ? "جاري الجلب..." : "جلب البيانات ⚡"}</span>
              </button>
            </div>
          </div>

          {/* Box 2: Client Selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  ربط السيارة بالزبون
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewClient(!isNewClient)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-1.5 px-3 rounded-lg transition-colors"
              >
                {isNewClient ? "اختيار زبون موجود" : "+ تسجيل زبون جديد"}
              </button>
            </div>

            {!isNewClient ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  اختر من قائمة الزبائن المسجلين
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="">-- اختر الزبون --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.phone} ({c.city || "طرابلس"})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    اسم الزبون بالكامل
                  </label>
                  <input
                    type="text"
                    required={isNewClient}
                    placeholder="مثال: علي مفتاح الزوي"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    رقم الهاتف (للتواصل والواتساب)
                  </label>
                  <input
                    type="tel"
                    required={isNewClient}
                    placeholder="0910000000"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm en-num"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Box 3: Vehicle Specs & VIN */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Car className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">
                مواصفات وبيانات السيارة
              </h3>
            </div>

            {/* VIN + NHTSA Button */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                رقم الهيكل VIN (17 حرفاً ورقم)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={17}
                  placeholder="مثال: 4T1B11HK5NU389102"
                  value={vinInput}
                  onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono en-num uppercase focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => triggerVinDecode()}
                  disabled={decodingVin || vinInput.length !== 17}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40 transition-colors shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{decodingVin ? "جاري الفك..." : "فك VIN (NHTSA)"}</span>
                </button>
              </div>
            </div>

            {/* Grid for Make, Model, Year, Body */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  الماركة (Make)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Toyota"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  الموديل (Model)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Camry"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  سنة الصنع (Year)
                </label>
                <input
                  type="number"
                  required
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm en-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  نوع الهيكل
                </label>
                <select
                  value={bodyClass}
                  onChange={(e) => setBodyClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="Sedan">سيدان (Sedan)</option>
                  <option value="SUV">دفع رباعي / جيب (SUV)</option>
                  <option value="Truck">نقل / بيك اب (Truck)</option>
                  <option value="Coupe">كوبيه (Coupe)</option>
                  <option value="Hatchback">هاتشباك (Hatchback)</option>
                </select>
              </div>
            </div>

            {/* Lot, Auction, Mileage, Image */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  رقم اللوت (Lot Number)
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 58921473"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono en-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  المزاد
                </label>
                <select
                  value={auctionName}
                  onChange={(e) => setAuctionName(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
                >
                  <option value="Copart">كوبارت (Copart)</option>
                  <option value="IAA">آي آي (IAA)</option>
                  <option value="Other">مزاد آخر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  العداد بالأميال (Odometer)
                </label>
                <input
                  type="number"
                  placeholder="35000"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm en-num"
                />
              </div>
            </div>

            {/* Condition, Damage, Title Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  حالة التشغيل (Highlights)
                </label>
                <select
                  value={conditionHighlight}
                  onChange={(e) => setConditionHighlight(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-emerald-700"
                >
                  <option value="Run and Drive">تعمل وتسير (Run & Drive)</option>
                  <option value="Starts">تشتغل فقط (Starts)</option>
                  <option value="Does Not Run">لا تعمل (Does Not Run)</option>
                  <option value="Stationary">ثابتة (Stationary)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  نوع الضرر الرئيسي (Damage)
                </label>
                <input
                  type="text"
                  placeholder="صدمة أمامية / خلفية / غرق..."
                  value={primaryDamage}
                  onChange={(e) => setPrimaryDamage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-rose-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  نوع الملكية والوثيقة (Title)
                </label>
                <select
                  value={titleType}
                  onChange={(e) => setTitleType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="Clean Title">ملكية نظيفة (Clean Title)</option>
                  <option value="Salvage Certificate">شهادة خردة (Salvage)</option>
                  <option value="Rebuilt Title">معاد بناؤها (Rebuilt)</option>
                  <option value="Certificate of Destruction">شهادة إتلاف (Parts Only)</option>
                  <option value="Bill of Sale">فاتورة بيع فقط</option>
                </select>
              </div>
            </div>

            {/* Image link */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                رابط الصورة الرئيسية للسيارة (من المزاد)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={mainImageUrl}
                onChange={(e) => setMainImageUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs en-num text-slate-700"
              />
            </div>
          </div>

          {/* Box 4: Interactive Libyan Import Calculator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  الحاسبة التقديرية لتكلفة الاستيراد لليبيا
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                يتم حساب الرسوم والشحن والمصروفات تلقائياً
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  سعر المزاد المتوقع ($)
                </label>
                <input
                  type="number"
                  required
                  value={bidPrice}
                  onChange={(e) => setBidPrice(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-extrabold text-blue-700 en-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ولاية ساحة المزاد بأمريكا
                </label>
                <select
                  value={auctionState}
                  onChange={(e) => setAuctionState(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  <option value="GA">جورجيا (GA - قريب من سافانا $350)</option>
                  <option value="FL">فلوريدا (FL - قريب $350)</option>
                  <option value="TX">تكساس (TX - ميناء هيوستن $350)</option>
                  <option value="NJ">نيوجيرسي (NJ $350)</option>
                  <option value="NC">كارولاينا الشمالية (NC $350)</option>
                  <option value="OH">أوهايو (OH - داخلي $550)</option>
                  <option value="MI">ميشيغان (MI - داخلي $550)</option>
                  <option value="CA">كاليفورنيا (CA - غرب بعيد $950)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ميناء الوصول بليبيا
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
            </div>

            {/* Cost Breakdown Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block">رسوم المزاد التقديرية</span>
                <span className="font-bold text-slate-800 en-num text-sm">
                  ${calcResult.auctionFees.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block">النقل الداخلي (Towing)</span>
                <span className="font-bold text-slate-800 en-num text-sm">
                  ${calcResult.towingFee.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block">الشحن البحري لليبيا</span>
                <span className="font-bold text-slate-800 en-num text-sm">
                  ${calcResult.shippingFee.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block">عمولة المكتب المتفق عليها</span>
                <span className="font-bold text-slate-800 en-num text-sm">
                  ${calcResult.commission.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Total Banner */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-emerald-800 block">
                  التكلفة الإجمالية التقديرية للسيارة (واصلة لليبيا)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-extrabold text-emerald-900 en-num">
                    ${calcResult.totalUSD.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-emerald-700 en-num">
                    ≈ {calcResult.totalLYD.toLocaleString()} د.ل
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                بسعر صرف: <span className="en-num font-bold text-slate-700">{exchangeRate}</span> د.ل
              </div>
            </div>

            {/* Client Approval & Max Bid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الحد الأقصى للمزايدة الذي وافق عليه الزبون ($)
                </label>
                <input
                  type="number"
                  value={maxBidApproved}
                  onChange={(e) => setMaxBidApproved(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 en-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ملاحظات الاتفاق وموافقة الزبون
                </label>
                <input
                  type="text"
                  placeholder="مثال: تمت الموافقة هاتفياً على المزايدة حتى 8000$"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? "جاري الحفظ..." : "حفظ السيارة في المنظومة"}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
