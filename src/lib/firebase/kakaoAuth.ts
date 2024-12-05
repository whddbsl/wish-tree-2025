import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './config';

export const signInWithKakao = async () => {
  try {
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
      const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    window.location.href = kakaoURL;
  } catch (error) {
    console.error("Kakao login error:", error);
    throw error;
  }
};

export const handleKakaoCallback = async (code: string) => {
  try {
    const response = await fetch("/api/auth/kakao", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Kakao auth response error:', errorData);
      throw new Error("Failed to authenticate with Kakao");
    }

    const { token } = await response.json();
    console.log('Received Firebase custom token:', token);

    // Firebase로 로그인
    const userCredential = await signInWithCustomToken(auth, token);
    console.log('Firebase login successful:', userCredential.user);
    
    return userCredential.user;
  } catch (error) {
    console.error("Error during Kakao authentication:", error);
    throw error;
  }
};
