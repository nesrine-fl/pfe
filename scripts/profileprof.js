document.addEventListener("DOMContentLoaded", function () {
    // Sidebar toggle function - updated to work like the second example
    function toggleNav() {
        let sidebar = document.getElementById("sidebar");
        sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
    }

    const menuIcon = document.querySelector(".menu-icon");
    const closeBtn = document.querySelector(".close-btn");

    if (menuIcon && closeBtn) {
        menuIcon.addEventListener("click", toggleNav);
        closeBtn.addEventListener("click", toggleNav);
    }

    // Close sidebar when clicking outside
    const sidebar = document.getElementById("sidebar");
    document.addEventListener("click", function (event) {
        if (sidebar && !sidebar.contains(event.target) && !menuIcon.contains(event.target)) {
            sidebar.style.left = "-250px";
        }
    });

    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const defaultImage = "./profil-pic.png";

    // Profile picture click to enlarge and show options
    if (profilePic) {
        profilePic.addEventListener("click", function () {
            const existingOverlay = document.getElementById("imgOverlay");
            if (existingOverlay) existingOverlay.remove();

            const overlay = document.createElement("div");
            overlay.id = "imgOverlay";
            Object.assign(overlay.style, {
                position: "fixed",
                top: "0",
                left: "0",
                width: "100vw",
                height: "100vh",
                background: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: "1000"
            });

            const enlargedImg = document.createElement("img");
            enlargedImg.src = profilePic.src;
            Object.assign(enlargedImg.style, {
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                border: "5px solid white",
                cursor: "pointer"
            });

            const btnContainer = document.createElement("div");
            Object.assign(btnContainer.style, {
                display: "flex",
                gap: "10px",
                marginTop: "10px"
            });

            const newChangePicBtn = document.createElement("button");
            newChangePicBtn.textContent = "Modifier";
            Object.assign(newChangePicBtn.style, {
                backgroundColor: "#7c3aed",
                color: "white",
                padding: "10px 15px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
            });
            newChangePicBtn.addEventListener("click", () => uploadInput.click());

            const newDeletePicBtn = document.createElement("button");
            newDeletePicBtn.textContent = "Supprimer";
            Object.assign(newDeletePicBtn.style, {
                backgroundColor: "red",
                color: "white",
                padding: "10px 15px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
            });
            newDeletePicBtn.addEventListener("click", () => {
                if (confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?")) {
                    profilePic.src = defaultImage;
                    enlargedImg.src = defaultImage;
                    localStorage.removeItem("profileImage");
                    overlay.remove();
                }
            });

            btnContainer.appendChild(newChangePicBtn);
            btnContainer.appendChild(newDeletePicBtn);
            overlay.appendChild(enlargedImg);
            overlay.appendChild(btnContainer);
            document.body.appendChild(overlay);

            overlay.addEventListener("click", function (event) {
                if (event.target === overlay) overlay.remove();
            });
        });
    }

    // Upload profile picture - using localStorage instead of backend
    if (uploadInput) {
        uploadInput.addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    profilePic.src = e.target.result;
                    localStorage.setItem("profileImage", e.target.result);

                    const enlargedImg = document.querySelector("#imgOverlay img");
                    if (enlargedImg) enlargedImg.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Load saved profile picture from localStorage
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage && profilePic) {
        profilePic.src = savedImage;
    }

    // Load user profile data from localStorage
    function loadProfileData() {
        const inputs = document.querySelectorAll(".input-box input");
        inputs.forEach(input => {
            const savedValue = localStorage.getItem(input.id);
            if (savedValue) input.value = savedValue;
        });
    }

    loadProfileData();

    // Save profile changes to localStorage
    const saveBtn = document.querySelector(".save-btn");
    const cancelBtn = document.querySelector(".cancel-btn");

    if (saveBtn) {
        saveBtn.addEventListener("click", function () {
            const inputs = document.querySelectorAll(".input-box input");
            inputs.forEach(input => {
                localStorage.setItem(input.id, input.value);
            });
            alert("Informations enregistrées avec succès !");
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            loadProfileData();
            alert("Modifications annulées !");
        });
    }

    // Password visibility toggle
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    }

    // Course management functionality
    const courseTableBody = document.getElementById("courseTableBody");
    const skillsList = document.getElementById("skillsList");
    const totalCourses = document.getElementById("totalCourses");
    const completedCourses = document.getElementById("completedCourses");
    const averageProgress = document.getElementById("averageProgress");

    let userCourses = JSON.parse(localStorage.getItem("userCourses")) || [];

    function loadCourses() {
        if (!courseTableBody) return;
        
        courseTableBody.innerHTML = "";
        let completedCount = 0;
        let totalProgress = 0;

        userCourses.forEach(course => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${course.title}</td>
                <td>
                    <div class="progress-bar">
                        <span style="width: ${course.progress}%;"></span>
                    </div>
                    ${course.progress}%
                </td>
                <td>${course.startDate}</td>
                <td>${course.endDate}</td>
                <td>${course.completed ? "✅ Terminé" : "⌛ En cours"}</td>
            `;
            courseTableBody.appendChild(row);

            if (course.completed) completedCount++;
            totalProgress += course.progress;
        });

        if (totalCourses) totalCourses.textContent = userCourses.length;
        if (completedCourses) completedCourses.textContent = completedCount;
        if (averageProgress) {
            averageProgress.textContent = userCourses.length > 0 ? 
                Math.round(totalProgress / userCourses.length) + "%" : "0%";
        }
    }

    function loadSkills() {
        if (!skillsList) return;
        
        skillsList.innerHTML = "";
        const allSkills = new Set();

        userCourses.forEach(course => {
            if (course.completed && course.skills) {
                course.skills.forEach(skill => allSkills.add(skill));
            }
        });

        allSkills.forEach(skill => {
            const li = document.createElement("li");
            li.textContent = skill;
            skillsList.appendChild(li);
        });
    }

    loadCourses();
    loadSkills();
});
