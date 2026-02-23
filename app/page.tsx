"use client";

import InstallPrompt from "./components/InstallPrompt";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dogs, setDogs] = useState<any[]>([]);
  const [parks, setParks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
  if (session) {
    // 자동 퇴장 체크
    checkAndAutoExit();
    
    fetchDogs();
    fetchParks();
  }
}, [session]);

const checkAndAutoExit = async () => {
  try {
    await fetch("/api/visit/auto-exit", {
      method: "POST",
    });
  } catch (error) {
    console.error("자동 퇴장 체크 에러:", error);
  }
};

  const fetchDogs = async () => {
    try {
      const res = await fetch("/api/dogs-list");
      if (res.ok) {
        const data = await res.json();
        setDogs(data);
        
        if (data.length === 0) {
          router.push("/dogs/register");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParks = async () => {
    try {
      const res = await fetch("/api/parks");
      if (res.ok) {
        const data = await res.json();
        setParks(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <InstallPrompt />

      <div className="max-w-4xl mx-auto">        
        {/* 사용자 정보 */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-xl font-bold truncate">
                  {session.user?.name || "사용자"}님
                </h2>
                <p className="text-sm sm:text-base font-medium">환영합니다!</p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 공원 목록 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">🏞️ 공원 현황</h3>
          
          {parks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              등록된 공원이 없습니다
            </p>
          ) : (
            <div className="space-y-4">
              {parks.map((park) => (
                <div key={park.id} className="border rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-3">{park.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{park.address}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {park.zones.map((zone: any) => (
                      <div
                        key={zone.id}
                        className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-green-500 transition cursor-pointer"
                        onClick={() => router.push(`/park/${zone.qrCode}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {zone.type === "small_medium" ? "🐩 소형·중형견" : "🐕 대형견"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              클릭하여 입장
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-green-500">
                              {zone.currentCount}
                            </p>
                            <p className="text-xs text-gray-500">마리</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 내 강아지들 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">내 강아지들 🐕</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dogs.map((dog) => (
              <div key={dog.id} className="border rounded-lg p-4">
                <h4 className="font-bold text-lg">{dog.name}</h4>
                <p className="text-gray-600">{dog.breed}</p>
                <p className="text-sm text-gray-500">
                  {dog.gender === "male" ? "수컷" : "암컷"} · {dog.size === "small" ? "소형견" : dog.size === "medium" ? "중형견" : "대형견"}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/dogs/register")}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
          >
            + 강아지 추가하기
          </button>
        </div>
      </div>
    </div>
  );
}