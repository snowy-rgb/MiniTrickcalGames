import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

// **1. 프로필 로드**
async function loadProfile() {
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(db, "Trickcal : MiniGames", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();

      // UI에 데이터를 반영
      document.getElementById("profile-name").value = data.username || "";
      document.getElementById("profile-bio").value = data.introduction || "";
      document.getElementById("profile-birthday").value = data.birthday ? new Date(data.birthday.toDate()).toISOString().substring(0, 10) : "";
      document.getElementById("email-visibility").checked = data.email !== "비공개";
    } else {
      console.log("프로필 데이터가 없습니다.");
    }
  } else {
    console.log("로그인된 사용자가 없습니다.");
  }
}

// **2. 프로필 저장**
async function saveProfile() {
  const user = auth.currentUser;

  if (user) {
    const userDocRef = doc(db, "Trickcal : MiniGames", user.uid);

    const profileData = {
      username: document.getElementById("profile-name").value || "",
      introduction: document.getElementById("profile-bio").value || "",
      birthday: new Date(document.getElementById("profile-birthday").value) || null,
      email: document.getElementById("email-visibility").checked ? user.email : "비공개",
      profile: {
        icon: "default-icon.png", // 아직 업로드 기능은 구현되지 않았으므로 기본값
      },
    };

    try {
      await setDoc(userDocRef, profileData, { merge: true });
      alert("프로필이 저장되었습니다!");
    } catch (error) {
      console.error("프로필 저장 오류:", error);
      alert("프로필 저장 중 오류가 발생했습니다.");
    }
  } else {
    alert("로그인된 사용자가 없습니다.");
  }
}

// **3. DOM 이벤트 추가**
document.addEventListener("DOMContentLoaded", () => {
  // 페이지 로드 시 프로필 데이터 로드
  loadProfile();

  // 저장 버튼 이벤트
  document.getElementById("save-profile").addEventListener("click", saveProfile);
});
