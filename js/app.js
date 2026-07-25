"use strict";

/* ---------------------------------
   Supabase client and helpers
--------------------------------- */

const supabaseClient = window.supabaseClient;

function getElement(id) {
    const element = document.getElementById(id);

    if (!element) {
        throw new Error(`Missing required element: #${id}`);
    }

    return element;
}

/* ---------------------------------
   Authentication elements
--------------------------------- */

const guestNavigation = getElement("guest-navigation");
const userNavigation = getElement("user-navigation");
const guestHero = getElement("guest-hero");
const signedInUserEmail = getElement("signed-in-user-email");
const openSignInButton = getElement("open-sign-in-button");
const openCreateAccountButton = getElement(
    "open-create-account-button"
);
const signOutButton = getElement("sign-out-button");
const forgotPasswordButton = getElement(
    "forgot-password-button"
);

const authenticationModal = getElement("authentication-modal");
const authenticationTitle = getElement("authentication-title");
const authenticationDescription = getElement(
    "authentication-description"
);
const closeAuthenticationButton = getElement(
    "close-authentication-button"
);
const authenticationForm = getElement("authentication-form");
const authenticationEmailInput = getElement(
    "authentication-email"
);
const authenticationPasswordInput = getElement(
    "authentication-password"
);
const confirmPasswordField = getElement(
    "confirm-password-field"
);
const authenticationConfirmPasswordInput = getElement(
    "authentication-confirm-password"
);
const authenticationMessage = getElement("authentication-message");
const authenticationSubmitButton = getElement(
    "authentication-submit-button"
);
const authenticationSwitchText = getElement(
    "authentication-switch-text"
);
const switchAuthenticationModeButton = getElement(
    "switch-authentication-mode"
);

/* ---------------------------------
   Application elements
--------------------------------- */

const applicationModal = getElement("application-modal");
const applicationForm = getElement("application-form");
const applicationFormTitle = getElement(
    "application-form-title"
);
const openApplicationFormButton = getElement(
    "open-application-form"
);
const exportApplicationsButton = getElement(
    "export-applications-button"
);
const closeApplicationFormButton = getElement(
    "close-application-form"
);
const cancelApplicationFormButton = getElement(
    "cancel-application-form"
);
const submitApplicationButton = applicationForm.querySelector(
    'button[type="submit"]'
);

if (!submitApplicationButton) {
    throw new Error("The application submit button is missing.");
}

const companyNameInput = getElement("company-name");
const positionTitleInput = getElement("position-title");
const jobLocationInput = getElement("job-location");
const applicationStatusInput = getElement("application-status");
const applicationDateInput = getElement("application-date");
const salaryInformationInput = getElement("salary-information");
const jobLinkInput = getElement("job-link");
const interviewDateInput = getElement("interview-date");
const followUpDateInput = getElement("follow-up-date");
const applicationNotesInput = getElement("application-notes");

const applicationSearchInput = getElement("application-search");
const statusFilterInput = getElement("status-filter");
const sortApplicationsInput = getElement("sort-applications");
const applicationsResultsMessage = getElement(
    "applications-results-message"
);
const applicationsList = getElement("applications-list");
const emptyApplicationsMessage = getElement(
    "empty-applications-message"
);

const totalApplicationsCount = getElement(
    "total-applications-count"
);
const interviewsCount = getElement("interviews-count");
const offersCount = getElement("offers-count");
const responseRateCount = getElement("response-rate-count");

/* ---------------------------------
   Application state
--------------------------------- */

let currentUser = null;
let applications = [];
let editingApplicationId = null;
let authenticationMode = "sign-in";
let isLoadingApplications = false;
let databaseErrorMessage = "";
let loadedUserId = null;

/* ---------------------------------
   General helpers
--------------------------------- */

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

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

