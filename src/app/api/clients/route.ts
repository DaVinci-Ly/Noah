import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const clients = await prisma.client.findMany({
    include: {
      orders: {
        include: {
          vehicles: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const data = await request.json();

    const office = await prisma.office.findFirst();
    const officeId = user?.officeId || office?.id;

    if (!officeId) {
      return NextResponse.json({ error: "لا يوجد مكتب مسجل" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        name: data.name,
        phone: data.phone,
        whatsapp: data.whatsapp || data.phone,
        city: data.city || "طرابلس",
        notes: data.notes || "",
        officeId,
      },
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json({ error: "فشل إضافة العميل" }, { status: 500 });
  }
}
