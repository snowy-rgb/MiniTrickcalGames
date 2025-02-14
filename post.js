import { db } from "./auth.js"; 
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// ✅ Firestore에서 게시글 불러오기
export async function loadPosts(boardType) {
    try {
        const postList = document.getElementById("post-list");
        postList.innerHTML = ""; // 기존 게시글 목록 초기화

        // ✅ Firestore에서 게시글 가져오기
        const postsQuery = query(collection(db, boardType), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(postsQuery);

        querySnapshot.forEach((doc) => {
            const post = doc.data();

            // ✅ 게시글 HTML 요소 추가
            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <p><strong>작성자:</strong> ${post.author}</p>
                <p><small>${new Date(post.createdAt.seconds * 1000).toLocaleString()}</small></p>
            `;
            postList.appendChild(postElement);
        });

        console.log("✅ 게시글 불러오기 성공!");

    } catch (error) {
        console.error("❌ 게시글 불러오기 오류:", error);
    }
}
