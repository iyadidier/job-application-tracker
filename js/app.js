"use strict";

/* ---------------------------------
   Page elements
--------------------------------- */

const applicationModal = document.getElementById("application-modal");
const applicationForm = document.getElementById("application-form");
const applicationFormTitle = document.getElementById(
    "application-form-title"
);

const openApplicationFormButton = document.getElementById(
    "open-application-form"
);

const closeApplicationFormButton = document.getElementById(
    "close-application-form"
);

const cancelApplicationFormButton = document.getElementById(
    "cancel-application-form"
);

const submitApplicationButton = applicationForm.querySelector(
    'button[type="submit"]'
);

const companyNameInput = document.getElementById("company-name");
const positionTitleInput = document.getElementById("position-title");
const jobLocationInput = document.getElementById("job-location");
const applicationStatusInput = document.getElementById(
    "application-status"
);
const applicationDateInput = document.getElementById(
    "application-date"
);
const salaryInformationInput = document.getElementById(
    "salary-information"
);
const jobLinkInput = document.getElementById("job-link");
const interviewDateInput = document.getElementById("interview-date");
const followUpDateInput = document.getElementById("follow-up-date");
const applicationNotesInput = document.getElementById(
    "application-notes"
);

const applicationsList = document.getElementById("applications-list");

const emptyApplicationsMessage = document.getElementById(
    "empty-applications-message"
);

const totalApplicationsCount = document.getElementById(
    "total-applications-count"
);

const interviewsCount = document.getElementById("interviews-count");
const offersCount = document.getElementById("offers-count");
const responseRateCount = document.getElementById(
    "response-rate-count"
);

/* ---------------------------------
   Application storage
--------------------------------- */

const storageKey = "jobTrackApplications";

let applications = loadApplications();
let editingApplicationId = null;

/**
 * Load saved applications from browser storage.
 */
function loadApplications() {
    const savedApplications = localStorage.getItem(storageKey);

    if (!savedApplications) {
        return [];
    }

    try {
        const parsedApplications = JSON.parse(savedApplications);

        return Array.isArray(parsedApplications)
            ? parsedApplications
            : [];
    } catch (error) {
        console.error("Could not load saved applications:", error);

        return [];
    }
}

/**
 * Save the current applications array in browser storage.
 */
function saveApplications() {
    localStorage.setItem(storageKey, JSON.stringify(applications));
}

/* ---------------------------------
   Date helpers
--------------------------------- */

/**
 * Return today's date in YYYY-MM-DD format.
 */
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/**
 * Convert YYYY-MM-DD into a readable date.
 */
