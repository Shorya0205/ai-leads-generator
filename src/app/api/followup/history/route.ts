import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  try {
    const whereCondition: any = {
      campaign: {
        userId: user.id,
      },
    };

    if (search.trim()) {
      whereCondition.OR = [
        { recipient: { email: { contains: search, mode: "insensitive" } } },
        { recipient: { company: { contains: search, mode: "insensitive" } } },
        { recipient: { name: { contains: search, mode: "insensitive" } } },
        { customSubject: { contains: search, mode: "insensitive" } },
      ];
    }

    const [logs, totalCount] = await Promise.all([
      prisma.campaignEmail.findMany({
        where: whereCondition,
        include: {
          recipient: true,
          campaign: {
            select: {
              id: true,
              subject: true,
              fromName: true,
              createdAt: true,
            },
          },
        },
        orderBy: [
          { sentAt: "desc" },
          { id: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaignEmail.count({ where: whereCondition }),
    ]);

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        sentAt: log.sentAt || log.campaign.createdAt,
        status: log.status,
        error: log.error,
        subject: log.customSubject || log.campaign.subject,
        body: log.customBody,
        fromName: log.campaign.fromName,
        recipient: {
          id: log.recipient.id,
          email: log.recipient.email,
          name: log.recipient.name,
          company: log.recipient.company,
          lastContactedAt: log.recipient.lastContactedAt,
          followUpCount: log.recipient.followUpCount,
        },
      })),
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error fetching sent email history logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch sent email history logs" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No log IDs provided for deletion" },
        { status: 400 }
      );
    }

    // Verify ownership via campaign.userId
    const logsToDelete = await prisma.campaignEmail.findMany({
      where: {
        id: { in: ids },
        campaign: { userId: user.id },
      },
      select: { id: true },
    });

    const validIds = logsToDelete.map((l) => l.id);

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No valid logs found to delete" },
        { status: 404 }
      );
    }

    const deleteResult = await prisma.campaignEmail.deleteMany({
      where: {
        id: { in: validIds },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error("Error deleting sent email history logs:", error);
    return NextResponse.json(
      { error: "Failed to delete sent email history logs" },
      { status: 500 }
    );
  }
}
