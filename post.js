import { db, auth } from "./auth.js";
import { 
    collection, 
    getDocs, 
    addDoc, 
    orderBy, 
    query, 
    serverTimestamp,
    doc,  // ✅ 문법 수정됨
    updateDoc, 
    getDoc
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";  // ✅ Firestore 추가
import { getStorage } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-storage.js";  // ✅ Firebase Storage 추가

// ✅ Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyA-tApRNQGZ3d1gzGhX5hAdntMsC5d9PrM",
  authDomain: "minitrickcal.firebaseapp.com",
  projectId: "minitrickcal",
  storageBucket: "minitrickcal.firebasestorage.app",
  messagingSenderId: "891613009633",
  appId: "1:891613009633:web:1b0888f7641df77424c9a0",
  measurementId: "G-6BK85ML1RH"
};

// ✅ Firebase 초기화
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);  // ✅ Storage 추가

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

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        let userData = userSnap.exists() ? userSnap.data() : { username: "익명", profile: { icon: "default-icon.png" } };

        // ✅ Firestore에 게시글 저장
        const postCollection = collection(db, boardType);
        await addDoc(postCollection, {  
            title: title.trim(),
            content: content.trim(),
            authorId: user.uid,  // 🔹 게시글 작성자 ID 저장
            authorName: userData.username,  // 🔥 사용자 이름 저장
            authorIcon: userData.profile.icon, 
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

// bullboard에 게시글 불러오기
export async function loadPosts(boardType) {
  try {
    if (!boardType || (boardType !== "dev_notices" && boardType !== "community_posts")) {
      console.log("오류 : 확인되지않음//u-//무시")
    }

    console.log("🔥 Firestore 요청 확인: ", boardType);

    const postCollection = collection(db, boardType);
    const q = query(postCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    let posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });

    console.log("✅ Firestore 데이터 가져옴:", posts);

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


export async function loadPost(board, postId) {
    console.log("🔥 loadPost() 실행됨! board:", board, "postId:", postId);

    if (!board || !postId) {
        console.error("❌ board 또는 postId가 없습니다!");
        return;
    }

    const postRef = doc(db, board, postId);
    console.log("📌 Firestore 문서 요청:", postRef.path);

    try {
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            console.error("❌ Firestore 문서 없음:", board, postId);
            alert("게시글을 찾을 수 없습니다.");
            window.location.href = "bullboard.html";
            return;
        }
        // end1

        const postData = postSnap.data();
        console.log("✅ Firestore 데이터 불러옴:", postData);

        document.getElementById("post-title").textContent = postData.title || "제목 없음";
        document.getElementById("post-content").innerHTML = postData.content || "내용 없음";
        document.getElementById("post-date").textContent = `📅 ${new Date(postData.createdAt.seconds * 1000).toLocaleString()}`;
        

        // ✅ 작성자 정보 가져오기 (authorId를 Firestore에서 조회)
       if (postData.authorId) {
            const userRef = doc(db, "Trickcal_MIniGames", postData.authorId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                console.log("✅ Firestore에서 사용자 정보 가져옴:", userData);

                // 🔥 UI 업데이트 (닉네임 & 프로필 사진)
                document.getElementById("author-name").textContent = userData.username || "알 수 없는 사용자";
                document.getElementById("author-icon").src = userData.profile?.icon || "default-icon.png";
            } else {
                console.warn("⚠️ Firestore에서 사용자 정보를 찾을 수 없음! 기본값 사용");
                document.getElementById("author-name").textContent = "알 수 없는 사용자";
                document.getElementById("author-icon").src = "default-icon.png";
            }
        } else {
            console.warn("⚠️ 게시글에 authorId가 없음! 기본값 사용");
        }


        // ✅ 태그 표시
        if (postData.tags && postData.tags.length > 0) {
            document.getElementById("post-tags").innerHTML = postData.tags.map(tag => `<span class="tag">#${tag}</span>`).join(" ");
        }

        // ✅ 미디어 표시
        if (postData.media && postData.media.length > 0) {
            document.getElementById("post-media").innerHTML = postData.media.map(mediaUrl => {
                if (mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".webm")) {
                    return `<video controls src="${mediaUrl}"></video>`;
                } else if (mediaUrl.endsWith(".mp3") || mediaUrl.endsWith(".wav")) {
                    return `<audio controls src="${mediaUrl}"></audio>`;
                } else {
                    return `<img src="${mediaUrl}" alt="업로드된 이미지">`;
                }
            }).join("");
        }

    } catch (error) {
        console.error("❌ Firestore에서 데이터 가져오기 오류:", error);
    }
}


// 🔥 조회수 증가 함수 (이 함수가 정의되지 않아서 오류 발생했음)
export async function updateViews(boardType, postId) {
    try {
        const postRef = doc(db, boardType, postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
            let postData = postSnap.data();
            const newViews = (postData.views || 0) + 1;

            await updateDoc(postRef, { views: newViews });

            document.getElementById("post-views").textContent = `조회수 ${newViews} views`;
            console.log(`✅ 조회수 업데이트됨: ${newViews}`);
        }
    } catch (error) {
        console.error("❌ 조회수 업데이트 오류:", error);
    }
}

// ✅ `DOMContentLoaded` 이벤트 리스너 내부에서 `updateViews()` 실행
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOMContentLoaded 실행됨!");

    const currentPage = window.location.pathname;
    console.log("📌 현재 페이지:", currentPage);

    if (currentPage.includes("bullboard.html")) {
        console.log("✅ bullboard.html 감지됨. 게시글 목록 불러오기 실행!");

        const board = "community_posts";  // 기본 게시판 타입 설정
        loadPosts(board);  // 🟢 `board` 값을 전달!

    } else if (currentPage.includes("post-view.html")) {
        console.log("✅ post-view.html 감지됨. 게시글 상세 보기 실행!");

        const urlParams = new URLSearchParams(window.location.search);
        const board = urlParams.get("board"); 
        const postId = urlParams.get("id");

        console.log("✅ board:", board);
        console.log("✅ postId:", postId);

        if (!board || !postId) {
            console.error("❌ 게시판 또는 게시글 ID가 정의되지 않았습니다.");
            return;
        }

        updateViews(board, postId);
        loadLikes(board, postId);
        loadComments(board, postId);
    } else {
        console.log("⚠️ 해당 페이지에서는 post.js 기능이 실행되지 않음.");
    }
});



