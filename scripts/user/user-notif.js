const BACKEND_URL = "https://backend-m6sm.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
        alert("Utilisateur non connecté");
        return;
    }

    try {
        const notifications = await fetchNotifications(token);
        displayNotifications(notifications);
        sortNotifications();
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications :", error);
    }
});
async function markNotificationRead(notificationId) {
  try {
    const response = await fetch(`https://your-backend-domain.com/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${yourAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Mark read result:', result);
    return result;

  } catch (error) {
    console.error('Erreur lors du marquage de notification comme lue :', error);
    throw error;
  }
}

async function fetchNotifications() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        console.error("Token non trouvé. L'utilisateur n'est peut-être pas connecté.");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/notifications/", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Échec de la récupération des notifications");
        }

        const data = await response.json();
        displayNotifications(data); // ou toute autre fonction qui les affiche
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications :", error);
    }
}


function displayNotifications(notifs) {
    const notificationList = document.querySelector(".notifications");
    notificationList.innerHTML = ""; // Clear existing

    notifs.forEach(notif => {
        const div = document.createElement("div");
        div.classList.add("notification");
        if (!notif.read) div.classList.add("unread");
        div.dataset.type = notif.type;
        div.dataset.content = notif.content;
        div.innerHTML = `
            <span class="message">${notif.title}</span>
            <span class="timestamp">${getTimestamp()}</span>
        `;
        div.addEventListener("click", () => showNotification(div));
        notificationList.appendChild(div);
    });
}

function getTimestamp() {
    let now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
}

function sortNotifications() {
    const notificationList = document.querySelector(".notifications");
    const notifications = Array.from(notificationList.children);

    notifications.sort((a, b) => {
        return b.querySelector(".timestamp").innerText.localeCompare(
            a.querySelector(".timestamp").innerText
        );
    });

    notifications.forEach(notif => notificationList.appendChild(notif));
}

function toggleNav() {
    document.getElementById("sidebar").classList.toggle("active");
}

function showNotification(element) {
    let contentArea = document.querySelector(".main-content");
    let sidebar = document.querySelector(".sidebar1");

    contentArea.innerHTML = `
        <span id="backButton" class="material-symbols-outlined" onclick="HideNotif()">arrow_back</span>
        <div class="notif">${element.dataset.content}</div>
    `;
    sidebar.classList.add("hidden");
    contentArea.classList.add("visible");
}

function HideNotif() {
    let contentArea = document.querySelector(".main-content");
    let sidebar = document.querySelector(".sidebar1");

    contentArea.innerHTML = `<p>Sélectionnez une notification pour voir les détails.</p>`;
    sidebar.classList.remove("hidden");
    contentArea.classList.remove("visible");
}

function filterMentions() {
    document.querySelectorAll(".notification").forEach(notif => {
        notif.style.display = notif.dataset.type === "mention" ? "block" : "none";
    });
}

function filterUnread() {
    document.querySelectorAll(".notification").forEach(notif => {
        notif.style.display = notif.classList.contains("unread") ? "block" : "none";
    });
}

function showAllNotifications() {
    document.querySelectorAll(".notification").forEach(notif => {
        notif.style.display = "block";
    });
}
