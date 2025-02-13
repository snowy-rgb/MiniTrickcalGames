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
    console.log("🚨 로그인된 사용자가 없습니다.");
    return;
  }

  const userDocRef = doc(db, "Trickcal_MIniGames", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const data = userDocSnap.data();

    document.getElementById("profile-name").value = data.username || "";
    document.getElementById("profile-bio").value = data.introduction || "";
    document.getElementById("email-visibility").checked = data.email !== "비공개";

    document.getElementById("email-display").textContent = data.email || user.email || "정보 없음";

    const joinDateDisplay = document.getElementById("profile-join-date");
    if (joinDateDisplay) {
      joinDateDisplay.textContent = data.joinday
        ? new Date(data.joinday.seconds * 1000).toLocaleDateString()
        : "정보 없음";
    }

    const birthdayInput = document.getElementById("profile-birthday");
    if (birthdayInput) {
      birthdayInput.value = data.birthday
        ? new Date(data.birthday.seconds * 1000).toISOString().substring(0, 10)
        : "";
    }

    // ✅ 프로필 사진 로드
    document.getElementById("profile-icon-preview").src = data.profile?.icon || "default-icon.png";

  } else {
    console.log("🚨 프로필 데이터 없음 → 새 문서 생성");

    const newUserData = {
      username: user.email.split("@")[0],
      introduction: "",
      email: user.email || "비공개",
      birthday: null,
      joinday: serverTimestamp(), // Firestore 자동 시간 기록
      profile: { icon: "default-icon.png" }
    };

    await setDoc(userDocRef, newUserData);
    loadProfile(user);
  }
}

// **2️⃣ 프로필 저장 (Firestore에 저장)**
async function saveProfile() {
  const user = auth.currentUser;
  if (!user) {
    alert("🚨 로그인된 사용자가 없습니다.");
    return;
  }

  const userDocRef = doc(db, "Trickcal_MIniGames", user.uid);

  let profileIconPreview = document.getElementById("profile-icon-preview");
  if (!profileIconPreview) {
    console.error("🚨 'profile-icon-preview' 요소를 찾을 수 없습니다.");
    return;
  }
  let iconURL = profileIconPreview.src;

  // ✅ 파일 업로드 여부 체크 후 진행
  const fileInput = document.getElementById("profile-icon-input");
  if (fileInput.files.length > 0) {
    const uploadedURL = await uploadProfilePicture(fileInput.files[0]);
    if (uploadedURL) {
      iconURL = uploadedURL;
    }
  }

  // ✅ 기존 `joinday` 값 유지
  const existingData = await getDoc(userDocRef);
  let joinDate = serverTimestamp(); // 기본값
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
    joinday: joinDate,  // ✅ 기존 값 유지
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
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("📸 사진 업로드 성공! URL:", downloadURL);
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

      // ✅ Firestore에도 즉시 업데이트
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "Trickcal_MIniGames", user.uid);
        try {
          await updateDoc(userDocRef, { "profile.icon": imageUrl });
          console.log("✅ Firestore 프로필 이미지 URL 업데이트 완료!");
        } catch (error) {
          console.error("❌ Firestore 프로필 이미지 업데이트 오류:", error);
        }
      }
    }
  }); // if (imageUrl) 블록의 끝
}); // addEventListener 콜백 함수의 끝