// re:end111- 582AFX90Cy
// 🔥 댓글 불러오기
// 🔥 댓글 불러오기 (최신순 정렬)
export async function loadComments(boardType, postId) {
    try {
        const commentsRef = collection(db, `${boardType}/${postId}/comments`);
        const q = query(commentsRef, orderBy("createdAt", "desc")); // 🔥 최신순 정렬 추가!
        const commentsSnap = await getDocs(q);

        const commentsList = document.getElementById("comments-list");
        commentsList.innerHTML = ""; // 기존 댓글 초기화

        if (commentsSnap.empty) {
            commentsList.innerHTML = "<p>아직 댓글이 없습니다.</p>";
        } else {
            for (const docSnap of commentsSnap.docs) {
                const commentData = docSnap.data();
                const commentElement = document.createElement("div");
                commentElement.className = "comment-box"; // 🔥 댓글 칸 스타일 적용

                // ✅ Firestore에서 작성자의 프로필 정보 가져오기
                let username = "익명";
                let userIcon = "default-icon.png";

                if (commentData.authorId) {
                    const userRef = doc(db, "Trickcal_MIniGames", commentData.authorId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        username = userData.username || "익명";
                        userIcon = userData.profile?.icon || "default-icon.png";
                    }
                }

                // ✅ 작성 시간 변환
                const createdAt = commentData.createdAt?.seconds
                    ? new Date(commentData.createdAt.seconds * 1000).toLocaleString()
                    : "날짜 없음";

                // ✅ 댓글 UI 구성
                commentElement.innerHTML = `
                    <div class="comment-header">
                        <img src="${userIcon}" alt="프로필 사진" class="comment-profile">
                        <div class="comment-info">
                            <span class="comment-username">${username}</span>
                            <span class="comment-time">${createdAt}</span>
                        </div>
                    </div>
                    <div class="comment-content">
                        ${commentData.content}
                    </div>
                `;

                commentsList.appendChild(commentElement);
            }
        }
    } catch (error) {
        console.error("❌ 댓글 불러오기 오류:", error);
        alert("🚨 댓글을 불러오는 중 오류가 발생했습니다.");
    }
}



