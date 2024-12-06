'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { signInWithKakao } from '@/lib/firebase/kakaoAuth';
import { FirebaseError } from 'firebase/app';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      console.log('로그인 성공:', userCredential.user);
      router.push('/my-tree');
    } catch (err) {
      console.error('로그인 에러:', err);
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/invalid-email':
            setError('유효하지 않은 이메일 형식입니다.');
            break;
          case 'auth/user-disabled':
            setError('비활성화된 계정입니다.');
            break;
          case 'auth/user-not-found':
            setError('등록되지 않은 이메일입니다.');
            break;
          case 'auth/wrong-password':
            setError('잘못된 비밀번호입니다.');
            break;
          default:
            setError('아이디나 비밀번호가 올바르지 않습니다.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5E1] px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/50 backdrop-blur-sm rounded-2xl">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-800">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/register" className="text-[#FF4B4B] hover:text-[#FF6B6B]">
              회원가입하기
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={signInWithKakao}
            className="w-full flex items-center justify-center px-4 py-2 space-x-2 bg-[#FEE500] text-[#000000] rounded-lg hover:bg-[#FEE500]/90 focus:outline-none focus:ring-2 focus:ring-[#FEE500] focus:ring-offset-2"
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 18 18"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M9 0.5625C4.03125 0.5625 0 3.75 0 7.65625C0 10.1562 1.67188 12.3750 4.21875 13.6875L3.14062 17.2188C3.09375 17.3438 3.14062 17.4688 3.23438 17.5312C3.32812 17.6250 3.51562 17.6250 3.60938 17.5312L7.875 14.7188C8.25 14.7812 8.625 14.7812 9 14.7812C13.9688 14.7812 18 11.5938 18 7.65625C18 3.75 13.9688 0.5625 9 0.5625Z" 
                fill="currentColor"
              />
            </svg>
            <span>카카오로 로그인</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/50 backdrop-blur-sm text-gray-600">또는</span>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-200 bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4B4B] focus:border-transparent"
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-200 bg-white/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4B4B] focus:border-transparent"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#FF4B4B] focus:ring-[#FF4B4B] border-gray-200 rounded bg-white/70"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                로그인 상태 유지
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#FF4B4B] hover:bg-[#FF6B6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4B4B] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로그인 중...' : '이메일로 로그인'}
          </button>
        </form>
      </div>
    </div>
  );
} 