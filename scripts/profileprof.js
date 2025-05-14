// Global toggleNav function
function toggleNav() {
    let sidebar = document.getElementById("sidebar");
    sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
}

document.addEventListener("DOMContentLoaded", function () {
    // Sidebar works immediately (non-blocking)
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

    // Check token (debug what's in localStorage)
    const token = localStorage.getItem("access_token");
    
    console.log("Debug - All localStorage keys:", Object.keys(localStorage));
    console.log("Debug - access_token value:", token);
    console.log("Debug - token length:", token ? token.length : "null");

    // If no token, log and return (but don't block page)
    if (!token) {
        console.log("No access token found");
        alert("Utilisateur non connecté.");
        return;
    }

    // Profile picture functionality (always works)
    setupProfilePicture(token);
    
    // Password toggle (always works)
    setupPasswordToggle();

    // Load data asynchronously (don't block)
    setTimeout(() => {
        loadProfileData(token);
        loadCoursesFromBackend(token);
    }, 100);
});

function setupProfilePicture(token) {
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const defaultImage = "./profil-pic.png";

    if (!profilePic) return;

    // Click to enlarge
    profilePic.addEventListener("click", function () {
        const existingOverlay = document.getElementById("imgOverlay");
        if (existingOverlay) existingOverlay.remove();

        const overlay = document.createElement("div");
        overlay.id = "imgOverlay";
        Object.assign(overlay.style, {
            position: "fixed", top: "0", left: "0",
            width: "100vw", height: "100vh",
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            zIndex: "1000"
        });

        const enlargedImg = document.createElement("img");
        enlargedImg.src = profilePic.src;
        Object.assign(enlargedImg.style, {
            width: "300px", height: "300px",
            borderRadius: "50%", border: "5px solid white",
            cursor: "pointer"
        });

        const btnContainer = document.createElement("div");
        Object.assign(btnContainer.style, {
            display: "flex", gap: "10px", marginTop: "10px"
        });

        // Change button
        const changePicBtn = document.createElement("button");
        changePicBtn.textContent = "Modifier";
        Object.assign(changePicBtn.style, {
            backgroundColor: "#7c3aed", color: "white",
            padding: "10px 15px", border: "none",
            borderRadius: "5px", cursor: "pointer"
        });
        changePicBtn.addEventListener("click", () => uploadInput.click());

        // Delete button
        const deletePicBtn = document.createElement("button");
        deletePicBtn.textContent = "Supprimer";
        Object.assign(deletePicBtn.style, {
            backgroundColor: "red", color: "white",
            padding: "10px 15px", border: "none",
            borderRadius: "5px", cursor: "pointer"
        });
        deletePicBtn.addEventListener("click", async () => {
            if (confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?")) {
                profilePic.src = defaultImage;
                enlargedImg.src = defaultImage;

                try {
                    await fetch("http://127.0.0.1:8000/users/me", {
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ profile_image: null })
                    });
                } catch (error) {
                    console.error("Error deleting profile image:", error);
                }
                overlay.remove();
            }
        });

        btnContainer.appendChild(changePicBtn);
        btnContainer.appendChild(deletePicBtn);
        overlay.appendChild(enlargedImg);
        overlay.appendChild(btnContainer);
        document.body.appendChild(overlay);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.remove();
        });
    });

    // Upload handler
    if (uploadInput) {
        uploadInput.addEventListener("change", async function (event) {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);

            try {
                const uploadResponse = await fetch("http://127.0.0.1:8000/upload/profile-pic", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                });

                const result = await uploadResponse.json();
                if (result.url) {
                    profilePic.src = result.url;
                    const enlargedImg = document.querySelector("#imgOverlay img");
                    if (enlargedImg) enlargedImg.src = result.url;

                    await fetch("http://127.0.0.1:8000/users/me", {
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ profile_image: result.url })
                    });
                }
            } catch (error) {
                console.error("Error uploading profile image:", error);
            }
        });
    }
}

function setupPasswordToggle() {
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    }
}

async function loadProfileData(token) {
    try {
        const response = await fetch("http://127.0.0.1:8000/users/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.error("Profile fetch failed:", response.status);
            return;
        }

        const data = await response.json();
        const inputs = document.querySelectorAll(".input-box input");
        const profilePic = document.getElementById("profilePic");

        inputs.forEach(input => {
            if (data[input.id]) input.value = data[input.id];
        });

        if (data.profile_image && profilePic) {
            profilePic.src = data.profile_image;
        }

        // Setup save/cancel buttons
        setupFormButtons(token);

    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

function setupFormButtons(token) {
    const saveBtn = document.querySelector(".save-btn");
    const cancelBtn = document.querySelector(".cancel-btn");

    if (saveBtn) {
        saveBtn.addEventListener("click", async function () {
            const inputs = document.querySelectorAll(".input-box input");
            const updatedData = {};

            inputs.forEach(input => {
                updatedData[input.id] = input.value;
            });

            try {
                await fetch("http://127.0.0.1:8000/users/me", {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedData)
                });
                alert("Informations enregistrées avec succès !");
            } catch (error) {
                console.error("Error saving profile:", error);
                alert("Erreur lors de la sauvegarde");
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            loadProfileData(token);
            alert("Modifications annulées !");
        });
    }
}

async function loadCoursesFromBackend(token) {
    const courseTableBody = document.getElementById("courseTableBody");
    if (!courseTableBody) return;

    try {
        const response = await fetch("http://127.0.0.1:8000/users/courses", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.error("Courses fetch failed:", response.status);
            return;
        }

        const userCourses = await response.json();
        displayCourses(userCourses);
        loadSkills(userCourses);

    } catch (error) {
        console.error("Error loading courses:", error);
    }
}

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
            <td>${course.title}</td>
            <td>
                <div class="progress-bar">
                    <span style="width: ${course.progress}%;"></span>
                </div>
                ${course.progress}%
            </td>
            <td>${course.startDate || course.start_date || 'N/A'}</td>
            <td>${course.endDate || course.end_date || 'N/A'}</td>
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

function loadSkills(userCourses) {
    const skillsList = document.getElementById("skillsList");
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
