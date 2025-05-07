document.addEventListener("DOMContentLoaded", function () {
    // Simuler les données utilisateur (remplacer par la récupération réelle des données)
    const userData = {
        role: "Employer", // Exemple: 'Employer', 'Stagiaire', 'Manager'
        department: "IT", // Exemple: 'IT', 'RH', 'Finance'
        // Ajoutez d'autres données utilisateur si nécessaire
    };

    // Sélectionner les éléments du profil dans la barre latérale
    const profileRoleElement = document.querySelector(".profile-side-bar h4.profile-sidebar-text");
    const profileDepartmentElement = document.querySelector(".profile-side-bar p.profile-sidebar-text");

    // Mettre à jour les éléments avec les données utilisateur
    if (profileRoleElement) {
        profileRoleElement.textContent = userData.role;
    }
    if (profileDepartmentElement) {
        profileDepartmentElement.textContent = userData.department;
    }

    // Sélection des éléments nécessaires
   
});



const searchInput = document.querySelector(".search-wrapper .input");
const courses = document.querySelectorAll(".course-card");
const domainFilters = document.querySelectorAll(".radio-inputs input");


// Fonction de filtrage
function filterCourses() {
    const searchValue = searchInput?.value.toLowerCase().trim() || "";
    const selectedDomain = document.querySelector(".radio-inputs input:checked")?.nextElementSibling.textContent.trim() || "Tous";

    courses.forEach(course => {
        const courseCategory = course.querySelector(".department")?.textContent.trim() || "";
        const courseText = course.textContent.toLowerCase();
        const matchesSearch = courseText.includes(searchValue);
        const matchesDomain = (selectedDomain === "Tous" || courseCategory === selectedDomain);

        course.style.display = (matchesSearch && matchesDomain) ? "block" : "none";
    });
}

// Événements de recherche et de sélection
if (searchInput) searchInput.addEventListener("input", filterCourses);
domainFilters.forEach(filter => filter.addEventListener("change", filterCourses));

// Appliquer le filtre au chargement
filterCourses();
 // Nav barre
function toggleNav() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}
















document.addEventListener("DOMContentLoaded", function () {
    // Sélection des éléments nécessaires
    const searchInput = document.querySelector(".search-wrapper input");
    const courses = document.querySelectorAll(".course-card");
    const domainFilters = document.querySelectorAll(".category-filter input");

    // Fonction pour filtrer les cours en fonction de la recherche et du domaine
    function filterCourses() {
        const searchValue = searchInput.value.toLowerCase().trim(); // Récupérer la valeur de recherche
        const selectedDomain = document.querySelector(".category-filter input:checked").value; // Récupérer le domaine sélectionné

        courses.forEach(course => {
            const courseCategory = course.getAttribute("data-category"); // Obtenir la catégorie du cours
            const courseText = course.textContent.toLowerCase(); // Convertir le texte du cours en minuscules
            const matchesSearch = courseText.includes(searchValue); // Vérifier si le texte correspond à la recherche
            const matchesDomain = (selectedDomain === "All" || courseCategory === selectedDomain); // Vérifier si la catégorie correspond

            course.style.display = (matchesSearch && matchesDomain) ? "block" : "none"; // Afficher ou masquer les cours
        });
    }

    // Ajouter les événements pour déclencher le filtrage
    searchInput.addEventListener("input", filterCourses);
    domainFilters.forEach(filter => filter.addEventListener("change", filterCourses));

    // Appliquer le filtre au chargement de la page
    filterCourses();
    
});


document.addEventListener("DOMContentLoaded", function () {
    const courses = document.querySelectorAll(".course-card");

    courses.forEach(course => {
        course.addEventListener("click", function () {
            const courseData = {
                title: this.getAttribute("data-title"),
                description: this.getAttribute("data-description"),
                teacher: this.getAttribute("data-teacher"),
                department: this.getAttribute("data-department"),
                mainContent: this.getAttribute("data-main-content"),
                type: this.getAttribute("data-type")
            };

            // Save course data in localStorage
            localStorage.setItem("selectedCourse", JSON.stringify(courseData));

            // Redirect to the course details page
            window.location.href = "../../pages/user/course.html";
        });
    });
});









