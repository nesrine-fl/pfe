// Global toggleNav function
function toggleNav() {
    let sidebar = document.getElementById("sidebar");
    sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
}

document.addEventListener("DOMContentLoaded", function () {
    // Sidebar fonctionne toujours (priorité)
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

    // Password toggle (toujours fonctionnel)
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    }

    // Check token and backend connectivity
    const token = localStorage.getItem("access_token");
    
    // Debug info
    console.log("Token check:", {
        token: token ? "Found" : "Not found",
        length: token ? token.length : 0,
        localStorage: Object.keys(localStorage)
    });

    // Test backend connectivity
    testBackendConnection(token);
});

async function testBackendConnection(token) {
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    
    // Setup basic profile picture functionality (works offline)
    setupOfflineProfilePic(profilePic, uploadInput);

    if (!token) {
        console.log("No token - working in offline mode");
        showOfflineMode();
        return;
    }

    console.log("Testing backend connection...");
    
    try {
        // Quick backend health check
        const response = await fetch("http://127.0.0.1:8000/", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        console.log("Backend status:", response.status);
        
        if (response.status >= 200 && response.status < 500) {
            // Backend is reachable, try to load profile
            console.log("Backend connected - loading profile");
            await loadProfileFromBackend(token);
            setupBackendFeatures(token);
        } else {
            throw new Error(`Backend returned ${response.status}`);
        }
        
    } catch (error) {
        console.log("Backend connection failed:", error.message);
        showOfflineMode();
    }
}

function showOfflineMode() {
    console.log("Running in offline mode");
    
    // Show a subtle notification
    const notification = document.createElement("div");
    notification.style.cssText = `
        position: fixed; top: 10px; right: 10px;
        background: #ff9800; color: white; padding: 10px;
        border-radius: 5px; z-index: 1000;
        font-size: 14px; max-width: 300px;
    `;
    notification.textContent = "Mode hors ligne - Fonctionnalités limitées";
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => notification.remove(), 5000);
}

function setupOfflineProfilePic(profilePic, uploadInput) {
    const defaultImage = "./profil-pic.png";
    
    // Load saved image from localStorage
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage && profilePic) {
        profilePic.src = savedImage;
    }

    if (!profilePic) return;

    // Basic click to enlarge (always works)
    profilePic.addEventListener("click", function () {
        const overlay = document.createElement("div");
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            display: flex; align-items: center; justify-content: center;
            z-index: 1000;
        `;

        const enlargedImg = document.createElement("img");
        enlargedImg.src = profilePic.src;
        enlargedImg.style.cssText = `
            width: 300px; height: 300px;
            border-radius: 50%; border: 5px solid white;
        `;

        overlay.appendChild(enlargedImg);
        document.body.appendChild(overlay);

        overlay.addEventListener("click", () => overlay.remove());
    });

    // Basic file upload (localStorage only)
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
}

async function loadProfileFromBackend(token) {
    try {
        const response = await fetch("http://127.0.0.1:8000/users/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error(`Profile load failed: ${response.status}`);

        const data = await response.json();
        console.log("Profile loaded:", data);

        // Load form data
        const inputs = document.querySelectorAll(".input-box input");
        inputs.forEach(input => {
            if (data[input.id]) input.value = data[input.id];
        });

        // Load profile image
        const profilePic = document.getElementById("profilePic");
        if (data.profile_image && profilePic) {
            profilePic.src = data.profile_image;
        }

    } catch (error) {
        console.error("Error loading profile:", error);
        throw error;
    }
}

function setupBackendFeatures(token) {
    console.log("Setting up backend features");
    
    // Enhanced profile picture with backend
    setupBackendProfilePic(token);
    
    // Save/Cancel buttons
    setupFormButtons(token);
    
    // Load courses
    loadCoursesFromBackend(token);
}

function setupBackendProfilePic(token) {
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const defaultImage = "./profil-pic.png";

    if (!profilePic) return;

    // Replace click handler with backend version
    profilePic.removeEventListener("click", profilePic.clickHandler);
    
    profilePic.addEventListener("click", function () {
        const existingOverlay = document.getElementById("imgOverlay");
        if (existingOverlay) existingOverlay.remove();

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

        const enlargedImg = document.createElement("img");
        enlargedImg.src = profilePic.src;
        enlargedImg.style.cssText = `
            width: 300px; height: 300px;
            border-radius: 50%; border: 5px solid white;
        `;

        const btnContainer = document.createElement("div");
        btnContainer.style.cssText = "display: flex; gap: 10px; margin-top: 10px;";

        // Change button
        const changePicBtn = document.createElement("button");
        changePicBtn.textContent = "Modifier";
        changePicBtn.style.cssText = `
            background: #7c3aed; color: white;
            padding: 10px 15px; border: none;
            border-radius: 5px; cursor: pointer;
        `;
        changePicBtn.addEventListener("click", () => uploadInput.click());

        // Delete button
        const deletePicBtn = document.createElement("button");
        deletePicBtn.textContent = "Supprimer";
        deletePicBtn.style.cssText = `
            background: red; color: white;
            padding: 10px 15px; border: none;
            border-radius: 5px; cursor: pointer;
        `;
        deletePicBtn.addEventListener("click", async () => {
            if (confirm("Supprimer la photo de profil ?")) {
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

    // Enhanced upload with backend
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
                console.error("Upload error:", error);
                // Fallback to localStorage
                const reader = new FileReader();
                reader.onload = e => {
                    profilePic.src = e.target.result;
                    localStorage.setItem("profileImage", e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
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
                console.error("Save error:", error);
                // Fallback to localStorage
                inputs.forEach(input => {
                    localStorage.setItem(input.id, input.value);
                });
                alert("Sauvegardé localement (backend indisponible)");
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            loadProfileFromBackend(token).catch(() => {
                // Fallback to localStorage
                const inputs = document.querySelectorAll(".input-box input");
                inputs.forEach(input => {
                    const saved = localStorage.getItem(input.id);
                    if (saved) input.value = saved;
                });
            });
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

        if (!response.ok) throw new Error("Courses fetch failed");

        const userCourses = await response.json();
        displayCourses(userCourses);

    } catch (error) {
        console.error("Error loading courses:", error);
        // Show placeholder
        courseTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #666;">
                    Cours indisponibles (backend déconnecté)
                </td>
            </tr>
        `;
    }
}

function displayCourses(userCourses) {
    const courseTableBody = document.getElementById("courseTableBody");
    if (!courseTableBody) return;

    courseTableBody.innerHTML = "";
    
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
    });
}
