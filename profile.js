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

// 🔥 **📌 Firestore에서 프로필 데이터 불러오기 (이름 포함)**
async function loadProfile(user) {
    if (!user) return;
    const customUID = await getCustomUID(user);
    const userDocRef = doc(db, "Trickcal_MIniGames", customUID);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("✅ 기존 사용자 데이터 불러오기:", userData); // 🔴 디버깅 추가

        // 🔴 **데이터가 올바르게 불러와지는지 확인**
        if (!userData.username) {
            console.warn("⚠️ Firestore에서 username을 찾을 수 없음!");
        }

        let usernameDisplay = userData.username || "사용자";
        document.getElementById("profile-name").value = userData.username || ""; 

        if (user.email === "catcat3335@naver.com") {
            usernameDisplay += ` <span style="color: blue;">-- 개발자</span>`;
        }
        document.getElementById("profile-display-name").innerHTML = usernameDisplay;

        document.getElementById("profile-bio").value = userData.introduction || "";

        const emailDisplay = document.getElementById("email-display");
        if (userData.emailVisible) {
            emailDisplay.textContent = userData.email || user.email || "정보 없음";
        } else {
            emailDisplay.textContent = "";
        }

        document.getElementById("profile-icon-preview").src = userData.profile?.icon || "default-icon.png";
    } else {
        console.warn("⚠️ Firestore에서 사용자 데이터가 존재하지 않음!");
    }
}

// 🔥 **📌 프로필 저장 (이름 포함)**
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

    // 🔴 **닉네임 값이 실제로 가져와지는지 확인**
    const usernameInput = document.getElementById("profile-name")?.value || "";
    console.log("🔴 저장할 username:", usernameInput);

    // 🔴 **이름(닉네임) 필드 저장 추가**
    const profileData = {
        username: usernameInput,  // 🔴 저장 시 username 포함
        introduction: document.getElementById("profile-bio")?.value || "",
        email: user.email,
        emailVisible: emailVisible,
        joinday: joinDate,
        birthday: birthday,
        profile: { icon: iconURL }
    };

    try {
        await setDoc(userDocRef, profileData, { merge: true });
        console.log("✅ Firestore에 저장 완료:", profileData); // 🔴 저장 확인용 로그
        alert("✅ 프로필이 저장되었습니다!");
        loadProfile(user);
    } catch (error) {
        console.error("❌ 프로필 저장 오류:", error);
        alert("🚨 프로필 저장 중 오류가 발생했습니다.");
    }
}

// 🔥 **📌 로그인 감지 후 프로필 자동 로드**
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("✅ 로그인 감지됨:", user);
        await loadProfile(user);
    } else {
        console.log("🚨 사용자가 로그인하지 않았습니다.");
    }
});

// ✅ 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("save-profile").addEventListener("click", saveProfile);
});






