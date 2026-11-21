import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            client: true,
          },
        },
        shippingDetail: true,
        financialRecords: {
          orderBy: { entryDate: "desc" },
        },
        documents: true,
        statusLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "السيارة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Get vehicle error:", error);
    return NextResponse.json({ error: "فشل جلب تفاصيل السيارة" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        lotNumber: data.lotNumber,
        vin: data.vin,
        make: data.make,
        model: data.model,
        year: Number(data.year) || undefined,
        bodyClass: data.bodyClass,
        engine: data.engine,
        driveType: data.driveType,
        color: data.color,
        mileage: Number(data.mileage) || undefined,
        primaryDamage: data.primaryDamage,
        secondaryDamage: data.secondaryDamage,
        conditionHighlight: data.conditionHighlight,
        titleType: data.titleType,
        status: data.status,
        actualPurchasePrice: Number(data.actualPurchasePrice) || undefined,
        auctionInvoiceNum: data.auctionInvoiceNum,
        maxBidApproved: Number(data.maxBidApproved) || undefined,
        approvalNote: data.approvalNote,
      },
    });

    // تحديث الشحن إن وُجد
    if (data.shipping) {
      await prisma.shippingDetail.upsert({
        where: { vehicleId: id },
        create: {
          vehicleId: id,
          ...data.shipping,
        },
        update: {
          ...data.shipping,
        },
      });
    }

    return NextResponse.json({ success: true, vehicle: updated });
  } catch (error) {
    console.error("Update vehicle error:", error);
    return NextResponse.json({ error: "فشل تحديث بيانات السيارة" }, { status: 500 });
  }
}
