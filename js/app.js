"use strict";

// Get the form modal and its buttons from the HTML.
const applicationModal = document.getElementById("application-modal");
const openApplicationFormButton = document.getElementById(
    "open-application-form"
);
const closeApplicationFormButton = document.getElementById(
    "close-application-form"
);
const cancelApplicationFormButton = document.getElementById(
    "cancel-application-form"
);

// Get the form and important form fields.
const applicationForm = document.getElementById("application-form");
const companyNameInput = document.getElementById("company-name");
const applicationDateInput = document.getElementById("application-date");

/**
 * Return today's date in the YYYY-MM-DD format
 * required by an HTML date input.
 */
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/**
 * Open the application form modal.
 */
function openApplicationForm() {
    applicationModal.hidden = false;
    document.body.classList.add("modal-open");

    // Add today's date only when the field is empty.
    if (!applicationDateInput.value) {
        applicationDateInput.value = getTodayDate();
    }

    // Move the cursor to the company name field.
    companyNameInput.focus();
}

/**
 * Close the application form modal.
 */
function closeApplicationForm() {
    applicationModal.hidden = true;
    document.body.classList.remove("modal-open");

    // Return keyboard focus to the Add Application button.
    openApplicationFormButton.focus();
}

// Open the form when Add Application is clicked.
openApplicationFormButton.addEventListener(
    "click",
    openApplicationForm
);

// Close the form using the × button.
closeApplicationFormButton.addEventListener(
    "click",
    closeApplicationForm
);

// Close the form using the Cancel button.
cancelApplicationFormButton.addEventListener(
    "click",
    closeApplicationForm
);

// Close the form when the dark background is clicked.
applicationModal.addEventListener("click", function (event) {
    if (event.target === applicationModal) {
        closeApplicationForm();
    }
});

// Close the form when the Escape key is pressed.
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !applicationModal.hidden) {
        closeApplicationForm();
    }
});

// Prevent the form from refreshing the page for now.
// Database saving will be added in a later stage.
applicationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    console.log("Application form submitted.");
});