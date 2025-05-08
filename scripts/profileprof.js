   document.addEventListener("DOMContentLoaded", function () {
    // Sidebar toggle function
    function toggleNav() {
        let sidebar = document.getElementById("sidebar");
        sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
    }
      // Add these functions to fetch data from backend
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
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

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
        
        // Update course table
        const courseTableBody = document.getElementById("courseTableBody");
        courseTableBody.innerHTML = "";
        
        courseData.forEach(course => {
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

        // Update statistics
        const completedCount = courseData.filter(course => course.completed).length;
        const totalProgress = courseData.reduce((sum, course) => sum + course.progress, 0);
        const avgProgress = courseData.length > 0 ? Math.round(totalProgress / courseData.length) : 0;

        document.getElementById("totalCourses").textContent = courseData.length;
        document.getElementById("completedCourses").textContent = completedCount;
        document.getElementById("averageProgress").textContent = `${avgProgress}%`;
    } catch (error) {
        console.error('Error fetching course progress:', error);
    }
}

// Add this line at the end of your DOMContentLoaded event listener
fetchUserProfile();
fetchCourseProgress();

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
    // In your existing profile picture upload code, replace the FileReader part with:
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
