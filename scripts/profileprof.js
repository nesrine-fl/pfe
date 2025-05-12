document.addEventListener("DOMContentLoaded", function () {
    // Fetch the token from localStorage
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

    // Menu icon and close button listeners
    const menuIcon = document.querySelector(".menu-icon");
    const closeBtn = document.querySelector(".close-btn");

    if (menuIcon && closeBtn) {
        menuIcon.addEventListener("click", toggleNav);
        closeBtn.addEventListener("click", toggleNav);
    }

    // Profile picture logic
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const defaultImage = "./profil-pic.png";

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

    // Upload profile picture
    if (uploadInput) {
        uploadInput.addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (profilePic) {
                        profilePic.src = e.target.result;
                        localStorage.setItem("profileImage", e.target.result);
                    }

                    const enlargedImg = document.querySelector("#imgOverlay img");
                    if (enlargedImg) enlargedImg.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Load saved profile picture
    const savedProfileImage = localStorage.getItem("profileImage");
    if (savedProfileImage && profilePic) {
        profilePic.src = savedProfileImage;
    }

    // Fetch user data and fill form
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

            console.log("User data fetched:", data);
        } catch (error) {
            console.error("Erreur profil utilisateur:", error);
            alert("Échec du chargement du profil.");
        }
    }

    fetchUserProfile();

    // Save and cancel profile data
    const saveBtn = document.querySelector(".save-btn");
    const cancelBtn = document.querySelector(".cancel-btn");
    const inputs = document.querySelectorAll(".input-box input");

    function loadProfileData() {
        inputs.forEach(input => {
            const savedValue = localStorage.getItem(input.id);
            if (savedValue) input.value = savedValue;
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", function () {
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

    loadProfileData();

    // Password visibility toggle
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    }
});
