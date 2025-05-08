    document.querySelector(".menu-icon").addEventListener("click", toggleNav);
    document.querySelector(".close-btn").addEventListener("click", toggleNav);

    // Fetch user profile data
    async function fetchUserProfile() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const userData = await response.json();
            
            // Update form fields with user data
            document.getElementById('nom').value = userData.nom;
            document.getElementById('prenom').value = userData.prenom;
            document.getElementById('email').value = userData.email;
            document.getElementById('telephone').value = userData.telephone;
            document.getElementById('departement').value = userData.departement;
            document.getElementById('fonction').value = userData.role;

            // If user has a profile picture, update it
            if (userData.profile_picture) {
                document.getElementById('profilePic').src = userData.profile_picture;
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            alert('Failed to load user profile');
        }
    }

    // Fetch course progress data
    async function fetchCourseProgress() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/courses/progress', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch course progress');
            }

            const courseData = await response.json();
            updateCourseTable(courseData);
            updateStatistics(courseData);
        } catch (error) {
            console.error('Error fetching course progress:', error);
            alert('Failed to load course progress');
        }
    }

    // Update course table with fetched data
    function updateCourseTable(courses) {
        const courseTableBody = document.getElementById("courseTableBody");
        courseTableBody.innerHTML = "";

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
                <td>${course.end_date ? new Date(course.end_date).toLocaleDateString() : 'En cours'}</td>
                <td>${course.completed ? "✅ Terminé" : "⌛ En cours"}</td>
            `;
            courseTableBody.appendChild(row);
        });
    }

    // Update statistics
    function updateStatistics(courses) {
        const totalCourses = document.getElementById("totalCourses");
        const completedCourses = document.getElementById("completedCourses");
        const averageProgress = document.getElementById("averageProgress");

        const completedCount = courses.filter(course => course.completed).length;
        const totalProgress = courses.reduce((sum, course) => sum + course.progress, 0);
        const avgProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;

        totalCourses.textContent = courses.length;
        completedCourses.textContent = completedCount;
        averageProgress.textContent = `${avgProgress}%`;
    }

    // Profile picture handling
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const changePicBtn = document.getElementById("changePicBtn");
    const deletePicBtn = document.getElementById("deletePicBtn");

    // Upload profile picture
    uploadInput.addEventListener("change", async function (event) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8000/users/profile-picture', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload profile picture');
                }

                const data = await response.json();
                profilePic.src = data.profile_picture_url;
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                alert('Failed to upload profile picture');
            }
        }
    });

    // Delete profile picture
    deletePicBtn.addEventListener("click", async function() {
        const confirmDelete = confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?");
        if (confirmDelete) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8000/users/profile-picture', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete profile picture');
                }

                profilePic.src = '../assets/images/profil-pic.png'; // Reset to default image
            } catch (error) {
                console.error('Error deleting profile picture:', error);
                alert('Failed to delete profile picture');
            }
        }
    });

    // Initialize data
    fetchUserProfile();
    fetchCourseProgress();
});
    document.querySelector(".menu-icon").addEventListener("click", toggleNav);
    document.querySelector(".close-btn").addEventListener("click", toggleNav);



    // Profile picture handling
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const changePicBtn = document.getElementById("changePicBtn");
    const deletePicBtn = document.getElementById("deletePicBtn");
    const defaultImage = "./profil-pic.png"; // Default image path

    // Function to open overlay with enlarged image
    profilePic.addEventListener("click", function () {
        // Remove existing overlay if it exists
        const existingOverlay = document.getElementById("imgOverlay");
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create overlay
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

        // Create enlarged image
        const enlargedImg = document.createElement("img");
        enlargedImg.src = profilePic.src;
        enlargedImg.style.width = "300px";
        enlargedImg.style.height = "300px";
        enlargedImg.style.borderRadius = "50%";
        enlargedImg.style.border = "5px solid white";
        enlargedImg.style.cursor = "pointer";

        // Create button container
        const btnContainer = document.createElement("div");
        btnContainer.style.display = "flex";
        btnContainer.style.gap = "10px";
        btnContainer.style.marginTop = "10px";

        // Create new buttons
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
                profilePic.src = defaultImage; // Reset profile image
                enlargedImg.src = defaultImage; // Update enlarged image
                localStorage.removeItem("profileImage"); // Remove from local storage
                overlay.remove(); // Close overlay after deleting
            }
        });
        

        // Append buttons to the button container
        btnContainer.appendChild(newChangePicBtn);
        btnContainer.appendChild(newDeletePicBtn);

        // Append everything to overlay
        overlay.appendChild(enlargedImg);
        overlay.appendChild(btnContainer);
        document.body.appendChild(overlay);

        // Close overlay when clicking outside
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) {
                overlay.remove();
            }
        });
    });

    // Upload profile picture
    uploadInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profilePic.src = e.target.result; // Update profile picture
                localStorage.setItem("profileImage", e.target.result); // Save to local storage

                // Also update enlarged image if overlay is open
                const enlargedImg = document.querySelector("#imgOverlay img");
                if (enlargedImg) {
                    enlargedImg.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    });

    // Load saved profile picture from local storage
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
        profilePic.src = savedImage;
    }

    // Save and restore user details
    const saveBtn = document.querySelector(".save-btn");
    const cancelBtn = document.querySelector(".cancel-btn");
    const inputs = document.querySelectorAll(".input-box input");

  function loadProfileData() {
    fetch('http://127.0.0.1:8000/teachers/')  // <-- Replace with your real backend API endpoint
        .then(response => response.json())
        .then(data => {
            console.log(data);  // for testing
            if (data.length > 0) {
                const teacher = data[0];  // You can select by ID or use the first one

                document.getElementById('nom').value = teacher.last_name;
                document.getElementById('prenom').value = teacher.first_name;
                document.getElementById('email').value = teacher.email;
                document.getElementById('telephone').value = teacher.phone_number;
                document.getElementById('departement').value = teacher.department;
                document.getElementById('fonction').value = teacher.role;
            }
        })
        .catch(error => console.error('Erreur lors de la récupération des données:', error));
}

    saveBtn.addEventListener("click", function () {
        inputs.forEach(input => {
            localStorage.setItem(input.id, input.value);
        });
        alert("Informations enregistrées avec succès !");
    });

    cancelBtn.addEventListener("click", function () {
        loadProfileData();
        alert("Modifications annulées !");
    });

    loadProfileData();

    // Toggle password visibility
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    if (togglePassword) {
        togglePassword.addEventListener("click", function () {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    }
});




document.addEventListener("DOMContentLoaded", function () {
    const courseTableBody = document.getElementById("courseTableBody");
    const skillsList = document.getElementById("skillsList");
    const totalCourses = document.getElementById("totalCourses");
    const completedCourses = document.getElementById("completedCourses");
    const averageProgress = document.getElementById("averageProgress");

    // Récupérer les cours stockés
    let userCourses = JSON.parse(localStorage.getItem("userCourses")) || [];

    function loadCourses() {
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
                <td>${course.startDate}</td>
                <td>${course.endDate}</td>
                <td>${course.completed ? "✅ Terminé" : "⌛ En cours"}</td>
            `;

            courseTableBody.appendChild(row);

            if (course.completed) completedCount++;
            totalProgress += course.progress;
        });

        totalCourses.textContent = userCourses.length;
        completedCourses.textContent = completedCount;
        averageProgress.textContent = userCourses.length > 0 ? Math.round(totalProgress / userCourses.length) + "%" : "0%";
    }

    function loadSkills() {
        skillsList.innerHTML = "";
        const allSkills = new Set();

        userCourses.forEach(course => {
            if (course.completed) {
                course.skills.forEach(skill => allSkills.add(skill));
            }
        });

        allSkills.forEach(skill => {
            const li = document.createElement("li");
            li.textContent = skill;
            skillsList.appendChild(li);
        });
    }

    loadCourses();
    loadSkills();
});

 // Fermer la sidebar en cliquant en dehors
 document.addEventListener("click", function (event) {
    if (!sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
        sidebar.classList.remove("active");
    }
});
