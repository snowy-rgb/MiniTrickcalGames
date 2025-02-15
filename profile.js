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

// ✅ Imgur API 설정 (변경 필요)
const IMGUR_CLIENT_ID = "YOUR_IMGUR_CLIENT_ID";  

// **1️⃣ Firestore에서 `customUID` 가져오기**
async function getCustomUID(user) {
    if (!user) return null;

    const userDocRef = doc(db, "Trickcal_MIniGames", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        return userDocSnap.data().customUID || user.uid;  // ✅ 기존 `customUID` 사용
    } else {
        return user.uid; // 기본적으로 `uid` 사용
    }
}

// **2️⃣ Firestore에서 프로필 데이터 불러오기**
async function loadProfile(user) {
    if (!user) {
        console.log("🚨 로그인된 사용자가 없습니다.");
        return;
    }

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

        // ✅ 가입일(joinday) 표시
        const joinDateDisplay = document.getElementById("profile-join-date");
        if (joinDateDisplay) {
            joinDateDisplay.textContent = userData.joinday
                ? new Date(userData.joinday.seconds * 1000).toLocaleDateString()
                : "정보 없음";
        }

        // ✅ 생일(birthday) 표시
        const birthdayInput = document.getElementById("profile-birthday");
        if (birthdayInput) {
            birthdayInput.value = userData.birthday
                ? new Date(userData.birthday.seconds * 1000).toISOString().substring(0, 10)
                : "";
        }

    } else {
        console.log("🚨 새 사용자 → 새 문서 생성");

        const newUserData = {
            customUID: customUID,  // ✅ Firestore에 `customUID` 저장
            username: user.email.split("@")[0],
            introduction: "",
            email: user.email || "비공개",
            birthday: null,
            joinday: serverTimestamp(), 
            profile: { icon: "default-icon.png" }
        };

        await setDoc(userDocRef, newUserData);
        console.log("✅ 새로운 사용자 데이터 저장 완료!");
    }
}

// **3️⃣ 프로필 저장 (Firestore에 저장)**
async function saveProfile() {
    const user = auth.currentUser;
    if (!user) {
        alert("🚨 로그인된 사용자가 없습니다.");
        return;
    }

    const customUID = await getCustomUID(user);
    const userDocRef = doc(db, "Trickcal_MIniGames", customUID);

    let profileIconPreview = document.getElementById("profile-icon-preview");
    if (!profileIconPreview) {
        console.error("🚨 'profile-icon-preview' 요소를 찾을 수 없습니다.");
        return;
    }
    let iconURL = profileIconPreview.src;

    // ✅ 기존 `joinday` 값 유지
    const existingData = await getDoc(userDocRef);
    let joinDate = serverTimestamp(); 
    if (existingData.exists() && existingData.data().joinday) {
        joinDate = existingData.data().joinday;
    }

    const profileData = {
        username: document.getElementById("profile-name")?.value || "",
        introduction: document.getElementById("profile-bio")?.value || "",
        birthday: document.getElementById("profile-birthday")?.value
            ? new Date(document.getElementById("profile-birthday").value)
            : null,
        email: document.getElementById("email-visibility")?.checked ? user.email : "비공개",
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

// **4️⃣ 로그인 감지 후 `customUID` 사용**
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await loadProfile(user);
    } else {
        console.log("🚨 사용자가 로그인하지 않았습니다.");
    }
});

// **5️⃣ 이벤트 리스너 설정**
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

        const imageUrl = await uploadProfilePicture(file);
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



