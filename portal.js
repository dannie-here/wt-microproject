"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, parent = document) => parent.querySelector(selector);

    // Registration form validation
    const form = $("#registerForm");

    if (form) {
        const rules = {
            fullName: [/^[a-zA-Z\s]{2,50}$/, "Use 2–50 letters and spaces only."],
            empId: [/^[A-Z0-9]{6,12}$/i, "Use 6–12 letters or numbers."],
            email: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Enter a valid email address."],
            mobile: [/^[6-9]\d{9}$/, "Enter a 10-digit number starting with 6–9."],
            password: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, "Use 8+ characters with uppercase, lowercase, number and a symbol."]
        };

        const fields = [
            "fullName", "empId", "email", "mobile",
            "dept", "password", "confirmPassword"
        ];

        const submit = $("#registerSubmit");

        function validate(id) {
            const input = $("#" + id);
            const error = $('[data-error="' + id + '"]');

            if (!input) return true;

            let valid = true;
            let message = "";

            if (id === "dept") {
                valid = input.value !== "";
                message = valid ? "" : "Please select your division.";
            } else if (id === "confirmPassword") {
                valid = input.value !== "" &&
                    input.value === $("#password").value;
                message = valid ? "" : "Passwords must match.";
            } else {
                const rule = rules[id];
                valid = !!rule && rule[0].test(input.value.trim());
                message = valid ? "" : (rule ? rule[1] : "This field is required.");
            }

            input.classList.toggle("invalid", !valid);
            input.setAttribute("aria-invalid", String(!valid));

            if (error) error.textContent = message;

            return valid;
        }

        function refresh() {
            submit.disabled = !fields.every(validate);
        }

        fields.forEach(id => {
            const input = $("#" + id);

            input?.addEventListener("blur", () => {
                validate(id);
                refresh();
            });

            input?.addEventListener("input", () => {
                validate(id);

                if (id === "password") {
                    validate("confirmPassword");
                }

                refresh();
            });

            input?.addEventListener("change", () => {
                validate(id);
                refresh();
            });
        });

        form.addEventListener("submit", event => {
            event.preventDefault();

            const valid = fields.map(validate).every(Boolean);
            refresh();

            if (!valid) {
                form.reportValidity();
                return;
            }

            $("#registerAlert").textContent =
                "All registration fields passed client-side validation. This demo does not send or store your details.";

            $("#registerAlert").classList.add("show");
            form.reset();

            fields.forEach(id => {
                $("#" + id)?.classList.remove("invalid");

                const error = $('[data-error="' + id + '"]');
                if (error) error.textContent = "";
            });

            submit.disabled = true;
        });

        refresh();
    }

    // Sign-up form validation
    const signup = $("#standaloneSignupForm");

    if (signup) {
        signup.addEventListener("submit", event => {
            event.preventDefault();

            const password = $("#signupPassword").value;
            const confirm = $("#signupConfirm").value;
            const alert = $("#signupAlert");

            if (
                password.length < 8 ||
                !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)
            ) {
                alert.textContent =
                    "Password must contain at least 8 characters, uppercase, lowercase, a number and a symbol.";
                alert.classList.add("show");
                return;
            }

            if (password !== confirm) {
                alert.textContent = "Passwords do not match.";
                alert.classList.add("show");
                return;
            }

            if (!$("#signupTerms").checked) {
                alert.textContent = "Please accept the Terms of Service.";
                alert.classList.add("show");
                return;
            }

            alert.textContent =
                "Sign-up form validated successfully. This front-end demo does not create a real account.";

            alert.classList.add("show");
        });
    }

    // Sign-in form validation
    const signin = $("#standaloneSigninForm");

    if (signin) {
        signin.addEventListener("submit", event => {
            event.preventDefault();

            const alert = $("#signinAlert");
            const email = $("#signinEmailPage").value.trim();
            const password = $("#signinPasswordPage").value;

            const emailOk =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

            if (!emailOk || password.length < 8) {
                alert.textContent =
                    "Invalid credential format. Enter a valid email and a password of at least 8 characters.";
                alert.classList.add("show");
                return;
            }

            alert.textContent =
                "Credential format is valid. Actual sign-in requires a secure authentication backend.";

            alert.classList.add("show");
        });
    }

    // Show / hide password buttons
    document.querySelectorAll("[data-show-password]").forEach(button => {
        button.addEventListener("click", () => {
            const input = $("#" + button.dataset.showPassword);

            if (!input) return;

            const visible = input.type === "text";
            input.type = visible ? "password" : "text";
            button.textContent = visible ? "Show" : "Hide";
            button.setAttribute("aria-pressed", String(!visible));
        });
    });

    // Dashboard mobile menu
    const menu = $("#dashboardMenu");
    const sidebar = $("#dashboardSidebar");

    menu?.addEventListener("click", () => {
        const open = sidebar.classList.toggle("open");
        menu.setAttribute("aria-expanded", String(open));
    });
});