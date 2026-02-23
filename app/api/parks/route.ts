import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const parks = await prisma.park.findMany({
      include: {
        zones: {
          orderBy: {
            type: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(parks);
  } catch (error) {
    console.error("공원 목록 조회 에러:", error);
    return NextResponse.json(
      { error: "공원 목록 조회 실패" },
      { status: 500 }
    );
  }
}