function formatDate(dateValue) {
    if (!dateValue) {
        return "Not provided";
    }

    const date = new Date(`${dateValue}T00:00:00`);

    return date.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

/* ---------------------------------
   Form and modal controls
--------------------------------- */

/**
 * Reset the form to Add Application mode.
 */
function resetApplicationForm() {
    applicationForm.reset();

    editingApplicationId = null;
    applicationFormTitle.textContent = "Add a New Application";
    submitApplicationButton.textContent = "Save Application";
    applicationDateInput.value = getTodayDate();
}

/**
 * Display the modal.
 */
function showApplicationModal() {
    applicationModal.hidden = false;
    document.body.classList.add("modal-open");
    companyNameInput.focus();
}

/**
 * Open an empty form for a new application.
 */
function openNewApplicationForm() {
    resetApplicationForm();
    showApplicationModal();
}

/**
 * Open the form with an existing application's information.
 */
function openEditApplicationForm(applicationId) {
    const applicationToEdit = applications.find(
        function (application) {
            return application.id === applicationId;
        }
    );

    if (!applicationToEdit) {
        return;
    }

    editingApplicationId = applicationId;

    applicationFormTitle.textContent = "Edit Application";
    submitApplicationButton.textContent = "Update Application";

    companyNameInput.value = applicationToEdit.companyName;
    positionTitleInput.value = applicationToEdit.positionTitle;
    jobLocationInput.value = applicationToEdit.location;
    applicationStatusInput.value = applicationToEdit.status;
    applicationDateInput.value = applicationToEdit.applicationDate;
    salaryInformationInput.value = applicationToEdit.salary;
    jobLinkInput.value = applicationToEdit.jobLink;
    interviewDateInput.value = applicationToEdit.interviewDate;
    followUpDateInput.value = applicationToEdit.followUpDate;
    applicationNotesInput.value = applicationToEdit.notes;

    showApplicationModal();
}

/**
 * Close the application form.
 */
function closeApplicationForm() {
    applicationModal.hidden = true;
    document.body.classList.remove("modal-open");

    resetApplicationForm();
    openApplicationFormButton.focus();
}

openApplicationFormButton.addEventListener(
    "click",
    openNewApplicationForm
);

closeApplicationFormButton.addEventListener(
    "click",
    closeApplicationForm
);

cancelApplicationFormButton.addEventListener(
    "click",
    closeApplicationForm
);

applicationModal.addEventListener("click", function (event) {
    if (event.target === applicationModal) {
        closeApplicationForm();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !applicationModal.hidden) {
        closeApplicationForm();
    }
});

/* ---------------------------------
   Dashboard statistics
--------------------------------- */

/**
 * Update the dashboard using the saved applications.
 */
function updateDashboard() {
    const totalApplications = applications.length;

    const interviewApplications = applications.filter(
        function (application) {
            return application.status === "Interview";
        }
    ).length;

    const offerApplications = applications.filter(
        function (application) {
            return application.status === "Offer";
        }
    ).length;

    const responseStatuses = [
        "Assessment",
        "Interview",
        "Offer",
        "Rejected"
    ];

    const applicationsWithResponses = applications.filter(
        function (application) {
            return responseStatuses.includes(application.status);
        }
    ).length;

    const responseRate = totalApplications === 0
        ? 0
        : Math.round(
            (applicationsWithResponses / totalApplications) * 100
        );

    totalApplicationsCount.textContent = totalApplications;
    interviewsCount.textContent = interviewApplications;
    offersCount.textContent = offerApplications;
    responseRateCount.textContent = `${responseRate}%`;
}

/* ---------------------------------
   Delete functionality
--------------------------------- */

/**
 * Delete an application after confirmation.
 */
function deleteApplication(applicationId) {
    const applicationToDelete = applications.find(
        function (application) {
            return application.id === applicationId;
        }
    );

    if (!applicationToDelete) {
        return;
    }

    const confirmed = window.confirm(
        `Delete the ${applicationToDelete.positionTitle} application at ${applicationToDelete.companyName}?`
    );

    if (!confirmed) {
        return;
    }

    applications = applications.filter(
        function (application) {
            return application.id !== applicationId;
        }
    );

    saveApplications();
    renderApplications();
}

/* ---------------------------------
   Application list
--------------------------------- */

/**
 * Create and return one application list item.
 */
function createApplicationListItem(application) {
    const listItem = document.createElement("li");

    const heading = document.createElement("div");
    const titleGroup = document.createElement("div");

    const positionTitle = document.createElement("h3");
    positionTitle.textContent = application.positionTitle;

    const companyName = document.createElement("p");
    companyName.textContent = application.companyName;

    const status = document.createElement("span");
    status.textContent = application.status;

    titleGroup.append(positionTitle, companyName);
    heading.append(titleGroup, status);

    const details = document.createElement("div");

    const location = document.createElement("p");
    location.textContent = `Location: ${
        application.location || "Not provided"
    }`;

    const applicationDate = document.createElement("p");
    applicationDate.textContent = `Applied: ${formatDate(
        application.applicationDate
    )}`;

    const salary = document.createElement("p");
    salary.textContent = `Salary: ${
        application.salary || "Not provided"
    }`;

    const followUpDate = document.createElement("p");
    followUpDate.textContent = `Follow-up: ${formatDate(
        application.followUpDate
    )}`;

    details.append(
        location,
        applicationDate,
        salary,
        followUpDate
    );

    if (application.jobLink) {
        const jobLink = document.createElement("a");

        jobLink.href = application.jobLink;
        jobLink.target = "_blank";
        jobLink.rel = "noopener noreferrer";
        jobLink.textContent = "View job posting";

        details.append(jobLink);
    }

    if (application.notes) {
        const notes = document.createElement("p");
        notes.textContent = `Notes: ${application.notes}`;

        details.append(notes);
    }

    const actions = document.createElement("div");
    actions.classList.add("application-actions");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("edit-application-button");
    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {
        openEditApplicationForm(application.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("delete-application-button");
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {
        deleteApplication(application.id);
    });

    actions.append(editButton, deleteButton);
    listItem.append(heading, details, actions);

    return listItem;
}

/**
 * Display all saved applications.
 */
function renderApplications() {
    applicationsList.innerHTML = "";

    emptyApplicationsMessage.hidden = applications.length !== 0;

    applications.forEach(function (application) {
        const listItem = createApplicationListItem(application);
        applicationsList.append(listItem);
    });

    updateDashboard();
}

/* ---------------------------------
   Form submission
--------------------------------- */

applicationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(applicationForm);

    const applicationInformation = {
        companyName: formData.get("companyName").trim(),
        positionTitle: formData.get("positionTitle").trim(),
        location: formData.get("jobLocation").trim(),
        status: formData.get("applicationStatus"),
        applicationDate: formData.get("applicationDate"),
        salary: formData.get("salaryInformation").trim(),
        jobLink: formData.get("jobLink").trim(),
        interviewDate: formData.get("interviewDate"),
        followUpDate: formData.get("followUpDate"),
        notes: formData.get("applicationNotes").trim()
    };

    if (editingApplicationId) {
        applications = applications.map(function (application) {
            if (application.id !== editingApplicationId) {
                return application;
            }

            return {
                ...application,
                ...applicationInformation,
                updatedAt: new Date().toISOString()
            };
        });
    } else {
        const newApplication = {
            id: crypto.randomUUID(),
            ...applicationInformation,
            createdAt: new Date().toISOString(),
            updatedAt: null
        };

        applications.unshift(newApplication);
    }

    saveApplications();
    renderApplications();
    closeApplicationForm();
});

/* ---------------------------------
   Initial page display
--------------------------------- */

resetApplicationForm();
renderApplications();