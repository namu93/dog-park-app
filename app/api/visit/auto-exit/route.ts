import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1시간(3600초) 이상 지난 입장 기록 찾기
    // const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 30 * 1000);

    const expiredVisits = await prisma.visit.findMany({
      where: {
        exitTime: null,
        entryTime: {
          lt: oneHourAgo,
        },
      },
      include: {
        zone: true,
      },
    });

    if (expiredVisits.length === 0) {
      return NextResponse.json({
        message: "자동 퇴장 대상 없음",
        count: 0,
      });
    }

    // 각 방문 기록 퇴장 처리
    const results = await Promise.all(
      expiredVisits.map(async (visit) => {
        return prisma.$transaction([
          // 방문 기록에 퇴장 시간 기록
          prisma.visit.update({
            where: { id: visit.id },
            data: {
              exitTime: new Date(),
              autoExit: true,
            },
          }),
          // 구역의 현재 강아지 수 감소
          prisma.zone.update({
            where: { id: visit.zoneId },
            data: {
              currentCount: {
                decrement: 1,
              },
            },
          }),
        ]);
      })
    );

    return NextResponse.json({
      message: "자동 퇴장 완료",
      count: expiredVisits.length,
      visits: expiredVisits.map((v) => ({
        id: v.id,
        entryTime: v.entryTime,
        zoneName: v.zone.type,
      })),
    });
  } catch (error) {
    console.error("자동 퇴장 에러:", error);
    return NextResponse.json(
      { error: "자동 퇴장 실패" },
      { status: 500 }
    );
  }
}