function getStatusClassName(status) {
    return String(status || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function setBodyModalState() {
    const modalIsOpen =
        !authenticationModal.hidden || !applicationModal.hidden;

    document.body.classList.toggle("modal-open", modalIsOpen);
}

/* ---------------------------------
   Authentication interface
--------------------------------- */

function setAuthenticationMessage(message, type = "") {
    authenticationMessage.textContent = message;
    authenticationMessage.classList.remove(
        "authentication-error",
        "authentication-success"
    );

    if (type === "error") {
        authenticationMessage.classList.add(
            "authentication-error"
        );
    }

    if (type === "success") {
        authenticationMessage.classList.add(
            "authentication-success"
        );
    }
}

function setAuthenticationMode(mode) {
    authenticationMode = mode;
    authenticationForm.reset();
    setAuthenticationMessage("");

    const creatingAccount = mode === "create-account";
    forgotPasswordButton.hidden = creatingAccount;

    authenticationTitle.textContent = creatingAccount
        ? "Create Account"
        : "Sign In";

    authenticationDescription.textContent = creatingAccount
        ? "Create an account to securely manage your job applications."
        : "Sign in to access your saved job applications.";

    authenticationSubmitButton.textContent = creatingAccount
        ? "Create Account"
        : "Sign In";

    authenticationSwitchText.textContent = creatingAccount
        ? "Already have an account?"
        : "Do not have an account?";

    switchAuthenticationModeButton.textContent = creatingAccount
        ? "Sign In"
        : "Create Account";

    confirmPasswordField.hidden = !creatingAccount;
    authenticationConfirmPasswordInput.required = creatingAccount;
    authenticationPasswordInput.autocomplete = creatingAccount
        ? "new-password"
        : "current-password";
}

function openAuthenticationModal(mode = "sign-in") {
    setAuthenticationMode(mode);
    authenticationModal.hidden = false;
    setBodyModalState();
    authenticationEmailInput.focus();
}

function closeAuthenticationModal() {
    authenticationModal.hidden = true;
    authenticationForm.reset();
    setAuthenticationMessage("");
    setAuthenticationMode("sign-in");
    setBodyModalState();
}

function updateAuthenticationNavigation(user) {
    const signedIn = Boolean(user);

    guestNavigation.hidden = signedIn;
    userNavigation.hidden = !signedIn;
    guestHero.hidden = signedIn;
    signedInUserEmail.textContent = user?.email || "";
}

/* ---------------------------------
   Authentication actions
--------------------------------- */

openSignInButton.addEventListener("click", function () {
    openAuthenticationModal("sign-in");
});

openCreateAccountButton.addEventListener("click", function () {
    openAuthenticationModal("create-account");
});
forgotPasswordButton.addEventListener(
    "click",
    async function () {
        if (!supabaseClient) {
            setAuthenticationMessage(
                "The Supabase connection is unavailable.",
                "error"
            );

            return;
        }

        const email = authenticationEmailInput.value
            .trim()
            .toLowerCase();

        if (!email) {
            setAuthenticationMessage(
                "Enter your email address first.",
                "error"
            );

            authenticationEmailInput.focus();
            return;
        }

        if (!authenticationEmailInput.checkValidity()) {
            setAuthenticationMessage(
                "Enter a valid email address.",
                "error"
            );

            authenticationEmailInput.focus();
            return;
        }

        forgotPasswordButton.disabled = true;
        forgotPasswordButton.textContent = "Sending...";

        setAuthenticationMessage("");

        try {
            const redirectTo =
                `${window.location.origin}/reset-password.html`;

            const { error } =
                await supabaseClient.auth
                    .resetPasswordForEmail(
                        email,
                        {
                            redirectTo
                        }
                    );

            if (error) {
                throw error;
            }

            setAuthenticationMessage(
                "If an account exists for this email, a password reset link has been sent.",
                "success"
            );
        } catch (error) {
            console.error(
                "Password reset request error:",
                error
            );

            setAuthenticationMessage(
                error.message
                    || "The password reset email could not be sent.",
                "error"
            );
        } finally {
            forgotPasswordButton.disabled = false;
            forgotPasswordButton.textContent =
                "Forgot Password?";
        }
    }
);

closeAuthenticationButton.addEventListener(
    "click",
    closeAuthenticationModal
);

switchAuthenticationModeButton.addEventListener(
    "click",
    function () {
        const nextMode = authenticationMode === "sign-in"
            ? "create-account"
            : "sign-in";

        setAuthenticationMode(nextMode);
        authenticationEmailInput.focus();
    }
);

authenticationModal.addEventListener("click", function (event) {
    if (event.target === authenticationModal) {
        closeAuthenticationModal();
    }
});

authenticationForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        if (!supabaseClient) {
            setAuthenticationMessage(
                "The Supabase connection is unavailable.",
                "error"
            );
            return;
        }

        const email = authenticationEmailInput.value
            .trim()
            .toLowerCase();
        const password = authenticationPasswordInput.value;
        const confirmPassword =
            authenticationConfirmPasswordInput.value;
        const creatingAccount =
            authenticationMode === "create-account";

        if (creatingAccount && password !== confirmPassword) {
            setAuthenticationMessage(
                "The passwords do not match.",
                "error"
            );
            authenticationConfirmPasswordInput.focus();
            return;
        }

        authenticationSubmitButton.disabled = true;
        authenticationSubmitButton.textContent = creatingAccount
            ? "Creating Account..."
            : "Signing In...";
        setAuthenticationMessage("");

        try {
            if (creatingAccount) {
                const { data, error } =
                    await supabaseClient.auth.signUp({
                        email,
                        password,
                        options: {
                            emailRedirectTo: window.location.origin
                        }
                    });

                if (error) {
                    throw error;
                }

                if (data.session) {
                    closeAuthenticationModal();
                } else {
                    setAuthenticationMessage(
                        "Account created. Check your email and click the confirmation link before signing in.",
                        "success"
                    );
                    authenticationPasswordInput.value = "";
                    authenticationConfirmPasswordInput.value = "";
                }
            } else {
                const { error } =
                    await supabaseClient.auth.signInWithPassword({
                        email,
                        password
                    });

                if (error) {
                    throw error;
                }

                closeAuthenticationModal();
            }
        } catch (error) {
            console.error("Authentication error:", error);
            setAuthenticationMessage(
                error.message || "Authentication was unsuccessful.",
                "error"
            );
        } finally {
            authenticationSubmitButton.disabled = false;

            if (!authenticationModal.hidden) {
                authenticationSubmitButton.textContent =
                    authenticationMode === "create-account"
                        ? "Create Account"
                        : "Sign In";
            }
        }
    }
);

