// user-notif.js

document.addEventListener('DOMContentLoaded', () => {
  const notifDot = document.getElementById('notifDot');
  const notificationsList = document.querySelector('.notifications');
  const mainContent = document.querySelector('.main-content');
  const backButton = document.getElementById('backButton');
  const sidebar = document.getElementById('sidebar');


const API_URL = 'https://your-deployed-backend.com/api/notifications'; // if deployed


  // Fetch notifications from backend
  async function fetchNotifications() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      renderNotifications(data);
      updateNotifDot();
    } catch (error) {
      console.error('Fetch error:', error);
      notificationsList.innerHTML = '<li>Erreur lors du chargement des notifications.</li>';
    }
  }

  // Render notifications in sidebar list
  function renderNotifications(notifs) {
    notificationsList.innerHTML = ''; // Clear existing list

    if (!notifs.length) {
      notificationsList.innerHTML = '<li>Aucune notification</li>';
      return;
    }

    notifs.forEach(notif => {
      const li = document.createElement('li');
      li.classList.add('notification');
      if (!notif.read) li.classList.add('unread');
      if (notif.type) li.dataset.type = notif.type;
      li.dataset.content = notif.content || '';
      li.textContent = notif.title || 'Notification';

      const spanTimestamp = document.createElement('span');
      spanTimestamp.className = 'timestamp';
      spanTimestamp.textContent = notif.timestamp ? formatTimestamp(notif.timestamp) : '';
      li.appendChild(spanTimestamp);

      li.addEventListener('click', () => showNotification(li, notif));

      notificationsList.appendChild(li);
    });
  }

  // Format timestamp (shows time if today, else date)
  function formatTimestamp(ts) {
    const date = new Date(ts);
    const now = new Date();
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  }

  // Update notification dot visibility (show if any unread)
  function updateNotifDot() {
    const unreadCount = document.querySelectorAll('.notification.unread').length;
    notifDot.style.display = unreadCount > 0 ? 'block' : 'none';
  }

  // Show notification detail in main content area
  function showNotification(li, notifData) {
    // Mark notification as read visually
    li.classList.remove('unread');
    updateNotifDot();

    // Show back button and notification content
    backButton.style.display = 'inline-block';
    mainContent.innerHTML = `
      <h2>Détail de la notification</h2>
      <p>${notifData.content || li.dataset.content || li.textContent}</p>
      <p><small>${li.querySelector('.timestamp').textContent}</small></p>
    `;

    // Optionally, here you can add code to mark notification as read in backend via fetch/POST
  }

  // Hide notification detail and show welcome message
  window.HideNotif = function() {
    backButton.style.display = 'none';
    mainContent.innerHTML = `<p>Sélectionnez une notification pour afficher son contenu.</p>`;
  };

  // Toggle sidebar visibility
  window.toggleNav = function() {
    sidebar.style.display = sidebar.style.display === 'block' ? 'none' : 'block';
  };

  // Filter notifications by "mention"
  window.filterMentions = function() {
    filterNotifications('mention');
  };

  // Filter notifications by unread only
  window.filterUnread = function() {
    filterNotifications(null, true);
  };

  // Show all notifications
  window.showAllNotifications = function() {
    filterNotifications();
  };

  // Helper to filter notifications list items
  function filterNotifications(type = null, unreadOnly = false) {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notif => {
      let show = true;
      if (type && notif.dataset.type !== type) show = false;
      if (unreadOnly && !notif.classList.contains('unread')) show = false;
      notif.style.display = show ? 'block' : 'none';
    });
  }

  // Initial load
  fetchNotifications();
  HideNotif(); // Show welcome message on load
});
