import { NextResponse } from "next/server";
import { decodeVin } from "@/lib/vin-decoder";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vin = searchParams.get("vin");

  if (!vin) {
    return NextResponse.json({ error: "VIN required" }, { status: 400 });
  }

  const result = await decodeVin(vin);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { vin } = await request.json();
  if (!vin) {
    return NextResponse.json({ error: "VIN required" }, { status: 400 });
  }

  const result = await decodeVin(vin);
  return NextResponse.json(result);
}
