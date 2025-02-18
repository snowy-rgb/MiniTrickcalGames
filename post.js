import { db, auth } from "./auth.js";  // ✅ auth.js에서 auth 가져오기
import { 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    orderBy, 
    query, 
    serverTimestamp,
    updateDoc,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// ✅ 게시글 저장 함수 (이미지 & 비디오 지원)
export async function savePost(boardType, title, content, mediaUrls, tags) {
    try {
        if (!boardType || (boardType !== "dev_notices" && boardType !== "community_posts")) {
            throw new Error("🚨 올바른 게시판을 선택하세요!");
        }

        // ✅ 현재 로그인한 사용자의 UID 가져오기
        const user = auth.currentUser;
        if (!user) {
            throw new Error("🚨 로그인이 필요합니다!");
        }

        // ✅ Firestore에 게시글 저장
        const postCollection = collection(db, boardType);
        await addDoc(postCollection, {  
            title: title.trim(),
            content: content.trim(),
            authorId: user.uid,  // 🔹 게시글 작성자 ID 저장
            createdAt: serverTimestamp(),
            media: mediaUrls || [],  // 🔥 이미지/비디오 URL 저장
            tags: tags || [],        // 🔥 태그 저장
            views: 0,                // 🔥 조회수 필드 추가
            likes: 0,                // 🔥 좋아요 초기값
            dislikes: 0              // 🔥 싫어요 초기값
        });

        alert("✅ 게시글이 등록되었습니다!");
        window.location.href = "bullboard.html";

    } catch (error) {
        console.error("❌ 게시글 저장 오류:", error);
        alert("🚨 게시글 저장 중 오류가 발생했습니다: " + error.message);
    }
}

// ✅ 게시글 목록 불러오기 함수 (export 추가)
export async function loadPosts(boardType) {
  try {
    if (!boardType || (boardType !== "dev_notices" && boardType !== "community_posts")) {
      throw new Error("🚨 올바른 게시판을 선택하세요!");
    }

    const postCollection = collection(db, boardType);
    const q = query(postCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    let posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });

    const postList = document.getElementById("post-list");
    postList.innerHTML = ""; // 기존 목록 초기화

    if (posts.length === 0) {
      postList.innerHTML = "<li>아직 게시글이 없습니다.</li>";
    } else {
      posts.forEach((post) => {
        const postItem = document.createElement("li");
        postItem.className = "post-item";
        postItem.innerHTML = `
          <div class="post-title">${post.title}</div>
          <div class="post-meta">📅 ${new Date(post.createdAt.seconds * 1000).toLocaleString()}</div>
        `;
        postItem.onclick = () => window.location.href = `post-view.html?id=${post.id}&board=${boardType}`;
        postList.appendChild(postItem);
      });
    }
  } catch (error) {
    console.error("❌ 게시글 불러오기 오류:", error);
    alert("🚨 게시글을 불러오는 중 오류가 발생했습니다.");
  }
}

