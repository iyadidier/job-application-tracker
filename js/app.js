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

const exportApplicationsButton = document.getElementById(
    "export-applications-button"
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

const applicationSearchInput = document.getElementById(
    "application-search"
);

const statusFilterInput = document.getElementById("status-filter");

const sortApplicationsInput = document.getElementById(
    "sort-applications"
);

const applicationsResultsMessage = document.getElementById(
    "applications-results-message"
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
 * Load applications from browser storage.
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
 * Save applications in browser storage.
 */
function saveApplications() {
    localStorage.setItem(storageKey, JSON.stringify(applications));
}

/**
 * Create a unique ID for a new application.
 */
function createApplicationId() {
    if (
        typeof crypto !== "undefined"
        && typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
 * Display the application modal.
 */
function showApplicationModal() {
    applicationModal.hidden = false;
    document.body.classList.add("modal-open");
    companyNameInput.focus();
}

/**
 * Open a blank form for a new application.
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

    companyNameInput.value = applicationToEdit.companyName || "";
    positionTitleInput.value = applicationToEdit.positionTitle || "";
    jobLocationInput.value = applicationToEdit.location || "";
    applicationStatusInput.value = applicationToEdit.status || "";
    applicationDateInput.value = applicationToEdit.applicationDate || "";
    salaryInformationInput.value = applicationToEdit.salary || "";
    jobLinkInput.value = applicationToEdit.jobLink || "";
    interviewDateInput.value = applicationToEdit.interviewDate || "";
    followUpDateInput.value = applicationToEdit.followUpDate || "";
    applicationNotesInput.value = applicationToEdit.notes || "";

    showApplicationModal();
}

/**
 * Close the application modal.
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
 * Update dashboard statistics using all applications.
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
   Search, filtering, and sorting
--------------------------------- */

/**
 * Return applications matching the current search and status filter.
 */
function getFilteredApplications() {
    const searchTerm = applicationSearchInput.value
        .trim()
        .toLowerCase();

    const selectedStatus = statusFilterInput.value;

    return applications.filter(function (application) {
        const searchableInformation = [
            application.companyName,
            application.positionTitle,
            application.location,
            application.status,
            application.notes
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesSearch = searchableInformation.includes(
            searchTerm
        );

        const matchesStatus = selectedStatus === "All"
            || application.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });
}

/**
 * Sort a copied application array using the selected option.
 */
function sortApplicationResults(applicationResults) {
    const selectedSort = sortApplicationsInput.value;
    const sortedApplications = [...applicationResults];

    sortedApplications.sort(function (
        firstApplication,
        secondApplication
    ) {
        if (selectedSort === "oldest") {
            return (
                firstApplication.applicationDate || ""
            ).localeCompare(
                secondApplication.applicationDate || ""
            );
        }

        if (selectedSort === "company-ascending") {
            return (
                firstApplication.companyName || ""
            ).localeCompare(
                secondApplication.companyName || "",
                undefined,
                { sensitivity: "base" }
            );
        }

        if (selectedSort === "company-descending") {
            return (
                secondApplication.companyName || ""
            ).localeCompare(
                firstApplication.companyName || "",
                undefined,
                { sensitivity: "base" }
            );
        }

        if (selectedSort === "position-ascending") {
            return (
                firstApplication.positionTitle || ""
            ).localeCompare(
                secondApplication.positionTitle || "",
                undefined,
                { sensitivity: "base" }
            );
        }

        return (
            secondApplication.applicationDate || ""
        ).localeCompare(
            firstApplication.applicationDate || ""
        );
    });

    return sortedApplications;
}

/**
 * Return the filtered and sorted applications.
 */
function getVisibleApplications() {
    const filteredApplications = getFilteredApplications();

    return sortApplicationResults(filteredApplications);
}

/**
 * Update the text showing how many applications are visible.
 */
function updateResultsMessage(visibleCount) {
    if (applications.length === 0) {
        applicationsResultsMessage.textContent = "";
        return;
    }

    if (visibleCount === applications.length) {
        applicationsResultsMessage.textContent =
            `Showing all ${applications.length} applications.`;

        return;
    }

    applicationsResultsMessage.textContent =
        `Showing ${visibleCount} of ${applications.length} applications.`;
}

/* ---------------------------------
   CSV export
--------------------------------- */

/**
 * Prepare one value for use inside a CSV file.
 */
function escapeCsvValue(value) {
    const textValue = value === null || value === undefined
        ? ""
        : String(value);

    const escapedValue = textValue.replace(/"/g, '""');

    return `"${escapedValue}"`;
}

/**
 * Export all saved applications to a CSV file.
 */
function exportApplicationsToCsv() {
    if (applications.length === 0) {
        window.alert(
            "Add at least one job application before exporting."
        );

        return;
    }

    const headers = [
        "Company Name",
        "Position Title",
        "Location",
        "Status",
        "Application Date",
        "Salary Information",
        "Job Posting Link",
        "Interview Date",
        "Follow-Up Date",
        "Notes",
        "Created At",
        "Updated At"
    ];

    const rows = applications.map(function (application) {
        return [
            application.companyName,
            application.positionTitle,
            application.location,
            application.status,
            application.applicationDate,
            application.salary,
            application.jobLink,
            application.interviewDate,
            application.followUpDate,
            application.notes,
            application.createdAt,
            application.updatedAt
        ];
    });

    const csvRows = [headers, ...rows].map(function (row) {
        return row.map(escapeCsvValue).join(",");
    });

    const csvContent = csvRows.join("\r\n");

    const csvFile = new Blob(
        ["\uFEFF", csvContent],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const downloadUrl = URL.createObjectURL(csvFile);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download =
        `job-applications-${getTodayDate()}.csv`;

    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(downloadUrl);
}

exportApplicationsButton.addEventListener(
    "click",
    exportApplicationsToCsv
);

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
   Application cards
--------------------------------- */

/**
 * Create and return one application card.
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

    if (application.interviewDate) {
        const interviewDate = document.createElement("p");

        interviewDate.textContent = `Interview: ${formatDate(
            application.interviewDate
        )}`;

        details.append(interviewDate);
    }

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
 * Display applications using the current controls.
 */
function renderApplications() {
    applicationsList.innerHTML = "";

    const visibleApplications = getVisibleApplications();

    emptyApplicationsMessage.hidden = applications.length !== 0;

    exportApplicationsButton.disabled =
        applications.length === 0;

    visibleApplications.forEach(function (application) {
        const listItem = createApplicationListItem(application);
        applicationsList.append(listItem);
    });

    if (
        applications.length > 0
        && visibleApplications.length === 0
    ) {
        applicationsResultsMessage.textContent =
            "No applications match your current search or filter.";
    } else {
        updateResultsMessage(visibleApplications.length);
    }

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
            id: createApplicationId(),
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
   Control event listeners
--------------------------------- */

applicationSearchInput.addEventListener(
    "input",
    renderApplications
);

statusFilterInput.addEventListener(
    "change",
    renderApplications
);

sortApplicationsInput.addEventListener(
    "change",
    renderApplications
);

/* ---------------------------------
   Initial page display
--------------------------------- */

resetApplicationForm();
renderApplications();