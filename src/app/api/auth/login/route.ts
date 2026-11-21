import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { phone, pin } = await request.json();

    if (!phone || !pin) {
      return NextResponse.json(
        { error: "يرجى إدخال رقم الهاتف ورمز الدخول" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();

    // البحث عن المستخدم برقم الهاتف
    const user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
      include: { office: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "رقم الهاتف غير مسجل في المنظومة" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "هذا الحساب موقوف، يرجى مراجعة إدارة المكتب" },
        { status: 403 }
      );
    }

    // التحقق من رمز الدخول (PIN / Password)
    const isMatch = await bcrypt.compare(pin.trim(), user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "رمز الدخول غير صحيح" },
        { status: 401 }
      );
    }

    // إنشاء جلسة الدخول
    await createSession({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      officeId: user.officeId,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        office: user.office,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
