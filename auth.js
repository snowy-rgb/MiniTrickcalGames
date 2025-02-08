// ✅ Firebase SDK 불러오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// ✅ Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyA-tApRNQGZ3d1gzGhX5hAdntMsC5d9PrM",
  authDomain: "minitrickcal.firebaseapp.com",
  projectId: "minitrickcal",
  storageBucket: "minitrickcal.firebasestorage.app",
  messagingSenderId: "891613009633",
  appId: "1:891613009633:web:1b0888f7641df77424c9a0",
  measurementId: "G-6BK85ML1RH"
};

// ✅ Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

// ✅ 회원가입 함수 (이메일 인증 추가)
export function signUp(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // 이메일 인증 링크 전송
      sendEmailVerification(user)
        .then(() => {
          alert("회원가입 성공! 이메일 인증 링크를 보냈습니다. 이메일을 확인해 주세요.");
        })
        .catch((error) => {
          console.error("이메일 인증 링크 전송 실패:", error.message);
          alert("이메일 인증 링크 전송에 실패했습니다: " + error.message);
        });
    })
    .catch((error) => {
      console.error("회원가입 실패:", error.message);
      alert("회원가입 실패: " + error.message);
    });
}

// ✅ 로그인 함수
export function signIn(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // 이메일 인증 여부 확인
      if (user.emailVerified) {
        alert("로그인 성공!");
      } else {
        alert("이메일 인증이 필요합니다. 이메일을 확인하세요.");
      }
    })
    .catch((error) => {
      console.error("로그인 실패:", error.message);
      alert("로그인 실패: " + error.message);
    });
}

// ✅ 로그아웃 함수
export function logOut() {
  signOut(auth)
    .then(() => {
      console.log("로그아웃 성공");
      alert("로그아웃 완료!");
    })
    .catch((error) => {
      console.error("로그아웃 실패:", error.message);
      alert("로그아웃 실패: " + error.message);
    });
}
