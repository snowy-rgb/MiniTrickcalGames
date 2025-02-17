import { db, auth } from "./auth.js";  // ✅ auth.js에서 auth 가져오기
import { 
    collection, 
    getDocs, 
    addDoc, 
    orderBy, 
    query, 
    serverTimestamp 
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
            tags: tags || []          // 🔥 태그 저장
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

