import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const deletedTransaction = await prisma.transaction.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(deletedTransaction, { status: 200 });
  } catch (error) {
    console.error("Failed to delete transaction", error);

    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 },
    );
  }
}
