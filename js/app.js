"use strict";

/* ---------------------------------
   Supabase client
--------------------------------- */

const supabaseClient = window.supabaseClient;

/* ---------------------------------
   Helper
--------------------------------- */

function getElement(id) {
    return document.getElementById(id);
}

/* ---------------------------------
   Authentication elements
--------------------------------- */

const guestNavigation = getElement("guest-navigation");
const userNavigation = getElement("user-navigation");
const signedInUserEmail = getElement("signed-in-user-email");

const openSignInButton = getElement("open-sign-in-button");
const openCreateAccountButton = getElement(
    "open-create-account-button"
);
const signOutButton = getElement("sign-out-button");

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
const authenticationMessage = getElement(
    "authentication-message"
);
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
   Job application elements
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

const companyNameInput = getElement("company-name");
const positionTitleInput = getElement("position-title");
const jobLocationInput = getElement("job-location");
const applicationStatusInput = getElement(
    "application-status"
);
const applicationDateInput = getElement(
    "application-date"
);
const salaryInformationInput = getElement(
    "salary-information"
);
const jobLinkInput = getElement("job-link");
const interviewDateInput = getElement("interview-date");
const followUpDateInput = getElement("follow-up-date");
const applicationNotesInput = getElement(
    "application-notes"
);

const applicationSearchInput = getElement(
    "application-search"
);
const statusFilterInput = getElement("status-filter");
const sortApplicationsInput = getElement(
    "sort-applications"
);

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
const responseRateCount = getElement(
    "response-rate-count"
);

/* ---------------------------------
   Application state
--------------------------------- */

let currentUser = null;
let applications = [];
let editingApplicationId = null;
let authenticationMode = "sign-in";
let isLoadingApplications = false;
let databaseErrorMessage = "";

/* ---------------------------------
   Authentication interface
--------------------------------- */

function setAuthenticationMessage(
    message,
    messageType = ""
) {
    authenticationMessage.textContent = message;

    authenticationMessage.classList.remove(
        "authentication-error",
        "authentication-success"
    );

    if (messageType === "error") {
        authenticationMessage.classList.add(
            "authentication-error"
        );
    }

    if (messageType === "success") {
        authenticationMessage.classList.add(
            "authentication-success"
        );
    }
}

function setAuthenticationMode(mode) {
    authenticationMode = mode;
    authenticationForm.reset();
    setAuthenticationMessage("");

    if (mode === "create-account") {
        authenticationTitle.textContent = "Create Account";

        authenticationDescription.textContent =
            "Create an account to securely manage your job applications.";

        authenticationSubmitButton.textContent =
            "Create Account";

        authenticationSwitchText.textContent =
            "Already have an account?";

        switchAuthenticationModeButton.textContent =
            "Sign In";

        confirmPasswordField.hidden = false;
        authenticationConfirmPasswordInput.required = true;

        authenticationPasswordInput.autocomplete =
            "new-password";

        return;
    }

    authenticationTitle.textContent = "Sign In";

    authenticationDescription.textContent =
        "Sign in to access your saved job applications.";

    authenticationSubmitButton.textContent = "Sign In";

    authenticationSwitchText.textContent =
        "Do not have an account?";

    switchAuthenticationModeButton.textContent =
        "Create Account";

    confirmPasswordField.hidden = true;
    authenticationConfirmPasswordInput.required = false;

    authenticationPasswordInput.autocomplete =
        "current-password";
}

function openAuthenticationModal(mode) {
    setAuthenticationMode(mode);

    authenticationModal.hidden = false;
    document.body.classList.add("modal-open");

    authenticationEmailInput.focus();
}

function closeAuthenticationModal() {
    authenticationModal.hidden = true;
    document.body.classList.remove("modal-open");

    authenticationForm.reset();
    setAuthenticationMode("sign-in");
}

