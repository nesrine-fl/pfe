
// Global toggleNav function
function toggleNav() {
    let sidebar = document.getElementById("sidebar");
    sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("Starting with backend integration...");
    // Add this function right after the toggleNav function
function debugTokenIssue() {
    console.log("=== TOKEN DEBUG ===");
    
    // Check localStorage
    const tokenKey1 = localStorage.getItem("token");
    const tokenKey2 = localStorage.getItem("access_token");
    
    console.log("token key:", tokenKey1 ? `${tokenKey1.substring(0, 50)}...` : "NOT FOUND");
    console.log("access_token key:", tokenKey2 ? `${tokenKey2.substring(0, 50)}...` : "NOT FOUND");
    
    const token = tokenKey1 || tokenKey2;
    
    if (token) {
        try {
            // Decode token
            const parts = token.split('.');
            console.log("Token parts count:", parts.length);
            
            if (parts.length !== 3) {
                console.error("❌ Invalid JWT format");
                return;
            }
            
            const payload = JSON.parse(atob(parts[1]));
            console.log("Token payload:", payload);
            
            const expiry = new Date(payload.exp * 1000);
            const issued = new Date(payload.iat * 1000);
            const now = new Date();
            
            console.log("Issued at:", issued);
            console.log("Expires at:", expiry);
            console.log("Current time:", now);
            console.log("Time until expiry (minutes):", (expiry - now) / 1000 / 60);
            console.log("Is expired?", now > expiry);
            
            // Test token with backend
            console.log("Testing token with backend...");
            fetch("http://127.0.0.1:8000/users/me", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                console.log("Backend response status:", response.status);
                console.log("Backend response headers:", [...response.headers.entries()]);
                
                if (response.status === 401) {
                    console.error("❌ Backend rejects token - need to login again");
                } else if (response.ok) {
                    console.log("✅ Token is valid on backend");
                }
            })
            .catch(error => {
                console.error("❌ Backend request failed:", error);
            });
            
        } catch (e) {
            console.error("❌ Error decoding token:", e);
        }
    } else {
        console.error("❌ No token found in localStorage");
    }
    
    console.log("=== END DEBUG ===");
}

// Call it immediately
debugTokenIssue();

    // ======= SIDEBAR SETUP (Always works) =======
    const menuIcon = document.querySelector(".menu-icon");
    const closeBtn = document.querySelector(".close-btn");
    const sidebar = document.getElementById("sidebar");

    if (menuIcon) menuIcon.addEventListener("click", toggleNav);
    if (closeBtn) closeBtn.addEventListener("click", toggleNav);

    // Close sidebar on outside click
    document.addEventListener("click", function (event) {
        if (sidebar && menuIcon && 
            !sidebar.contains(event.target) && 
            !menuIcon.contains(event.target) &&
            sidebar.style.left === "0px") {
            sidebar.style.left = "-250px";
        }
    });

    // ======= TOKEN CHECK =======
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    
    if (!token) {
        console.log("No token found");
        alert("Utilisateur non connecté. Redirection...");
        window.location.href = "./log-in.html";
        return;
    }

    console.log("Token found, checking backend...");
    console.log("Running token debug...");
debugTokenIssue();

    // ======= BACKEND INTEGRATION =======
    initializeWithBackend(token);
});
// Add this to your profile page:
setInterval(async () => {
    const token = localStorage.getItem("token");
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = new Date(payload.exp * 1000);
        const now = new Date();
        const minutesLeft = (expiry - now) / 1000 / 60;
        
        if (minutesLeft < 5) {
            console.log("Token expires in", minutesLeft, "minutes - consider refreshing");
            // Auto redirect to login or refresh token
        }
    }
}, 5 * 60 * 1000); // Check every 5 minutes

