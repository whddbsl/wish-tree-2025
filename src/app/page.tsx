import Link from 'next/link'

export default function Home() {
  return (
    <main 
      className="min-h-screen flex flex-col justify-between p-4 bg-[#FFF5E1]"
      style={{
        backgroundImage: "url('/images/logo.png')",
        backgroundSize: '100% auto',  // 너비를 100%로 설정
        backgroundPosition: 'center 40%',  // 중앙에서 약간 위로 조정
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 상단 텍스트 */}
      <div className="text-center pt-6">
        <h1 className="text-4xl font-bold text-gray-800">
          2025 소원트리
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          새해를 맞이하여 소중한 사람들과 
          <br />
          마음을 나누어보세요
        </p>
      </div>

      {/* 하단 버튼 */}
      <div className="w-full max-w-md mx-auto">
        <Link
          href="/login"
          className="w-full inline-block bg-[#FF4B4B] hover:bg-[#FF6B6B] text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
        >
          시작하기
        </Link>
      </div>
    </main>
  );
} 