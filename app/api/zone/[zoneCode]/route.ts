import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ zoneCode: string }> }
) {
  try {
    const { zoneCode } = await params;  // await 추가!

    const zone = await prisma.zone.findUnique({
      where: { qrCode: zoneCode },
      include: { park: true },
    });

    if (!zone) {
      return NextResponse.json(
        { error: "구역을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json(zone);
  } catch (error) {
    console.error("구역 조회 에러:", error);
    return NextResponse.json(
      { error: "구역 조회 실패" },
      { status: 500 }
    );
  }
}