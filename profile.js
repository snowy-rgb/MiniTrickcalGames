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

// ✅ Cloudinary API 설정
const CLOUDINARY_CLOUD_NAME = "doji3ykrt";
const CLOUDINARY_UPLOAD_PRESET = "MiniTrickcalGames"; 

// 🔥 **📌 uploadProfilePicture 함수 - Cloudinary 업로드**
async function uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (data.secure_url) {
            console.log("✅ 프로필 사진 업로드 성공:", data.secure_url);
            return data.secure_url;
        } else {
            console.error("❌ Cloudinary 업로드 실패:", data);
            return null;
        }
    } catch (error) {
        console.error("❌ Cloudinary 업로드 오류:", error);
        return null;
    }
}

// 🔥 **📌 이 함수를 전역에서 사용할 수 있도록 추가**
window.uploadProfilePicture = uploadProfilePicture; 

// **📌 Firestore에서 `customUID` 가져오기**
async function getCustomUID(user) {
    if (!user) return null;
    const userDocRef = doc(db, "Trickcal_MIniGames", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists() ? userDocSnap.data().customUID || user.uid : user.uid;
}

// **📌 Firestore에서 프로필 데이터 불러오기**
async function loadProfile(user) {
    if (!user) return;
    const customUID = await getCustomUID(user);
    const userDocRef = doc(db, "Trickcal_MIniGames", customUID);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("✅ 기존 사용자 데이터 불러오기:", userData);
        document.getElementById("profile-name").value = userData.username || "";
        document.getElementById("profile-bio").value = userData.introduction || "";
        document.getElementById("email-display").textContent = userData.email || user.email || "정보 없음";
        document.getElementById("profile-icon-preview").src = userData.profile?.icon || "default-icon.png";
    }
}

// **📌 프로필 저장**
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
    let joinDate = existingData.exists() && existingData.data().joinday ? existingData.data().joinday : serverTimestamp();

    const profileData = {
        username: document.getElementById("profile-name")?.value || "",
        introduction: document.getElementById("profile-bio")?.value || "",
        email: user.email,
        joinday: joinDate,
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

    // ✅ 프로필 사진 클릭 시 파일 선택 창 열기
    document.getElementById("profile-icon").addEventListener("click", () => {
        document.getElementById("profile-icon-input").click();
    });

    // ✅ 프로필 사진 변경 이벤트 리스너 추가
    document.getElementById("profile-icon-input").addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // 🔥 Cloudinary에 프로필 사진 업로드
        const imageUrl = await window.uploadProfilePicture(file);
        if (imageUrl) {
            document.getElementById("profile-icon-preview").src = imageUrl;

            const user = auth.currentUser;
            if (user) {
                const customUID = await getCustomUID(user);
                const userDocRef = doc(db, "Trickcal_MIniGames", customUID);
                await updateDoc(userDocRef, { "profile.icon": imageUrl });
                console.log("✅ Firestore 프로필 이미지 URL 업데이트 완료!");
            }
        }
    });
});





