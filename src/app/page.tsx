import Link from 'next/link'
import { ROUTES } from '@/constants/routes'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold">
          2025 새해 소원나무
        </h1>
        <p className="mb-8 text-xl text-gray-300">
          소중한 사람들과 함께 나누는 새해 소원
        </p>
        <div className="space-x-4">
          <Link 
            href={ROUTES.LOGIN}
            className="rounded-full bg-[#FF4B4B] px-8 py-3 font-semibold hover:bg-opacity-90"
          >
            시작하기
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-full border border-white px-8 py-3 font-semibold hover:bg-white hover:text-black"
          >
            사용 방법
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black/30 py-12">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 text-center md:grid-cols-4">
          <div>
            <h3 className="text-3xl font-bold text-[#FFD700]">2,000+</h3>
            <p className="text-gray-400">참여자</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[#FFD700]">5,000+</h3>
            <p className="text-gray-400">메시지</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[#FFD700]">30</h3>
            <p className="text-gray-400">남은 일수</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[#FFD700]">1,500+</h3>
            <p className="text-gray-400">공유됨</p>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">이용 방법</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-black/20 p-6 text-center">
            <div className="mb-4 text-2xl">🌱</div>
            <h3 className="mb-2 text-xl font-semibold">1. 나무 만들기</h3>
            <p className="text-gray-400">나만의 소원나무를 만들고 꾸며보세요</p>
          </div>
          <div className="rounded-lg bg-black/20 p-6 text-center">
            <div className="mb-4 text-2xl">🔗</div>
            <h3 className="mb-2 text-xl font-semibold">2. 링크 공유하기</h3>
            <p className="text-gray-400">소중한 사람들에게 나무 링크를 공유하세요</p>
          </div>
          <div className="rounded-lg bg-black/20 p-6 text-center">
            <div className="mb-4 text-2xl">✨</div>
            <h3 className="mb-2 text-xl font-semibold">3. 새해 메시지 확인</h3>
            <p className="text-gray-400">2025년 1월 1일, 모든 메시지가 공개됩니다</p>
          </div>
        </div>
      </section>
    </main>
  )
} 