const BACKEND_URL = "http://127.0.0.1:8000";

localStorage.setItem("access_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzZWxsYW1pYW1pbmVAZ21haWwuY29tIiwiZXhwIjoxNzQ3NDE5NzMwfQ.WiALtqhbXaEjf5wUVz4uQuCyQUvTY34m7v2qaECtPao");

async function fetchNotifications() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.error("Token d'accès manquant");
    return;
  }
  try {
    const response = await fetch(`${BACKEND_URL}/notifications/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }
    const notifications = await response.json();
    console.log("Notifications reçues :", notifications);
  } catch (err) {
    console.error("Erreur lors de la récupération des notifications :", err);
  }
}

// Appelle la fonction pour tester
fetchNotifications();


// 🔄 FETCH notifications
async function fetchNotifications(token) {
    try {
        const response = await fetch(`${BACKEND_URL}/notifications/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Échec de la récupération des notifications");
        }

        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications :", error);
        throw error;
    }
}

// ✅ MARK AS READ
async function markNotificationRead(notificationId) {
    const token = localStorage.getItem("access_token");

    try {
        const response = await fetch(`${BACKEND_URL}/notifications/${notificationId}/read`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Erreur lors du marquage :", error);
        throw error;
    }
}

// 📬 DISPLAY notifications
function displayNotifications(notifs) {
    const notificationList = document.querySelector(".notifications");
    notificationList.innerHTML = "";

    notifs.forEach(notif => {
        const div = document.createElement("div");
        div.classList.add("notification");
        if (!notif.read) div.classList.add("unread");

        div.dataset.type = notif.type;
        div.dataset.content = notif.content;
        div.dataset.id = notif.id;

        div.innerHTML = `
            <span class="message">${notif.title}</span>
            <span class="timestamp">${getTimestamp()}</span>
        `;

        div.addEventListener("click", async () => {
            showNotification(div);
            await markNotificationRead(notif.id);
            div.classList.remove("unread");
        });

        notificationList.appendChild(div);
    });
}

// ⏱ TIMESTAMP
function getTimestamp() {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
}

// 🧮 SORT notifications
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

// 🎛️ SIDEBAR toggle
function toggleNav() {
    document.getElementById("sidebar").classList.toggle("active");
}

// 🔎 SHOW notif content
function showNotification(element) {
    const contentArea = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar1");

    contentArea.innerHTML = `
        <span id="backButton" class="material-symbols-outlined" onclick="HideNotif()">arrow_back</span>
        <div class="notif">${element.dataset.content}</div>
    `;
    sidebar.classList.add("hidden");
    contentArea.classList.add("visible");
}

// 🔙 HIDE content
function HideNotif() {
    const contentArea = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar1");

    contentArea.innerHTML = `<p>Sélectionnez une notification pour voir les détails.</p>`;
    sidebar.classList.remove("hidden");
    contentArea.classList.remove("visible");
}

// 🧵 FILTERS
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
