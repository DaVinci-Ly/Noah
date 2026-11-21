import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { newStatus, note } = await request.json();
    const user = await getCurrentUser();

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "السيارة غير موجودة" }, { status: 404 });
    }

    const oldStatus = vehicle.status;

    // تحديث الحالة
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: { status: newStatus },
    });

    // إضافة سجل التغيير
    await prisma.statusLog.create({
      data: {
        vehicleId: id,
        oldStatus,
        newStatus,
        note: note || `تغيير الحالة إلى ${newStatus}`,
        changedBy: user?.name || "الموظف",
      },
    });

    return NextResponse.json({ success: true, vehicle: updatedVehicle });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: "فشل تحديث الحالة" }, { status: 500 });
  }
}
