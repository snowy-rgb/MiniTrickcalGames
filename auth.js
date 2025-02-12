// ✅ Firebase SDK 불러오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

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
const db = getFirestore(app);

export { auth, db };

// **1. 회원가입 (Firestore에 자동 저장)**
export function signUp(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      await sendEmailVerification(user);
      alert("회원가입 성공! 이메일 인증 링크를 보냈습니다. 이메일을 확인해 주세요.");

      // **Firestore에 기본 사용자 정보 저장**
      const userDocRef = doc(db, "Trickcal_MIniGames", user.uid);
      await setDoc(userDocRef, {
        username: email.split('@')[0],  // 기본 이름을 이메일 앞부분으로 설정
        email: email,
        introduction: "안녕하세요!",
        birthday: null, // 사용자가 나중에 설정 가능
        joinday: new Date(), // **가입일 자동 저장**
        profile: {
          icon: "default-icon.png", // 기본 프로필 사진
        },
      });

    })
    .catch((error) => {
      console.error("회원가입 실패:", error.message);
      alert("회원가입 실패: " + error.message);
    });
}

// **2. 로그인 (Firestore에서 데이터 불러오기 후 start.html로 이동)**
export function signIn(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      if (user.emailVerified) {
        alert("로그인 성공!");

        // 로그인 후 start.html로 이동
        window.location.href = "start.html";

      } else {
        alert("이메일 인증이 필요합니다. 이메일을 확인하세요.(주의. 이메일이 스팸메일함에 들어갈 수 있습니다)");
      }
    })
    .catch((error) => {
      console.error("로그인 실패:", error.message);
      alert("로그인 실패: " + error.message);
    });
}

// **3. 로그아웃**
export function logOut() {
  signOut(auth)
    .then(() => {
      console.log("로그아웃 성공");
      alert("로그아웃 완료!");
      window.location.href = "index.html"; // 로그아웃 후 로그인 화면으로 이동
    })
    .catch((error) => {
      console.error("로그아웃 실패:", error.message);
      alert("로그아웃 실패: " + error.message);
    });
}

