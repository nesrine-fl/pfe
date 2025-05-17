// --- Toggle sidebar ---
function toggleNav() {
    document.getElementById("sidebar").classList.toggle("active");
}

// --- Show full notification in main content ---
function showNotification(element) {
    const contentArea = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar1");
    const token = localStorage.getItem("access_token");

    if (!element || !contentArea || !sidebar || !token) return;

    // Update content area
    contentArea.innerHTML = `
        <span id="backButton" class="material-symbols-outlined" onclick="HideNotif()">arrow_back</span>
        <div class="notif">${element.dataset.content}</div>
    `;
    sidebar.classList.add("hidden");
    contentArea.classList.add("visible");

    // Mark as read in backend
    fetch(`https://backend-m6sm.onrender.com/notifications/${element.dataset.id}/read`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }).catch(err => console.error("Erreur de mise à jour :", err));

    // Update frontend visual
    element.classList.remove("unread");
    element.dataset.read = "true";
}

// --- Return to notifications list ---
function HideNotif() {
    const contentArea = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar1");

    if (!contentArea || !sidebar) return;

    contentArea.innerHTML = `<p>Sélectionnez une notification pour voir les détails.</p>`;
    sidebar.classList.remove("hidden");
    contentArea.classList.remove("visible");
}

// --- Filter Buttons ---
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

// --- Fetch Notifications from Backend ---
async function fetchNotifications() {
    const container = document.querySelector(".notifications");
    const token = localStorage.getItem("access_token");

    if (!container || !token) return;

    try {
        const response = await fetch("https://backend-m6sm.onrender.com/notifications/", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
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

// --- Render Notifications ---
function renderNotifications(notifications) {
    const container = document.querySelector(".notifications");
    if (!container) return;

    container.innerHTML = ""; // Clear old content

    notifications.forEach(notif => {
        const div = document.createElement("div");
        div.className = "notification";
        if (!notif.is_read) div.classList.add("unread");

        // Data attributes for filtering and detail
        div.dataset.type = notif.type;
        div.dataset.read = notif.is_read ? "true" : "false";
        div.dataset.content = notif.message;
        div.dataset.id = notif.id;
        div.dataset.timestamp = notif.created_at;

        // Display content
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

// --- Sort by Newest ---
function sortNotifications() {
    const container = document.querySelector(".notifications");
    if (!container) return;

    const items = Array.from(container.children);
    items.sort((a, b) => new Date(b.dataset.timestamp) - new Date(a.dataset.timestamp));
    items.forEach(item => container.appendChild(item));
}

// --- Load on Page ---
document.addEventListener("DOMContentLoaded", fetchNotifications);
