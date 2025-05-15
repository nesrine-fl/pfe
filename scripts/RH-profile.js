document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("Vous devez être connecté pour accéder à cette page.");
    // Optionally redirect to login page
    return;
  }

  // Sidebar toggle
  function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
  }
  document.querySelector(".menu-icon").addEventListener("click", toggleSidebar);
  document.querySelector(".close-btn").addEventListener("click", toggleSidebar);

  // Profile picture elements
  const profilePic = document.getElementById("profilePic");
  const uploadInput = document.getElementById("uploadProfilePic");
  const defaultImage = "./profil-pic.png"; // fallback default

  // Load profile picture from backend
  async function loadProfilePic() {
    try {
      const res = await fetch("https://your-backend-url.com/api/users/me/profile-pic", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Assuming API returns JSON with URL of image:
        const data = await res.json();
        profilePic.src = data.url || defaultImage;
      } else {
        profilePic.src = defaultImage;
      }
    } catch {
      profilePic.src = defaultImage;
    }
  }

  // Open overlay with enlarged image and options
  profilePic.addEventListener("click", () => {
    // Remove existing overlay
    const existingOverlay = document.getElementById("imgOverlay");
    if (existingOverlay) existingOverlay.remove();

    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "imgOverlay";
    Object.assign(overlay.style, {
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", zIndex: "1000",
    });

    const enlargedImg = document.createElement("img");
    enlargedImg.src = profilePic.src;
    Object.assign(enlargedImg.style, {
      width: "300px", height: "300px", borderRadius: "50%", border: "5px solid white",
      cursor: "pointer",
    });

    const btnContainer = document.createElement("div");
    Object.assign(btnContainer.style, {
      display: "flex", gap: "10px", marginTop: "10px",
    });

    // Modifier button (opens file dialog)
    const changeBtn = document.createElement("button");
    changeBtn.textContent = "Modifier";
    Object.assign(changeBtn.style, {
      backgroundColor: "#7c3aed", color: "white", padding: "10px 15px",
      border: "none", borderRadius: "5px", cursor: "pointer",
    });
    changeBtn.onclick = () => uploadInput.click();

    // Supprimer button (calls backend delete)
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Supprimer";
    Object.assign(deleteBtn.style, {
      backgroundColor: "red", color: "white", padding: "10px 15px",
      border: "none", borderRadius: "5px", cursor: "pointer",
    });
    deleteBtn.onclick = async () => {
      if (confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?")) {
        try {
          const res = await fetch("https://your-backend-url.com/api/users/me/profile-pic", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            profilePic.src = defaultImage;
            enlargedImg.src = defaultImage;
            alert("Photo de profil supprimée avec succès.");
            overlay.remove();
          } else {
            alert("Erreur lors de la suppression de la photo.");
          }
        } catch {
          alert("Erreur réseau lors de la suppression.");
        }
      }
    };

    btnContainer.append(changeBtn, deleteBtn);
    overlay.append(enlargedImg, btnContainer);
    document.body.appendChild(overlay);

    // Close overlay if clicking outside image/buttons
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  });

  // Upload profile picture to backend
  uploadInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://your-backend-url.com/api/users/me/profile-pic", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        // Assuming backend returns new image URL
        const data = await res.json();
        profilePic.src = data.url;
        alert("Photo de profil mise à jour avec succès.");
        // Update overlay image if open
        const overlayImg = document.querySelector("#imgOverlay img");
        if (overlayImg) overlayImg.src = data.url;
      } else {
        alert("Erreur lors de la mise à jour de la photo.");
      }
    } catch {
      alert("Erreur réseau lors de la mise à jour de la photo.");
    }
  });

  // User profile form inputs
  const inputs = {
    username: document.getElementById("username"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    // Add more inputs here if you have more profile fields
  };

  // Load user profile from backend
  async function fetchUserProfile() {
    try {
      const res = await fetch("https://your-backend-url.com/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement du profil.");
      const data = await res.json();

      inputs.username.value = data.username || "";
      inputs.email.value = data.email || "";
      inputs.password.value = ""; // For security, backend usually does not send password
      // Set other fields if needed
    } catch (err) {
      alert(err.message);
    }
  }

  // Save profile updates to backend
  document.querySelector(".save-btn").addEventListener("click", async () => {
    const payload = {
      username: inputs.username.value,
      email: inputs.email.value,
    };
    if (inputs.password.value.trim() !== "") {
      payload.password = inputs.password.value;
    }

    try {
      const res = await fetch("https://your-backend-url.com/api/users/me", {
        method: "PUT", // or PATCH depending on your API
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour du profil.");

      alert("Informations enregistrées avec succès !");
      inputs.password.value = ""; // Clear password field after save
    } catch (err) {
      alert(err.message);
    }
  });

  // Cancel button reloads profile from backend
  document.querySelector(".cancel-btn").addEventListener("click", fetchUserProfile);

  // Toggle password visibility
  const togglePassword = document.querySelector(".toggle-password");
  if (togglePassword) {
    togglePassword.addEventListener("click", () => {
      inputs.password.type = inputs.password.type === "password" ? "text" : "password";
    });
  }

  // Courses table and skills list
  const courseTableBody = document.getElementById("courseTableBody");
  const skillsList = document.getElementById("skillsList");
  const totalCourses = document.getElementById("totalCourses");
  const completedCourses = document.getElementById("completedCourses");
  const averageProgress = document.getElementById("averageProgress");

  function loadCourses(courses) {
    courseTableBody.innerHTML = "";
    let completedCount = 0;
    let totalProgress = 0;

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
        <td>${course.startDate}</td>
        <td>${course.endDate}</td>
        <td>${course.completed ? "✅ Terminé" : "⌛ En cours"}</td>
      `;
      courseTableBody.appendChild(row);
      if (course.completed) completedCount++;
      totalProgress += course.progress;
    });

    totalCourses.textContent = courses.length;
    completedCourses.textContent = completedCount;
    averageProgress.textContent = courses.length > 0 ? Math.round(totalProgress / courses.length) + "%" : "0%";
  }

  function loadSkills(courses) {
    skillsList.innerHTML = "";
    const allSkills = new Set();

    courses.forEach(course => {
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

  // Fetch courses from backend
  async function fetchUserCourses() {
    try {
      const res = await fetch("https://your-backend-url.com/api/users/me/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des cours.");
      const courses = await res.json();

      loadCourses(courses);
      loadSkills(courses);
    } catch (err) {
      alert(err.message);
    }
  }

  // Initial load
  fetchUserProfile();
  fetchUserCourses();
  loadProfilePic();

});

    
