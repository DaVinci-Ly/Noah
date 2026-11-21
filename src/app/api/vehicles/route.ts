import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { lotNumber: { contains: search } },
      { vin: { contains: search } },
      { make: { contains: search } },
      { model: { contains: search } },
      { order: { client: { name: { contains: search } } } },
      { order: { client: { phone: { contains: search } } } },
    ];
  }

  const vehicles = await prisma.vehicle.findMany({
    where,
    include: {
      order: {
        include: {
          client: true,
        },
      },
      shippingDetail: true,
      financialRecords: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vehicles);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const data = await request.json();

    // الحصول على أو إنشاء طلب للعميل
    let orderId = data.orderId;
    let clientId = data.clientId;

    const office = await prisma.office.findFirst();
    const officeId = user?.officeId || office?.id;

    if (!officeId) {
      return NextResponse.json({ error: "لا يوجد مكتب مسجل" }, { status: 400 });
    }

    // إذا تم تمرير عميل جديد
    if (!clientId && data.clientName && data.clientPhone) {
      const newClient = await prisma.client.create({
        data: {
          name: data.clientName,
          phone: data.clientPhone,
          whatsapp: data.clientWhatsapp || data.clientPhone,
          city: data.clientCity || "طرابلس",
          officeId,
        },
      });
      clientId = newClient.id;
    }

    if (!orderId && clientId) {
      const newOrder = await prisma.order.create({
        data: {
          clientId,
          officeId,
          status: "ACTIVE",
          notes: `طلب شراء ${data.make || ""} ${data.model || ""} ${data.year || ""}`,
        },
      });
      orderId = newOrder.id;
    }

    if (!orderId) {
      return NextResponse.json({ error: "يرجى تحديد العميل أو إنشاء طلب" }, { status: 400 });
    }

    // إنشاء السيارة
    const vehicle = await prisma.vehicle.create({
      data: {
        orderId,
        officeId,
        lotNumber: data.lotNumber || "بدون لوت",
        vin: data.vin || "",
        auctionName: data.auctionName || "Copart",
        auctionUrl: data.auctionUrl || "",
        mainImageUrl: data.mainImageUrl || "",
        make: data.make || "غير محدد",
        model: data.model || "غير محدد",
        year: Number(data.year) || new Date().getFullYear(),
        bodyClass: data.bodyClass || "Sedan",
        engine: data.engine || "",
        driveType: data.driveType || "",
        color: data.color || "",
        mileage: Number(data.mileage) || null,
        primaryDamage: data.primaryDamage || "",
        secondaryDamage: data.secondaryDamage || "",
        conditionHighlight: data.conditionHighlight || "Run and Drive",
        titleType: data.titleType || "Salvage Certificate",
        status: data.status || "PENDING_APPROVAL",
        
        // الأرقام التقديرية
        estPurchasePrice: Number(data.estPurchasePrice) || 0,
        estAuctionFees: Number(data.estAuctionFees) || 0,
        estTowingFee: Number(data.estTowingFee) || 0,
        estShippingFee: Number(data.estShippingFee) || 0,
        estCustomsFee: Number(data.estCustomsFee) || 0,
        estCommission: Number(data.estCommission) || 500,
        estTotal: Number(data.estTotal) || 0,
        maxBidApproved: Number(data.maxBidApproved) || 0,
        approvalNote: data.approvalNote || "",
      },
    });

    // إنشاء تفاصيل الشحن الافتراضية
    await prisma.shippingDetail.create({
      data: {
        vehicleId: vehicle.id,
        auctionState: data.auctionState || "",
        auctionYard: data.auctionYard || "",
        destinationPort: data.destinationPort || office?.defaultPort || "ميناء الخمس",
      },
    });

    // تسجيل في سجل الحالات
    await prisma.statusLog.create({
      data: {
        vehicleId: vehicle.id,
        newStatus: vehicle.status,
        note: "تمت إضافة السيارة إلى المنظومة",
        changedBy: user?.name || "الموظف",
      },
    });

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("Create vehicle error:", error);
    return NextResponse.json({ error: "فشل إنشاء السيارة" }, { status: 500 });
  }
}
