import { NextResponse } from "next/server";
import { scrapeAuctionLot } from "@/lib/scraper";

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    if (!input) {
      return NextResponse.json(
        { error: "يرجى إدخال رابط المزاد أو رقم اللوت" },
        { status: 400 }
      );
    }

    const result = await scrapeAuctionLot(input);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Scraper API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة رابط المزاد" },
      { status: 500 }
    );
  }
}
