const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create or get Office
  let office = await prisma.office.findFirst();
  if (!office) {
    office = await prisma.office.create({
      data: {
        name: "مكتب الفارس لاستيراد السيارات والآليات",
        phone: "0912345678",
        address: "طريق الشط، طرابلس - ليبيا",
        logoUrl: "/logo.png",
        primaryColor: "#0270c7",
        defaultCommission: 500.0,
        exchangeRate: 7.15,
        defaultPort: "ميناء الخمس",
      },
    });
  }

  // 2. Create Admin User (Phone: 0912345678, PIN: 1234)
  const pinHash = await bcrypt.hash("1234", 10);
  const existingUser = await prisma.user.findUnique({
    where: { phone: "0912345678" },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        phone: "0912345678",
        name: "إدارة المكتب",
        passwordHash: pinHash,
        role: "ADMIN",
        officeId: office.id,
      },
    });
  }

  // Staff user (Phone: 0923456789, PIN: 1234)
  const existingStaff = await prisma.user.findUnique({
    where: { phone: "0923456789" },
  });

  if (!existingStaff) {
    await prisma.user.create({
      data: {
        phone: "0923456789",
        name: "أحمد الورفلي (مشتريات ومتابعة)",
        passwordHash: pinHash,
        role: "STAFF",
        officeId: office.id,
      },
    });
  }

  // 3. Create Sample Clients
  const client1 = await prisma.client.create({
    data: {
      name: "محمد عبد السلام الفيتوري",
      phone: "0917788990",
      whatsapp: "0917788990",
      city: "طرابلس",
      notes: "زبون دائم، يفضل سيارات هيونداي وتويوتا النظيفة",
      officeId: office.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "طارق علي الترهوني",
      phone: "0925566778",
      whatsapp: "0925566778",
      city: "مصراتة",
      notes: "تاجر محلي، يبحث عن سيارات دفع رباعي SUV",
      officeId: office.id,
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: "سالم محمود العريبي",
      phone: "0941122334",
      whatsapp: "0941122334",
      city: "بنغازي",
      notes: "طلب سيارة شخصية للاستخدام العائلي",
      officeId: office.id,
    },
  });

  // 4. Create Sample Orders
  const order1 = await prisma.order.create({
    data: {
      clientId: client1.id,
      officeId: office.id,
      status: "ACTIVE",
      notes: "تويوتا كامري 2022 - لوت كوبارت",
    },
  });

  const order2 = await prisma.order.create({
    data: {
      clientId: client2.id,
      officeId: office.id,
      status: "ACTIVE",
      notes: "فورد اكسبلورر 2020 - شحن بحري إلى الخمس",
    },
  });

  const order3 = await prisma.order.create({
    data: {
      clientId: client3.id,
      officeId: office.id,
      status: "COMPLETED",
      notes: "كيا سبورتاج 2023 - تم التسليم في بنغازي",
    },
  });

  // 5. Vehicles

  // Vehicle 1: In Shipping (Ford Explorer)
  const v1 = await prisma.vehicle.create({
    data: {
      orderId: order2.id,
      officeId: office.id,
      lotNumber: "58921473",
      vin: "1FM5K8GC8LGA12940",
      auctionName: "Copart",
      auctionUrl: "https://www.copart.com/lot/58921473",
      mainImageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=60",
      make: "Ford",
      model: "Explorer XLT",
      year: 2020,
      bodyClass: "SUV",
      engine: "2.3L EcoBoost 4 Cyl",
      driveType: "4WD",
      color: "أسود ملوكي",
      mileage: 43200,
      primaryDamage: "صدمة خلفية خفيفة",
      secondaryDamage: "خدوش بالصدام",
      conditionHighlight: "Run and Drive",
      titleType: "Salvage Certificate",
      status: "SHIPPED",
      estPurchasePrice: 12500,
      estAuctionFees: 1100,
      estTowingFee: 450,
      estShippingFee: 1350,
      estCustomsFee: 850,
      estCommission: 500,
      estTotal: 16750,
      maxBidApproved: 13000,
      actualPurchasePrice: 12200,
      auctionInvoiceNum: "COP-2026-9812",
      paymentDueDate: new Date(Date.now() - 20 * 86400000),
    },
  });

  await prisma.shippingDetail.create({
    data: {
      vehicleId: v1.id,
      auctionState: "GA",
      auctionYard: "Copart Atlanta South",
      towingCompany: "American Star Towing",
      pickupDate: new Date(Date.now() - 15 * 86400000),
      portArrivalDate: new Date(Date.now() - 12 * 86400000),
      originPort: "Savannah, GA",
      destinationPort: "ميناء الخمس",
      shippingCompany: "Grimaldi Lines",
      bookingNumber: "GRM-LIB-99412",
      containerNumber: "MSCU7829104",
      billOfLading: "MEDU8912401",
      departureDate: new Date(Date.now() - 8 * 86400000),
      eta: new Date(Date.now() + 14 * 86400000),
      trackingUrl: "https://www.grimaldi.napoli.it/tracking",
      customsBroker: "مخلص البركة - الخمس",
    },
  });

  await prisma.financialRecord.createMany({
    data: [
      {
        vehicleId: v1.id,
        officeId: office.id,
        type: "CLIENT_PAYMENT",
        amount: 14000,
        currency: "USD",
        note: "دفعة أولى من الزبون نقداً",
        receiptNumber: "REC-101",
        recordedBy: "إدارة المكتب",
      },
      {
        vehicleId: v1.id,
        officeId: office.id,
        type: "AUCTION_PAYMENT",
        amount: 13250,
        currency: "USD",
        note: "سداد قيمة المزاد والرسوم كاملة",
        receiptNumber: "COP-PAY-882",
        recordedBy: "أحمد الورفلي",
      },
      {
        vehicleId: v1.id,
        officeId: office.id,
        type: "TOWING_FEE",
        amount: 450,
        currency: "USD",
        note: "سداد النقل الداخلي للساحة إلى ميناء سافانا",
        recordedBy: "أحمد الورفلي",
      },
      {
        vehicleId: v1.id,
        officeId: office.id,
        type: "SHIPPING_FEE",
        amount: 1350,
        currency: "USD",
        note: "شحن بحري حاوية مع خط غريمالدي",
        recordedBy: "إدارة المكتب",
      },
      {
        vehicleId: v1.id,
        officeId: office.id,
        type: "OFFICE_COMMISSION",
        amount: 500,
        currency: "USD",
        note: "عمولة المكتب المتفق عليها",
        recordedBy: "إدارة المكتب",
      },
    ],
  });

  // Vehicle 2: Won - Needs auction payment
  const v2 = await prisma.vehicle.create({
    data: {
      orderId: order1.id,
      officeId: office.id,
      lotNumber: "71204891",
      vin: "4T1B11HK5NU389102",
      auctionName: "Copart",
      auctionUrl: "https://www.copart.com/lot/71204891",
      mainImageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=60",
      make: "Toyota",
      model: "Camry SE",
      year: 2022,
      bodyClass: "Sedan",
      engine: "2.5L 4 Cyl",
      driveType: "FWD",
      color: "أبيض لؤلؤي",
      mileage: 28500,
      primaryDamage: "صدمة أمامية",
      secondaryDamage: "أضرار تحتية خفيفة",
      conditionHighlight: "Run and Drive",
      titleType: "Clean Title",
      status: "WON",
      estPurchasePrice: 9500,
      estAuctionFees: 920,
      estTowingFee: 400,
      estShippingFee: 1250,
      estCustomsFee: 700,
      estCommission: 500,
      estTotal: 13270,
      maxBidApproved: 10000,
      actualPurchasePrice: 9300,
      auctionInvoiceNum: "COP-2026-10492",
      paymentDueDate: new Date(Date.now() + 2 * 86400000), // مستحق خلال يومين!
    },
  });

  await prisma.financialRecord.create({
    data: {
      vehicleId: v2.id,
      officeId: office.id,
      type: "CLIENT_PAYMENT",
      amount: 10000,
      currency: "USD",
      note: "دفعة مقدمة للمزايدة من الزبون نقداً",
      receiptNumber: "REC-108",
      recordedBy: "إدارة المكتب",
    },
  });

  // Vehicle 3: Pending Approval
  await prisma.vehicle.create({
    data: {
      orderId: order1.id,
      officeId: office.id,
      lotNumber: "38910245",
      vin: "KMHD84LF7NU918231",
      auctionName: "IAA",
      auctionUrl: "https://www.iaai.com/VehicleDetail/38910245~US",
      mainImageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=60",
      make: "Hyundai",
      model: "Elantra SEL",
      year: 2022,
      bodyClass: "Sedan",
      engine: "2.0L 4 Cyl",
      driveType: "FWD",
      color: "رمادي معدني",
      mileage: 34100,
      primaryDamage: "صدمة جانبية (باب السائق)",
      secondaryDamage: "خدوش",
      conditionHighlight: "Starts",
      titleType: "Salvage Certificate",
      status: "PENDING_APPROVAL",
      estPurchasePrice: 6800,
      estAuctionFees: 750,
      estTowingFee: 350,
      estShippingFee: 1200,
      estCustomsFee: 600,
      estCommission: 500,
      estTotal: 10200,
      maxBidApproved: 7200,
    },
  });

  // Vehicle 4: Completed & Delivered
  const v4 = await prisma.vehicle.create({
    data: {
      orderId: order3.id,
      officeId: office.id,
      lotNumber: "49201948",
      vin: "KNDPB3AC4P7192834",
      auctionName: "Copart",
      auctionUrl: "https://www.copart.com/lot/49201948",
      mainImageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=60",
      make: "Kia",
      model: "Sportage LX",
      year: 2023,
      bodyClass: "SUV",
      engine: "2.5L 4 Cyl",
      driveType: "AWD",
      color: "كحلي داكن",
      mileage: 18900,
      primaryDamage: "صدمة خلفية بسيطة",
      conditionHighlight: "Run and Drive",
      titleType: "Clean Title",
      status: "DELIVERED",
      estPurchasePrice: 14000,
      estAuctionFees: 1200,
      estTowingFee: 400,
      estShippingFee: 1400,
      estCustomsFee: 900,
      estCommission: 500,
      estTotal: 18400,
      maxBidApproved: 14500,
      actualPurchasePrice: 13800,
      auctionInvoiceNum: "COP-2026-7712",
    },
  });

  await prisma.shippingDetail.create({
    data: {
      vehicleId: v4.id,
      auctionState: "TX",
      auctionYard: "Copart Houston",
      originPort: "Houston, TX",
      destinationPort: "ميناء بنغازي",
      shippingCompany: "Sallaum Lines",
      billOfLading: "SAL-BGZ-4412",
      deliveryDate: new Date(Date.now() - 5 * 86400000),
      customsBroker: "مكتب الواحة للتخليص الجمركي",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