async function initializeWithBackend(token) {
    try {
        // ======= 1. GET USER INFO =======
        console.log("Fetching user info...");
        const userInfo = await fetchUserInfo(token);
        console.log("User info received:", userInfo);
        populateUserForm(userInfo);

        // ======= 2. GET USER PROGRESS =======
        console.log("Fetching user progress...");
        await fetchUserProgress(token);

        // ======= 3. SETUP PROFILE FEATURES =======
        setupProfileFeatures(token, userInfo);

        // ======= 4. SETUP FORM BUTTONS =======
        setupFormButtons(token);

        // ======= 5. SETUP PASSWORD TOGGLE =======
        setupPasswordToggle();

        console.log("Backend integration complete!");

    } catch (error) {
        console.error("Backend integration failed:", error);
        
        if (error.message.includes("401")) {
            alert("Session expirée.mode offline activé");
            window.location.href = "./log-in.html";
        } else {
            alert("Erreur backend. Mode offline activé.");
            loadFromLocalStorage();
        }
    }
}

async function fetchUserInfo(token) {
    console.log("Making API call to /users/me");
    
    const response = await fetch("http://127.0.0.1:8000/users/me", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    console.log("User info response status:", response.status);

    if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
    }

    const userInfo = await response.json();
    console.log("User info data:", userInfo);
    return userInfo;
}

async function fetchUserProgress(token) {
    try {
        console.log("Making API call to /users/progress or /users/courses");
        
        // Try different possible endpoints
        const endpoints = [
            "/users/courses",
            "/users/progress", 
            "/courses",
            "/user/courses"
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                console.log(`${endpoint} response status:`, response.status);

                if (response.ok) {
                    const courses = await response.json();
                    console.log(`Courses from ${endpoint}:`, courses);
                    displayCourses(courses);
                    return courses;
                }
            } catch (error) {
                console.log(`${endpoint} failed:`, error.message);
                continue;
            }
        }

        // If all endpoints fail, try localStorage
        console.log("All course endpoints failed, using localStorage");
        const localCourses = JSON.parse(localStorage.getItem("userCourses") || "[]");
        displayCourses(localCourses);
        
    } catch (error) {
        console.error("Error fetching user progress:", error);
        // Fallback to localStorage
        const localCourses = JSON.parse(localStorage.getItem("userCourses") || "[]");
        displayCourses(localCourses);
    }
}

function populateUserForm(userInfo) {
    console.log("Populating form with user data");
    
    const inputs = document.querySelectorAll(".input-box input");
    
    // Map common field names
    const fieldMapping = {
        'nom': ['nom', 'lastname', 'last_name'],
        'prenom': ['prenom', 'firstname', 'first_name'],
        'email': ['email'],
        'telephone': ['telephone', 'phone'],
        'departement': ['departement', 'department'],
        'fonction': ['fonction', 'function', 'role']
    };

    inputs.forEach(input => {
        const inputId = input.id;
        
        // Direct match
        if (userInfo[inputId]) {
            input.value = userInfo[inputId];
            return;
        }

        // Try mapped fields
        if (fieldMapping[inputId]) {
            for (const field of fieldMapping[inputId]) {
                if (userInfo[field]) {
                    input.value = userInfo[field];
                    break;
                }
            }
        }
    });

    // Load profile image
    const profilePic = document.getElementById("profilePic");
    if (userInfo.profile_image && profilePic) {
        profilePic.src = userInfo.profile_image;
        console.log("Profile image loaded:", userInfo.profile_image);
    }
}

