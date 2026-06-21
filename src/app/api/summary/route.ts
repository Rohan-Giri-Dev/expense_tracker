import { prisma } from "@/lib/prisma";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req : NextRequest){
    try {
        const {searchParams} = new URL(req.url)
        const month = searchParams.get("month")

        if(!month){
            return NextResponse.json({error: "Month is required"}, {status: 400})
        }

        const [year, monthNumber] = month.split("-").map(Number);

        // Create date range for the selected month:
        // startDate = first day of selected month
        // endDate = first day of next month
        const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
        const endDate = new Date(Date.UTC(year, monthNumber, 1));
        
        const transactions = await prisma.transaction.findMany({
            where: {
                date: {
                    gte: startDate, // greater then or eaual to >=
                    lt: endDate, // less than <
                }
            },
            orderBy: {
                date: "desc"
            }
        })

        return NextResponse.json({transactions}, {status: 200});
    } catch (error) {
    console.error("Failed to GET summary", error);
    return NextResponse.json(
      { error: "Failed to GET summary" },
      { status: 500 }
    );
  }
}