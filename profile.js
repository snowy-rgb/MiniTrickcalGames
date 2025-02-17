import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { 
    getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { 
    getAuth, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);


// **📌 Firestore에서 `customUID` 가져오기**
async function getCustomUID(user) {
    if (!user) return null;
    const userDocRef = doc(db, "Trickcal_MIniGames", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists() ? userDocSnap.data().customUID || user.uid : user.uid;
}


// 🔥 **📌 Firestore에서 프로필 데이터 불러오기 (이메일 공개 설정 확인 포함)**
// 🔴 **Firestore에서 프로필 데이터 불러오기 (이름 포함)**
async function loadProfile(user) {
    if (!user) return;
    const customUID = await getCustomUID(user);
    const userDocRef = doc(db, "Trickcal_MIniGames", customUID);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("✅ 기존 사용자 데이터 불러오기:", userData);

        // 🔴 **이름(닉네임) 가져오기 - 기본값 "사용자" 설정**
        let usernameDisplay = userData.username || "사용자";
        document.getElementById("profile-name").value = userData.username || ""; // 🔴 이름 입력칸에 값 설정

        // 🔴 **개발자 표시 추가**
        if (user.email === "catcat3335@naver.com") {
            usernameDisplay += ` <span style="color: blue;">-- 개발자</span>`;
        }
        document.getElementById("profile-display-name").innerHTML = usernameDisplay; // 🔴 추가: 닉네임 표시용 div

        document.getElementById("profile-bio").value = userData.introduction || "";

        const emailDisplay = document.getElementById("email-display");
        if (userData.emailVisible) {
            emailDisplay.textContent = userData.email || user.email || "정보 없음";
        } else {
            emailDisplay.textContent = "";
        }

        document.getElementById("profile-icon-preview").src = userData.profile?.icon || "default-icon.png";
    }
}

// 🔴 **프로필 저장 (이름 포함)**
async function saveProfile() {
    const user = auth.currentUser;
    if (!user) {
        alert("🚨 로그인된 사용자가 없습니다.");
        return;
    }

    const customUID = await getCustomUID(user);
    const userDocRef = doc(db, "Trickcal_MIniGames", customUID);
    const profileIconPreview = document.getElementById("profile-icon-preview");
    let iconURL = profileIconPreview ? profileIconPreview.src : "default-icon.png";

    const existingData = await getDoc(userDocRef);
    let joinDate = serverTimestamp();
    if (existingData.exists() && existingData.data().joinday) {
        joinDate = existingData.data().joinday;
    }

    let birthdayValue = document.getElementById("profile-birthday")?.value;
    let birthday = null;
    if (birthdayValue) {
        birthday = new Date(birthdayValue);
    }

    let emailVisible = document.getElementById("email-visible").checked;

    // 🔴 **이름(닉네임) 필드 저장 추가**
    const profileData = {
        username: document.getElementById("profile-name")?.value || "", // 🔴 저장 시 username 포함
        introduction: document.getElementById("profile-bio")?.value || "",
        email: user.email,
        emailVisible: emailVisible,
        joinday: joinDate,
        birthday: birthday,
        profile: { icon: iconURL }
    };

    try {
        await setDoc(userDocRef, profileData, { merge: true });
        alert("✅ 프로필이 저장되었습니다!");
        loadProfile(user);
    } catch (error) {
        console.error("❌ 프로필 저장 오류:", error);
        alert("🚨 프로필 저장 중 오류가 발생했습니다.");
    }
}

// 🔴 **프로필 닉네임 표시용 div 추가 (HTML에서 필요)**
/*
<div id="profile-display-name"></div>  // HTML에 추가해야 함
<input type="text" id="profile-name">  // 닉네임 입력칸
*/

// ✅ 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("save-profile").addEventListener("click", saveProfile);
});






