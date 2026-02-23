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

    const { visitId } = await req.json();

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { zone: true },
    });

    if (!visit || visit.userId !== session.user.id) {
      return NextResponse.json(
        { error: "방문 기록을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 이미 퇴장했는지 확인
    if (visit.exitTime) {
      return NextResponse.json(
        { error: "이미 퇴장한 기록입니다" },
        { status: 400 }
      );
    }

    // 퇴장 처리 (트랜잭션)
    const [updatedVisit] = await prisma.$transaction([
      prisma.visit.update({
        where: { id: visitId },
        data: { exitTime: new Date() },
      }),
      prisma.zone.update({
        where: { id: visit.zoneId },
        data: {
          currentCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    // 음수 방지 - 0 미만이면 0으로 리셋
    if (visit.zone.currentCount - 1 < 0) {
      await prisma.zone.update({
        where: { id: visit.zoneId },
        data: { currentCount: 0 },
      });
    }

    return NextResponse.json(updatedVisit);
  } catch (error) {
    console.error("퇴장 에러:", error);
    return NextResponse.json({ error: "퇴장 처리 실패" }, { status: 500 });
  }
}