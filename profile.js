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

// 🔥 **📌 Firestore에서 프로필 데이터 저장 및 불러오기**
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
    let birthday = birthdayValue ? new Date(birthdayValue) : null;
    let emailVisible = document.getElementById("email-visible").checked;
    let usernameInput = document.getElementById("profile-name").value.trim();

    if (!usernameInput) {
        alert("이름을 입력해야 합니다.");
        return;
    }

    let friendCode = existingData.exists() && existingData.data().friendCode
        ? existingData.data().friendCode
        : Math.floor(100000 + Math.random() * 900000);

    const profileData = {
        username: usernameInput,
        introduction: document.getElementById("profile-bio")?.value || "",
        email: user.email,
        emailVisible: emailVisible,
        joinday: joinDate,
        birthday: birthday,
        friendCode: friendCode,
        profile: { icon: iconURL }
    };

    try {
        await setDoc(userDocRef, profileData, { merge: true });
        alert("✅ 프로필이 저장되었습니다!");
        loadProfile(user);
    } catch (error) {
        alert("🚨 프로필 저장 중 오류가 발생했습니다.");
    }
}

// 🔥 Firestore에서 프로필 데이터 불러오기
async function loadProfile(user) {
    if (!user) return;
    const customUID = await getCustomUID(user);
    const userDocRef = doc(db, "Trickcal_MIniGames", customUID);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        document.getElementById("profile-display-name").textContent = userData.username || "사용자";
        document.getElementById("profile-name").value = userData.username || "";
        document.getElementById("profile-bio").value = userData.introduction || "";
        document.getElementById("email-display").textContent = userData.emailVisible ? userData.email : "비공개";
        document.getElementById("profile-icon-preview").src = userData.profile?.icon || "default-icon.png";
        document.getElementById("profile-birthday").value = userData.birthday
            ? new Date(userData.birthday.seconds * 1000).toISOString().substring(0, 10)
            : "";
        document.getElementById("profile-birthday-display").textContent = userData.birthday ? document.getElementById("profile-birthday").value : "정보 없음";
        document.getElementById("profile-join-date").textContent = userData.joinday
            ? new Date(userData.joinday.seconds * 1000).toLocaleDateString()
            : "정보 없음";
    }
}

// ✅ 보기 모드 & 수정 모드 전환
function toggleEditMode(editMode) {
    document.getElementById("profile-name").style.display = editMode ? "block" : "none";
    document.getElementById("profile-display-name").style.display = editMode ? "none" : "block";
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
    document.getElementById("profile-icon").addEventListener("click", () => {
        if (document.getElementById("save-profile").style.display === "block") {
            document.getElementById("profile-icon-input").click();
        }
    });
    document.getElementById("profile-icon-input").addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("profile-icon-preview").src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});

// 🔥 로그인 감지 후 프로필 자동 로드
onAuthStateChanged(auth, async (user) => {
    if (user) await loadProfile(user);
});






