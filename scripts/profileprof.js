document.addEventListener("DOMContentLoaded", function () {
    // Sidebar toggle function
   // Define toggleNav function globally
// Define toggleNav function globally
function toggleNav() {
    let sidebar = document.getElementById("sidebar");
    if (sidebar.style.left === "0px") {
        sidebar.style.left = "-250px";
    } else {
        sidebar.style.left = "0px";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Add event listeners for sidebar
    document.querySelector(".menu-icon").addEventListener("click", toggleNav);
    document.querySelector(".close-btn").addEventListener("click", toggleNav);

    // Profile picture handling
    const profilePic = document.getElementById("profilePic");
    const uploadInput = document.getElementById("uploadProfilePic");
    const changePicBtn = document.getElementById("changePicBtn");
    const deletePicBtn = document.getElementById("deletePicBtn");

    // Change picture button click
    changePicBtn.addEventListener("click", function() {
        uploadInput.click();
    });

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

    // Rest of your existing code...
});
   
    // Fetch user profile data
    async function fetchUserProfile() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
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

    // Fetch course progress data
    async function fetchCourseProgress() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/courses/progress', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch course progress');
            }

            const courseData = await response.json();
            updateCourseTable(courseData);
            updateStatistics(courseData);
        } catch (error) {
            console.error('Error fetching course progress:', error);
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

    // Your existing profile picture code here...

    // Initialize data
    fetchUserProfile();
    fetchCourseProgress();
});
