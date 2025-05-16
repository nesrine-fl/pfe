const BACKEND_URL = "https://backend-m6sm.onrender.com";

// ✅ Auth token (ex. récupéré après login)
const accessToken = "ACCESS_TOKEN_ICI"; // ⛔ REMPLACE ceci par le vrai token JWT

document.addEventListener("DOMContentLoaded", async () => {
    if (!accessToken) {
        alert("Utilisateur non connecté");
        return;
    }

    try {
        const notifications = await fetchNotifications(accessToken);
        displayNotifications(notifications);
        sortNotifications();
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications :", error);
    }
});

async function fetchNotifications(token) {
    try {
        const response = await fetch(`${BACKEND_URL}/notifications/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Échec de la récupération des notifications - Code ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications :", error);
        throw error;
    }
}

async function markNotificationRead(notificationId) {
    try {
        const response = await fetch(`${BACKEND_URL}/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
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

function displayNotifications(notifs) {
    const notificationList = document.querySelector(".notifications");
    notificationList.innerHTML = "";

    notifs.forEach(notif => {
        const div = document.createElement("div");
        div.classList.add("notification");
        if (!notif.read) div.classList.add("unread");
        div.dataset.id = notif.id;
        div.dataset.type = notif.type;
        div.dataset.content = notif.content;
        div.innerHTML = `
            <span class="message">${notif.title || "Notification"}</span>
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
