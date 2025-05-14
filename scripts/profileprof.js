// Global toggleNav function
function toggleNav() {
    let sidebar = document.getElementById("sidebar");
    sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
}

document.addEventListener("DOMContentLoaded", function () {
    // ======= SIDEBAR - FONCTIONNE TOUJOURS =======
    const menuIcon = document.querySelector(".menu-icon");
    const closeBtn = document.querySelector(".close-btn");
    const sidebar = document.getElementById("sidebar");

    if (menuIcon) menuIcon.addEventListener("click", toggleNav);
    if (closeBtn) closeBtn.addEventListener("click", toggleNav);

    // Close sidebar when clicking outside
    document.addEventListener("click", function (event) {
        if (sidebar && menuIcon && 
            !sidebar.contains(event.target) && 
            !menuIcon.contains(event.target) &&
            sidebar.style.left === "0px") {
            sidebar.style.left = "-250px";
        }
    });

    // ======= SKIP TOKEN CHECK - DIRECT ACCESS =======
    console.log("Accès direct au profil (sans vérification token)");

    // ======= LOAD PROFILE FROM LOCALSTORAGE =======
    const userData = localStorage.getItem("userData");
    if (userData) {
        try {
            const data = JSON.parse(userData);
            const inputs = document.querySelectorAll(".input-box input");
            
            // Fill form with localStorage data
            inputs.forEach(input => {
                const value = data[input.id] || data[input.name];
                if (value) input.value = value;
            });
            
            console.log("Profil chargé depuis localStorage");
        } catch (e) {
            console.error("Erreur localStorage:", e);
        }
    }

    // ======= PROFILE PICTURE - BASIC VERSION =======
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const defaultImage = "./profil-pic.png";

    // Load saved image
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage && profilePic) {
        profilePic.src = savedImage;
    }

    // Click to enlarge
    if (profilePic) {
        profilePic.addEventListener("click", function () {
            const overlay = document.createElement("div");
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(0, 0, 0, 0.7);
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                z-index: 1000;
            `;

            const enlargedImg = document.createElement("img");
            enlargedImg.src = profilePic.src;
            enlargedImg.style.cssText = `
                width: 300px; height: 300px;
                border-radius: 50%; border: 5px solid white;
            `;

            const btnContainer = document.createElement("div");
            btnContainer.style.cssText = "display: flex; gap: 10px; margin-top: 10px;";

            // Change button
            const changeBtn = document.createElement("button");
            changeBtn.textContent = "Modifier";
            changeBtn.style.cssText = `
                background: #7c3aed; color: white;
                padding: 10px 15px; border: none;
                border-radius: 5px; cursor: pointer;
            `;
            changeBtn.onclick = () => uploadInput.click();

            // Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Supprimer";
            deleteBtn.style.cssText = `
                background: red; color: white;
                padding: 10px 15px; border: none;
                border-radius: 5px; cursor: pointer;
            `;
            deleteBtn.onclick = () => {
                if (confirm("Supprimer la photo de profil ?")) {
                    profilePic.src = defaultImage;
                    enlargedImg.src = defaultImage;
                    localStorage.removeItem("profileImage");
                    overlay.remove();
                }
            };

            btnContainer.appendChild(changeBtn);
            btnContainer.appendChild(deleteBtn);
            overlay.appendChild(enlargedImg);
            overlay.appendChild(btnContainer);
            document.body.appendChild(overlay);

            overlay.onclick = (e) => {
                if (e.target === overlay) overlay.remove();
            };
        });
    }

    // Upload handler (localStorage only)
    if (uploadInput) {
        uploadInput.addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    profilePic.src = e.target.result;
                    localStorage.setItem("profileImage", e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // ======= SAVE/CANCEL BUTTONS - LOCALSTORAGE ONLY =======
    const saveBtn = document.querySelector(".save-btn");
    const cancelBtn = document.querySelector(".cancel-btn");

    if (saveBtn) {
        saveBtn.addEventListener("click", function () {
            const inputs = document.querySelectorAll(".input-box input");
            const updatedData = {};

            inputs.forEach(input => {
                updatedData[input.id] = input.value;
                localStorage.setItem(input.id, input.value);
            });

            // Save complete userData
            localStorage.setItem("userData", JSON.stringify(updatedData));
            alert("Informations sauvegardées localement !");
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            location.reload();
            alert("Modifications annulées !");
        });
    }

    // ======= PASSWORD TOGGLE =======
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    }

    // ======= LOAD COURSES FROM LOCALSTORAGE =======
    const userCourses = JSON.parse(localStorage.getItem("userCourses") || "[]");
    displayCourses(userCourses);
});

function displayCourses(userCourses) {
    const courseTableBody = document.getElementById("courseTableBody");
    const totalCourses = document.getElementById("totalCourses");
    const completedCourses = document.getElementById("completedCourses");
    const averageProgress = document.getElementById("averageProgress");

    if (!courseTableBody) return;

    courseTableBody.innerHTML = "";
    let completedCount = 0;
    let totalProgress = 0;

    userCourses.forEach(course => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${course.title || 'Cours sans titre'}</td>
            <td>
                <div class="progress-bar">
                    <span style="width: ${course.progress || 0}%;"></span>
                </div>
                ${course.progress || 0}%
            </td>
            <td>${course.startDate || course.start_date || 'N/A'}</td>
            <td>${course.endDate || course.end_date || 'En cours'}</td>
            <td>${course.completed ? "✅ Terminé" : "⌛ En cours"}</td>
        `;
        courseTableBody.appendChild(row);

        if (course.completed) completedCount++;
        totalProgress += (course.progress || 0);
    });

    if (totalCourses) totalCourses.textContent = userCourses.length;
    if (completedCourses) completedCourses.textContent = completedCount;
    if (averageProgress) {
        averageProgress.textContent = userCourses.length > 0 ? 
            Math.round(totalProgress / userCourses.length) + "%" : "0%";
    }
}
