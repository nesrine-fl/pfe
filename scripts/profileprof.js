document.addEventListener("DOMContentLoaded", function () {
    // Sidebar toggle function
    function toggleNav() {
        let sidebar = document.getElementById("sidebar");
        if (sidebar) {
            sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
        }
    }
    function toggleNav() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}


    const menuIcon = document.querySelector(".menu-icon");
    const closeBtn = document.querySelector(".close-btn");

    if (menuIcon && closeBtn) {
        menuIcon.addEventListener("click", toggleNav);
        closeBtn.addEventListener("click", toggleNav);
    }

    // Profile picture handling
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const defaultImage = "./profil-pic.png"; // Default image path

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
            newDeletePicBtn.addEventListener("click", function () {
                const confirmDelete = confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?");
                if (confirmDelete) {
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
                if (event.target === overlay) {
                    overlay.remove();
                }
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
                    if (enlargedImg) {
                        enlargedImg.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Load saved profile picture from local storage
    async function fetchUserProfile() {
        try {
            
        const token = localStorage.getItem("access_token"); // Or however you saved it

fetch("http://127.0.0.1:8000/users/me", {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    }
})
.then(response => {
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
})
.then(data => {
    console.log("User data:", data);
})
.catch(error => {
    console.error("Error fetching user profile:", error);
});

    }

    fetchUserProfile();

    // Save and restore user details
    const saveBtn = document.querySelector(".save-btn");
    const cancelBtn = document.querySelector(".cancel-btn");
    const inputs = document.querySelectorAll(".input-box input");

    function loadProfileData() {
        inputs.forEach(input => {
            const savedValue = localStorage.getItem(input.id);
            if (savedValue) {
                input.value = savedValue;
            }
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

    // Toggle password visibility
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    }
});
