import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인 필요" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const zoneCode = searchParams.get("zoneCode");

    if (!zoneCode) {
      return NextResponse.json({ error: "zoneCode가 필요합니다" }, { status: 400 });
    }

    const zone = await prisma.zone.findUnique({
      where: { qrCode: zoneCode },
    });

    if (!zone) {
      return NextResponse.json({ visit: null });
    }

    const visit = await prisma.visit.findFirst({
      where: {
        userId: session.user.id,
        zoneId: zone.id,
        exitTime: null,
      },
    });

    return NextResponse.json({ visit });
  } catch (error) {
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}