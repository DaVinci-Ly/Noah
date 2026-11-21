// محرك كاشط وجلب بيانات مزادات Copart و IAA
// يقرأ الرابط أو رقم اللوت، ويستخرج بيانات السيارة، الضرر، الصور، وحالة التشغيل

export interface ScrapedVehicleData {
  lotNumber: string;
  auctionName: "Copart" | "IAA" | "Other";
  auctionUrl: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  bodyClass?: string;
  engine?: string;
  driveType?: string;
  color?: string;
  mileage?: number;
  primaryDamage?: string;
  secondaryDamage?: string;
  conditionHighlight?: string; // Run and Drive, Starts, Stationary...
  titleType?: string;          // Clean Title, Salvage...
  auctionState?: string;       // الولاية (TX, CA, FL, GA...)
  auctionYard?: string;        // الساحة
  currentBid?: number;
  mainImageUrl?: string;
  images?: string[];
  success: boolean;
  message?: string;
}

export function parseAuctionInput(input: string): {
  lotNumber: string;
  auctionName: "Copart" | "IAA" | "Other";
  url: string;
} {
  const cleanInput = input.trim();

  // هل المدخل رابط Copart؟
  if (cleanInput.includes("copart.com")) {
    const lotMatch = cleanInput.match(/lot\/(\d+)/i) || cleanInput.match(/lotNumber=(\d+)/i);
    const lotNumber = lotMatch ? lotMatch[1] : "";
    return {
      lotNumber,
      auctionName: "Copart",
      url: lotNumber ? `https://www.copart.com/lot/${lotNumber}` : cleanInput,
    };
  }

  // هل المدخل رابط IAA؟
  if (cleanInput.includes("iaai.com")) {
    const stockMatch = cleanInput.match(/VehicleDetail\/(\d+)/i) || cleanInput.match(/itemID=(\d+)/i);
    const lotNumber = stockMatch ? stockMatch[1] : "";
    return {
      lotNumber,
      auctionName: "IAA",
      url: lotNumber ? `https://www.iaai.com/VehicleDetail/${lotNumber}~US` : cleanInput,
    };
  }

  // إذا كان المدخل مجرد أرقام (رقم اللوت مباشرة)
  if (/^\d{7,10}$/.test(cleanInput)) {
    return {
      lotNumber: cleanInput,
      auctionName: "Copart", // الافتراضي
      url: `https://www.copart.com/lot/${cleanInput}`,
    };
  }

  return {
    lotNumber: "",
    auctionName: "Other",
    url: cleanInput,
  };
}

export async function scrapeAuctionLot(input: string): Promise<ScrapedVehicleData> {
  const parsed = parseAuctionInput(input);
  const lotNumber = parsed.lotNumber;
  const auctionName = parsed.auctionName;

  if (!lotNumber) {
    return {
      lotNumber: "",
      auctionName: "Other",
      auctionUrl: input,
      success: false,
      message: "لم يتم التعرف على رقم لوت صالح من الرابط أو المدخلات",
    };
  }

  try {
    // محاولة جلب الصفحة عبر User-Agent حقيقي وتفادي الحظر
    const targetUrl = parsed.url;
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const html = await response.text();

      // فحص وجود JSON مخفي في الصفحة (Copart و IAA يضعان بيانات Lot في script tags)
      const jsonMatch = html.match(/\{"lotDetails":\{[\s\S]*?\}\}/) || html.match(/"lotId":/);
      
      // استخراج البيانات الأساسية عبر Regex للسرعة والخفة
      const vinMatch = html.match(/"vin":\s*"([A-HJ-NPR-Z0-9]{17})"/i) || html.match(/VIN:\s*([A-HJ-NPR-Z0-9]{17})/i);
      const yearMatch = html.match(/"year":\s*(\d{4})/i) || html.match(/"modelYear":\s*(\d{4})/i);
      const makeMatch = html.match(/"make":\s*"([^"]+)"/i) || html.match(/"vehicleMake":\s*"([^"]+)"/i);
      const modelMatch = html.match(/"modelGroup":\s*"([^"]+)"/i) || html.match(/"model":\s*"([^"]+)"/i);
      const odometerMatch = html.match(/"odometer":\s*(\d+)/i) || html.match(/Odometer:\s*([\d,]+)/i);
      const damageMatch = html.match(/"primaryDamage":\s*"([^"]+)"/i) || html.match(/Primary Damage:\s*([^<]+)/i);
      const highlightMatch = html.match(/"runAndDrive":\s*(true|false)/i) || html.match(/Run &amp; Drive/i) ? "Run and Drive" : undefined;
      const titleMatch = html.match(/"saleTitleType":\s*"([^"]+)"/i) || html.match(/Title:\s*([^<]+)/i);
      const imageMatch = html.match(/https:\/\/[^"]+copart_lot_images[^"]+\.JPG/i) || html.match(/https:\/\/images\.iaai\.com\/vehicledetails\/[^"]+\.jpg/i);

      if (makeMatch || yearMatch || vinMatch) {
        return {
          lotNumber,
          auctionName,
          auctionUrl: targetUrl,
          vin: vinMatch ? vinMatch[1] : undefined,
          make: makeMatch ? makeMatch[1] : undefined,
          model: modelMatch ? modelMatch[1] : undefined,
          year: yearMatch ? parseInt(yearMatch[1], 10) : undefined,
          mileage: odometerMatch ? parseInt(odometerMatch[1].replace(/,/g, ""), 10) : undefined,
          primaryDamage: damageMatch ? damageMatch[1].trim() : undefined,
          conditionHighlight: highlightMatch || "Run and Drive",
          titleType: titleMatch ? titleMatch[1].trim() : "Salvage Certificate",
          mainImageUrl: imageMatch ? imageMatch[0] : undefined,
          success: true,
          message: "تم جلب بيانات اللوت بنجاح من المزاد",
        };
      }
    }
  } catch (err) {
    console.warn("Direct auction fetch hit WAF/challenge, falling back to structured templates:", err);
  }

  // في حال واجه الطلب جدار حماية (Akamai/Cloudflare challenge)
  // نرجع رقم اللوت ورابط المزاد ليتمكن الموظف من إكماله، أو تفكيك VIN تلقائياً
  return {
    lotNumber,
    auctionName,
    auctionUrl: parsed.url,
    success: false,
    message: "تم تجهيز رابط المزاد ورقم اللوت، يرجى مراجعة الحقول أو إدخال VIN لجلب بيانات المصنع تلقائياً",
  };
}
