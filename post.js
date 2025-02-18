import { db, auth } from "./auth.js";
import { getFirestore, doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// 🔥 URL에서 게시글 ID & 게시판 타입 가져오기
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");
const board = urlParams.get("board");

if (!postId || !board) {
    alert("🚨 잘못된 접근입니다.");
    window.location.href = "bullboard.html";
}

// 🔥 게시글 요소 가져오기
const postTitle = document.getElementById("post-title");
const postAuthor = document.getElementById("post-author");
const authorIcon = document.getElementById("author-icon");
const authorName = document.getElementById("author-name");
const postDate = document.getElementById("post-date");
const postContent = document.getElementById("post-content");
const postTags = document.getElementById("post-tags");
const postMedia = document.getElementById("post-media");
const editBtn = document.getElementById("edit-btn");
const deleteBtn = document.getElementById("delete-btn");

// 🔥 게시글 불러오기 함수
async function loadPost() {
    console.log("📌 게시글 불러오는 중...");

    const postRef = doc(db, board, postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
        alert("🚨 게시글을 찾을 수 없습니다.");
        window.location.href = "bullboard.html";
        return;
    }

    const postData = postSnap.data();
    console.log("✅ 불러온 게시글 데이터:", postData);

    // 🔹 게시글 정보 표시
    postTitle.textContent = postData.title;
    postDate.textContent = `📅 ${new Date(postData.createdAt.seconds * 1000).toLocaleString()}`;
    postContent.innerHTML = postData.content;

    // 🔹 태그 표시
    if (postData.tags && postData.tags.length > 0) {
        postTags.innerHTML = postData.tags.map(tag => `<span class="tag">#${tag}</span>`).join(" ");
    } else {
        postTags.innerHTML = "<span>📌 태그 없음</span>";
    }

    // 🔹 미디어 표시
    if (postData.media && postData.media.length > 0) {
        postMedia.innerHTML = postData.media.map(mediaUrl => {
            if (mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".webm")) {
                return `<video controls src="${mediaUrl}"></video>`;
            } else if (mediaUrl.endsWith(".mp3") || mediaUrl.endsWith(".wav")) {
                return `<audio controls src="${mediaUrl}"></audio>`;
            } else {
                return `<img src="${mediaUrl}" alt="업로드된 이미지">`;
            }
        }).join("");
    }

    // 🔹 작성자 정보 가져오기
    const userRef = doc(db, "users", postData.authorId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data();
        authorIcon.src = userData.profile?.icon || "default-icon.png";
        authorName.textContent = userData.username || "익명";
        postAuthor.onclick = () => {
            window.location.href = `profile.html?uid=${postData.authorId}`;
        };
    } else {
        authorName.textContent = "알 수 없는 사용자";
    }

    // 🔥 조회수 증가
    if (!postData.views) postData.views = 0;
    const newViews = postData.views + 1;
    await updateDoc(postRef, { views: newViews });
    document.getElementById("post-views").textContent = `👀 ${newViews} views`;

    // 🔥 수정/삭제 버튼 체크
    checkUserPermissions(postData.authorId);
}

// 🔥 사용자 권한 확인 (작성자만 수정/삭제 가능)
function checkUserPermissions(authorId) {
    onAuthStateChanged(auth, (user) => {
        if (user && user.uid === authorId) {
            editBtn.style.display = "inline-block";
            deleteBtn.style.display = "inline-block";

            editBtn.onclick = () => {
                window.location.href = `post-edit.html?id=${postId}&board=${board}`;
            };

            deleteBtn.onclick = async () => {
                if (confirm("정말 삭제하시겠습니까?")) {
                    await deleteDoc(doc(db, board, postId));
                    alert("게시글이 삭제되었습니다.");
                    window.location.href = "bullboard.html";
                }
            };
        }
    });
}

// 🔥 페이지 로드 시 게시글 불러오기 실행
loadPost();






