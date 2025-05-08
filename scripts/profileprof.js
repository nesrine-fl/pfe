   document.addEventListener("DOMContentLoaded", function () {
    // Sidebar toggle function
    function toggleNav() {
        let sidebar = document.getElementById("sidebar");
        sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
    }

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