// 🔥 **댓글 작성**
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOMContentLoaded 실행됨!");

    // 🌟 현재 페이지 확인 (bullboard.html인지 post-view.html인지)
    const currentPage = window.location.pathname;
    console.log("📌 현재 페이지:", currentPage);

    if (!currentPage.includes("post-view.html")) {
        console.log("🚨 현재 페이지는 post-view.html이 아니므로 댓글 기능 실행 안함!");
        return;
    }

    // ✅ post-view.html에서만 실행될 코드
    console.log("✅ post-view.html 감지됨. 댓글 기능 실행 시작!");

    const commentsList = document.getElementById("comments-list");
    const addCommentBtn = document.getElementById("add-comment");
    const commentInput = document.getElementById("comment-input");

    if (!commentsList) {
        console.error("❌ 댓글 리스트 (#comments-list) 요소를 찾을 수 없습니다!");
        return;
    }

    if (!addCommentBtn) {
        console.error("❌ 댓글 작성 버튼 (#add-comment) 요소를 찾을 수 없습니다!");
        return;
    }

    // 🔥 댓글 불러오기
    async function loadComments() {
        console.log("📝 댓글 불러오는 중...");
        commentsList.innerHTML = ""; // 기존 댓글 삭제 후 다시 로드

        const commentsRef = collection(db, `${board}/${postId}/comments`);
        const commentsSnap = await getDocs(commentsRef);

        commentsSnap.forEach((doc) => {
            const comment = doc.data();
            const commentElement = document.createElement("div");
            commentElement.innerHTML = `
                <p><strong>${comment.authorId}</strong>: ${comment.content}</p>
                <button onclick="deleteComment('${doc.id}')">삭제</button>
            `;
            commentsList.appendChild(commentElement);
        });
    }

    // 🔥 댓글 작성
    addCommentBtn.addEventListener("click", async () => {
        if (!commentInput || !commentInput.value.trim()) {
            alert("댓글을 입력하세요!");
            return;
        }

        const commentsRef = collection(db, `${board}/${postId}/comments`);
        await addDoc(commentsRef, {
            authorId: auth.currentUser.uid,
            content: commentInput.value,
            createdAt: serverTimestamp()
        });

        commentInput.value = ""; // 입력칸 초기화
        loadComments(); // 댓글 새로고침
    });

    // 🔥 댓글 삭제
    async function deleteComment(commentId) {
        if (!confirm("댓글을 삭제하시겠습니까?")) return;
        const commentRef = doc(db, `${board}/${postId}/comments`, commentId);
        await deleteDoc(commentRef);
        loadComments();
    }

    // 🔥 페이지 로드 시 댓글 불러오기
    loadComments();
});


// 🔥 **좋아요/싫어요 기능**
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOMContentLoaded 실행됨!");

    // 🌟 현재 페이지 확인 (bullboard.html인지 post-view.html인지)
    const currentPage = window.location.pathname;
    console.log("📌 현재 페이지:", currentPage);

    if (!currentPage.includes("post-view.html")) {
        console.log("🚨 현재 페이지는 post-view.html이 아니므로 댓글 및 좋아요/싫어요 기능 실행 안함!");
        return;
    }

    // ✅ post-view.html에서만 실행될 코드
    console.log("✅ post-view.html 감지됨. 댓글 및 좋아요/싫어요 기능 실행 시작!");

    const commentsList = document.getElementById("comments-list");
    const addCommentBtn = document.getElementById("add-comment");
    const commentInput = document.getElementById("comment-input");
    const likeBtn = document.getElementById("like-btn");
    const dislikeBtn = document.getElementById("dislike-btn");
    const likeCount = document.getElementById("like-count");
    const dislikeCount = document.getElementById("dislike-count");

    if (!commentsList) {
        console.error("❌ 댓글 리스트 (#comments-list) 요소를 찾을 수 없습니다!");
        return;
    }

    if (!addCommentBtn) {
        console.error("❌ 댓글 작성 버튼 (#add-comment) 요소를 찾을 수 없습니다!");
        return;
    }

    if (!likeBtn || !dislikeBtn) {
        console.error("❌ 좋아요/싫어요 버튼 요소를 찾을 수 없습니다!");
        return;
    }

    // 🔥 **좋아요/싫어요 기능**
    async function updateLikes(type) {
        const postRef = doc(db, board, postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return;
        let postData = postSnap.data();

        if (!postData.likes) postData.likes = 0;
        if (!postData.dislikes) postData.dislikes = 0;

        if (type === "like") {
            postData.likes += 1;
        } else {
            postData.dislikes += 1;
        }

        await updateDoc(postRef, {
            likes: postData.likes,
            dislikes: postData.dislikes
        });

        likeCount.textContent = postData.likes;
        dislikeCount.textContent = postData.dislikes;
    }

    // 🔥 **좋아요/싫어요 버튼 이벤트 리스너 추가**
    likeBtn.addEventListener("click", () => updateLikes("like"));
    dislikeBtn.addEventListener("click", () => updateLikes("dislike"));

    // 🔥 **게시글 불러올 때 좋아요/싫어요 반영**
    async function loadLikes() {
        const postRef = doc(db, board, postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return;
        let postData = postSnap.data();

        likeCount.textContent = postData.likes || 0;
        dislikeCount.textContent = postData.dislikes || 0;
    }

    // 🔥 **페이지 로드 시 실행**
    loadLikes();
});


