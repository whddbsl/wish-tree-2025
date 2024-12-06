import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FFF5E1] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">
            2025 설렘 다락
          </h1>
          <p className="text-lg text-gray-600">
            다락방에 남기는 우리들의 이야기, 
            <br />
            새해 첫 날 서로에게 전하는 특별한 선물이 됩니다.
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <Link
            href="/login"
            className="w-full inline-block bg-[#FF4B4B] hover:bg-[#FF6B6B] text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            시작하기
          </Link>
        </div>
      </div>
    </main>
  )
} 