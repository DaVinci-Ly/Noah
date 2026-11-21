// حاسبة تكاليف استيراد السيارات من المزادات الأمريكية إلى موانئ ليبيا

export interface CalculatorInput {
  bidPrice: number;            // سعر السيارة المتوقع في المزاد (بالدولار)
  auctionName: "Copart" | "IAA" | "Other";
  auctionState?: string;       // الولاية (TX, CA, FL, GA, NJ...)
  portOfDischarge?: string;    // ميناء الوصول في ليبيا (الخمس، بنغازي، مصراتة، طرابلس)
  bodyType?: "Sedan" | "SUV" | "Truck" | "Van";
  commission?: number;         // عمولة المكتب (افتراضي 500$)
  exchangeRate?: number;       // سعر صرف الدولار بالدينار الليبي
  customsEstimate?: number;    // جمرك تقديري
}

export interface CalculatorResult {
  bidPrice: number;
  auctionFees: number;         // رسوم المزاد + البوابة + رسوم البيئة
  towingFee: number;           // النقل الداخلي للساحة
  shippingFee: number;         // الشحن البحري
  customsEstimate: number;     // تقدير الجمرك والتخليص
  commission: number;          // عمولة المكتب
  totalUSD: number;            // الإجمالي بالدولار
  totalLYD: number;            // الإجمالي بالدينار الليبي
  exchangeRate: number;
}

// حساب رسوم المزاد التقريبية لكوبارت و IAA بناءً على شريحة السعر
export function calculateAuctionFees(bidPrice: number, auction: "Copart" | "IAA" | "Other"): number {
  if (bidPrice <= 0) return 0;
  
  // رسوم أساسية: رسوم بوابة (Gate Fee 79-99$) + رسوم بيئة وإنترنت (Internet Fee 119$)
  const baseFees = auction === "Copart" ? 220 : 210;
  
  // Buyer Fee حسب شريحة السعر
  let buyerFee = 0;
  if (bidPrice < 1000) {
    buyerFee = 180;
  } else if (bidPrice < 2000) {
    buyerFee = 280;
  } else if (bidPrice < 3000) {
    buyerFee = 380;
  } else if (bidPrice < 4000) {
    buyerFee = 480;
  } else if (bidPrice < 6000) {
    buyerFee = 600;
  } else if (bidPrice < 8000) {
    buyerFee = 720;
  } else if (bidPrice < 10000) {
    buyerFee = 840;
  } else if (bidPrice < 15000) {
    buyerFee = 980;
  } else if (bidPrice < 20000) {
    buyerFee = 1150;
  } else {
    buyerFee = Math.round(bidPrice * 0.065); // حوالي 6.5% للسيارات الأغلى
  }

  return baseFees + buyerFee;
}

// تقدير النقل الداخلي حسب الولاية الأمريكية إلى أقرب ميناء رئيسي (Savannah / New Jersey / Houston)
export function estimateTowingFee(state?: string): number {
  if (!state) return 400; // متوسط
  const cleanState = state.toUpperCase().trim();

  // السواحل الشرقية والجنوبية القريبة من الموانئ
  const lowStates = ["GA", "FL", "SC", "NC", "NJ", "NY", "PA", "TX", "MD", "VA"];
  // الولايات الداخلية
  const midStates = ["OH", "MI", "IN", "IL", "TN", "AL", "MS", "KY", "MO", "AR", "LA"];
  // الغرب البعيد
  const highStates = ["CA", "WA", "OR", "AZ", "NV", "UT", "CO", "NM", "ID", "MT", "WY"];

  if (lowStates.includes(cleanState)) return 350;
  if (midStates.includes(cleanState)) return 550;
  if (highStates.includes(cleanState)) return 950;
  return 450;
}

// تقدير الشحن البحري لموانئ ليبيا
export function estimateOceanShipping(
  port: string = "ميناء الخمس",
  bodyType: string = "Sedan"
): number {
  const isLarge = bodyType === "SUV" || bodyType === "Truck" || bodyType === "Van";
  const sizeSurcharge = isLarge ? 200 : 0;

  switch (port) {
    case "ميناء بنغازي":
      return 1300 + sizeSurcharge;
    case "ميناء الخمس":
      return 1200 + sizeSurcharge;
    case "ميناء مصراتة":
      return 1250 + sizeSurcharge;
    case "ميناء طرابلس":
      return 1300 + sizeSurcharge;
    case "ميناء طبرق":
      return 1350 + sizeSurcharge;
    default:
      return 1250 + sizeSurcharge;
  }
}

// الحاسبة التقديرية الشاملة
export function calculateTotalCost(input: CalculatorInput): CalculatorResult {
  const bidPrice = Number(input.bidPrice) || 0;
  const auctionFees = calculateAuctionFees(bidPrice, input.auctionName || "Copart");
  const towingFee = estimateTowingFee(input.auctionState);
  const shippingFee = estimateOceanShipping(input.portOfDischarge, input.bodyType);
  const customsEstimate = input.customsEstimate !== undefined ? Number(input.customsEstimate) : 750;
  const commission = input.commission !== undefined ? Number(input.commission) : 500;
  const exchangeRate = Number(input.exchangeRate) || 7.15;

  const totalUSD = bidPrice + auctionFees + towingFee + shippingFee + customsEstimate + commission;
  const totalLYD = Math.round(totalUSD * exchangeRate);

  return {
    bidPrice,
    auctionFees,
    towingFee,
    shippingFee,
    customsEstimate,
    commission,
    totalUSD,
    totalLYD,
    exchangeRate,
  };
}

// قائمة موانئ ليبيا الافتراضية
export const LIBYAN_PORTS = [
  "ميناء الخمس",
  "ميناء بنغازي",
  "ميناء مصراتة",
  "ميناء طرابلس",
  "ميناء طبرق",
  "ميناء سرت",
];