signOutButton.addEventListener("click", async function () {
    if (!supabaseClient) {
        return;
    }

    signOutButton.disabled = true;
    signOutButton.textContent = "Signing Out...";

    try {
        const { error } = await supabaseClient.auth.signOut({
            scope: "local"
        });

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error("Sign-out error:", error);
        window.alert(
            error.message || "Sign out was unsuccessful."
        );
    } finally {
        signOutButton.disabled = false;
        signOutButton.textContent = "Sign Out";
    }
});

/* ---------------------------------
   Database conversion helpers
--------------------------------- */

function convertDatabaseRow(row) {
    return {
        id: row.id,
        userId: row.user_id,
        companyName: row.company_name,
        positionTitle: row.position_title,
        location: row.job_location || "",
        status: row.status,
        applicationDate: row.application_date,
        salary: row.salary_information || "",
        jobLink: row.job_posting_url || "",
        interviewDate: row.interview_date || "",
        followUpDate: row.follow_up_date || "",
        notes: row.notes || "",
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

function createDatabasePayload(formData) {
    const optionalText = function (fieldName) {
        const value = String(formData.get(fieldName) || "").trim();
        return value || null;
    };

    const optionalDate = function (fieldName) {
        const value = String(formData.get(fieldName) || "");
        return value || null;
    };

    return {
        company_name: String(
            formData.get("companyName") || ""
        ).trim(),
        position_title: String(
            formData.get("positionTitle") || ""
        ).trim(),
        job_location: optionalText("jobLocation"),
        status: formData.get("applicationStatus"),
        application_date: formData.get("applicationDate"),
        salary_information: optionalText("salaryInformation"),
        job_posting_url: optionalText("jobLink"),
        interview_date: optionalDate("interviewDate"),
        follow_up_date: optionalDate("followUpDate"),
        notes: optionalText("applicationNotes")
    };
}

/* ---------------------------------
   Database loading and auth state
--------------------------------- */

async function loadApplicationsFromDatabase() {
    if (!currentUser) {
        applications = [];
        loadedUserId = null;
        renderApplications();
        return;
    }

    isLoadingApplications = true;
    databaseErrorMessage = "";
    renderApplications();

    try {
        const { data, error } = await supabaseClient
            .from("job_applications")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("application_date", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        applications = (data || []).map(convertDatabaseRow);
        loadedUserId = currentUser.id;
    } catch (error) {
        console.error("Could not load applications:", error);
        applications = [];
        databaseErrorMessage =
            error.message || "Your applications could not be loaded.";
    } finally {
        isLoadingApplications = false;
        renderApplications();
    }
}

async function applyAuthenticationSession(session) {
    const nextUser = session?.user || null;
    const nextUserId = nextUser?.id || null;

    currentUser = nextUser;
    updateAuthenticationNavigation(currentUser);

    if (!currentUser) {
        applications = [];
        loadedUserId = null;
        editingApplicationId = null;
        databaseErrorMessage = "";
        applicationSearchInput.value = "";
        statusFilterInput.value = "All";
        sortApplicationsInput.value = "newest";

        if (!applicationModal.hidden) {
            applicationModal.hidden = true;
            setBodyModalState();
        }

        renderApplications();
        return;
    }

    if (!authenticationModal.hidden) {
        closeAuthenticationModal();
    }

    if (loadedUserId !== nextUserId) {
        await loadApplicationsFromDatabase();
    } else {
        renderApplications();
    }
}

function initializeAuthentication() {
    if (!supabaseClient) {
        updateAuthenticationNavigation(null);
        console.error("Supabase client was not found.");
        renderApplications();
        return;
    }

    supabaseClient.auth.onAuthStateChange(function (_event, session) {
        window.setTimeout(function () {
            void applyAuthenticationSession(session);
        }, 0);
    });

    void supabaseClient.auth.getSession().then(function ({ data, error }) {
        if (error) {
            console.error("Could not read the session:", error);
            void applyAuthenticationSession(null);
            return;
        }

        void applyAuthenticationSession(data.session);
    });
}

/* ---------------------------------
   Application modal
--------------------------------- */

function resetApplicationForm() {
    applicationForm.reset();
    editingApplicationId = null;
    applicationFormTitle.textContent = "Add a New Application";
    submitApplicationButton.textContent = "Save Application";
    applicationDateInput.value = getTodayDate();
}

function showApplicationModal() {
    if (!currentUser) {
        openAuthenticationModal("sign-in");
        return;
    }

    applicationModal.hidden = false;
    setBodyModalState();
    companyNameInput.focus();
}

function openNewApplicationForm() {
    resetApplicationForm();
    showApplicationModal();
}

function openEditApplicationForm(applicationId) {
    const application = applications.find(
        (item) => item.id === applicationId
    );

    if (!currentUser || !application) {
        return;
    }

    editingApplicationId = applicationId;
    applicationFormTitle.textContent = "Edit Application";
    submitApplicationButton.textContent = "Update Application";

    companyNameInput.value = application.companyName;
    positionTitleInput.value = application.positionTitle;
    jobLocationInput.value = application.location;
    applicationStatusInput.value = application.status;
    applicationDateInput.value = application.applicationDate;
    salaryInformationInput.value = application.salary;
    jobLinkInput.value = application.jobLink;
    interviewDateInput.value = application.interviewDate;
    followUpDateInput.value = application.followUpDate;
    applicationNotesInput.value = application.notes;

    showApplicationModal();
}

function closeApplicationForm() {
    applicationModal.hidden = true;
    resetApplicationForm();
    setBodyModalState();

    if (!openApplicationFormButton.disabled) {
        openApplicationFormButton.focus();
    }
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
    if (event.key !== "Escape") {
        return;
    }

    if (!authenticationModal.hidden) {
        closeAuthenticationModal();
        return;
    }

    if (!applicationModal.hidden) {
        closeApplicationForm();
    }
});

/* ---------------------------------
   Dashboard, filtering, and sorting
--------------------------------- */

function updateDashboard() {
    const total = applications.length;

    const interviews = applications.filter(
        (application) => application.status === "Interview"
    ).length;

    const offers = applications.filter(
        (application) => application.status === "Offer"
    ).length;

    const responseStatuses = new Set([
        "Assessment",
        "Interview",
        "Offer",
        "Rejected"
    ]);

    const responses = applications.filter((application) =>
        responseStatuses.has(application.status)
    ).length;

    const responseRate = total === 0
        ? 0
        : Math.round((responses / total) * 100);

    totalApplicationsCount.textContent = total;
    interviewsCount.textContent = interviews;
    offersCount.textContent = offers;
    responseRateCount.textContent = `${responseRate}%`;
}

function getFilteredApplications() {
    const searchTerm = applicationSearchInput.value
        .trim()
        .toLowerCase();

    const selectedStatus = statusFilterInput.value;

    return applications.filter(function (application) {
        const searchableText = [
            application.companyName,
            application.positionTitle,
            application.location,
            application.status,
            application.notes
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesSearch = searchableText.includes(searchTerm);

        const matchesStatus = selectedStatus === "All"
            || application.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });
}

function sortApplicationResults(results) {
    const sortValue = sortApplicationsInput.value;
    const sorted = [...results];

    sorted.sort(function (first, second) {
        switch (sortValue) {
            case "oldest":
                return (first.applicationDate || "").localeCompare(
                    second.applicationDate || ""
                );

            case "company-ascending":
                return (first.companyName || "").localeCompare(
                    second.companyName || "",
                    undefined,
                    { sensitivity: "base" }
                );

            case "company-descending":
                return (second.companyName || "").localeCompare(
                    first.companyName || "",
                    undefined,
                    { sensitivity: "base" }
                );

            case "position-ascending":
                return (first.positionTitle || "").localeCompare(
                    second.positionTitle || "",
                    undefined,
                    { sensitivity: "base" }
                );

            default:
                return (second.applicationDate || "").localeCompare(
                    first.applicationDate || ""
                );
        }
    });

    return sorted;
}

function getVisibleApplications() {
    return sortApplicationResults(getFilteredApplications());
}

/* ---------------------------------
   Application cards
--------------------------------- */

function createApplicationListItem(application) {
    const listItem = document.createElement("li");
    const heading = document.createElement("div");
    const titleGroup = document.createElement("div");
    const positionTitle = document.createElement("h3");
    const companyName = document.createElement("p");
    const status = document.createElement("span");

    positionTitle.textContent = application.positionTitle;
    companyName.textContent = application.companyName;
    status.textContent = application.status;

    const statusClassName = getStatusClassName(application.status);

    status.classList.add(
        "application-status-badge",
        `status-${statusClassName}`
    );

    titleGroup.append(positionTitle, companyName);
    heading.append(titleGroup, status);

    const details = document.createElement("div");

    const detailValues = [
        `Location: ${application.location || "Not provided"}`,
        `Applied: ${formatDate(application.applicationDate)}`,
        `Salary: ${application.salary || "Not provided"}`,
        `Follow-up: ${formatDate(application.followUpDate)}`
    ];

    if (application.interviewDate) {
        detailValues.push(
            `Interview: ${formatDate(application.interviewDate)}`
        );
    }

    detailValues.forEach(function (value) {
        const paragraph = document.createElement("p");
        paragraph.textContent = value;
        details.append(paragraph);
    });

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
        void deleteApplication(application.id);
    });

    actions.append(editButton, deleteButton);
    listItem.append(heading, details, actions);

    return listItem;
}

function updateTrackerAvailability() {
    const unavailable = !currentUser || isLoadingApplications;

    openApplicationFormButton.disabled = unavailable;
    applicationSearchInput.disabled = unavailable;
    statusFilterInput.disabled = unavailable;
    sortApplicationsInput.disabled = unavailable;

    exportApplicationsButton.disabled =
        unavailable || applications.length === 0;
}

function renderApplications() {
    applicationsList.innerHTML = "";

    const visibleApplications =
        currentUser && !isLoadingApplications
            ? getVisibleApplications()
            : [];

    if (!currentUser) {
        emptyApplicationsMessage.hidden = false;
        emptyApplicationsMessage.textContent =
            "Sign in to view and manage your job applications.";
    } else if (isLoadingApplications) {
        emptyApplicationsMessage.hidden = false;
        emptyApplicationsMessage.textContent =
            "Loading your applications...";
    } else if (applications.length === 0) {
        emptyApplicationsMessage.hidden = false;
        emptyApplicationsMessage.textContent =
            "No applications have been added yet.";
    } else {
        emptyApplicationsMessage.hidden = true;
    }

    visibleApplications.forEach(function (application) {
        applicationsList.append(
            createApplicationListItem(application)
        );
    });

    if (databaseErrorMessage) {
        applicationsResultsMessage.textContent =
            databaseErrorMessage;
    } else if (
        !currentUser
        || isLoadingApplications
        || applications.length === 0
    ) {
        applicationsResultsMessage.textContent = "";
    } else if (visibleApplications.length === 0) {
        applicationsResultsMessage.textContent =
            "No applications match your current search or filter.";
    } else if (
        visibleApplications.length === applications.length
    ) {
        applicationsResultsMessage.textContent =
            `Showing all ${applications.length} applications.`;
    } else {
        applicationsResultsMessage.textContent =
            `Showing ${visibleApplications.length} of ${applications.length} applications.`;
    }

    updateDashboard();
    updateTrackerAvailability();
}

/* ---------------------------------
   Database CRUD
--------------------------------- */

applicationForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        if (!currentUser) {
            closeApplicationForm();
            openAuthenticationModal("sign-in");
            return;
        }

        const formData = new FormData(applicationForm);
        const payload = createDatabasePayload(formData);
        const isEditing = Boolean(editingApplicationId);

        submitApplicationButton.disabled = true;

        submitApplicationButton.textContent = isEditing
            ? "Updating..."
            : "Saving...";

        try {
            if (isEditing) {
                const { data, error } = await supabaseClient
                    .from("job_applications")
                    .update(payload)
                    .eq("id", editingApplicationId)
                    .eq("user_id", currentUser.id)
                    .select()
                    .single();

                if (error) {
                    throw error;
                }

                const updatedApplication =
                    convertDatabaseRow(data);

                applications = applications.map(
                    (application) =>
                        application.id === updatedApplication.id
                            ? updatedApplication
                            : application
                );
            } else {
                const { data, error } = await supabaseClient
                    .from("job_applications")
                    .insert({
                        ...payload,
                        user_id: currentUser.id
                    })
                    .select()
                    .single();

                if (error) {
                    throw error;
                }

                applications.unshift(
                    convertDatabaseRow(data)
                );
            }

            closeApplicationForm();
            renderApplications();
        } catch (error) {
            console.error(
                "Could not save application:",
                error
            );

            window.alert(
                error.message
                    || "The application could not be saved."
            );
        } finally {
            submitApplicationButton.disabled = false;

            if (!applicationModal.hidden) {
                submitApplicationButton.textContent =
                    editingApplicationId
                        ? "Update Application"
                        : "Save Application";
            }
        }
    }
);