function setupProfileFeatures(token, userInfo) {
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const defaultImage = "./profil-pic.png";

    if (!profilePic) return;

    // Click handler
    profilePic.addEventListener("click", function () {
        showProfileOverlay(profilePic, uploadInput, token);
    });

    // Upload handler with backend
    if (uploadInput) {
        uploadInput.addEventListener("change", async function (event) {
            const file = event.target.files[0];
            if (!file) return;

            console.log("Uploading profile picture...");

            const formData = new FormData();
            formData.append("file", file);

            try {
                const uploadResponse = await fetch("http://127.0.0.1:8000/upload/profile-pic", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                });

                console.log("Upload response status:", uploadResponse.status);

                if (!uploadResponse.ok) {
                    throw new Error(`Upload failed: ${uploadResponse.status}`);
                }

                const result = await uploadResponse.json();
                console.log("Upload result:", result);

                if (result.url) {
                    profilePic.src = result.url;

                    // Update enlarged image if overlay is open
                    const enlargedImg = document.querySelector("#imgOverlay img");
                    if (enlargedImg) enlargedImg.src = result.url;

                    // Update user profile
                    console.log("Updating user profile with new image...");
                    await updateUserProfile(token, { profile_image: result.url });
                    
                    console.log("Profile picture updated successfully!");
                }
            } catch (error) {
                console.error("Upload error:", error);
                alert("Erreur upload. Mode local activé.");
                
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

function showProfileOverlay(profilePic, uploadInput, token) {
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
    deleteBtn.onclick = async () => {
        if (confirm("Supprimer la photo de profil ?")) {
            profilePic.src = "./profil-pic.png";
            enlargedImg.src = "./profil-pic.png";

            try {
                console.log("Deleting profile picture...");
                await updateUserProfile(token, { profile_image: null });
                console.log("Profile picture deleted successfully!");
            } catch (error) {
                console.error("Delete error:", error);
            }

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
}

async function updateUserProfile(token, updates) {
    console.log("Updating user profile:", updates);
    
    const response = await fetch("http://127.0.0.1:8000/users/me", {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
    });

    console.log("Update response status:", response.status);

    if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("Update result:", result);
    return result;
}

function setupFormButtons(token) {
    const saveBtn = document.querySelector(".save-btn");
    const cancelBtn = document.querySelector(".cancel-btn");

    if (saveBtn) {
        saveBtn.addEventListener("click", async function () {
            console.log("Saving form data...");
            
            const inputs = document.querySelectorAll(".input-box input");
            const updatedData = {};

            inputs.forEach(input => {
                updatedData[input.id] = input.value;
            });

            try {
                await updateUserProfile(token, updatedData);
                alert("Informations sauvegardées avec succès !");
                
                // Backup to localStorage
                localStorage.setItem("userData", JSON.stringify(updatedData));
                
            } catch (error) {
                console.error("Save error:", error);
                
              if (error.message.includes("401")) {
    alert("Token expiré. Sauvegarde échouée.");
    console.error("❌ Cannot save - token expired");
} else {
    alert("Erreur sauvegarde. Sauvegardé localement.");
    localStorage.setItem("userData", JSON.stringify(updatedData));
}
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", async function () {
            try {
                const userInfo = await fetchUserInfo(token);
                populateUserForm(userInfo);
                alert("Modifications annulées !");
            } catch (error) {
                console.error("Cancel error:", error);
                location.reload();
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

function displayCourses(courses) {
    const courseTableBody = document.getElementById("courseTableBody");
    const totalCourses = document.getElementById("totalCourses");
    const completedCourses = document.getElementById("completedCourses");
    const averageProgress = document.getElementById("averageProgress");

    if (!courseTableBody) return;

    console.log("Displaying courses:", courses);

    courseTableBody.innerHTML = "";
    let completedCount = 0;
    let totalProgress = 0;

    courses.forEach(course => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${course.title || course.name || 'Cours sans titre'}</td>
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

    // Update statistics
    if (totalCourses) totalCourses.textContent = courses.length;
    if (completedCourses) completedCourses.textContent = completedCount;
    if (averageProgress) {
        averageProgress.textContent = courses.length > 0 ? 
            Math.round(totalProgress / courses.length) + "%" : "0%";
    }
}

function loadFromLocalStorage() {
    console.log("Loading from localStorage as fallback");
    
    // Load user data
    const userData = localStorage.getItem("userData");
    if (userData) {
        try {
            const data = JSON.parse(userData);
            populateUserForm(data);
        } catch (e) {
            console.error("Error parsing userData:", e);
        }
    }

    // Load courses
    const courses = JSON.parse(localStorage.getItem("userCourses") || "[]");
    displayCourses(courses);

    // Load profile image
    const profilePic = document.getElementById("profilePic");
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage && profilePic) {
        profilePic.src = savedImage;
    }
}
