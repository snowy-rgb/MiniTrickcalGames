import { db, auth } from "./auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// ✅ 게시글 저장 함수
async function savePost(board, title, content) {
  const user = auth.currentUser;
  if (!user) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, board), {
      title: title,
      content: content,
      author: user.displayName || user.email,  // 작성자 정보
      timestamp: serverTimestamp(),
    });
    alert("게시글이 등록되었습니다!");
    console.log("✅ 게시글 ID:", docRef.id);
  } catch (error) {
    console.error("❌ 게시글 저장 오류:", error);
  }
}

// ✅ 게시글 작성 버튼 클릭 시 실행
document.getElementById("post-submit").addEventListener("click", () => {
  const board = document.getElementById("board-select").value;
  const title = document.getElementById("post-title").value;
  const content = document.getElementById("post-content").value;
  
  if (title.trim() === "" || content.trim() === "") {
    alert("제목과 내용을 입력하세요.");
    return;
  }

  savePost(board, title, content);
});