//댓글 작성
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOMContentLoaded 실행됨!");

    // 현재 페이지 확인
    const currentPage = window.location.pathname;
    console.log("📌 현재 페이지:", currentPage);

    if (currentPage.includes("bullboard.html")) {
        console.log("✅ bullboard.html 감지됨. 게시글 목록 불러오기 실행!");

        const boardType = "community_posts";  // 기본 게시판 타입 설정
        loadPosts();  // 게시글 목록 불러오기 실행

    } else if (currentPage.includes("post-view.html")) {
        console.log("✅ post-view.html 감지됨. 게시글 상세 보기 실행!");

        const urlParams = new URLSearchParams(window.location.search);
        const board = urlParams.get("board"); 
        const postId = urlParams.get("id");

        console.log("✅ board:", board);
        console.log("✅ postId:", postId);

        if (!board || !postId) {
            console.error("❌ 게시판 또는 게시글 ID가 정의되지 않았습니다.");
            return;
        }

        // ✅ 게시글 조회수 증가
        updateViews(board, postId);

        // ✅ 좋아요/싫어요 불러오기
        loadLikes(board, postId);

        // ✅ 댓글 불러오기
        loadComments(board, postId);

        // ✅ 댓글 작성 기능 추가 (post-view.html에서만 실행)
        const addCommentBtn = document.getElementById("add-comment");
        if (addCommentBtn) {
            addCommentBtn.addEventListener("click", async () => {
                const commentInput = document.getElementById("comment-input").value;
                if (!commentInput.trim()) return alert("🚨 댓글을 입력하세요!");

                const user = auth.currentUser;
                if (!user) return alert("🚨 로그인이 필요합니다!");

                try {
                    const commentsRef = collection(db, `${board}/${postId}/comments`);
                    await addDoc(commentsRef, {
                        authorId: user.uid,
                        content: commentInput.trim(),
                        createdAt: serverTimestamp(),
                    });

                    document.getElementById("comment-input").value = ""; // 입력칸 초기화
                    loadComments(board, postId); // 댓글 새로고침
                } catch (error) {
                    console.error("❌ 댓글 저장 오류:", error);
                    alert("🚨 댓글 저장 중 오류 발생");
                }
            });
        } else {
            console.warn("⚠️ 현재 페이지에는 댓글 작성 버튼이 없습니다! (무시 가능)");
        }

        // ✅ 좋아요/싫어요 버튼 이벤트 추가 (post-view.html에서만 실행)
        const likeBtn = document.getElementById("like-btn");
        const dislikeBtn = document.getElementById("dislike-btn");

        if (likeBtn && dislikeBtn) {
            likeBtn.addEventListener("click", () => updateLikes("like"));
            dislikeBtn.addEventListener("click", () => updateLikes("dislike"));
        } else {
            console.warn("⚠️ 현재 페이지에는 좋아요/싫어요 버튼이 없습니다! (무시 가능)");
        }
    } else {
        console.log("⚠️ 해당 페이지에서는 post.js 기능이 실행되지 않음.");
    }
});

//post 불러오기(post-view)
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOMContentLoaded 실행됨!");

    const currentPage = window.location.pathname;
    console.log("📌 현재 페이지:", currentPage);

    if (currentPage.includes("post-view.html")) {  // 🟢 오직 post-view.html에서만 실행됨
        console.log("✅ post-view.html 감지됨. 게시글 상세 보기 실행!");

        const urlParams = new URLSearchParams(window.location.search);
        const board = urlParams.get("board"); 
        const postId = urlParams.get("id");

        console.log("✅ board:", board);
        console.log("✅ postId:", postId);

        if (!board || !postId) {
            console.error("❌ 게시판 또는 게시글 ID가 정의되지 않았습니다.");
            return;
        }

        updateViews(board, postId);
        loadLikes(board, postId);
        loadComments(board, postId);
        loadPost(board, postId);  // ✅ 게시글 불러오기 실행
    } else {
        console.log("⚠️ 해당 페이지에서는 post.js 기능이 실행되지 않음.");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOMContentLoaded 실행됨!");

    const urlParams = new URLSearchParams(window.location.search);
    const board = urlParams.get("board"); 
    const postId = urlParams.get("id");

    console.log("📌 board:", board);
    console.log("📌 postId:", postId);

    if (!board || !postId) {
        console.error("❌ board 또는 postId가 없습니다!");
        return;
    }

    // ✅ 인자를 명확하게 전달하여 실행
    loadPost(board, postId);
});


