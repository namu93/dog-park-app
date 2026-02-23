import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dogRegNo = searchParams.get("dogRegNo");

  if (!dogRegNo) {
    return NextResponse.json(
      { error: "등록번호를 입력해주세요" },
      { status: 400 }
    );
  }

  try {
    const serviceKey = process.env.ANIMAL_API_KEY;
    // 올바른 엔드포인트 사용
    const url = `http://apis.data.go.kr/1543061/animalInfoSrvc_v3/animalInfo_v3?serviceKey=${serviceKey}&dog_reg_no=${dogRegNo}&_type=json`;

    const response = await fetch(url);
    const text = await response.text();

    console.log("API 응답:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: "API 응답 오류: " + text.substring(0, 100),
      });
    }

    // 응답 확인
    if (data?.response?.header?.resultCode === "00") {
      const item = data?.response?.body?.item;
      
      if (!item) {
        return NextResponse.json({
          success: false,
          message: "등록되지 않은 동물등록번호입니다",
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          name: item.dogNm || "정보없음",
          breed: item.kindNm || "정보없음",
          gender: item.sexNm || "정보없음",
          age: item.age || "정보없음",
          ownerName: item.ownerNm || "정보없음",
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `조회 실패 (코드: ${data?.response?.header?.resultCode || "알 수 없음"})`,
      });
    }
  } catch (error) {
    console.error("동물등록번호 조회 에러:", error);
    return NextResponse.json(
      { error: "조회 중 오류 발생" },
      { status: 500 }
    );
  }
}