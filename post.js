import { db } from "./auth.js"; 
import { 
    collection, 
    getDocs, 
    addDoc, 
    orderBy, 
    query, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// ✅ 게시글 저장 함수
export async function savePost(boardType, title, content, author) {
    try {
        // 🔹 게시판 선택 검증
        if (!boardType || (boardType !== "dev_notices" && boardType !== "community_posts")) {
            throw new Error("🚨 올바른 게시판을 선택하세요!");
        }

        // 🔹 Firestore에 게시글 저장
        const postCollection = collection(db, boardType);
        await addDoc(postCollection, {  
            title: title.trim(),  // 🔹 불필요한 공백 제거
            content: content.trim(),
            author: author,
            createdAt: serverTimestamp()
        });

        alert("✅ 게시글이 등록되었습니다!");
        window.location.href = "bullboard.html"; // 게시판으로 이동

    } catch (error) {
        console.error("❌ 게시글 저장 오류:", error);
        alert("🚨 게시글 저장 중 오류가 발생했습니다: " + error.message);
    }
}

// ✅ 게시글 목록 불러오기 함수
export async function savePost(boardType, title, content, authorId) {
    try {
        if (!boardType || (boardType !== "dev_notices" && boardType !== "community_posts")) {
            throw new Error("🚨 올바른 게시판을 선택하세요!");
        }

        const postCollection = collection(db, boardType);
        await addDoc(postCollection, {  
            title: title.trim(),
            content: content.trim(),
            authorId: authorId,  // 🔹 사용자 ID 저장
            createdAt: serverTimestamp()
        });

        alert("✅ 게시글이 등록되었습니다!");
        window.location.href = "bullboard.html";

    } catch (error) {
        console.error("❌ 게시글 저장 오류:", error);
        alert("🚨 게시글 저장 중 오류가 발생했습니다: " + error.message);
    }
}


