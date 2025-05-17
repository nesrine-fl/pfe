// Toggle sidebar visibility
function toggleNav() {
    document.getElementById("sidebar").classList.toggle("active");
}

// Show full notification in main area
function showNotification(element) {
    const contentArea = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar1");

    // Update content
    contentArea.innerHTML = `
        <span id="backButton" class="material-symbols-outlined" onclick="HideNotif()">arrow_back</span>
        <div class="notif">${element.dataset.content}</div>
    `;

    // Hide sidebar, show content
    sidebar.classList.add("hidden");
    contentArea.classList.add("visible");

    // Mark as read in backend
    const token = localStorage.getItem("access_token");
   fetch(`https://backend-m6sm.onrender.com/notifications/${element.dataset.id}/read`, {
        method: "PUT",
    
    }).catch(err => console.error("Erreur de mise à jour :", err));

    // Update display
    element.classList.remove("unread");
    element.dataset.read = "true";
}

// Hide detail view and go back to sidebar
function HideNotif() {
    document.querySelector(".main-content").innerHTML = `<p>Sélectionnez une notification pour voir les détails.</p>`;
    document.querySelector(".sidebar1").classList.remove("hidden");
    document.querySelector(".main-content").classList.remove("visible");
}

// Filters
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

async function fetchNotifications() {
    try {
        const response = await fetch("https://backend-m6sm.onrender.com/notifications");
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
    container.innerHTML = "";

    notifications.forEach(notif => {
        const div = document.createElement("div");
        div.className = "notification";
        if (!notif.is_read && notif.is_read !== undefined) div.classList.add("unread");
        else if (!notif.read && notif.read !== undefined) div.classList.add("unread");

        div.dataset.type = notif.type || "";
        div.dataset.read = (notif.is_read || notif.read) ? "true" : "false";
        div.dataset.content = notif.message || notif.content || "";
        div.dataset.id = notif.id || "";
        div.dataset.timestamp = notif.created_at || notif.timestamp || "";

        div.innerHTML = `
            <div class="notif-header">${notif.title || notif.message || "Notification"}</div>
            <div class="timestamp">${formatTimestamp(div.dataset.timestamp)}</div>
        `;

        div.addEventListener("click", function () {
            showNotification(this);
        });

        container.appendChild(div);
    });
}


document.addEventListener("DOMContentLoaded", fetchNotifications);

// Helper: convert ISO timestamp to readable time
function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
}

// Sort notifications by timestamp (newest first)
function sortNotifications() {
    const container = document.querySelector(".notifications");
    const items = Array.from(container.children);
    items.sort((a, b) => {
        const timeA = a.dataset.timestamp;
        const timeB = b.dataset.timestamp;
        return new Date(timeB) - new Date(timeA);
    });
    items.forEach(item => container.appendChild(item));
}

// Render notifications in the sidebar
function renderNotifications(notifications) {
    const container = document.querySelector(".notifications");
    container.innerHTML = "";

    notifications.forEach(notif => {
        const div = document.createElement("div");
        div.className = "notification";
        if (!notif.is_read) div.classList.add("unread");

        div.dataset.type = notif.type;
        div.dataset.read = notif.is_read ? "true" : "false";
        div.dataset.content = notif.message;
        div.dataset.id = notif.id;
        div.dataset.timestamp = notif.created_at;

        div.innerHTML = `
            <div class="notif-header">${notif.title}</div>
            <div class="timestamp">${formatTimestamp(notif.created_at)}</div>
        `;

        div.addEventListener("click", function () {
            showNotification(this);
        });

        container.appendChild(div);
    });
}
