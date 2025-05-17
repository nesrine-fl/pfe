// side barre

    // Fonction pour gérer l'affichage de la barre de navigation
function toggleNav() {
        document.getElementById("sidebar").classList.toggle("active"); // Ajouter ou supprimer la classe active
}


// Function to display a notification's content
function showNotification(element) {
    document.querySelector(".main-content").innerHTML = `<p>${element.innerText}</p>`;
    element.classList.remove("unread"); // Mark as read
    element.dataset.read = "true"; // Store read status in data attribute
}

// Function to filter only mentions
function filterMentions() {
    let notifications = document.querySelectorAll(".notification");
    notifications.forEach((notif) => {
        notif.style.display = notif.dataset.type === "mention" ? "block" : "none";
    });
}

// Function to filter only unread notifications
function filterUnread() {
    let notifications = document.querySelectorAll(".notification");
    notifications.forEach((notif) => {
        notif.style.display = notif.classList.contains("unread") ? "block" : "none";
    });
}

// Function to reset filter and show all notifications
function showAllNotifications() {
    document.querySelectorAll(".notification").forEach((notif) => {
        notif.style.display = "block";
    });
}

// Function to generate a timestamp in HH:MM format
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

    // Re-append sorted notifications
    notifications.forEach((notif) => notificationList.appendChild(notif));
}

// Initialize timestamps for unread notifications
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".notification.unread").forEach((notif) => {
        notif.querySelector(".timestamp").innerText = getTimestamp();
    });
    sortNotifications(); // Sort after adding timestamps
});


function showNotification(element) {
    let contentArea = document.querySelector(".main-content");
    let backButton = document.getElementById("backButton");
    let sidebar = document.querySelector(".sidebar1");

    // Modifier le contenu de la notification
    contentArea.innerHTML = `
        <span id="backButton" class="material-symbols-outlined" onclick="HideNotif()">arrow_back</span>
        <div class="notif">${element.dataset.content}</div>`;

    // Cacher la sidebar et afficher le contenu principal
    sidebar.classList.add("hidden");
    contentArea.classList.add("visible");
}

function HideNotif() {
    let contentArea = document.querySelector(".main-content");
    let sidebar = document.querySelector(".sidebar1");

    // Réinitialiser le texte
    contentArea.innerHTML = `<p>Sélectionnez une notification pour voir les détails.</p>`;

    // Réafficher la sidebar et cacher le contenu
    sidebar.classList.remove("hidden");
    contentArea.classList.remove("visible");
}
document.addEventListener("DOMContentLoaded", function () {
    fetchNotifications();
});

async function fetchNotifications() {
    try {
        const response = await fetch("https://backend-m6sm.onrender.com/notifications/");

        if (!response.ok) {
            throw new Error("Erreur de chargement des notifications");
        }

        const notifications = await response.json();
        renderNotifications(notifications);
        sortNotifications(); // Optional: sort after render
    } catch (error) {
        console.error(error);
        document.querySelector(".notifications").innerHTML = "<p>Erreur de chargement.</p>";
    }
}

function renderNotifications(notifications) {
    const container = document.querySelector(".notifications");
    container.innerHTML = ""; // Clear existing content

    notifications.forEach(notif => {
        const notifEl = document.createElement("div");
        notifEl.classList.add("notification");
        if (!notif.read) notifEl.classList.add("unread");

        notifEl.dataset.type = notif.type;
        notifEl.dataset.read = notif.read;
        notifEl.dataset.content = notif.content;

        notifEl.innerHTML = `
            <div class="message">${notif.message}</div>
            <div class="timestamp">${notif.timestamp}</div>
        `;

        notifEl.addEventListener("click", function () {
            showNotification(notifEl);
        });

        container.appendChild(notifEl);
    });
}

