import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const month = req.nextUrl.searchParams.get("month");

    if (!month) {
      return NextResponse.json({ error: "Month is required" }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "Month should be in YYYY-MM format" },
        { status: 400 },
      );
    }

    const [year, monthNumber] = month.split("-").map(Number);

    if (monthNumber < 1 || monthNumber > 12) {
      return NextResponse.json({ error: "Invalid month" }, { status: 400 });
    }

    // Create date range for the selected month:
    // startDate = first day of selected month
    // endDate = first day of next month
    const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
    const endDate = new Date(Date.UTC(year, monthNumber, 1));

    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error("Failed to GET summary", error);
    return NextResponse.json(
      { error: "Failed to GET summary" },
      { status: 500 },
    );
  }
}