document.addEventListener("DOMContentLoaded", function () {
    const profileLink = document.getElementById("profile-link");
    const sidebar = document.getElementById("sidebar2");
    const closeSidebar = document.getElementById("close-sidebar2");
    const overlay = document.getElementById("overlay");

    // Open Sidebar
    profileLink.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default link behavior
        sidebar.classList.add("show");
        sidebar.classList.remove("hide");
        overlay.classList.add("show");
    });

    // Close Sidebar
    function closeMenu() {
        sidebar.classList.add("hide"); // Move it out completely
        sidebar.classList.remove("show");
        overlay.classList.remove("show");
    }

    closeSidebar.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);
});

// Calendar elements
const daysTag2 = document.querySelector(".days2"),
currentDate2 = document.querySelector(".current-date2"),
prevNextIcon2 = document.querySelectorAll(".icons2 span");

// Getting new date, current year and month
let date = new Date(),
currYear = date.getFullYear(),
currMonth = date.getMonth();

// Storing full name of all months in array
const months = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"];

// Storing full name of all months in French array
const mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet",
            "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

// Course schedule data - this should be loaded dynamically in a real application
// Key format: "YYYY-M" where M is the 0-indexed month number
const courseSchedule = {
    "2025-2": [ // March 2025 (Month is 0-indexed)
        {
            day: 3,
            id: 1,
            title: "Droit du travail et relations professionnelles ",
            trainer: "Amani Amel",
            time: "09:00-10:00",
            type: "online",
            image: "logiciel-rh.webp", // Added image property
            meetingLink: "https://meet.google.com/abc-defg-hij" // Meeting link for this course
        },
         {
            day: 22,
            id: 2,
            title: "Recrutement et sélection des talents",
            trainer: "Hamadi Ali",
            time: "14:00-15:00",
            type: "in-person",
            image: "rh2.jpg", // Added image property
            meetingLink: "https://teams.microsoft.com/meeting/123456" // Meeting link for this course
        }
    ],
    "2025-3": [ // April 2025
         {
            day: 10,
            id: 3,
            title: "Gestion de Projet Agile",
            trainer: "Leila Khaled",
            time: "11:00-12:30",
            type: "online",
            image: "agile.jpg", // Example image
            meetingLink: "https://zoom.us/j/123456789" // Meeting link for this course
        }
    ]
    // Add more months and courses as needed
};

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(), // getting first day of month
    lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), // getting last date of month
    lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), // getting last day of month
    lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month
    let liTag = "";

    // Creating li of previous month last days
    for (let i = firstDayofMonth; i > 0; i--) {
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    // Get courses for the current month and year
    const currentMonthKey = `${currYear}-${currMonth}`;
    const coursesThisMonth = courseSchedule[currentMonthKey] || [];

    // Creating li of all days of current month
    for (let i = 1; i <= lastDateofMonth; i++) {
        // Adding active class to li if the current day, month, and year matched
        let isToday = i === date.getDate() && currMonth === new Date().getMonth()
                     && currYear === new Date().getFullYear() ? "active" : "";

        // Check if this day has any courses for the current year and month
        let isCourseDay = coursesThisMonth.some(course => course.day === i) ? "cours" : "";
        liTag += `<li class="${isToday} ${isCourseDay}">${i}</li>`;
    }

    // Creating li of next month first days
    for (let i = lastDayofMonth; i < 6; i++) {
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`
    }

    // Updating the HTML
    currentDate2.innerText = `${mois[currMonth]} ${currYear}`; // Use French month name
    daysTag2.innerHTML = liTag;

    // Remove selection from previously selected day if any - needed if renderCalendar is called elsewhere
    const currentlySelected = daysTag2.querySelector("li.selected-day");
    if (currentlySelected) {
        currentlySelected.classList.remove("selected-day");
    }

    // Update the courses shown in the sidebar (will show all for the month initially)
    updateSidebarCourses();
}

// Function to update the courses shown in the sidebar
function updateSidebarCourses() {
    const sidebarCoursesContainer = document.querySelector(".sidebar2");
    const existingCourses = sidebarCoursesContainer.querySelectorAll(".cours-sidebar");

    // Remove existing course elements
    existingCourses.forEach(course => course.remove());

    // Get courses for the current month and year
    const currentMonthKey = `${currYear}-${currMonth}`;
    const coursesForMonth = courseSchedule[currentMonthKey] || [];

    // Check if a specific day is selected
    const selectedDayElement = daysTag2.querySelector("li.selected-day");
    let coursesToDisplay = [];

    if (selectedDayElement) {
        const selectedDay = parseInt(selectedDayElement.innerText);
        // Filter courses for the selected day
        coursesToDisplay = coursesForMonth.filter(course => course.day === selectedDay);
    } else {
        // No specific day selected, show all courses for the month
        coursesToDisplay = coursesForMonth;
    }

    // Sort courses by day (or time if filtering by day later)
    coursesToDisplay.sort((a, b) => a.day - b.day); // Keep sorting by day for now

    // Add courses to sidebar after the calendar
    coursesToDisplay.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.className = 'cours-sidebar';
        courseElement.innerHTML = `
            <img src="../../assets/images/${course.image}" class="rh-commun">
            <div class="infooo">
                <p class="date-cour2">${course.day} ${mois[currMonth]} ${currYear}</p> <!-- Use French month -->
                <p class="nom-cour">${course.title}</p>
            </div>
        `;
        
        // Add click event to show course details popup
        courseElement.addEventListener('click', () => {
            showCourseDetailsPopup(course);
        });
        
        // Append the course element directly to the sidebar container.
        // Since coursesToDisplay is sorted, they will appear in the correct order after existing elements (profile, calendar).
        sidebarCoursesContainer.appendChild(courseElement);
    });
}

// Function to create and show course details popup
function showCourseDetailsPopup(course) {
    // Create popup container
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    
    // Populate popup with course details
    popupContent.innerHTML = `
        <div class="popup-header">
            <h3>${course.title}</h3>
            <span class="popup-close">&times;</span>
        </div>
        <div class="popup-body">
            <div class="popup-info">
                <p><strong>Date:</strong> ${course.day} ${mois[currMonth]} ${currYear}</p>
                <p><strong>Heure:</strong> ${course.time}</p>
                <p><strong>Formateur:</strong> ${course.trainer}</p>
                <p><strong>Type:</strong> ${course.type === 'online' ? 'En ligne' : 'Présentiel'}</p>
            </div>
            <div class="popup-image">
                <img src="../../assets/images/${course.image}" alt="${course.title}">
            </div>
        </div>
        <div class="popup-footer">
            <a href="${course.meetingLink}" target="_blank" class="join-button">Rejoindre</a>
        </div>
    `;
    
    // Add popup to page
    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);
    
    // Prevent closing when clicking on the popup content
    popupContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Close popup when clicking on close button
    const closeButton = popupContent.querySelector('.popup-close');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(popupOverlay);
    });
    
    // Close popup when clicking outside
    popupOverlay.addEventListener('click', () => {
        document.body.removeChild(popupOverlay);
    });
    
    // No need for separate join button click handler, it's now an <a> tag
}

// Add CSS styles for the popup to the page
function addPopupStyles() {
    // Check if styles already exist
    if (!document.getElementById('popup-styles')) {
        const style = document.createElement('style');
        style.id = 'popup-styles';
        style.textContent = `
            /* Popup styles */
            .popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .popup-content {
                background-color: white;
                border-radius: 10px;
                width: 80%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            
            .popup-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #eee;
            }
            
            .popup-header h3 {
                margin: 0;
                color: #333;
            }
            
            .popup-close {
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                color: #999;
            }
            
            .popup-close:hover {
                color: #333;
            }
            
            .popup-body {
                padding: 20px;
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
            }
            
            .popup-info {
                flex: 1;
                min-width: 200px;
                color: black;
            }
            
            .popup-image {
                flex: 1;
                min-width: 200px;
                display: flex;
                justify-content: center;
            }
            
            .popup-image img {
                max-width: 100%;
                max-height: 150px;
                object-fit: contain;
            }
            
            .popup-footer {
                padding: 15px 20px;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: flex-end;
            }
            
            

                .join-button  {  padding: 6px 12px;
        border-radius: 15px;
        font-weight: 500;
        display: inline-block;
        margin-right: 10px;
        cursor: pointer;
        border: none;
        font-size: 18px;
        text-decoration: none;
    }

                        .join-button {
                background-color: #DBEAFE;
                color: #1E40AF;
                box-shadow: 0 2px 6px rgba(30, 64, 175, 0.3);
                }
                .join-button:hover {
                box-shadow: 0 4px 12px rgba(30, 64, 175, 0.4); /* Darker blue shadow */
                transform: translateY(-1px);
                transition: all 0.2s ease;
                }

            
            /* Make courses in sidebar look clickable */
            .cours-sidebar {
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .cours-sidebar:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
            }

            /* Add scrolling to sidebar2 */
            .sidebar2 {
                max-height: 100vh;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: #888 #f1f1f1;
            }

            /* Webkit scrollbar styling */
            .sidebar2::-webkit-scrollbar {
                width: 5px;
            }

            .sidebar2::-webkit-scrollbar-track {
                background: #f1f1f1;
            }

            .sidebar2::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 5px;
            }

            .sidebar2::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
                 .days2 li.selected-day {
                // background-color: #e0e0e0 !important; /* Slightly darker gray, force override */
                color: #000 !important; /* Set text color to black for contrast */
                outline: 1px solid #bbb; /* Use outline to prevent movement */
                border-radius: 50%;
            }
        `;
        document.head.appendChild(style);
    }
}

// Add the popup styles when the page loads
document.addEventListener('DOMContentLoaded', () => {
    addPopupStyles();
    renderCalendar();
});

// Add event listeners for the calendar navigation
prevNextIcon2.forEach(icon => {
    icon.addEventListener("click", () => {
        // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

        if(currMonth < 0 || currMonth > 11) { // if current month is less than 0 or greater than 11
            // creating a new date of current year & month and pass it as date value
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear(); // updating current year with new date year
            currMonth = date.getMonth(); // updating current month with new date month
        } else {
            date = new Date(); // pass the current date as date value // This seems wrong, should maybe be new Date(currYear, currMonth)
        }
        // We don't need to remove selected-day here, renderCalendar() handles it now.
        renderCalendar(); // calling renderCalendar function
    });
});

// Add event listener for clicking on days using event delegation
daysTag2.addEventListener('click', (event) => {
    const clickedLi = event.target;

    // Check if the click was on a valid day (LI element, not inactive)
    if (clickedLi.tagName === 'LI' && !clickedLi.classList.contains('inactive')) {
        // Remove selected class from previously selected day
        const previouslySelected = daysTag2.querySelector("li.selected-day");
        if (previouslySelected) {
            previouslySelected.classList.remove("selected-day");
        }

        // Add selected class to the clicked day
        clickedLi.classList.add("selected-day");

        // Update the sidebar courses to show only for the selected day
        updateSidebarCourses();
    }
     // Optional: handle clicks outside valid days - e.g., remove selection
     // else if (clickedLi.tagName !== 'LI') { // Clicked on the UL gap?
     //    const previouslySelected = daysTag2.querySelector("li.selected-day");
     //    if (previouslySelected) {
     //       previouslySelected.classList.remove("selected-day");
     //       updateSidebarCourses(); // Update to show all month's courses
     //    }
     //}
});

// Initialize calendar when page loads
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    // Note: The day click listener is added outside DOMContentLoaded,
    // ensure daysTag2 is available globally or move listener addition inside.
    // Since daysTag2 is defined globally, this should be fine.
});

/* 
Suggestion: Add CSS for the selected day in your stylesheet (e.g., user-dashboard.css)
.days2 li.selected-day {
    background-color: #f0f0f0; // Or your preferred highlight color
    border: 1px solid #ccc;
    border-radius: 50%; 
}
*/
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.course-card').forEach(card => {
      card.addEventListener('click', function () {
        // Build the course object based on the card's content or data attributes
        const courseObj = {
          domain: this.querySelector('.department')?.textContent || 'IT',
          image: this.querySelector('img')?.getAttribute('src') || '',
          title: this.querySelector('h3')?.textContent || '',
          teacher: this.querySelector('p')?.textContent.replace('By ', '') || '',
          description: 'Description à compléter...', // You may want to add a data-description attribute
          field: this.querySelector('.department')?.textContent || '',
          resources: {
            record: null,
            pptx: null,
            pdf: null,
            extraLinks: [],
            quiz: null
          }
        };
        localStorage.setItem('selectedCourse', JSON.stringify(courseObj));
        window.location.href = 'course.html';
      });
    });
});

// Function to handle clicking outside of sidebar1
document.addEventListener('click', function(event) {
    const sidebar1 = document.getElementById('sidebar');
    const menuIcon = document.querySelector('.menuicon');
    
    // Check if click is outside sidebar1 and not on the menu icon
    if (sidebar1 && !sidebar1.contains(event.target) && 
        menuIcon && !menuIcon.contains(event.target) && 
        sidebar1.classList.contains('active')) {
        
        // Close sidebar1
        sidebar1.classList.remove('active');
    }
});