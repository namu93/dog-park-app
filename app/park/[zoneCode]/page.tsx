"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

export default function ParkZonePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const zoneCode = params.zoneCode as string;

  const [zone, setZone] = useState<any>(null);
  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedDog, setSelectedDog] = useState<string>("");
  const [activeVisit, setActiveVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      checkAndAutoExit();
      fetchZoneInfo();
      fetchDogs();
      checkActiveVisit();
    }
  }, [session, zoneCode]);

// 자동 퇴장 체크 함수 추가
const checkAndAutoExit = async () => {
  try {
    await fetch("/api/visit/auto-exit", {
      method: "POST",
    });
  } catch (error) {
    console.error("자동 퇴장 체크 에러:", error);
  }
};

  const fetchZoneInfo = async () => {
    const res = await fetch(`/api/zone/${zoneCode}`);
    if (res.ok) {
      const data = await res.json();
      setZone(data);
    }
    setLoading(false);
  };

  const fetchDogs = async () => {
    const res = await fetch("/api/dogs-list");
    if (res.ok) {
      const data = await res.json();
      setDogs(data);
      if (data.length > 0) {
        setSelectedDog(data[0].id);
      }
    }
  };

  const checkActiveVisit = async () => {
    const res = await fetch(`/api/visit/active?zoneCode=${zoneCode}`);
    if (res.ok) {
      const data = await res.json();
      setActiveVisit(data.visit);
    }
  };

  const handleEntry = async () => {
    if (!selectedDog) {
      alert("강아지를 선택해주세요");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/visit/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneCode, dogId: selectedDog }),
      });
      if (res.ok) {
        await checkActiveVisit();
        await fetchZoneInfo();
        alert("입장 완료! 🐕");
      } else {
        const data = await res.json();
        alert(data.error || "입장 실패");
      }
    } catch (error) {
      alert("오류 발생");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExit = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/visit/exit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId: activeVisit.id }),
      });
      if (res.ok) {
        setActiveVisit(null);
        await fetchZoneInfo();
        alert("퇴장 완료! 또 방문해주세요 👋");
      } else {
        alert("퇴장 실패");
      }
    } catch (error) {
      alert("오류 발생");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg sm:text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-lg sm:text-xl text-red-500 text-center">존재하지 않는 구역입니다</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-md mx-auto space-y-4">

        {/* 공원 정보 */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold">{zone.park.name}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {zone.type === "small_medium" ? "🐩 소형·중형견 구역" : "🐕 대형견 구역"}
          </p>
        </div>

        {/* 현재 강아지 수 */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
          <p className="text-sm sm:text-base text-gray-600 mb-2">현재 공원에 있는 강아지</p>
          <div className="text-5xl sm:text-6xl font-bold text-green-500">
            {zone.currentCount}
          </div>
          <p className="text-sm sm:text-base text-gray-500 mt-2">마리</p>
        </div>

        {/* 입장/퇴장 */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {activeVisit ? (
            <div className="text-center">
              <p className="text-green-600 font-bold mb-2 text-sm sm:text-base">
                🐕 현재 공원에 있어요!
              </p>
              <p className="text-gray-500 text-xs sm:text-sm mb-4">
                입장 시간: {new Date(activeVisit.entryTime).toLocaleTimeString("ko-KR")}
              </p>
              <button
                onClick={handleExit}
                disabled={actionLoading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 sm:py-4 rounded-lg text-lg sm:text-xl disabled:bg-gray-400"
              >
                {actionLoading ? "처리 중..." : "🚪 퇴장하기"}
              </button>
            </div>
          ) : (
            <div>
              {dogs.length === 0 ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    먼저 강아지를 등록해주세요
                  </p>
                  <button
                    onClick={() => router.push("/dogs/register")}
                    className="w-full bg-green-500 text-white py-3 rounded-lg text-sm sm:text-base"
                  >
                    강아지 등록하러 가기
                  </button>
                </div>
              ) : (
                <div>
                  <p className="font-medium mb-3 text-sm sm:text-base">함께 온 강아지를 선택하세요:</p>
                  <select
                    value={selectedDog}
                    onChange={(e) => setSelectedDog(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg mb-4 text-sm sm:text-base"
                  >
                    {dogs.map((dog) => (
                      <option key={dog.id} value={dog.id}>
                        {dog.name} ({dog.breed})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleEntry}
                    disabled={actionLoading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 sm:py-4 rounded-lg text-lg sm:text-xl disabled:bg-gray-400"
                  >
                    {actionLoading ? "처리 중..." : "🐾 입장하기"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 홈으로 돌아가기 */}
        <button
          onClick={() => router.push("/")}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
        >
          ← 홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}