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

    // 🔴 **생일 값 가져오기**
    let birthdayValue = document.getElementById("profile-birthday")?.value;
    let birthday = null;
    if (birthdayValue) {
        birthday = new Date(birthdayValue); // 날짜 형식으로 저장
    }

    let emailVisible = document.getElementById("email-visible").checked;
    let usernameInput = document.getElementById("profile-name").value || "";

    const profileData = {
        username: usernameInput,
        introduction: document.getElementById("profile-bio")?.value || "",
        email: user.email,
        emailVisible: emailVisible,
        joinday: joinDate,
        birthday: birthday, // 🔴 생일 값 저장
        profile: { icon: iconURL }
    };

    try {
        await setDoc(userDocRef, profileData, { merge: true });
        console.log("✅ Firestore에 저장 완료:", profileData);
        alert("✅ 프로필이 저장되었습니다!");
        loadProfile(user); // 🔴 저장 후 다시 불러오기
    } catch (error) {
        console.error("❌ 프로필 저장 오류:", error);
        alert("🚨 프로필 저장 중 오류가 발생했습니다.");
    }
}

// 🔴 **Firestore에서 프로필 데이터 불러오기 (생일 값 포함)**
// 🔥 **📌 Firestore에서 프로필 데이터 불러오기**
async function loadProfile(user) {
    if (!user) return;
    const customUID = await getCustomUID(user);
    const userDocRef = doc(db, "Trickcal_MIniGames", customUID);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("✅ 기존 사용자 데이터 불러오기:", userData);

        let usernameDisplay = userData.username || "사용자";
        if (user.email === "catcat3335@naver.com") {
            usernameDisplay += ` <span style="color: blue;">-- 개발자</span>`;
        }

        document.getElementById("profile-display-name").innerHTML = usernameDisplay;
        document.getElementById("profile-name").value = userData.username || "";

        document.getElementById("profile-bio").value = userData.introduction || "";

        const emailDisplay = document.getElementById("email-display");
        if (emailDisplay) {
            emailDisplay.textContent = userData.emailVisible ? (userData.email || "정보 없음") : "비공개";
        }

        document.getElementById("profile-icon-preview").src = userData.profile?.icon || "default-icon.png";

        // 🔴 **생일 불러오기 (요소 확인 후 설정)**
        const birthdayInput = document.getElementById("profile-birthday");
        if (birthdayInput) {
            birthdayInput.value = userData.birthday
                ? new Date(userData.birthday.seconds * 1000).toISOString().substring(0, 10)
                : "";
        } else {
            console.warn("⚠️ profile-birthday 요소가 HTML에 없음!");
        }

        // 🔴 **가입일 표시 (요소 확인 후 설정)**
        const joinDateDisplay = document.getElementById("profile-join-date");
        if (joinDateDisplay) {
            joinDateDisplay.textContent = userData.joinday
                ? new Date(userData.joinday.seconds * 1000).toLocaleDateString()
                : "정보 없음";
        } else {
            console.warn("⚠️ profile-join-date 요소가 HTML에 없음!");
        }

        // 🔴 **수정 모드 & 보기 모드 전환**
        toggleEditMode(false);
    }
}


// 🔴 **보기 모드 & 수정 모드 전환**
function toggleEditMode(editMode) {
    // 수정 모드에서는 닉네임 입력 가능
    document.getElementById("profile-name").style.display = editMode ? "block" : "none";
    document.getElementById("profile-display-name").style.display = editMode ? "none" : "block";

    // 저장 버튼과 수정 버튼 표시 변경
    document.getElementById("save-profile").style.display = editMode ? "block" : "none";
    document.getElementById("edit-profile").style.display = editMode ? "none" : "block";
}

// ✅ 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("save-profile").addEventListener("click", () => {
        saveProfile();
        toggleEditMode(false);
    });

    document.getElementById("edit-profile").addEventListener("click", () => {
        toggleEditMode(true);
    });
});


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






