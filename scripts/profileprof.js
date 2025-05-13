document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("Utilisateur non connecté.");
        return;
    }

    // Toggle Sidebar
    function toggleNav() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }

    const menuIcon = document.querySelector(".menu-icon");
    const closeBtn = document.querySelector(".close-btn");

    if (menuIcon && closeBtn) {
        menuIcon.addEventListener("click", toggleNav);
        closeBtn.addEventListener("click", toggleNav);
    }

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
            newDeletePicBtn.addEventListener("click", async () => {
                if (confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?")) {
                    profilePic.src = defaultImage;
                    enlargedImg.src = defaultImage;

                    await fetch("http://127.0.0.1:8000/users/me", {
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ profile_image: null })
                    });

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

    // Upload profile picture and update backend
    if (uploadInput) {
        uploadInput.addEventListener("change", async function (event) {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append("file", file);

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
            }
        });
    }

    // Fetch user data from backend
    async function fetchUserProfile() {
        try {
            const response = await fetch("http://127.0.0.1:8000/users/me", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Erreur API");

            const data = await response.json();
            const inputs = document.querySelectorAll(".input-box input");

            inputs.forEach(input => {
                if (data[input.id]) input.value = data[input.id];
            });

            if (data.profile_image && profilePic) {
                profilePic.src = data.profile_image;
            }

        } catch (error) {
            console.error("Erreur profil utilisateur:", error);
            alert("Échec du chargement du profil.");
        }
    }

    fetchUserProfile();

    // Save profile changes to backend
    const saveBtn = document.querySelector(".save-btn");
    const cancelBtn = document.querySelector(".cancel-btn");
    const inputs = document.querySelectorAll(".input-box input");

    if (saveBtn) {
        saveBtn.addEventListener("click", async function () {
            const updatedData = {};
            inputs.forEach(input => {
                updatedData[input.id] = input.value;
            });

            await fetch("http://127.0.0.1:8000/users/me", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            });

            alert("Informations enregistrées avec succès !");
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            fetchUserProfile();
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
});
