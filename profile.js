import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-storage.js";

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
const storage = getStorage(app);

// **1️⃣ Firestore에서 프로필 데이터 불러오기**
async function loadProfile(user) {
  if (!user) {
    console.log("로그인된 사용자가 없습니다.");
    return;
  }

  const userDocRef = doc(db, "Trickcal_MIniGames", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const data = userDocSnap.data();

    // **이름, 소개글, 이메일 공개 여부 반영**
    document.getElementById("profile-name").value = data.username || "";
    document.getElementById("profile-bio").value = data.introduction || "";
    document.getElementById("email-visibility").checked = data.email !== "비공개";

    // **이메일 표시**
    document.getElementById("email-display").textContent = data.email || user.email || "정보 없음";

    // **가입일 표시**
    document.getElementById("join-date").textContent = data.joinday
      ? new Date(data.joinday.seconds * 1000).toLocaleDateString()
      : "정보 없음";

    // **생일 표시**
    document.getElementById("profile-birthday").value = data.birthday
      ? new Date(data.birthday.seconds * 1000).toISOString().substring(0, 10)
      : "";

    // **프로필 사진 로드**
    document.getElementById("profile-icon-preview").src = data.profile?.icon || "default-icon.png";

  } else {
    console.log("🚨 프로필 데이터가 없으므로 새로 생성합니다.");

    // **새로운 유저 데이터 생성**
    const newUserData = {
      username: user.email.split("@")[0], // 기본값: 이메일 앞부분
      introduction: "",
      email: user.email || "비공개",
      birthday: null,
      joinday: serverTimestamp(), // Firestore에서 현재 시간으로 자동 저장
      profile: {
        icon: "default-icon.png"
      }
    };

    // **Firestore에 새 문서 저장**
    await setDoc(userDocRef, newUserData);
    loadProfile(user); // 저장 후 다시 로드
  }
}

// **2️⃣ 프로필 저장 (Firestore에 저장)**
async function saveProfile() {
  const user = auth.currentUser;
  if (!user) {
    alert("로그인된 사용자가 없습니다.");
    return;
  }

  const userDocRef = doc(db, "Trickcal_MIniGames", user.uid);

  // **프로필 사진이 변경되었는지 확인 후 업로드**
  const fileInput = document.getElementById("profile-icon");
  let iconURL = document.getElementById("profile-icon-preview").src;

  if (fileInput.files.length > 0) {
    const uploadedURL = await uploadProfilePicture(fileInput.files[0]);
    if (uploadedURL) {
      iconURL = uploadedURL;
    }
  }

  const profileData = {
    username: document.getElementById("profile-name").value || "",
    introduction: document.getElementById("profile-bio").value || "",
    birthday: document.getElementById("profile-birthday").value
      ? new Date(document.getElementById("profile-birthday").value)
      : null,
    email: document.getElementById("email-visibility").checked ? user.email : "비공개",
    profile: {
      icon: iconURL,
    },
  };

  try {
    await setDoc(userDocRef, profileData, { merge: true });
    alert("✅ 프로필이 저장되었습니다!");
    loadProfile(user); // 저장 후 UI 업데이트
  } catch (error) {
    console.error("❌ 프로필 저장 오류:", error);
    alert("🚨 프로필 저장 중 오류가 발생했습니다.");
  }
}

// **3️⃣ 프로필 사진 업로드 (Firebase Storage)**
async function uploadProfilePicture(file) {
  if (!file) {
    alert("파일을 선택하세요!");
    return null;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("로그인된 사용자가 없습니다.");
    return null;
  }

  const storageRef = ref(storage, `profile-pictures/${user.uid}`);

  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("❌ 사진 업로드 오류:", error);
    alert("🚨 사진 업로드 중 오류가 발생했습니다.");
    return null;
  }
}

// **4️⃣ 로그인 감지 후 프로필 로드**
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadProfile(user);
  } else {
    console.log("🚨 사용자가 로그인하지 않았습니다.");
  }
});

// **5️⃣ 이벤트 리스너 설정**
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("save-profile").addEventListener("click", saveProfile);
  document.getElementById("profile-icon").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    const imageUrl = await uploadProfilePicture(file);
    if (imageUrl) {
      document.getElementById("profile-icon-preview").src = imageUrl;
    }
  });
});

