// ✅ Firebase SDK 불러오기
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-storage.js";

// ✅ Firebase 초기화
const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

// **1. 프로필 로드 (Firestore에서 데이터 가져오기)**
async function loadProfile() {
  const user = auth.currentUser;
  if (!user) {
    console.log("로그인된 사용자가 없습니다.");
    return;
  }

  const userDocRef = doc(db, "Trickcal : MiniGames", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const data = userDocSnap.data();

    // **이름, 소개글 반영**
    document.getElementById("profile-name").value = data.username || "";
    document.getElementById("profile-bio").value = data.introduction || "";

    // **이메일 표시 (Firestore 데이터가 없으면 auth의 이메일 사용)**
    document.getElementById("email-display").textContent = data.email || user.email || "정보 없음";

    // **가입일 표시**
    document.getElementById("join-date").textContent = data.joinday
      ? new Date(data.joinday.seconds * 1000).toLocaleDateString()
      : "정보 없음";

    // **생일 표시**
    document.getElementById("profile-birthday").value = data.birthday
      ? new Date(data.birthday.seconds * 1000).toISOString().substring(0, 10)
      : "";

    // **이메일 공개 여부 설정**
    document.getElementById("email-visibility").checked = data.email !== "비공개";

    // **프로필 사진 로드 (Firestore에 저장된 URL이 있으면 사용)**
    if (data.profile && data.profile.icon) {
      document.getElementById("profile-icon-preview").src = data.profile.icon;
    } else {
      document.getElementById("profile-icon-preview").src = "default-icon.png"; // 기본 아이콘
    }
  } else {
    console.log("프로필 데이터가 없습니다.");
  }
}

// **2. 프로필 저장 (Firestore에 데이터 저장)**
async function saveProfile() {
  const user = auth.currentUser;
  if (!user) {
    alert("로그인된 사용자가 없습니다.");
    return;
  }

  const userDocRef = doc(db, "Trickcal : MiniGames", user.uid);

  const profileData = {
    username: document.getElementById("profile-name").value || "",
    introduction: document.getElementById("profile-bio").value || "",
    birthday: document.getElementById("profile-birthday").value
      ? new Date(document.getElementById("profile-birthday").value)
      : null,
    email: document.getElementById("email-visibility").checked ? user.email : "비공개",
    joinday: new Date(), // 가입일 업데이트
    profile: {
      icon: document.getElementById("profile-icon-preview").src, // 프로필 사진 URL 저장
    },
  };

  try {
    await setDoc(userDocRef, profileData, { merge: true });
    alert("프로필이 저장되었습니다!");
    loadProfile(); // 저장 후 즉시 반영
  } catch (error) {
    console.error("프로필 저장 오류:", error);
    alert("프로필 저장 중 오류가 발생했습니다.");
  }
}

// **3. 프로필 사진 업로드 (Firebase Storage)**
async function uploadProfilePicture(file) {
  if (!file) {
    alert("파일을 선택하세요!");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("로그인된 사용자가 없습니다.");
    return;
  }

  const storageRef = ref(storage, `profile-pictures/${user.uid}`);

  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // UI 업데이트
    document.getElementById("profile-icon-preview").src = downloadURL;
    alert("사진 업로드 성공!");
    return downloadURL;
  } catch (error) {
    console.error("사진 업로드 오류:", error);
    alert("사진 업로드 중 오류가 발생했습니다.");
  }
}

// **4. 이벤트 리스너 설정**
document.addEventListener("DOMContentLoaded", () => {
  loadProfile(); // 페이지 로드시 프로필 로드

  document.getElementById("save-profile").addEventListener("click", saveProfile);

  document.getElementById("profile-icon").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    const imageUrl = await uploadProfilePicture(file);
    if (imageUrl) {
      document.getElementById("profile-icon-preview").src = imageUrl; // 미리보기 업데이트
    }
  });
});
