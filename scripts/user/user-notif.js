// Toggle sidebar nav
function toggleNav() {
    document.getElementById("sidebar").classList.toggle("active");
}

// Generate timestamp (HH:MM)
function getTimestamp() {
    let now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
}

// Sort notifications by timestamp (latest first)
function sortNotifications() {
    let notificationList = document.querySelector(".notifications");
    let notifications = Array.from(notificationList.children);
    
    notifications.sort((a, b) => {
        let timeA = a.querySelector(".timestamp").innerText;
        let timeB = b.querySelector(".timestamp").innerText;
        return timeB.localeCompare(timeA);
    });

    notifications.forEach((notif) => notificationList.appendChild(notif));
}

// Show notification content in main area
function showNotification(element) {
    let contentArea = document.querySelector(".main-content");
    let sidebar = document.querySelector(".sidebar1");

    contentArea.innerHTML = `
        <span id="backButton" class="material-symbols-outlined" onclick="HideNotif()">arrow_back</span>
        <div class="notif">${element.dataset.content}</div>`;

    sidebar.classList.add("hidden");
    contentArea.classList.add("visible");

    element.classList.remove("unread"); // Mark as read visually
    element.dataset.read = "true";
}

// Hide notification content, show sidebar again
function HideNotif() {
    let contentArea = document.querySelector(".main-content");
    let sidebar = document.querySelector(".sidebar1");

    contentArea.innerHTML = `<p>Sélectionnez une notification pour voir les détails.</p>`;
    sidebar.classList.remove("hidden");
    contentArea.classList.remove("visible");
}

// Filter mentions only
function filterMentions() {
    let notifications = document.querySelectorAll(".notification");
    notifications.forEach(notif => {
        notif.style.display = notif.dataset.type === "mention" ? "block" : "none";
    });
}

// Filter unread only
function filterUnread() {
    let notifications = document.querySelectorAll(".notification");
    notifications.forEach(notif => {
        notif.style.display = notif.classList.contains("unread") ? "block" : "none";
    });
}

// Show all notifications (clear filter)
function showAllNotifications() {
    document.querySelectorAll(".notification").forEach(notif => {
        notif.style.display = "block";
    });
}

// Fetch notifications from backend API and render in sidebar
async function fetchNotifications() {
    try {
        const response = await fetch("https://your-api-url.com/api/notifications", {
            credentials: "include" // if your API requires cookies or authentication
        });
        if (!response.ok) throw new Error("Network response was not ok");
        
        const notifications = await response.json();

        const notificationList = document.querySelector(".notifications");
        notificationList.innerHTML = ""; // Clear existing notifications

        notifications.forEach(notif => {
            const notifElement = document.createElement("div");
            notifElement.classList.add("notification");
            if (!notif.read) notifElement.classList.add("unread");

            // Assuming your notification object has id, message, type, content, timestamp fields
            notifElement.dataset.id = notif.id;
            notifElement.dataset.type = notif.type || "general"; 
            notifElement.dataset.content = notif.content || notif.message;
            notifElement.dataset.read = notif.read ? "true" : "false";

            notifElement.innerHTML = `
                <p class="message">${notif.message}</p>
                <span class="timestamp">${notif.timestamp || getTimestamp()}</span>
            `;

            notifElement.onclick = () => showNotification(notifElement);

            notificationList.appendChild(notifElement);
        });

        sortNotifications();
    } catch (error) {
        console.error("Fetch error:", error);
        // Optional: show error message in UI
    }
}

// On page load
document.addEventListener("DOMContentLoaded", () => {
    fetchNotifications();

    // Initialize timestamps for any unread (if you still want this)
    document.querySelectorAll(".notification.unread").forEach(notif => {
        notif.querySelector(".timestamp").innerText = getTimestamp();
    });
    sortNotifications();
});
