// ✅ Firebase SDK 불러오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

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

// ✅ 회원가입 함수
export function signUp(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("회원가입 성공:", userCredential.user);
      alert("회원가입 성공! 이메일을 확인해주세요.");
    })
    .catch((error) => {
      console.error("회원가입 실패:", error.message);
    });
}

// ✅ 로그인 함수
export function signIn(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("로그인 성공:", userCredential.user);
      alert("로그인 성공!");
    })
    .catch((error) => {
      console.error("로그인 실패:", error.message);
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
    });
}
