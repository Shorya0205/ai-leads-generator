import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(500, parseInt(limitParam, 10))) : 100;

  try {
    // Fetch recipients ordered by lastContactedAt ASC (nulls first), then createdAt ASC
    const candidates = await prisma.recipient.findMany({
      where: { userId: user.id },
      orderBy: [
        { lastContactedAt: "asc" },
        { createdAt: "asc" },
      ],
      take: limit,
    });

    const totalRecipients = await prisma.recipient.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      candidates,
      count: candidates.length,
      totalRecipients,
    });
  } catch (error) {
    console.error("Error fetching follow-up candidates:", error);
    return NextResponse.json(
      { error: "Failed to fetch follow-up candidates" },
      { status: 500 }
    );
  }
}
