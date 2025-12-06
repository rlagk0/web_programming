/* -------------------------
   사용자 인증 & 헤더
------------------------- */
async function loadUserDataForHeader() {
    try {
        const response = await fetch("/User.json");
        return response.ok ? await response.json() : {};
    } catch (e) {
        console.warn("User.json 로드 실패:", e);
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const loggedInUsername = localStorage.getItem('loginUser');
        const user = users.find(u => u.username === loggedInUsername);
        return user || {};
    }
}

function updateAuthUI(isLoggedIn, userName) {
    const icon = document.getElementById('profileIcon');
    const menu = document.getElementById('profileMenu');
    const nameEl = document.getElementById('dropdownUserName');

    if (!icon || !menu) return;

    if (isLoggedIn) {
        icon.onclick = (e) => {
            e.stopPropagation();
            menu.classList.toggle('active');
            if (nameEl) nameEl.textContent = userName || "사용자";
        };
    } else {
        icon.onclick = () => {
            window.location.href = '../Login/13_NeulIt_Login.html';
        };
        menu.style.display = 'none';
    }

    document.addEventListener('click', (e) => {
        if (menu && !icon.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('active');
        }
    });
}

function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginUser');
    alert("로그아웃 되었습니다.");
    window.location.href = '../Main/13_NeulIt_Main.html';
}

/* -------------------------
   페이지 초기화
------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
    // 사용자 인증 처리
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loggedInUser = localStorage.getItem('loginUser');
    let userName = loggedInUser || 'guest';

    if (isLoggedIn) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find(u => u.username === loggedInUser);

        if (!foundUser) {
            const jsonUser = await loadUserDataForHeader();
            if (jsonUser && jsonUser.userId === loggedInUser) {
                userName = jsonUser.name;
            }
        } else {
            userName = foundUser.name;
        }
    }

    updateAuthUI(isLoggedIn, userName);

    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) logoutBtn.onclick = handleLogout;

    // 페이지 구분 및 초기화
    const isMainPage = document.querySelector(".clip-list") !== null;
    const isDetailPage = document.querySelector(".content") !== null;

    if (isMainPage) initMainPage();
    if (isDetailPage) initDetailPage();

    // 댓글 기능
    const commentInput = document.getElementById("commentInput");
    const postCommentBtn = document.getElementById("postComment");
    const commentList = document.getElementById("commentList");

    if (isLoggedIn && commentInput && postCommentBtn) {
        commentInput.disabled = false;
        commentInput.placeholder = "댓글을 작성하세요.";
        postCommentBtn.disabled = false;

        postCommentBtn.addEventListener("click", () => {
            const commentText = commentInput.value.trim();
            if (commentText) {
                const li = document.createElement("li");

                const author = document.createElement("strong");
                author.textContent = userName || "NeulIT";

                const content = document.createElement("p");
                content.textContent = commentText;

                li.appendChild(author);
                li.appendChild(document.createElement("br"));
                li.appendChild(content);

                commentList.appendChild(li);
                commentInput.value = "";
            }
        });
    }
});

/* -------------------------
   메인 페이지 초기화
------------------------- */
function initMainPage() {
    const clipItems = document.querySelectorAll(".clip-item");
    const clipList = document.querySelector(".clip-list");
    if (!clipList) return;

    const readData = JSON.parse(sessionStorage.getItem("clip_read") || "{}");
    const clipsArray = Array.from(clipItems);
    const sortSelect = document.getElementById("sort");

    clipsArray.forEach((item, idx) => {
        const id = item.dataset.id || idx;
        const titleElement = item.querySelector('h3');

        if (readData[id] && titleElement) {
            titleElement.classList.add('read');
        }

        item.addEventListener("click", () => {
            if (titleElement) {
                titleElement.classList.add('read');
            }
            
            readData[id] = true;
            sessionStorage.setItem("clip_read", JSON.stringify(readData));
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            const shuffled = clipsArray
                .map(c => ({ c, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(obj => obj.c);

            clipList.innerHTML = "";
            shuffled.forEach(item => clipList.appendChild(item));
        });
    }
}

/* -------------------------
   디테일 페이지 초기화
------------------------- */
function initDetailPage() {
    const contentArea = document.querySelector(".content");
    if (!contentArea) return;

    const pdfContainer = document.createElement("div");
    pdfContainer.style.display = "flex";
    pdfContainer.style.gap = "10px";
    pdfContainer.style.marginTop = "10px";
    contentArea.appendChild(pdfContainer);

    // PDF 다운로드 버튼
    const pdfBtn1 = document.createElement("button");
    pdfBtn1.textContent = "📥 PDF 다운로드";
    stylePdfButton(pdfBtn1);
    pdfContainer.appendChild(pdfBtn1);

    pdfBtn1.addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        html2canvas(document.querySelector(".content")).then(canvas => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            const imgWidth = 190;
            const pageHeight = 290;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save("content.pdf");
        });
    });

    const pdfBtn2 = document.createElement("button");
    pdfBtn2.textContent = "📄 도움되는 자료";
    stylePdfButton(pdfBtn2);
    pdfContainer.appendChild(pdfBtn2);

    pdfBtn2.addEventListener("click", () => {
        const pdfPath = "PDF/add.pdf";
        fetch(pdfPath)
            .then(resp => resp.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "add.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(err => {
                alert("PDF 다운로드 실패 (서버 환경 필요)");
                console.error(err);
            });
    });
}

function stylePdfButton(btn) {
    btn.style.padding = "8px 12px";
    btn.style.border = "1px solid #aaa";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.background = "#f8f8f8";
    btn.style.textDecoration = "none";
    btn.style.color = "#000";
}
