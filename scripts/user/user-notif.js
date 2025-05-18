// Toggle sidebar
function toggleNav() {
    document.getElementById("sidebar").classList.toggle("active");
}

// Load notifications from backend
async function loadNotifications() {
    try {
        const response = await fetch("http://localhost:8000/notifications");
        const data = await response.json();

        const list = document.querySelector(".notifications");
        list.innerHTML = ""; // Clear old notifications

        data.forEach((notif) => {
            const notifElement = document.createElement("div");
            notifElement.className = `notification ${notif.read ? "" : "unread"}`;
            notifElement.dataset.type = notif.type;
            notifElement.dataset.read = notif.read;
            notifElement.dataset.content = notif.content;
            notifElement.dataset.timestamp = notif.timestamp;

            notifElement.innerHTML = `
                <p>${notif.content}</p>
                <span class="timestamp">${formatTimestamp(notif.timestamp)}</span>
            `;

            notifElement.addEventListener("click", () => showNotification(notifElement));
            list.appendChild(notifElement);
        });

        sortNotifications();
    } catch (error) {
        console.error("Error loading notifications:", error);
    }
}

// Show notification content
function showNotification(element) {
    let contentArea = document.querySelector(".main-content");
    let sidebar = document.querySelector(".sidebar1");

    contentArea.innerHTML = `
        <span id="backButton" class="material-symbols-outlined" onclick="HideNotif()">arrow_back</span>
        <div class="notif">${element.dataset.content}</div>
    `;

    sidebar.classList.add("hidden");
    contentArea.classList.add("visible");

    // Mark as read visually
    element.classList.remove("unread");
    element.dataset.read = "true";
}

// Hide detailed notification view
function HideNotif() {
    let contentArea = document.querySelector(".main-content");
    let sidebar = document.querySelector(".sidebar1");

    contentArea.innerHTML = `<p>Sélectionnez une notification pour voir les détails.</p>`;
    sidebar.classList.remove("hidden");
    contentArea.classList.remove("visible");
}

// Filtering functions
function filterMentions() {
    document.querySelectorAll(".notification").forEach((n) => {
        n.style.display = n.dataset.type === "mention" ? "block" : "none";
    });
}

function filterUnread() {
    document.querySelectorAll(".notification").forEach((n) => {
        n.style.display = n.dataset.read === "false" ? "block" : "none";
    });
}

function showAllNotifications() {
    document.querySelectorAll(".notification").forEach((n) => {
        n.style.display = "block";
    });
}

// Format timestamp to HH:MM or readable format
function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
}

// Sort notifications by timestamp descending
function sortNotifications() {
    let list = document.querySelector(".notifications");
    let items = Array.from(list.children);

    items.sort((a, b) => {
        return new Date(b.dataset.timestamp) - new Date(a.dataset.timestamp);
    });

    items.forEach((item) => list.appendChild(item));
}

// Load notifications on DOM load
document.addEventListener("DOMContentLoaded", () => {
    loadNotifications();
});
