import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Failed to get the transactions", error);
    return NextResponse.json(
      { error: "Failed to get the transactions" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { title, amount, type, category, date } = await req.json();

  if (typeof title !== "string" || typeof category !== "string") {
    return NextResponse.json(
      { message: "Title and category must be of type string" },
      { status: 400 },
    );
  }

  if (!title.trim() || !category.trim()) {
    return NextResponse.json(
      { message: "Title and category are required" },
      { status: 400 },
    );
  }

  if (amount === undefined || amount === null || !type || !date) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 },
    );
  }

  const transactionData = new Date(date);
  const transactionAmount = Number(amount);

  if (Number.isNaN(transactionData.getTime())) {
    return NextResponse.json({ message: "Invalid date" }, { status: 400 });
  }

  if (Number.isNaN(transactionAmount)) {
    return NextResponse.json(
      { message: "Amount must be a number" },
      { status: 400 },
    );
  }

  if (type !== "INCOME" && type !== "EXPENSE") {
    return NextResponse.json(
      { message: "Type must be INCOME or EXPENSE" },
      { status: 400 },
    );
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount: transactionAmount,
        type,
        category,
        date: transactionData,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Failed to create transactions", error);
    return NextResponse.json(
      { error: "Failed to create transactions" },
      { status: 500 },
    );
  }
}
