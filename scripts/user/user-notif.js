// ---- SIDEBAR TOGGLE ----
function toggleNav() {
    document.getElementById("sidebar").classList.toggle("active");
}

// ---- SHOW/HIDE NOTIFICATION DETAILS ----
function showNotification(element) {
    const contentArea = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar1");

    contentArea.innerHTML = `
        <span id="backButton" class="material-symbols-outlined" onclick="HideNotif()">arrow_back</span>
        <div class="notif">${element.dataset.content}</div>`;

    sidebar.classList.add("hidden");
    contentArea.classList.add("visible");

    element.classList.remove("unread");
    element.dataset.read = "true";
}

function HideNotif() {
    const contentArea = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar1");

    contentArea.innerHTML = `<p>Sélectionnez une notification pour voir les détails.</p>`;
    sidebar.classList.remove("hidden");
    contentArea.classList.remove("visible");
}

// ---- FILTER FUNCTIONS ----
function filterMentions() {
    document.querySelectorAll(".notification").forEach((notif) => {
        notif.style.display = notif.dataset.type === "mention" ? "block" : "none";
    });
}

function filterUnread() {
    document.querySelectorAll(".notification").forEach((notif) => {
        notif.style.display = notif.classList.contains("unread") ? "block" : "none";
    });
}

function showAllNotifications() {
    document.querySelectorAll(".notification").forEach((notif) => {
        notif.style.display = "block";
    });
}

// ---- TIMESTAMP / SORTING ----
function getTimestamp() {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
}

function sortNotifications() {
    const notificationList = document.querySelector(".notifications");
    const notifications = Array.from(notificationList.children);

    notifications.sort((a, b) => {
        const timeA = a.querySelector(".timestamp").innerText;
        const timeB = b.querySelector(".timestamp").innerText;
        return timeB.localeCompare(timeA);
    });

    notifications.forEach((notif) => notificationList.appendChild(notif));
}

// ---- FETCH AND DISPLAY NOTIFICATIONS FROM BACKEND ----
document.addEventListener("DOMContentLoaded", () => {
    fetchNotifications();
});

async function fetchNotifications() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        console.error("Token non trouvé.");
        document.querySelector(".notifications").innerHTML = "<p>Non authentifié.</p>";
        return;
    }

    try {
        const response = await fetch("https://backend-m6sm.onrender.com/notifications/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Erreur de chargement des notifications");
        }

        const notifications = await response.json();
        renderNotifications(notifications);
        sortNotifications();
    } catch (error) {
        console.error(error);
        document.querySelector(".notifications").innerHTML = "<p>Erreur de chargement.</p>";
    }
}

function renderNotifications(notifications) {
    const container = document.querySelector(".notifications");
    container.innerHTML = ""; // Clear existing content

    notifications.forEach((notif) => {
        const notifEl = document.createElement("div");
        notifEl.classList.add("notification");
        if (!notif.read) notifEl.classList.add("unread");

        notifEl.dataset.type = notif.type;
        notifEl.dataset.read = notif.read;
        notifEl.dataset.content = notif.content;

        notifEl.innerHTML = `
            <div class="message">${notif.message}</div>
            <div class="timestamp">${notif.timestamp || getTimestamp()}</div>
        `;

        notifEl.addEventListener("click", () => showNotification(notifEl));
        container.appendChild(notifEl);
    });
}
