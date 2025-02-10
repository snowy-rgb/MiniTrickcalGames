import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-storage.js";

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

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

      // 프로필 이미지 미리보기
      if (data.profile && data.profile.icon) {
        document.getElementById("profile-icon-preview").src = data.profile.icon;
      }

      // 이메일, 가입일 표시
      document.getElementById("email-display").textContent = data.email || "정보 없음";
      document.getElementById("join-date").textContent = data.joinday ? new Date(data.joinday.toDate()).toLocaleDateString() : "정보 없음";
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
      birthday: document.getElementById("profile-birthday").value
        ? new Date(document.getElementById("profile-birthday").value)
        : null,
      email: document.getElementById("email-visibility").checked ? user.email : "비공개",
      profile: {
        icon: document.getElementById("profile-icon-preview").src || "default-icon.png",
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

// **3. 사진 업로드**
async function uploadProfilePicture(file) {
  if (!file) {
    alert("파일을 선택하세요!");
    return;
  }

  const user = auth.currentUser;
  const storageRef = ref(storage, `profile-pictures/${user.uid}`);
  
  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    alert("사진 업로드 성공!");
    return downloadURL;
  } catch (error) {
    console.error("사진 업로드 오류:", error);
    alert("사진 업로드 중 오류가 발생했습니다.");
  }
}

// **4. DOM 이벤트 추가**
document.addEventListener("DOMContentLoaded", () => {
  // 페이지 로드 시 프로필 데이터 로드
  loadProfile();

  // 저장 버튼 이벤트
  document.getElementById("save-profile").addEventListener("click", saveProfile);

  // 사진 업로드 이벤트
  document.getElementById("profile-icon").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    const imageUrl = await uploadProfilePicture(file);

    if (imageUrl) {
      document.getElementById("profile-icon-preview").src = imageUrl; // 미리보기 업데이트
    }
  });
});
