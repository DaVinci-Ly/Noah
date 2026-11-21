import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const data = await request.json();

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "السيارة غير موجودة" }, { status: 404 });
    }

    const record = await prisma.financialRecord.create({
      data: {
        vehicleId: id,
        officeId: vehicle.officeId,
        type: data.type,
        amount: Number(data.amount) || 0,
        currency: data.currency || "USD",
        exchangeRate: Number(data.exchangeRate) || 1.0,
        receiptNumber: data.receiptNumber || "",
        note: data.note || "",
        recordedBy: user?.name || "الموظف",
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("Financial record error:", error);
    return NextResponse.json({ error: "فشل تسجيل الحركة المالية" }, { status: 500 });
  }
}
