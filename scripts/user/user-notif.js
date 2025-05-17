
    // Toggle sidebar visibility
    function toggleNav() {
        document.getElementById("sidebar").classList.toggle("active");
    }

    // Show full notification in main area
    function showNotification(element) {
        let contentArea = document.querySelector(".main-content");
        let sidebar = document.querySelector(".sidebar1");

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
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        // Update local display
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

    // Fetch and render notifications from backend
    document.addEventListener("DOMContentLoaded", async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            alert("Utilisateur non connecté.");
            return;
        }

        try {
            const response = await fetch("https://backend-m6sm.onrender.com/notifications/", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Erreur de chargement des notifications");

            const notifications = await response.json();
            renderNotifications(notifications);
            sortNotifications();
        } catch (error) {
            console.error(error);
            document.querySelector(".notifications").innerHTML = "<p>Erreur de chargement.</p>";
        }
    });

    function getTimestamp() {
        const now = new Date();
        return `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
    }

    function sortNotifications() {
        const container = document.querySelector(".notifications");
        const items = Array.from(container.children);
        items.sort((a, b) => {
            const timeA = a.querySelector(".timestamp").innerText;
            const timeB = b.querySelector(".timestamp").innerText;
            return timeB.localeCompare(timeA);
        });
        items.forEach(item => container.appendChild(item));
    }

    function renderNotifications(notifications) {
        const container = document.querySelector(".notifications");
        container.innerHTML = "";

        notifications.forEach(notif => {
            const div = document.createElement("div");
            div.className = "notification";
            if (!notif.read) div.classList.add("unread");

            div.dataset.type = notif.type;
            div.dataset.read = notif.read;
            div.dataset.content = notif.content;
            div.dataset.id = notif.id;

            div.innerHTML = `
                <div class="notif-header">${notif.title}</div>
                <div class="timestamp">${getTimestamp()}</div>
            `;

            div.addEventListener("click", function () {
                showNotification(this);
            });

            container.appendChild(div);
        });
    }
</script>
