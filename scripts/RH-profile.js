// RH-profile.js

// Sidebar toggle function
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar.style.width === "250px") {
        sidebar.style.width = "0";
    } else {
        sidebar.style.width = "250px";
    }
}

// DOM Content Loaded block
window.addEventListener("DOMContentLoaded", function () {
    // Profile picture handling
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const defaultImage = "./profil-pic.png";

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
        btnContainer.style.display = "flex";
        btnContainer.style.gap = "10px";
        btnContainer.style.marginTop = "10px";

        const changeBtn = document.createElement("button");
        changeBtn.textContent = "Modifier";
        Object.assign(changeBtn.style, {
            backgroundColor: "#7c3aed",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
        });
        changeBtn.onclick = () => uploadInput.click();

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Supprimer";
        Object.assign(deleteBtn.style, {
            backgroundColor: "red",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
        });
        deleteBtn.onclick = async () => {
            if (confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?")) {
                profilePic.src = defaultImage;
                enlargedImg.src = defaultImage;
                overlay.remove();
                // DELETE request to backend
                await fetch("/api/profile-picture", { method: "DELETE" });
            }
        };

        btnContainer.appendChild(changeBtn);
        btnContainer.appendChild(deleteBtn);
        overlay.appendChild(enlargedImg);
        overlay.appendChild(btnContainer);
        document.body.appendChild(overlay);

        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) overlay.remove();
        });
    });

    uploadInput.addEventListener("change", async function (event) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/profile-picture", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                profilePic.src = data.url;
                const enlargedImg = document.querySelector("#imgOverlay img");
                if (enlargedImg) enlargedImg.src = data.url;
            }
        }
    });

    // Load profile picture from backend
    (async function loadProfilePic() {
        try {
            const res = await fetch("/api/profile-picture");
            if (res.ok) {
                const data = await res.json();
                if (data.url) profilePic.src = data.url;
            }
        } catch (err) {
            console.error("Error loading profile image:", err);
        }
    })();

    // Password toggle
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");
    if (togglePassword) {
        togglePassword.addEventListener("click", () => {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    }

    // Sidebar notification dot
    const icon = document.querySelector("i.fa-users");
    const dot = icon ? icon.querySelector(".notification-dot") : null;
    const hasPending = localStorage.getItem("hasPendingAccountRequests") === "true";
    if (dot) dot.style.display = hasPending ? "block" : "none";

    // Check training requests
    function checkFormationRequests() {
        const notificationDot = document.getElementById('formationNotificationDot');
        const requests = JSON.parse(localStorage.getItem('formationRequests') || '{}');
        const hasRequests = Object.values(requests).some(count => count > 0);
        if (notificationDot) notificationDot.style.display = hasRequests ? 'block' : 'none';
    }
    checkFormationRequests();
    setInterval(checkFormationRequests, 1000);
});