async function deleteApplication(applicationId) {
    if (!currentUser) {
        return;
    }

    const application = applications.find(
        (item) => item.id === applicationId
    );

    if (!application) {
        return;
    }

    const confirmed = window.confirm(
        `Delete the ${application.positionTitle} application at ${application.companyName}?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const { error } = await supabaseClient
            .from("job_applications")
            .delete()
            .eq("id", applicationId)
            .eq("user_id", currentUser.id);

        if (error) {
            throw error;
        }

        applications = applications.filter(
            (item) => item.id !== applicationId
        );

        renderApplications();
    } catch (error) {
        console.error(
            "Could not delete application:",
            error
        );

        window.alert(
            error.message
                || "The application could not be deleted."
        );
    }
}

/* ---------------------------------
   CSV export
--------------------------------- */

function escapeCsvValue(value) {
    const text =
        value === null || value === undefined
            ? ""
            : String(value);

    return `"${text.replace(/"/g, '""')}"`;
}

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

    const csvContent = [headers, ...rows]
        .map(
            (row) =>
                row.map(escapeCsvValue).join(",")
        )
        .join("\r\n");

    const csvFile = new Blob(
        ["\uFEFF", csvContent],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const downloadUrl =
        URL.createObjectURL(csvFile);

    const downloadLink =
        document.createElement("a");

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
   Search, filter, and sorting events
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
   Initial interface
--------------------------------- */

setAuthenticationMode("sign-in");
resetApplicationForm();
updateAuthenticationNavigation(null);
renderApplications();
initializeAuthentication();