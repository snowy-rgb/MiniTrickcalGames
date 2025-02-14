import { db } from "./auth.js";
import {
  collection,
  getDocs,
  addDoc,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// ✅ 중복 선언 방지: 이미 정의된 경우 재정의 방지
if (!window.savePost) {
  window.savePost = async function (boardType, title, content, author) {
    try {
      if (!boardType || (boardType !== "dev_notices" && boardType !== "community_posts")) {
        throw new Error("🚨 올바른 게시판을 선택하세요!");
      }

      const postCollection = collection(db, boardType);
      await addDoc(postCollection, {
        title: title.trim(),
        content: content.trim(),
        authorId: author, // Firestore에는 user ID 저장
        createdAt: serverTimestamp()
      });

      alert("✅ 게시글이 등록되었습니다!");
      window.location.href = "bullboard.html";

    } catch (error) {
      console.error("❌ 게시글 저장 오류:", error);
      alert("🚨 게시글 저장 중 오류가 발생했습니다: " + error.message);
    }
  };
}

// ✅ 중복 선언 방지
if (!window.loadPosts) {
  window.loadPosts = async function (boardType) {
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
  };
}



