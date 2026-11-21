// إدارة حالات السيارة ومراحل المعاملة

export interface StatusConfig {
  key: string;
  label: string;
  step: number; // 1 to 5
  color: string;
  bgLight: string;
  description: string;
}

export const VEHICLE_STATUSES: Record<string, StatusConfig> = {
  DRAFT: {
    key: "DRAFT",
    label: "مسودة",
    step: 1,
    color: "text-gray-700",
    bgLight: "bg-gray-100 border-gray-300",
    description: "تمت إضافة السيارة ولم تُعرض بعد على الزبون",
  },
  PENDING_APPROVAL: {
    key: "PENDING_APPROVAL",
    label: "بانتظار الموافقة",
    step: 1,
    color: "text-amber-800",
    bgLight: "bg-amber-50 border-amber-300",
    description: "تم إعداد العرض وبانتظار موافقة الزبون وتحديد حد المزايدة",
  },
  APPROVED: {
    key: "APPROVED",
    label: "موافق عليها",
    step: 1,
    color: "text-blue-800",
    bgLight: "bg-blue-50 border-blue-300",
    description: "وافق الزبون على حد المزايدة وجاهزة للمزايدة",
  },
  BID_PLACED: {
    key: "BID_PLACED",
    label: "تمت المزايدة",
    step: 2,
    color: "text-indigo-800",
    bgLight: "bg-indigo-50 border-indigo-300",
    description: "دخل الموظف المزاد وقدم السعر وبانتظار النتيجة",
  },
  WON: {
    key: "WON",
    label: "رست (فوز)",
    step: 2,
    color: "text-emerald-800",
    bgLight: "bg-emerald-50 border-emerald-300",
    description: "فاز المكتب بالسيارة وبانتظار سداد المزاد",
  },
  LOST: {
    key: "LOST",
    label: "لم تَرُس (خسارة)",
    step: 2,
    color: "text-rose-800",
    bgLight: "bg-rose-50 border-rose-300",
    description: "تجاوز السعر حد الزبون ولم يتم الشراء",
  },
  PAID: {
    key: "PAID",
    label: "تم سداد المزاد",
    step: 3,
    color: "text-teal-800",
    bgLight: "bg-teal-50 border-teal-300",
    description: "سدد المكتب فاتورة المزاد بالكامل وبانتظار أمر النقل",
  },
  PICKED_UP: {
    key: "PICKED_UP",
    label: "تم سحبها من الساحة",
    step: 3,
    color: "text-sky-800",
    bgLight: "bg-sky-50 border-sky-300",
    description: "استلمت شركة النقل الداخلي السيارة من ساحة المزاد",
  },
  IN_TRANSIT_US: {
    key: "IN_TRANSIT_US",
    label: "في النقل الداخلي الأمريكي",
    step: 3,
    color: "text-blue-800",
    bgLight: "bg-blue-50 border-blue-300",
    description: "السيارة في طريقها من الساحة إلى ميناء الشحن",
  },
  AT_PORT_US: {
    key: "AT_PORT_US",
    label: "وصلت الميناء الأمريكي",
    step: 3,
    color: "text-cyan-800",
    bgLight: "bg-cyan-50 border-cyan-300",
    description: "وصلت مستودع الشحن في أمريكا وبانتظار التحميل في الحاوية",
  },
  SHIPPED: {
    key: "SHIPPED",
    label: "تم الشحن البحري (بالبحر)",
    step: 4,
    color: "text-purple-800",
    bgLight: "bg-purple-50 border-purple-300",
    description: "أبحرت السفينة باتجاه الموانئ الليبية",
  },
  ARRIVED_DEST: {
    key: "ARRIVED_DEST",
    label: "وصلت الميناء الليبي",
    step: 4,
    color: "text-indigo-800",
    bgLight: "bg-indigo-50 border-indigo-300",
    description: "وصلت الحاوية للميناء وجاهزة للتفريغ",
  },
  CUSTOMS: {
    key: "CUSTOMS",
    label: "بانتظار التخليص الجمركي",
    step: 5,
    color: "text-orange-800",
    bgLight: "bg-orange-50 border-orange-300",
    description: "أوراق السيارة لدى المخلص الجمركي للإفراج",
  },
  READY_DELIVERY: {
    key: "READY_DELIVERY",
    label: "جاهزة للتسليم",
    step: 5,
    color: "text-green-800",
    bgLight: "bg-green-50 border-green-300",
    description: "خرجت من الميناء وجاهزة في مقر المكتب لتسليمها للزبون",
  },
  DELIVERED: {
    key: "DELIVERED",
    label: "تم التسليم للزبون",
    step: 5,
    color: "text-emerald-900 font-bold",
    bgLight: "bg-emerald-100 border-emerald-400",
    description: "تمت تسوية الحسابات وتسليم السيارة والمفاتيح للزبون",
  },
};

export const STATUS_LIST = Object.values(VEHICLE_STATUSES);

export function getStatusBadge(statusKey: string) {
  return VEHICLE_STATUSES[statusKey] || {
    key: statusKey,
    label: statusKey,
    step: 1,
    color: "text-gray-700",
    bgLight: "bg-gray-100 border-gray-300",
    description: "",
  };
}
