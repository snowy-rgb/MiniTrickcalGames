import { db } from "./auth.js"; 
import { collection, getDocs, addDoc, orderBy, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// ✅ 게시글 저장 함수
export async function savePost(boardType, title, content, author) {
    try {
        const postCollection = collection(db, boardType);  // ✅ 선택한 게시판에 게시글 저장
        await addDoc(postCollection, {  // ✅ 자동으로 문서 ID 생성됨
            title: title,
            content: content,
            author: author,
            createdAt: serverTimestamp()  // Firestore에서 자동으로 타임스탬프 설정
        });

        alert("✅ 게시글이 등록되었습니다!");
        window.location.href = "bullboard.html"; // 게시판으로 이동

    } catch (error) {
        console.error("❌ 게시글 저장 오류:", error);
        alert("🚨 게시글 저장 중 오류가 발생했습니다.");
    }
}
