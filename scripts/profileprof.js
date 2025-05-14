// Global toggleNav function for HTML onclick
function toggleNav() {
    let sidebar = document.getElementById("sidebar");
    sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
}

document.addEventListener("DOMContentLoaded", function () {
    // Check authentication token
    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("Utilisateur non connecté.");
        return;
    }

    // Sidebar functionality
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

    // Profile picture handling with backend integration
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const defaultImage = "./profil-pic.png";

    // Function to open overlay with enlarged image
    if (profilePic) {
        profilePic.addEventListener("click", function () {
            const existingOverlay = document.getElementById("imgOverlay");
            if (existingOverlay) {
                existingOverlay.remove();
            }

            const overlay = document.createElement("div");
            overlay.id = "imgOverlay";
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100vw";
            overlay.style.height = "100vh";
            overlay.style.background = "rgba(0, 0, 0, 0.7)";
            overlay.style.display = "flex";
            overlay.style.flexDirection = "column";
            overlay.style.alignItems = "center";
            overlay.style.justifyContent = "center";
            overlay.style.zIndex = "1000";

            const enlargedImg = document.createElement("img");
            enlargedImg.src = profilePic.src;
            enlargedImg.style.width = "300px";
            enlargedImg.style.height = "300px";
            enlargedImg.style.borderRadius = "50%";
            enlargedImg.style.border = "5px solid white";
            enlargedImg.style.cursor = "pointer";

            const btnContainer = document.createElement("div");
            btnContainer.style.display = "flex";
            btnContainer.style.gap = "10px";
            btnContainer.style.marginTop = "10px";

            const newChangePicBtn = document.createElement("button");
            newChangePicBtn.textContent = "Modifier";
            newChangePicBtn.style.backgroundColor = "#7c3aed";
            newChangePicBtn.style.color = "white";
            newChangePicBtn.style.padding = "10px 15px";
            newChangePicBtn.style.border = "none";
            newChangePicBtn.style.borderRadius = "5px";
            newChangePicBtn.style.cursor = "pointer";
            newChangePicBtn.addEventListener("click", function () {
                uploadInput.click();
            });

            const newDeletePicBtn = document.createElement("button");
            newDeletePicBtn.textContent = "Supprimer";
            newDeletePicBtn.style.backgroundColor = "red";
            newDeletePicBtn.style.color = "white";
            newDeletePicBtn.style.padding = "10px 15px";
            newDeletePicBtn.style.border = "none";
            newDeletePicBtn.style.borderRadius = "5px";
            newDeletePicBtn.style.cursor = "pointer";
            newDeletePicBtn.addEventListener("click", async function () {
                const confirmDelete = confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?");
                if (confirmDelete) {
                    profilePic.src = defaultImage;
                    enlargedImg.src = defaultImage;

                    // Delete from backend
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
            
            btnContainer.appendChild(newChangePicBtn);
            btnContainer.appendChild(newDeletePicBtn);
            overlay.appendChild(enlargedImg);
            overlay.appendChild(btnContainer);
            document.body.appendChild(overlay);

            overlay.addEventListener("click", function (event) {
                if (event.target === overlay) {
                    overlay.remove();
                }
            });
        });
    }

    // Upload profile picture to backend
    if (uploadInput) {
        uploadInput.addEventListener("change", async function (event) {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                try {
                    // Upload image to backend
                    const uploadResponse = await fetch("http://127.0.0.1:8000/upload/profile-pic", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        body: formData
                    });

                    const result = await uploadResponse.json();
                    if (result.url) {
                        profilePic.src = result.url;

                        // Update enlarged image if overlay is open
                        const enlargedImg = document.querySelector("#imgOverlay img");
                        if (enlargedImg) {
                            enlargedImg.src = result.url;
                        }

                        // Update user profile with new image URL
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
            }
        });
    }

    // Load user profile data from backend
    async function loadProfileData() {
        try {
            const response = await fetch("http://127.0.0.1:8000/users/me", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Failed to fetch profile");

            const data = await response.json();
            const inputs = document.querySelectorAll(".input-box input");

            // Load form data
            inputs.forEach(input => {
                if (data[input.id]) {
                    input.value = data[input.id];
                }
            });

            // Load profile image
            if (data.profile_image && profilePic) {
                profilePic.src = data.profile_image;
            }

        } catch (error) {
            console.error("Error loading profile:", error);
        }
    }

    // Save user details to backend
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
            loadProfileData();
            alert("Modifications annulées !");
        });
    }

    // Load profile data on page load
    loadProfileData();

    // Toggle password visibility
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    if (togglePassword) {
        togglePassword.addEventListener("click", function () {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    }

    // Course management - FETCHING FROM BACKEND
    const courseTableBody = document.getElementById("courseTableBody");
    const skillsList = document.getElementById("skillsList");
    const totalCourses = document.getElementById("totalCourses");
    const completedCourses = document.getElementById("completedCourses");
    const averageProgress = document.getElementById("averageProgress");

    // Fetch courses from backend
    async function loadCoursesFromBackend() {
        try {
            const response = await fetch("http://127.0.0.1:8000/users/courses", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Failed to fetch courses");

            const userCourses = await response.json();
            displayCourses(userCourses);
            loadSkills(userCourses);

        } catch (error) {
            console.error("Error loading courses:", error);
            // Fallback to localStorage if backend fails
            const userCourses = JSON.parse(localStorage.getItem("userCourses")) || [];
            displayCourses(userCourses);
            loadSkills(userCourses);
        }
    }

    function displayCourses(userCourses) {
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

    // Load courses from backend on page load
    loadCoursesFromBackend();
});