const likeBtn = document.getElementById("like-btn");
const dislikeBtn = document.getElementById("dislike-btn");
const likeCount = document.getElementById("like-count");
const dislikeCount = document.getElementById("dislike-count");

// 🔥 좋아요/싫어요 불러오기
export async function loadLikes(boardType, postId) {
    try {
        const postRef = doc(db, boardType, postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return;

        let postData = postSnap.data();
        const user = auth.currentUser;

        if (!user) return;

        // 🔥 좋아요/싫어요 개수 업데이트
        likeCount.textContent = postData.likes || 0;
        dislikeCount.textContent = postData.dislikes || 0;

        // ✅ 현재 사용자가 좋아요/싫어요를 눌렀는지 확인
        let userLikes = postData.likedUsers || {};
        let userDislikes = postData.dislikedUsers || {};

        if (userLikes[user.uid]) {
            likeBtn.style.backgroundColor = "green";
        } else {
            likeBtn.style.backgroundColor = "";
        }

        if (userDislikes[user.uid]) {
            dislikeBtn.style.backgroundColor = "green";
        } else {
            dislikeBtn.style.backgroundColor = "";
        }

        // 🔥 버튼 이벤트 리스너 추가 (중복 방지)
        likeBtn.onclick = () => updateLikes(boardType, postId, "like");
        dislikeBtn.onclick = () => updateLikes(boardType, postId, "dislike");
    } catch (error) {
        console.error("❌ 좋아요/싫어요 불러오기 오류:", error);
    }
}

// 🔥 좋아요/싫어요 업데이트
async function updateLikes(boardType, postId, type) {
    try {
        const postRef = doc(db, boardType, postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return;

        let postData = postSnap.data();
        const user = auth.currentUser;

        if (!user) {
            alert("🚨 로그인이 필요합니다!");
            return;
        }

        if (user.uid === postData.authorId) {
            alert("🚨 자신의 게시글에는 좋아요/싫어요를 누를 수 없습니다!");
            return;
        }

        let userLikes = postData.likedUsers || {};
        let userDislikes = postData.dislikedUsers || {};

        let likes = postData.likes || 0;
        let dislikes = postData.dislikes || 0;

        if (type === "like") {
            if (userLikes[user.uid]) {
                // 🔥 좋아요 취소
                delete userLikes[user.uid];
                likes -= 1;
                likeBtn.style.backgroundColor = "";
            } else {
                // 🔥 좋아요 추가
                userLikes[user.uid] = true;
                likes += 1;
                likeBtn.style.backgroundColor = "green";

                // ❌ 싫어요가 눌려 있다면 취소
                if (userDislikes[user.uid]) {
                    delete userDislikes[user.uid];
                    dislikes -= 1;
                    dislikeBtn.style.backgroundColor = "";
                }
            }
        } else if (type === "dislike") {
            if (userDislikes[user.uid]) {
                // 🔥 싫어요 취소
                delete userDislikes[user.uid];
                dislikes -= 1;
                dislikeBtn.style.backgroundColor = "";
            } else {
                // 🔥 싫어요 추가
                userDislikes[user.uid] = true;
                dislikes += 1;
                dislikeBtn.style.backgroundColor = "green";

                // ❌ 좋아요가 눌려 있다면 취소
                if (userLikes[user.uid]) {
                    delete userLikes[user.uid];
                    likes -= 1;
                    likeBtn.style.backgroundColor = "";
                }
            }
        }

        // 🔥 Firestore 업데이트
        await updateDoc(postRef, {
            likes: likes,
            dislikes: dislikes,
            likedUsers: userLikes,
            dislikedUsers: userDislikes
        });

        // 🔥 UI 업데이트
        likeCount.textContent = likes;
        dislikeCount.textContent = dislikes;
    } catch (error) {
        console.error("❌ 좋아요/싫어요 업데이트 오류:", error);
    }
}


const urlParams = new URLSearchParams(window.location.search);
const board = urlParams.get("board"); 
const postId = urlParams.get("id");

console.log("✅ board:", board);
console.log("✅ postId:", postId);

if (!board || !postId) {
    console.error("❌ 게시판 또는 게시글 ID가 정의되지 않았습니다.");
}




//업데이트 - 0.1.21
