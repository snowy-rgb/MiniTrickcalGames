import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { auth } from "./auth.js";

const db = getFirestore();
const profileBtn = document.getElementById("profile-btn");
const profileModal = document.getElementById("profile-modal");
const closeModal = document.getElementById("close-modal");
const saveProfile = document.getElementById("save-profile");
const profileIcon = document.getElementById("profile-icon");
const profileName = document.getElementById("profile-name");
const profileBio = document.getElementById("profile-bio");
const emailVisibility = document.getElementById("email-visibility");

// ✅ 로그인 후 프로필이 없으면 자동 이동
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // 프로필 정보가 없으면 프로필 설정 페이지로 이동
      window.location.href = "start.html";
    }
  }
});

// ✅ 프로필 모달 열기
profileBtn.addEventListener("click", () => {
  profileModal.classList.remove("hidden");
  loadProfile(); // 기존 데이터 로드
});

// ✅ 프로필 모달 닫기
closeModal.addEventListener("click", () => {
  profileModal.classList.add("hidden");
});

// ✅ 프로필 저장
saveProfile.addEventListener("click", async () => {
  const userId = auth.currentUser.uid;
  const file = profileIcon.files[0];
  const name = profileName.value;
  const bio = profileBio.value;
  const isEmailPublic = emailVisibility.checked;

  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      await setDoc(doc(db, "users", userId), {
        profileIcon: e.target.result, // 이미지 Base64 저장
        name: name,
        bio: bio,
        email: auth.currentUser.email,
        isEmailPublic: isEmailPublic, // 이메일 공개 여부 저장
        createdAt: new Date(),
      });
      alert("프로필이 저장되었습니다.");
      profileModal.classList.add("hidden");
    };
    reader.readAsDataURL(file);
  } else {
    await setDoc(doc(db, "users", userId), { name, bio, isEmailPublic }, { merge: true });
    alert("프로필이 저장되었습니다.");
    profileModal.classList.add("hidden");
  }
});

// ✅ 프로필 로드
async function loadProfile() {
  const userId = auth.currentUser.uid;
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    profileName.value = data.name || "";
    profileBio.value = data.bio || "";
    emailVisibility.checked = data.isEmailPublic || false;
  }
}
