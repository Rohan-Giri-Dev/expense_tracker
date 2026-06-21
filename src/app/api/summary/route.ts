import { prisma } from "@/lib/prisma";
import {  NextResponse } from "next/server";

export async function GET(){
    try {
        const transactions = await prisma.transaction.findMany({
            orderBy: {
                date: "desc"
            }
        })

        return NextResponse.json({transactions}, {status: 200});
    } catch (error) {
        console.error("Failed to GET all the transactions", error)
        return NextResponse.json({error: "Failed to GET all the transactions"}, {status: 400})
    }
}