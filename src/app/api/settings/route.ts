import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const office = await prisma.office.findFirst();
  return NextResponse.json(office);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const office = await prisma.office.findFirst();

    if (!office) {
      return NextResponse.json({ error: "لا يوجد مكتب" }, { status: 404 });
    }

    const updated = await prisma.office.update({
      where: { id: office.id },
      data: {
        name: data.name ?? office.name,
        phone: data.phone ?? office.phone,
        address: data.address ?? office.address,
        defaultCommission: Number(data.defaultCommission) || office.defaultCommission,
        exchangeRate: Number(data.exchangeRate) || office.exchangeRate,
        defaultPort: data.defaultPort ?? office.defaultPort,
      },
    });

    return NextResponse.json({ success: true, office: updated });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "فشل تحديث الإعدادات" }, { status: 500 });
  }
}
