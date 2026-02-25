import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, breed, gender, size, birthDate, dogRegNo } = body;

    if (!name || !breed || !gender || !size) {
      return NextResponse.json(
        { error: "이름, 견종, 성별, 크기는 필수 항목입니다" },
        { status: 400 }
      );
    }

    const dog = await prisma.dog.create({
      data: {
        userId: session.user.id,
        name,
        breed,
        gender,
        size,
        dogRegNo: dogRegNo || null,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    });

    return NextResponse.json(dog);
  } catch (error) {
    console.error("강아지 등록 에러:", error);
    return NextResponse.json(
      { error: "강아지 등록 실패" },
      { status: 500 }
    );
  }
}