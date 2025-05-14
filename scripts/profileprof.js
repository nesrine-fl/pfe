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

    // Password toggle
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    }

    // Check token
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    
    console.log("Token found:", token ? "Yes" : "No");
    
    if (!token) {
        alert("Utilisateur non connecté.");
        return;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
        console.log("Token expired");
        alert("Session expirée. Veuillez vous reconnecter.");
        // Redirect to login
        window.location.href = "login.html"; // Adjust path as needed
        return;
    }

    // Load with backend
    initializeProfile(token);
});

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (e) {
        console.error("Error parsing token:", e);
        return true; // Assume expired if we can't parse
    }
}

async function initializeProfile(token) {
    console.log("Initializing profile with backend...");
    
    // Setup basic features that always work
    setupProfileFeatures(token);
    
    // Try to load profile data
    try {
        await loadProfileData(token);
        console.log("Profile loaded successfully");
    } catch (error) {
        console.error("Failed to load profile:", error);
        
        if (error.message.includes("401")) {
            alert("Session invalide. Redirection vers la connexion...");
            window.location.href = "login.html";
            return;
        }
        
        // Use localStorage fallback
        loadProfileFromLocalStorage();
    }
    
    // Load courses (with fallback)
    loadCoursesFromBackend(token);
}

function setupProfileFeatures(token) {
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const defaultImage = "./profil-pic.png";

    if (!profilePic) return;

    // Click to enlarge with modify/delete buttons
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
            cursor: pointer;
        `;

        const btnContainer = document.createElement("div");
        btnContainer.style.cssText = "display: flex; gap: 10px; margin-top: 10px;";

        // Modify button
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

                if (!uploadResponse.ok) {
                    throw new Error(`Upload failed: ${uploadResponse.status}`);
                }

                const result = await uploadResponse.json();
                if (result.url) {
                    profilePic.src = result.url;

                    // Update enlarged image if overlay is open
                    const enlargedImg = document.querySelector("#imgOverlay img");
                    if (enlargedImg) enlargedImg.src = result.url;

                    // Update user profile
                    await fetch("http://127.0.0.1:8000/users/me", {
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ profile_image: result.url })
                    });
                    
                    console.log("Profile image updated successfully");
                }
            } catch (error) {
                console.error("Error uploading profile image:", error);
                alert("Erreur lors du téléchargement de l'image");
            }
        });
    }

    // Setup save/cancel buttons
    setupFormButtons(token);
}

async function loadProfileData(token) {
    const response = await fetch("http://127.0.0.1:8000/users/me", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Profile load failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Profile loaded from backend:", data);

    // Load form data
    const inputs = document.querySelectorAll(".input-box input");
    inputs.forEach(input => {
        const value = data[input.id] || data[input.name];
        if (value) input.value = value;
    });

    // Load profile image
    const profilePic = document.getElementById("profilePic");
    if (data.profile_image && profilePic) {
        profilePic.src = data.profile_image;
    }
}

function loadProfileFromLocalStorage() {
    console.log("Loading profile from localStorage...");
    
    const userData = localStorage.getItem("userData");
    if (userData) {
        try {
            const data = JSON.parse(userData);
            const inputs = document.querySelectorAll(".input-box input");
            
            // Map the data to form fields
            inputs.forEach(input => {
                const key = input.id;
                if (data[key]) {
                    input.value = data[key];
                }
            });
            
            console.log("Profile loaded from localStorage");
        } catch (e) {
            console.error("Error parsing localStorage userData:", e);
        }
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
                const response = await fetch("http://127.0.0.1:8000/users/me", {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedData)
                });

                if (!response.ok) {
                    throw new Error(`Save failed: ${response.status}`);
                }

                alert("Informations enregistrées avec succès !");
                
                // Update localStorage backup
                localStorage.setItem("userData", JSON.stringify(updatedData));
                
            } catch (error) {
                console.error("Save error:", error);
                
                if (error.message.includes("401")) {
                    alert("Session expirée. Redirection vers la connexion...");
                    window.location.href = "login.html";
                } else {
                    alert("Erreur lors de la sauvegarde. Sauvegardé localement.");
                    // Save to localStorage as backup
                    inputs.forEach(input => {
                        localStorage.setItem(input.id, input.value);
                    });
                }
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            loadProfileData(token).catch(() => {
                loadProfileFromLocalStorage();
            });
            alert("Modifications annulées !");
        });
    }
}

async function loadCoursesFromBackend(token) {
    const courseTableBody = document.getElementById("courseTableBody");
    if (!courseTableBody) return;

    // Always try localStorage first since backend might not have /users/courses
    const userCourses = JSON.parse(localStorage.getItem("userCourses") || "[]");
    displayCourses(userCourses);

    // Optionally try backend later (if endpoint exists)
    try {
        const response = await fetch("http://127.0.0.1:8000/users/courses", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const backendCourses = await response.json();
            displayCourses(backendCourses);
        }
    } catch (error) {
        console.log("Courses endpoint not available, using localStorage");
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
