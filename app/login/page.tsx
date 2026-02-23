"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
          강아지공원 관리
        </h1>
        <p className="text-gray-600 text-center mb-6 sm:mb-8 text-sm sm:text-base">
          로그인하고 공원 방문을 기록하세요
        </p>
        
        <button
          onClick={() => signIn("kakao", { callbackUrl: "/" })}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-4 rounded-lg transition duration-200 text-sm sm:text-base"
        >
          카카오로 로그인
        </button>
      </div>
    </div>
  );
}