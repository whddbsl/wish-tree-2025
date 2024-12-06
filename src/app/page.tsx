import Link from 'next/link'

export default function Home() {
  return (
    <main 
      className="min-h-screen flex flex-col justify-between p-4"
      style={{
        backgroundImage: "url('/images/logo.png')",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#FFF5E1"
      }}
    >
      <div className="text-center pt-8">
        <h1 className="text-4xl font-bold text-gray-800">
          2025 소원트리
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          새해를 맞이하여 소중한 사람들과 
          <br />
          마음을 나누어보세요
        </p>
      </div>

      <div className="w-full max-w-md mx-auto pb-8">
        <Link
          href="/login"
          className="w-full inline-block bg-[#FF4B4B] hover:bg-[#FF6B6B] text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
        >
          시작하기
        </Link>
      </div>
    </main>
  )
} 