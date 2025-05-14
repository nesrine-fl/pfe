// Global toggleNav function
function toggleNav() {
    let sidebar = document.getElementById("sidebar");
    sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("Page loaded - NO TOKEN CHECKS");

    // ======= SIDEBAR SETUP =======
    const menuIcon = document.querySelector(".menu-icon");
    const closeBtn = document.querySelector(".close-btn");
    const sidebar = document.getElementById("sidebar");

    if (menuIcon) {
        menuIcon.addEventListener("click", toggleNav);
        console.log("Menu icon connected");
    }
    
    if (closeBtn) {
        closeBtn.addEventListener("click", toggleNav);
        console.log("Close button connected");
    }

    // Close sidebar on outside click
    document.addEventListener("click", function (event) {
        if (sidebar && menuIcon && 
            !sidebar.contains(event.target) && 
            !menuIcon.contains(event.target) &&
            sidebar.style.left === "0px") {
            sidebar.style.left = "-250px";
        }
    });

    // ======= PROFILE SETUP (NO BACKEND) =======
    setupLocalProfile();
    setupLocalCourses();
    
    console.log("Profile loaded in offline mode");
});

function setupLocalProfile() {
    // Load user data from localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
        try {
            const data = JSON.parse(userData);
            const inputs = document.querySelectorAll(".input-box input");
            
            inputs.forEach(input => {
                if (data[input.id]) {
                    input.value = data[input.id];
                }
            });
        } catch (e) {
            console.error("Error loading user data:", e);
        }
    }

    // Profile picture setup
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    
    // Load saved profile image
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage && profilePic) {
        profilePic.src = savedImage;
    }

    // Profile picture click handler
    if (profilePic) {
        profilePic.addEventListener("click", function () {
            showProfileImageOverlay(profilePic, uploadInput);
        });
    }

    // Upload handler
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

    // Save/Cancel buttons
    const saveBtn = document.querySelector(".save-btn");
    const cancelBtn = document.querySelector(".cancel-btn");

    if (saveBtn) {
        saveBtn.addEventListener("click", function () {
            const inputs = document.querySelectorAll(".input-box input");
            const formData = {};

            inputs.forEach(input => {
                formData[input.id] = input.value;
            });

            localStorage.setItem("userData", JSON.stringify(formData));
            alert("Données sauvegardées avec succès !");
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            location.reload();
            alert("Modifications annulées !");
        });
    }

    // Password toggle
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    }
}

function showProfileImageOverlay(profilePic, uploadInput) {
    // Remove existing overlay
    const existingOverlay = document.getElementById("imgOverlay");
    if (existingOverlay) existingOverlay.remove();

    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "imgOverlay";
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.7);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        z-index: 1000;
    `;

    // Create enlarged image
    const enlargedImg = document.createElement("img");
    enlargedImg.src = profilePic.src;
    enlargedImg.style.cssText = `
        width: 300px; height: 300px;
        border-radius: 50%; border: 5px solid white;
        cursor: pointer;
    `;

    // Create button container
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
            profilePic.src = "./profil-pic.png";
            enlargedImg.src = "./profil-pic.png";
            localStorage.removeItem("profileImage");
            overlay.remove();
        }
    };

    // Assemble overlay
    btnContainer.appendChild(changeBtn);
    btnContainer.appendChild(deleteBtn);
    overlay.appendChild(enlargedImg);
    overlay.appendChild(btnContainer);
    document.body.appendChild(overlay);

    // Click outside to close
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
}

function setupLocalCourses() {
    const courseTableBody = document.getElementById("courseTableBody");
    if (!courseTableBody) return;

    // Load courses from localStorage
    const userCourses = JSON.parse(localStorage.getItem("userCourses") || "[]");
    
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
            <td>${course.startDate || 'N/A'}</td>
            <td>${course.endDate || 'En cours'}</td>
            <td>${course.completed ? "✅ Terminé" : "⌛ En cours"}</td>
        `;
        courseTableBody.appendChild(row);

        if (course.completed) completedCount++;
        totalProgress += (course.progress || 0);
    });

    // Update statistics
    const totalCourses = document.getElementById("totalCourses");
    const completedCourses = document.getElementById("completedCourses");
    const averageProgress = document.getElementById("averageProgress");

    if (totalCourses) totalCourses.textContent = userCourses.length;
    if (completedCourses) completedCourses.textContent = completedCount;
    if (averageProgress) {
        averageProgress.textContent = userCourses.length > 0 ? 
            Math.round(totalProgress / userCourses.length) + "%" : "0%";
    }
}
