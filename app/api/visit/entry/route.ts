import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인 필요" }, { status: 401 });
    }

    const { zoneCode, dogId } = await req.json();

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

    // 이미 입장 중인지 확인
    const existingVisit = await prisma.visit.findFirst({
      where: {
        userId: session.user.id,
        zoneId: zone.id,
        exitTime: null,
      },
    });

    if (existingVisit) {
      return NextResponse.json(
        { error: "이미 입장 중입니다" },
        { status: 400 }
      );
    }

    // 입장 처리 (트랜잭션)
    const [visit] = await prisma.$transaction([
      prisma.visit.create({
        data: {
          userId: session.user.id,
          dogId,
          parkId: zone.parkId,
          zoneId: zone.id,
        },
      }),
      prisma.zone.update({
        where: { id: zone.id },
        data: { currentCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(visit);
  } catch (error) {
    console.error("입장 에러:", error);
    return NextResponse.json({ error: "입장 처리 실패" }, { status: 500 });
  }
}