"use strict";

const supabaseClient = window.supabaseClient;

const passwordResetForm = document.getElementById(
    "password-reset-form"
);

const newPasswordInput = document.getElementById(
    "new-password"
);

const confirmNewPasswordInput = document.getElementById(
    "confirm-new-password"
);

const updatePasswordButton = document.getElementById(
    "update-password-button"
);

const passwordResetStatus = document.getElementById(
    "password-reset-status"
);

const returnToJobTrackLink = document.getElementById(
    "return-to-jobtrack"
);

let recoverySessionAvailable = false;

function setResetStatus(message, type = "") {
    passwordResetStatus.textContent = message;

    passwordResetStatus.classList.remove(
        "authentication-error",
        "authentication-success"
    );

    if (type === "error") {
        passwordResetStatus.classList.add(
            "authentication-error"
        );
    }

    if (type === "success") {
        passwordResetStatus.classList.add(
            "authentication-success"
        );
    }
}

function enablePasswordResetForm() {
    recoverySessionAvailable = true;
    passwordResetForm.hidden = false;

    setResetStatus(
        "Your reset link is valid. Enter your new password."
    );

    newPasswordInput.focus();
}

function disablePasswordResetForm(message) {
    recoverySessionAvailable = false;
    passwordResetForm.hidden = true;

    setResetStatus(message, "error");
}

if (!supabaseClient) {
    disablePasswordResetForm(
        "The Supabase connection is unavailable."
    );
} else {
    supabaseClient.auth.onAuthStateChange(
        function (event, session) {
            if (
                event === "PASSWORD_RECOVERY"
                && session
            ) {
                enablePasswordResetForm();
                return;
            }

            if (
                event === "INITIAL_SESSION"
                && session
            ) {
                enablePasswordResetForm();
                return;
            }

            if (
                event === "INITIAL_SESSION"
                && !session
            ) {
                disablePasswordResetForm(
                    "This password reset link is invalid or has expired. Request a new link from JobTrack."
                );
            }
        }
    );
}

passwordResetForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        if (
            !supabaseClient
            || !recoverySessionAvailable
        ) {
            disablePasswordResetForm(
                "This password reset session is unavailable."
            );

            return;
        }

        const newPassword =
            newPasswordInput.value;

        const confirmNewPassword =
            confirmNewPasswordInput.value;

        if (newPassword.length < 8) {
            setResetStatus(
                "Your password must contain at least 8 characters.",
                "error"
            );

            newPasswordInput.focus();
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setResetStatus(
                "The passwords do not match.",
                "error"
            );

            confirmNewPasswordInput.focus();
            return;
        }

        updatePasswordButton.disabled = true;
        updatePasswordButton.textContent =
            "Updating Password...";

        setResetStatus("");

        try {
            const { error } =
                await supabaseClient.auth.updateUser({
                    password: newPassword
                });

            if (error) {
                throw error;
            }

            await supabaseClient.auth.signOut({
                scope: "local"
            });

            passwordResetForm.reset();
            passwordResetForm.hidden = true;
            returnToJobTrackLink.hidden = false;

            setResetStatus(
                "Your password was updated successfully. Return to JobTrack and sign in with your new password.",
                "success"
            );
        } catch (error) {
            console.error(
                "Password update error:",
                error
            );

            setResetStatus(
                error.message
                    || "Your password could not be updated.",
                "error"
            );
        } finally {
            updatePasswordButton.disabled = false;
            updatePasswordButton.textContent =
                "Update Password";
        }
    }
);