function updateAuthenticationNavigation(user) {
    if (user) {
        guestNavigation.hidden = true;
        userNavigation.hidden = false;

        signedInUserEmail.textContent =
            user.email || "Signed-in user";

        return;
    }

    guestNavigation.hidden = false;
    userNavigation.hidden = true;
    signedInUserEmail.textContent = "";
}

/* ---------------------------------
   Authentication events
--------------------------------- */

openSignInButton.addEventListener("click", function () {
    openAuthenticationModal("sign-in");
});

openCreateAccountButton.addEventListener(
    "click",
    function () {
        openAuthenticationModal("create-account");
    }
);

closeAuthenticationButton.addEventListener(
    "click",
    closeAuthenticationModal
);

switchAuthenticationModeButton.addEventListener(
    "click",
    function () {
        const nextMode =
            authenticationMode === "sign-in"
                ? "create-account"
                : "sign-in";

        setAuthenticationMode(nextMode);
        authenticationEmailInput.focus();
    }
);

authenticationModal.addEventListener(
    "click",
    function (event) {
        if (event.target === authenticationModal) {
            closeAuthenticationModal();
        }
    }
);

/* ---------------------------------
   Authentication submission
--------------------------------- */

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

        const password =
            authenticationPasswordInput.value;

        const confirmPassword =
            authenticationConfirmPasswordInput.value;

        if (
            authenticationMode === "create-account"
            && password !== confirmPassword
        ) {
            setAuthenticationMessage(
                "The passwords do not match.",
                "error"
            );

            authenticationConfirmPasswordInput.focus();
            return;
        }

        authenticationSubmitButton.disabled = true;

        authenticationSubmitButton.textContent =
            authenticationMode === "create-account"
                ? "Creating Account..."
                : "Signing In...";

        setAuthenticationMessage("");

        try {
            if (authenticationMode === "create-account") {
                const { data, error } =
                    await supabaseClient.auth.signUp({
                        email,
                        password,
                        options: {
                            emailRedirectTo:
                                window.location.origin
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
                    authenticationConfirmPasswordInput.value =
                        "";
                }
            } else {
                const { error } =
                    await supabaseClient.auth
                        .signInWithPassword({
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
                error.message ||
                    "Authentication was unsuccessful.",
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

/* ---------------------------------
   Sign out
--------------------------------- */

signOutButton.addEventListener(
    "click",
    async function () {
        if (!supabaseClient) {
            return;
        }

        signOutButton.disabled = true;
        signOutButton.textContent = "Signing Out...";

        const { error } =
            await supabaseClient.auth.signOut({
                scope: "local"
            });

        if (error) {
            console.error("Sign-out error:", error);

            window.alert(
                error.message ||
                    "Sign out was unsuccessful."
            );
        }

        signOutButton.disabled = false;
        signOutButton.textContent = "Sign Out";
    }
);

/* ---------------------------------
   Database row conversion
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
    const location = formData
        .get("jobLocation")
        .trim();

    const salary = formData
        .get("salaryInformation")
        .trim();

    const jobLink = formData
        .get("jobLink")
        .trim();

    const interviewDate = formData.get(
        "interviewDate"
    );

    const followUpDate = formData.get(
        "followUpDate"
    );

    const notes = formData
        .get("applicationNotes")
        .trim();

    return {
        company_name: formData
            .get("companyName")
            .trim(),

        position_title: formData
            .get("positionTitle")
            .trim(),

        job_location: location || null,

        status: formData.get(
            "applicationStatus"
        ),

        application_date: formData.get(
            "applicationDate"
        ),

        salary_information: salary || null,

        job_posting_url: jobLink || null,

        interview_date: interviewDate || null,

        follow_up_date: followUpDate || null,

        notes: notes || null
    };
}

/* ---------------------------------
   Database loading
--------------------------------- */

async function loadApplicationsFromDatabase() {
    if (!currentUser) {
        applications = [];
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
            .order("application_date", {
                ascending: false
            })
            .order("created_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        applications = (data || []).map(
            convertDatabaseRow
        );
    } catch (error) {
        console.error(
            "Could not load applications:",
            error
        );

        applications = [];

        databaseErrorMessage =
            error.message ||
            "Your applications could not be loaded.";
    } finally {
        isLoadingApplications = false;
        renderApplications();
    }
}

/* ---------------------------------
   Authentication state changes
--------------------------------- */

async function handleAuthenticationChange(
    event,
    session
) {
    const previousUserId = currentUser?.id || null;

    currentUser = session?.user || null;

    updateAuthenticationNavigation(currentUser);

    if (!currentUser) {
        applications = [];
        editingApplicationId = null;
        databaseErrorMessage = "";

        applicationSearchInput.value = "";
        statusFilterInput.value = "All";
        sortApplicationsInput.value = "newest";

        if (!applicationModal.hidden) {
            applicationModal.hidden = true;
            document.body.classList.remove("modal-open");
        }

        renderApplications();
        return;
    }

    if (
        !authenticationModal.hidden
        && (
            event === "SIGNED_IN"
            || event === "INITIAL_SESSION"
        )
    ) {
        closeAuthenticationModal();
    }

    const userChanged =
        previousUserId !== currentUser.id;

    if (
        userChanged
        || event === "INITIAL_SESSION"
    ) {
        await loadApplicationsFromDatabase();
    }
}

if (supabaseClient) {
    /*
     * The callback itself stays synchronous.
     * The asynchronous work runs in a separate function.
     */
    supabaseClient.auth.onAuthStateChange(
        function (event, session) {
            void handleAuthenticationChange(
                event,
                session
            );
        }
    );
} else {
    updateAuthenticationNavigation(null);

    console.error(
        "Supabase client was not found."
    );
}

/* ---------------------------------
   Date helpers
--------------------------------- */

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "Not provided";
    }

    const date = new Date(
        `${dateValue}T00:00:00`
    );

    return date.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

/* ---------------------------------
   Application modal
--------------------------------- */

function resetApplicationForm() {
    applicationForm.reset();

    editingApplicationId = null;

    applicationFormTitle.textContent =
        "Add a New Application";

    submitApplicationButton.textContent =
        "Save Application";

    applicationDateInput.value = getTodayDate();
}

function showApplicationModal() {
    if (!currentUser) {
        openAuthenticationModal("sign-in");
        return;
    }

    applicationModal.hidden = false;
    document.body.classList.add("modal-open");

    companyNameInput.focus();
}

function openNewApplicationForm() {
    resetApplicationForm();
    showApplicationModal();
}

function openEditApplicationForm(applicationId) {
    if (!currentUser) {
        return;
    }

    const applicationToEdit = applications.find(
        function (application) {
            return application.id === applicationId;
        }
    );

    if (!applicationToEdit) {
        return;
    }

    editingApplicationId = applicationId;

    applicationFormTitle.textContent =
        "Edit Application";

    submitApplicationButton.textContent =
        "Update Application";

    companyNameInput.value =
        applicationToEdit.companyName || "";

    positionTitleInput.value =
        applicationToEdit.positionTitle || "";

    jobLocationInput.value =
        applicationToEdit.location || "";

    applicationStatusInput.value =
        applicationToEdit.status || "";

    applicationDateInput.value =
        applicationToEdit.applicationDate || "";

    salaryInformationInput.value =
        applicationToEdit.salary || "";

    jobLinkInput.value =
        applicationToEdit.jobLink || "";

    interviewDateInput.value =
        applicationToEdit.interviewDate || "";

    followUpDateInput.value =
        applicationToEdit.followUpDate || "";

    applicationNotesInput.value =
        applicationToEdit.notes || "";

    showApplicationModal();
}

function closeApplicationForm() {
    applicationModal.hidden = true;
    document.body.classList.remove("modal-open");

    resetApplicationForm();

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

applicationModal.addEventListener(
    "click",
    function (event) {
        if (event.target === applicationModal) {
            closeApplicationForm();
        }
    }
);

/* ---------------------------------
   Escape key
--------------------------------- */

document.addEventListener(
    "keydown",
    function (event) {
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
    }
);

/* ---------------------------------
   Dashboard
--------------------------------- */

function updateDashboard() {
    const totalApplications = applications.length;

    const interviewApplications =
        applications.filter(
            function (application) {
                return application.status === "Interview";
            }
        ).length;

    const offerApplications =
        applications.filter(
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

    const applicationsWithResponses =
        applications.filter(
            function (application) {
                return responseStatuses.includes(
                    application.status
                );
            }
        ).length;

    const responseRate =
        totalApplications === 0
            ? 0
            : Math.round(
                (
                    applicationsWithResponses
                    / totalApplications
                ) * 100
            );

    totalApplicationsCount.textContent =
        totalApplications;

    interviewsCount.textContent =
        interviewApplications;

    offersCount.textContent =
        offerApplications;

    responseRateCount.textContent =
        `${responseRate}%`;
}

/* ---------------------------------
   Search, filter, and sort
--------------------------------- */

function getFilteredApplications() {
    const searchTerm =
        applicationSearchInput.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        statusFilterInput.value;

    return applications.filter(
        function (application) {
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

            const matchesSearch =
                searchableInformation.includes(
                    searchTerm
                );

            const matchesStatus =
                selectedStatus === "All"
                || application.status === selectedStatus;

            return matchesSearch && matchesStatus;
        }
    );
}

function sortApplicationResults(results) {
    const selectedSort =
        sortApplicationsInput.value;

    const sortedApplications = [...results];

    sortedApplications.sort(
        function (firstApplication, secondApplication) {
            if (selectedSort === "oldest") {
                return (
                    firstApplication.applicationDate || ""
                ).localeCompare(
                    secondApplication.applicationDate || ""
                );
            }

            if (
                selectedSort === "company-ascending"
            ) {
                return (
                    firstApplication.companyName || ""
                ).localeCompare(
                    secondApplication.companyName || "",
                    undefined,
                    { sensitivity: "base" }
                );
            }

            if (
                selectedSort === "company-descending"
            ) {
                return (
                    secondApplication.companyName || ""
                ).localeCompare(
                    firstApplication.companyName || "",
                    undefined,
                    { sensitivity: "base" }
                );
            }

            if (
                selectedSort === "position-ascending"
            ) {
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
        }
    );

    return sortedApplications;
}

function getVisibleApplications() {
    return sortApplicationResults(
        getFilteredApplications()
    );
}

/* ---------------------------------
   Delete application
--------------------------------- */

async function deleteApplication(applicationId) {
    if (!currentUser) {
        return;
    }

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
            function (application) {
                return application.id !== applicationId;
            }
        );

        renderApplications();
    } catch (error) {
        console.error(
            "Could not delete application:",
            error
        );

        window.alert(
            error.message ||
                "The application could not be deleted."
        );
    }
}

/* ---------------------------------
   Application cards
--------------------------------- */

function createApplicationListItem(application) {
    const listItem = document.createElement("li");

    const heading = document.createElement("div");
    const titleGroup = document.createElement("div");

    const positionTitle =
        document.createElement("h3");

    positionTitle.textContent =
        application.positionTitle;

    const companyName =
        document.createElement("p");

    companyName.textContent =
        application.companyName;

    const status =
        document.createElement("span");

    status.textContent = application.status;

    titleGroup.append(
        positionTitle,
        companyName
    );

    heading.append(titleGroup, status);

    const details = document.createElement("div");

    const location = document.createElement("p");

    location.textContent =
        `Location: ${
            application.location || "Not provided"
        }`;

    const applicationDate =
        document.createElement("p");

    applicationDate.textContent =
        `Applied: ${formatDate(
            application.applicationDate
        )}`;

    const salary = document.createElement("p");

    salary.textContent =
        `Salary: ${
            application.salary || "Not provided"
        }`;

    const followUpDate =
        document.createElement("p");

    followUpDate.textContent =
        `Follow-up: ${formatDate(
            application.followUpDate
        )}`;

    details.append(
        location,
        applicationDate,
        salary,
        followUpDate
    );

    if (application.interviewDate) {
        const interviewDate =
            document.createElement("p");

        interviewDate.textContent =
            `Interview: ${formatDate(
                application.interviewDate
            )}`;

        details.append(interviewDate);
    }

    if (application.jobLink) {
        const jobLink =
            document.createElement("a");

        jobLink.href = application.jobLink;
        jobLink.target = "_blank";
        jobLink.rel = "noopener noreferrer";
        jobLink.textContent = "View job posting";

        details.append(jobLink);
    }

    if (application.notes) {
        const notes = document.createElement("p");

        notes.textContent =
            `Notes: ${application.notes}`;

        details.append(notes);
    }

    const actions = document.createElement("div");

    actions.classList.add(
        "application-actions"
    );

    const editButton =
        document.createElement("button");

    editButton.type = "button";

    editButton.classList.add(
        "edit-application-button"
    );

    editButton.textContent = "Edit";

    editButton.addEventListener(
        "click",
        function () {
            openEditApplicationForm(
                application.id
            );
        }
    );

    const deleteButton =
        document.createElement("button");

    deleteButton.type = "button";

    deleteButton.classList.add(
        "delete-application-button"
    );

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener(
        "click",
        function () {
            void deleteApplication(
                application.id
            );
        }
    );

    actions.append(editButton, deleteButton);

    listItem.append(
        heading,
        details,
        actions
    );

    return listItem;
}

/* ---------------------------------
   Tracker availability and rendering
--------------------------------- */

function updateTrackerAvailability() {
    const unavailable =
        !currentUser || isLoadingApplications;

    openApplicationFormButton.disabled =
        unavailable;

    applicationSearchInput.disabled =
        unavailable;

    statusFilterInput.disabled =
        unavailable;

    sortApplicationsInput.disabled =
        unavailable;

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

    visibleApplications.forEach(
        function (application) {
            applicationsList.append(
                createApplicationListItem(
                    application
                )
            );
        }
    );

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
        visibleApplications.length
        === applications.length
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
   Save or update application
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

        const formData =
            new FormData(applicationForm);

        const databasePayload =
            createDatabasePayload(formData);

        submitApplicationButton.disabled = true;

        submitApplicationButton.textContent =
            editingApplicationId
                ? "Updating..."
                : "Saving...";

        try {
            if (editingApplicationId) {
                const { data, error } =
                    await supabaseClient
                        .from("job_applications")
                        .update(databasePayload)
                        .eq(
                            "id",
                            editingApplicationId
                        )
                        .eq(
                            "user_id",
                            currentUser.id
                        )
                        .select()
                        .single();

                if (error) {
                    throw error;
                }

                const updatedApplication =
                    convertDatabaseRow(data);

                applications = applications.map(
                    function (application) {
                        return application.id
                            === updatedApplication.id
                            ? updatedApplication
                            : application;
                    }
                );
            } else {
                const { data, error } =
                    await supabaseClient
                        .from("job_applications")
                        .insert({
                            ...databasePayload,
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
                error.message ||
                    "The application could not be saved."
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

/* ---------------------------------
   CSV export
--------------------------------- */

function escapeCsvValue(value) {
    const textValue =
        value === null || value === undefined
            ? ""
            : String(value);

    return `"${textValue.replace(/"/g, '""')}"`;
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

    const rows = applications.map(
        function (application) {
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
        }
    );

    const csvContent = [headers, ...rows]
        .map(function (row) {
            return row
                .map(escapeCsvValue)
                .join(",");
        })
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
   Search, filter, and sort events
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