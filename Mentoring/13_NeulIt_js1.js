document.addEventListener("DOMContentLoaded", function () {

    /* ---------------------------------------------------
        1) 멘토 필터 기능
    --------------------------------------------------- */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const mentorCards = document.querySelectorAll('.card2');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter.toLowerCase();

            mentorCards.forEach(card => {
                const categories = card.dataset.category
                    .split(',')
                    .map(c => c.trim().toLowerCase());

                if (filter === 'all' || categories.includes(filter)) {
                    card.classList.remove("hidden");
                } else {
                    card.classList.add("hidden");
                }
            });
        });
    });

    /* ---------------------------------------------------
        2) 자동완성 검색 기능
    --------------------------------------------------- */
    const searchData = [
        "김은지", "이지현", "류보람", "이가은", "한서윤",
        "장유진", "박지현", "오다현", "최지민",
        "프론트엔드", "백엔드", "데이터 엔지니어",
        "모바일", "임베디드", "DevOps"
    ];

    const searchInput = document.getElementById("searchInput");
    const autocompleteList = document.getElementById("autocomplete-list");

    if (searchInput && autocompleteList) {
        searchInput.addEventListener("input", function () {
            const value = this.value.toLowerCase().trim();
            autocompleteList.innerHTML = "";

            if (!value) {
                autocompleteList.style.display = "none";
                return;
            }

            const filtered = searchData.filter(item =>
                item.toLowerCase().includes(value)
            );

            filtered.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;

                li.addEventListener("click", function () {
                    searchInput.value = item;
                    autocompleteList.style.display = "none";
                });

                autocompleteList.appendChild(li);
            });

            autocompleteList.style.display = filtered.length ? "block" : "none";
        });

        document.addEventListener("click", function (e) {
            if (!e.target.closest(".lecture-search")) {
                autocompleteList.style.display = "none";
            }
        });
    }

    /* ---------------------------------------------------
        3) 멘토 카드에 ID 자동 부여
    --------------------------------------------------- */
    if (typeof allMentors !== "undefined") {
        mentorCards.forEach(card => {
            const nameEl = card.querySelector(".name2");
            if (!nameEl) return;

            const mentorName = nameEl.textContent.trim();
            let mentorId = null;

            for (const key in allMentors) {
                if (allMentors[key].name === mentorName) {
                    mentorId = allMentors[key].id;
                    break;
                }
            }

            if (!mentorId) return;

            const originalHref = card.getAttribute("href") || "";
            if (!originalHref.includes("?id=")) {
                card.setAttribute("href", `${originalHref}?id=${mentorId}`);
            }
        });
    }

    /* ---------------------------------------------------
        4) 검색 placeholder 애니메이션  
    --------------------------------------------------- */

    if (searchInput) {  // <-- 핵심: 검색창이 있을 때만 실행
        const placeholders = [
            "📘 알고리즘 완전 정복!",
            "🔥 새로운 기술을 배워볼까요?",
            "💡 실력이 느는 순간을 경험하세요!"
        ];

        let phIndex = 0;
        let phTimer = null;

        function startPlaceholderAnimation() {
            stopPlaceholderAnimation(); // 중복 방지
            phTimer = setInterval(() => {
                searchInput.classList.remove("show");
                setTimeout(() => {
                    searchInput.placeholder = placeholders[phIndex];
                    phIndex = (phIndex + 1) % placeholders.length;
                    searchInput.classList.add("show");
                }, 300);
            }, 2000);
        }

        function stopPlaceholderAnimation() {
            if (phTimer) clearInterval(phTimer);
            searchInput.classList.add("show");
        }

        searchInput.classList.add("show");
        startPlaceholderAnimation();

        searchInput.addEventListener("input", stopPlaceholderAnimation);
        searchInput.addEventListener("focus", stopPlaceholderAnimation);
        searchInput.addEventListener("blur", () => {
            if (!searchInput.value.trim()) startPlaceholderAnimation();
        });
    }

});
