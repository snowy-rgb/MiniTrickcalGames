// // ✅ Firebase SDK 불러오기
// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
// import { 
//   getAuth, 
//   createUserWithEmailAndPassword, 
//   signInWithEmailAndPassword, 
//   signOut, 
//   sendEmailVerification 
// } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// import { 
//   getFirestore, 
//   doc, 
//   setDoc, 
//   getDoc 
// } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// import { getStorage } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-storage.js";  // ✅ Firebase Storage 추가

// // ✅ Firebase 설정
// const firebaseConfig = {
//   // 보안 문제로 인해 대체되었습니다. 메모장을 확인하세요.
//   show: false;
// };

// // ✅ Firebase 초기화
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);  // ✅ Firebase Storage 초기화 추가

// export { auth, db, storage };

// // **📌 1. 회원가입 (Firestore 자동 저장)**
// export async function signUp(email, password) {
//   try {
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     // ✅ 이메일 인증 발송
//     await sendEmailVerification(user);
//     alert("응답: 회원가입 성공! 이메일 인증 링크가 발송되었습니다. 메일함을 확인해주세요!");

//     // **Firestore에 기본 사용자 정보 저장**
//     const userDocRef = doc(db, "Trickcal_MIniGames", user.uid);
//     await setDoc(userDocRef, {
//       username: email.split('@')[0],  // 기본 이름을 이메일 앞부분으로 설정
//       email: email,
//       introduction: "안녕하세요!",
//       birthday: null, // 사용자가 나중에 설정 가능
//       joinday: new Date(), // **가입일 자동 저장**
//       profile: {
//         icon: "default-icon.png", // 기본 프로필 사진
//       },
//     });

//     // ✅ 회원가입 후 로그인 페이지(index.html)로 이동
//     window.location.href = "index.html"; 

//   } catch (error) {
//     console.error("error:101 회원가입 실패:", error.message);
//     alert("error:101 <회원가입 실패>: " + error.message);
//   }
// }

// // **📌 2. 로그인 (Firestore에서 데이터 불러오기 후 start.html로 이동)**
// export async function signIn(email, password) {
//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     if (!user.emailVerified) {
//       alert("📩 이메일 인증을 완료해야 로그인할 수 있습니다.");
//       return;
//     }

//     // ✅ Firestore에서 사용자 정보 가져오기
//     const userDocRef = doc(db, "Trickcal_MIniGames", user.uid);
//     const userDocSnap = await getDoc(userDocRef);

//     if (userDocSnap.exists()) {
//       console.log("✅ Firestore 데이터 로드 성공:", userDocSnap.data());

//       // ✅ 로컬 저장 (사용자 정보 캐싱)
//       localStorage.setItem("userProfile", JSON.stringify(userDocSnap.data()));

//       alert("✅ 로그인 성공!");
//       window.location.href = "start.html"; // 로그인 후 start 페이지 이동
//     } else {
//       alert("error:102 <Firestore에 사용자 정보가 없습니다. 다시 회원가입 해주세요>");
//     }

//   } catch (error) {
//     console.error("error:113 로그인 실패:", error.message);
//     alert("error:113 <로그인 실패> : " + error.message);
//   }
// }

// // **📌 3. 로그아웃**
// export async function logOut() {
//   try {
//     await signOut(auth);
//     console.log("✅ 로그아웃 성공");
//     alert("응답 : 로그아웃 되었습니다.");

//     // ✅ 로컬 저장 데이터 삭제
//     localStorage.removeItem("userProfile");

//     window.location.href = "index.html"; // 로그아웃 후 로그인 화면으로 이동
//   } catch (error) {
//     console.error("❌ 로그아웃 실패:", error.message);
//     alert("🚨 로그아웃 실패: " + error.message);
//   }
// }

