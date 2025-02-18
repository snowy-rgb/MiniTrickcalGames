import { db, auth } from "./auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// ✅ Cloudinary API 설정
const CLOUDINARY_CLOUD_NAME = "doji3ykrt";
const CLOUDINARY_UPLOAD_PRESET = "MiniTrickcalGames";

// ✅ 게시글 정보
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const postTitle = document.getElementById("post-title");
const postContent = document.getElementById("post-content");
const mediaUpload = document.getElementById("media-upload");

// ✅ 현재 글자 스타일 설정
let currentFontSize = "16px";
let currentFontColor = "#000000";

// 🔹 글자 크기 변경
function setFontSize() {
    const size = prompt("변경할 글자 크기를 입력하세요 (예: 16px, 1.2em)");
    if (size) {
        currentFontSize = size;
        document.execCommand("fontSize", false, "7"); // 기본 크기 설정
        document.querySelector(".editor").style.fontSize = currentFontSize;
    }
}

// 🔹 글자 색 변경
function setFontColor() {
    const color = prompt("변경할 글자 색을 입력하세요 (예: red, #ff0000)");
    if (color) {
        currentFontColor = color;
        document.execCommand("foreColor", false, currentFontColor);
    }
}

// 🔥 새로운 글이 추가될 때 현재 스타일 유지
postContent.addEventListener("keydown", () => {
    document.execCommand("fontSize", false, "7");
    document.execCommand("foreColor", false, currentFontColor);
});

// 🔹 미디어 업로드 & Cloudinary 저장
mediaUpload.addEventListener("change", async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    for (let file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.secure_url) {
                insertMediaIntoEditor(data.secure_url, file.type);
            } else {
                console.error("❌ 업로드 실패:", data);
                alert("🚨 미디어 업로드 실패");
            }
        } catch (error) {
            console.error("❌ Cloudinary 업로드 오류:", error);
            alert("🚨 Cloudinary 업로드 중 오류 발생");
        }
    }
});

// 🔹 미디어 삽입 (현재 커서 위치에 추가)
function insertMediaIntoEditor(url, type) {
    const editor = postContent;
    const mediaElement = document.createElement(type.startsWith("image") ? "img" : "video");

    if (type.startsWith("video")) {
        mediaElement.controls = true;
    }

    mediaElement.src = url;
    mediaElement.style.maxWidth = "100%";
    mediaElement.style.marginTop = "5px";
    mediaElement.contentEditable = "false"; // 직접 수정 방지
    mediaElement.classList.add("media-item");

    // 🔥 현재 커서 위치에 미디어 삽입
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(mediaElement);
        range.insertNode(document.createElement("br")); // 줄바꿈 추가
        selection.collapseToEnd(); // 커서를 미디어 뒤로 이동
    } else {
        editor.appendChild(mediaElement);
        editor.appendChild(document.createElement("br")); // 줄바꿈 추가
    }
}

// 🔥 미디어 삭제 (Backspace/Delete 키로 삭제)
postContent.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" || event.key === "Delete") {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const node = range.startContainer.parentNode;

            if (node.classList.contains("media-item")) {
                node.remove(); // 미디어 삭제
                event.preventDefault(); // 기본 동작 방지
            }
        }
    }
});

// 🔥 게시글 저장
submitBtn.addEventListener("click", async () => {
    const title = postTitle.value.trim();
    const content = postContent.innerHTML;
    const tags = document.getElementById("tag-input").value
        .split("#")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");

    if (!title || !content) {
        alert("🚨 제목과 내용을 입력하세요!");
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        alert("🚨 로그인한 사용자만 글을 작성할 수 있습니다.");
        return;
    }

    try {
        await addDoc(collection(db, "community_posts"), {
            title,
            content,
            tags,
            authorId: user.uid,
            createdAt: serverTimestamp(),
        });

        alert("✅ 게시글이 등록되었습니다!");
        window.location.href = "bullboard.html";
    } catch (error) {
        console.error("❌ 게시글 저장 오류:", error);
        alert("🚨 게시글 저장 중 오류 발생");
    }
});

// 🔹 취소 버튼 클릭 시 게시판으로 이동
cancelBtn.addEventListener("click", () => {
    window.location.href = "bullboard.html";
});





