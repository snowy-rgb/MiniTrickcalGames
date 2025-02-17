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

// 🔥 **📌 Firestore에서 프로필 데이터 불러오기 (이메일 공개 설정 확인 포함)**
async function loadProfile(user) {
    if (!user) return;
    const customUID = await getCustomUID(user);
    const userDocRef = doc(db, "Trickcal_MIniGames", customUID);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("✅ 기존 사용자 데이터 불러오기:", userData);

        // 🔴 **닉네임 + 개발자 태그 추가**
        let usernameDisplay = userData.username || "사용자";
        if (user.email === "catcat3335@naver.com") {
            usernameDisplay += ` <span style="color: blue;">-- 개발자</span>`;
        }
        document.getElementById("profile-name").innerHTML = usernameDisplay;

        document.getElementById("profile-bio").value = userData.introduction || "";

        // 🔴 **이메일 공개 여부 확인**
        const emailDisplay = document.getElementById("email-display");
        if (userData.emailVisible) {  // Firestore에서 emailVisible이 true인지 확인
            emailDisplay.textContent = userData.email || user.email || "정보 없음";
        } else {
            emailDisplay.textContent = "";  // 이메일 숨김 처리
        }

        document.getElementById("profile-icon-preview").src = userData.profile?.icon || "default-icon.png";

        // ✅ 가입일 (joinday) 표시
        const joinDateDisplay = document.getElementById("profile-join-date");
        if (joinDateDisplay) {
            joinDateDisplay.textContent = userData.joinday
                ? new Date(userData.joinday.seconds * 1000).toLocaleDateString()
                : "정보 없음";
        }

        // ✅ 생일 (birthday) 표시
        const birthdayInput = document.getElementById("profile-birthday");
        if (birthdayInput) {
            birthdayInput.value = userData.birthday
                ? new Date(userData.birthday.seconds * 1000).toISOString().substring(0, 10)
                : "";
        }
    }
}

// 🔥 **📌 프로필 저장 (이메일 공개 여부 저장 추가)**
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

    // ✅ 기존 `joinday` 값 유지 (가입일)
    const existingData = await getDoc(userDocRef);
    let joinDate = serverTimestamp();
    if (existingData.exists() && existingData.data().joinday) {
        joinDate = existingData.data().joinday;
    }

    // ✅ 생일 값 가져오기
    let birthdayValue = document.getElementById("profile-birthday")?.value;
    let birthday = null;
    if (birthdayValue) {
        birthday = new Date(birthdayValue);
    }

    // 🔴 **이메일 공개 여부 가져오기**
    let emailVisible = document.getElementById("email-visible").checked;

    const profileData = {
        username: document.getElementById("profile-name")?.value || "",
        introduction: document.getElementById("profile-bio")?.value || "",
        email: user.email,
        emailVisible: emailVisible,  // 🔴 이메일 공개 여부 추가
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

// **📌 로그인 감지 후 `customUID` 사용**
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await loadProfile(user);
    } else {
        console.log("🚨 사용자가 로그인하지 않았습니다.");
    }
});

// **📌 이벤트 리스너 설정**
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("save-profile").addEventListener("click", saveProfile);
});





