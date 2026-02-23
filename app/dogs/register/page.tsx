"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RegisterDogPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  //const [checking, setChecking] = useState(false);
  //const [checkResult, setCheckResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    gender: "male",
    size: "small",
    birthDate: "",
    //dogRegNo: "",
  });

  // const handleCheckRegNo = async () => {
  //   if (!formData.dogRegNo) {
  //     alert("등록번호를 입력해주세요");
  //     return;
  //   }

  //   setChecking(true);
  //   setCheckResult(null);

  //   try {
  //     const res = await fetch(`/api/animal-check?dogRegNo=${formData.dogRegNo}`);
  //     const data = await res.json();

  //     setCheckResult(data);

  //     if (data.success && data.data) {
  //       setFormData({
  //         ...formData,
  //         name: data.data.name !== "정보없음" ? data.data.name : formData.name,
  //         breed: data.data.breed !== "정보없음" ? data.data.breed : formData.breed,
  //         gender: data.data.gender === "수" ? "male" : 
  //                 data.data.gender === "암" ? "female" : formData.gender,
  //       });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     alert("조회 중 오류 발생");
  //   } finally {
  //     setChecking(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/dogs-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/");
      } else {
        alert("강아지 등록 실패");
      }
    } catch (error) {
      console.error(error);
      alert("오류 발생");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
          🐕 강아지 등록
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 동물등록번호 */}
          {/* <div>
            <label className="block text-sm font-medium mb-2">
              동물등록번호 (선택)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={formData.dogRegNo}
                onChange={(e) => setFormData({ ...formData, dogRegNo: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                placeholder="15자리 등록번호"
                maxLength={15}
              />
              <button
                type="button"
                onClick={handleCheckRegNo}
                disabled={checking}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 whitespace-nowrap text-sm sm:text-base"
              >
                {checking ? "조회중..." : "조회"}
              </button>
            </div>

            {checkResult && (
              <div className={`mt-2 p-3 rounded-lg text-xs sm:text-sm ${
                checkResult.success 
                  ? "bg-green-50 border border-green-200 text-green-800" 
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}>
                {checkResult.success ? (
                  <div>
                    <p className="font-bold">✅ 등록된 동물입니다!</p>
                    <p>이름: {checkResult.data.name}</p>
                    <p>견종: {checkResult.data.breed}</p>
                    <p>성별: {checkResult.data.gender}</p>
                  </div>
                ) : (
                  <p>❌ {checkResult.message || "등록되지 않은 번호입니다"}</p>
                )}
              </div>
            )}
          </div> */}

          {/* 강아지 이름 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              강아지 이름 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              placeholder="예: 뽀삐"
            />
          </div>

          {/* 견종 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              견종 *
            </label>
            <input
              type="text"
              required
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              placeholder="예: 포메라니안"
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              성별 *
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            >
              <option value="male">수컷</option>
              <option value="female">암컷</option>
            </select>
          </div>

          {/* 크기 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              크기 *
            </label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            >
              <option value="small">소형견 (10kg 이하)</option>
              <option value="medium">중형견 (10-25kg)</option>
              <option value="large">대형견 (25kg 이상)</option>
            </select>
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              생년월일
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 text-sm sm:text-base"
          >
            {loading ? "등록 중..." : "강아지 등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}