document.addEventListener("DOMContentLoaded", function () {
    // === Configuration ===
    const BASE_URL = "http://localhost:8000";
    const TOKEN = localStorage.getItem("token");

    // === Sidebar Toggle ===
    function toggleNav() {
        const sidebar = document.getElementById("sidebar");
        sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
    }

    document.querySelector(".menu-icon").addEventListener("click", toggleNav);
    document.querySelector(".close-btn").addEventListener("click", toggleNav);

    // === Profile Picture Handling ===
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const changePicBtn = document.getElementById("changePicBtn");
    const deletePicBtn = document.getElementById("deletePicBtn");

    changePicBtn.addEventListener("click", () => uploadInput.click());

    uploadInput.addEventListener("change", async function (event) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await fetch(`${BASE_URL}/users/profile-picture`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${TOKEN}`
                    },
                    body: formData
                });

                if (!response.ok) throw new Error("Upload failed");

                const data = await response.json();
                profilePic.src = data.profile_picture_url;
            } catch (err) {
                console.error(err);
                alert("Failed to upload profile picture");
            }
        }
    });

    deletePicBtn.addEventListener("click", async function () {
        if (confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?")) {
            try {
                const response = await fetch(`${BASE_URL}/users/profile-picture`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${TOKEN}`
                    }
                });

                if (!response.ok) throw new Error("Deletion failed");

                profilePic.src = "../assets/images/profil-pic.png";
            } catch (err) {
                console.error(err);
                alert("Failed to delete profile picture");
            }
        }
    });

    // === Fetch User Profile ===
    async function fetchUserProfile() {
        try {
            const response = await fetch(`${BASE_URL}/users/me`, {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                credentials: "include"
            });

            if (!response.ok) throw new Error("Profile fetch failed");

            const user = await response.json();

            document.getElementById("nom").value = user.nom;
            document.getElementById("prenom").value = user.prenom;
            document.getElementById("email").value = user.email;
            document.getElementById("telephone").value = user.telephone;
            document.getElementById("departement").value = user.departement;
            document.getElementById("fonction").value = user.role;
        } catch (err) {
            console.error(err);
        }
    }

    // === Fetch Course Progress ===
    async function fetchCourseProgress() {
        try {
            const response = await fetch(`${BASE_URL}/courses/progress`, {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                credentials: "include"
            });

            if (!response.ok) throw new Error("Progress fetch failed");

            const courses = await response.json();
            updateCourseTable(courses);
            updateStatistics(courses);
        } catch (err) {
            console.error(err);
        }
    }

    function updateCourseTable(courses) {
        const tbody = document.getElementById("courseTableBody");
        tbody.innerHTML = "";

        courses.forEach(course => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${course.title}</td>
                <td>
                    <div class="progress-bar">
                        <span style="width: ${course.progress}%;"></span>
                    </div>
                    ${course.progress}%
                </td>
                <td>${new Date(course.start_date).toLocaleDateString()}</td>
                <td>${course.end_date ? new Date(course.end_date).toLocaleDateString() : "En cours"}</td>
                <td>${course.completed ? "✅ Terminé" : "⌛ En cours"}</td>
            `;
            tbody.appendChild(row);
        });
    }

    function updateStatistics(courses) {
        const completed = courses.filter(c => c.completed).length;
        const avgProgress = courses.length
            ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
            : 0;

        document.getElementById("totalCourses").textContent = courses.length;
        document.getElementById("completedCourses").textContent = completed;
        document.getElementById("averageProgress").textContent = `${avgProgress}%`;
    }

    // === Init ===
    fetchUserProfile();
    fetchCourseProgress();
});
