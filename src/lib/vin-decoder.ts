// جلب بيانات السيارة الرسمية المجانية من وكالة السلامة المرورية الأمريكية NHTSA vPIC
// https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{vin}?format=json

export interface DecodedVinData {
  vin: string;
  make: string;
  model: string;
  year: number;
  bodyClass?: string;
  engine?: string;
  driveType?: string;
  fuelType?: string;
  plantCountry?: string;
  raw?: Record<string, string>;
  success: boolean;
  message?: string;
}

export async function decodeVin(vin: string): Promise<DecodedVinData> {
  const cleanVin = vin.trim().toUpperCase();
  if (cleanVin.length !== 17) {
    return {
      vin: cleanVin,
      make: "",
      model: "",
      year: 0,
      success: false,
      message: "رقم الهيكل VIN يجب أن يتكون من 17 حرفاً ورقماً",
    };
  }

  try {
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${cleanVin}?format=json`;
    const res = await fetch(url, { next: { revalidate: 86400 } });

    if (!res.ok) {
      throw new Error(`NHTSA API error: ${res.statusText}`);
    }

    const json = await res.json();
    const result = json.Results?.[0];

    if (!result || !result.Make) {
      return {
        vin: cleanVin,
        make: "",
        model: "",
        year: 0,
        success: false,
        message: "لم يتم العثور على بيانات لهذا الرقم، يرجى إدخالها يدوياً",
      };
    }

    // تجهيز المحرك
    const engineParts = [];
    if (result.DisplacementL) engineParts.push(`${result.DisplacementL}L`);
    if (result.EngineCylinders) engineParts.push(`${result.EngineCylinders} Cyl`);
    if (result.EngineHP) engineParts.push(`${result.EngineHP} HP`);
    const engine = engineParts.length > 0 ? engineParts.join(" ") : result.EngineModel || "";

    return {
      vin: cleanVin,
      make: result.Make || "",
      model: result.Model || "",
      year: parseInt(result.ModelYear, 10) || 0,
      bodyClass: result.BodyClass || "",
      engine,
      driveType: result.DriveType || "",
      fuelType: result.FuelTypePrimary || "",
      plantCountry: result.PlantCountry || "",
      success: true,
      raw: result,
    };
  } catch (error) {
    console.error("VIN decode failed:", error);
    return {
      vin: cleanVin,
      make: "",
      model: "",
      year: 0,
      success: false,
      message: "تعذر الاتصال بخدمة فك رقم الهيكل، يمكنك كتابة البيانات يدوياً",
    };
  }
}
