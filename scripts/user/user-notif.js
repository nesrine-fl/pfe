// --- Dynamic Notification Logic with token and clean rendering ---

// Toggle sidebar visibility
function toggleNav() {
    document.getElementById("sidebar").classList.toggle("active");
}

// Show full notification in main content
function showNotification(element) {
    const contentArea = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar1");
    const token = localStorage.getItem("access_token");

    if (!element || !contentArea || !sidebar) return;

    // Display notification content
    contentArea.innerHTML = `
        <span id="backButton" class="material-symbols-outlined" onclick="HideNotif()">arrow_back</span>
        <div class="notif">${element.dataset.content}</div>
    `;

    sidebar.classList.add("hidden");
    contentArea.classList.add("visible");

    // Mark notification as read in backend
    fetch(`https://backend-m6sm.onrender.com/notifications/${element.dataset.id}/read`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }).catch(err => console.error("Erreur de mise à jour :", err));

    // Update frontend visual state
    element.classList.remove("unread");
    element.dataset.read = "true";
}

// Hide full notification and return to sidebar view
function HideNotif() {
    const contentArea = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar1");

    if (!contentArea || !sidebar) return;

    contentArea.innerHTML = `<p>Sélectionnez une notification pour voir les détails.</p>`;
    sidebar.classList.remove("hidden");
    contentArea.classList.remove("visible");
}

// --- Filter functions ---

function filterMentions() {
    document.querySelectorAll(".notification").forEach(notif => {
        notif.style.display = notif.dataset.type === "mention" ? "block" : "none";
    });
}

function filterUnread() {
    document.querySelectorAll(".notification").forEach(notif => {
        notif.style.display = notif.dataset.read === "false" ? "block" : "none";
    });
}

function showAllNotifications() {
    document.querySelectorAll(".notification").forEach(notif => {
        notif.style.display = "block";
    });
}

// --- Fetch notifications from backend ---
async function fetchNotifications() {
    const container = document.querySelector(".notifications");
    const token = localStorage.getItem("access_token");

    if (!container) return;

    try {
        if (!token) throw new Error("Token d'authentification manquant");

        const response = await fetch("https://backend-m6sm.onrender.com/notifications/", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur ${response.status} : ${errorText}`);
        }

        const notifications = await response.json();
        if (!Array.isArray(notifications)) throw new Error("Format de données inattendu");

        renderNotifications(notifications);
        sortNotifications();

    } catch (error) {
        console.error("Erreur de chargement des notifications :", error);
        container.innerHTML = `<p>Erreur de chargement : ${error.message}</p>`;
    }
}

// --- Render notifications into sidebar ---
function renderNotifications(notifications) {
    const container = document.querySelector(".notifications");
    if (!container) return;

    container.innerHTML = "";

    notifications.forEach(notif => {
        const div = document.createElement("div");
        div.className = "notification";
        if (!notif.is_read) div.classList.add("unread");

        // Set data attributes
        div.dataset.type = notif.type;
        div.dataset.read = notif.is_read ? "true" : "false";
        div.dataset.content = notif.message;
        div.dataset.id = notif.id;
        div.dataset.timestamp = notif.created_at;

        // Content
        div.innerHTML = `
            <div class="notif-header">${notif.title}</div>
            <div class="timestamp">${formatTimestamp(notif.created_at)}</div>
        `;

        div.addEventListener("click", () => showNotification(div));
        container.appendChild(div);
    });
}

// --- Format timestamp to HH:MM ---
function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

// --- Sort notifications by most recent ---
function sortNotifications() {
    const container = document.querySelector(".notifications");
    if (!container) return;

    const items = Array.from(container.children);
    items.sort((a, b) => new Date(b.dataset.timestamp) - new Date(a.dataset.timestamp));
    items.forEach(item => container.appendChild(item));
}

// --- Load notifications on page load ---
document.addEventListener("DOMContentLoaded", fetchNotifications);
