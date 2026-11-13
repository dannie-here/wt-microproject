/* =========================================================
   TRIPVISTA
   HTML5 + CSS3 + Vanilla JavaScript
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ==================== HELPERS ==================== */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const formatINR = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(amount);

    const formatDate = (dateString) => {
        if (!dateString) return "Date not set";

        const date = new Date(`${dateString}T00:00:00`);

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const safeText = (value) => String(value ?? "").trim();

    function readStorage(key, fallback) {
        try {
            const stored = localStorage.getItem(key);

            return stored === null ? fallback : JSON.parse(stored);
        } catch (error) {
            console.warn(`Could not read ${key} from local storage.`, error);
            return fallback;
        }
    }

    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Could not save ${key} to local storage.`, error);
            showToast("Browser storage is unavailable. Your change may not persist.");
            return false;
        }
    }


    /* ==================== TOAST ==================== */

    const toast = $("#toast");
    let toastTimer;

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3200);
    }


    /* ==================== THEME ==================== */

    const themeToggle = $("#themeToggle");
    const themeIcon = $("#themeIcon");
    const themeMeta = $('meta[name="theme-color"]');

    function applyTheme(theme) {
        const dark = theme === "dark";

        document.documentElement.dataset.theme = dark ? "dark" : "light";

        if (themeIcon) {
            themeIcon.textContent = dark ? "☀" : "☾";
        }

        if (themeToggle) {
            themeToggle.setAttribute(
                "aria-label",
                dark ? "Switch to light mode" : "Switch to dark mode"
            );
        }

        if (themeMeta) {
            themeMeta.setAttribute(
                "content",
                dark ? "#101b18" : "#103b32"
            );
        }
    }

    const savedTheme = readStorage("tripvistaTheme", "light");

    applyTheme(savedTheme === "dark" ? "dark" : "light");

    themeToggle?.addEventListener("click", () => {
        const nextTheme =
            document.documentElement.dataset.theme === "dark"
                ? "light"
                : "dark";

        applyTheme(nextTheme);
        writeStorage("tripvistaTheme", nextTheme);
    });


    /* ==================== MOBILE NAVIGATION ==================== */

    const menuToggle = $("#menuToggle");
    const navLinks = $("#navLinks");

    function closeMobileMenu() {
        navLinks?.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");
    }

    menuToggle?.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    $$(".nav-links a").forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
    });

    $$("[data-open-auth]").forEach((button) => {
        button.addEventListener("click", () => {
            closeMobileMenu();
            openAuth(button.dataset.openAuth);
        });
    });


    /* ==================== NAVIGATION HIGHLIGHT ==================== */

    const navAnchors = $$(".nav-link");

    if ("IntersectionObserver" in window) {
        const navObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const id = entry.target.id;

                    navAnchors.forEach((link) => {
                        link.classList.toggle(
                            "active",
                            link.getAttribute("href") === `#${id}`
                        );
                    });
                });
            },
            {
                rootMargin: "-25% 0px -65% 0px"
            }
        );

        ["home", "destinations", "budget", "planner", "about"]
            .forEach((id) => {
                const section = document.getElementById(id);

                if (section) navObserver.observe(section);
            });
    }


    /* ==================== SCROLL REVEALS ==================== */

    const revealElements = $$(".reveal");

    if (
        "IntersectionObserver" in window &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -25px 0px"
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("visible");
        });
    }


    /* ==================== DESTINATION SEARCH/FILTER ==================== */

    const destinationSearch = $("#destinationSearch");
    const filterButtons = $$(".filter-btn");
    const destinationCards = $$(".destination-card");
    const noDestinationResults = $("#noDestinationResults");

    let currentFilter = "all";

    function filterDestinations() {
        const searchTerm = safeText(destinationSearch?.value).toLowerCase();

        let visibleCount = 0;

        destinationCards.forEach((card) => {
            const name = safeText(card.dataset.destination).toLowerCase();
            const description = safeText(card.dataset.description).toLowerCase();
            const categories = safeText(card.dataset.category)
                .toLowerCase()
                .split(/\s+/);

            const matchesSearch =
                name.includes(searchTerm) ||
                description.includes(searchTerm);

            const matchesFilter =
                currentFilter === "all" ||
                categories.includes(currentFilter);

            const visible = matchesSearch && matchesFilter;

            card.hidden = !visible;

            if (visible) visibleCount++;
        });

        if (noDestinationResults) {
            noDestinationResults.hidden = visibleCount !== 0;
        }
    }

    destinationSearch?.addEventListener("input", filterDestinations);

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            currentFilter = button.dataset.filter || "all";

            filterButtons.forEach((filterButton) => {
                const active = filterButton === button;

                filterButton.classList.toggle("active", active);
                filterButton.setAttribute("aria-pressed", String(active));
            });

            filterDestinations();
        });
    });

    /*
       Clicking a destination:
       1. Selects it in the budget calculator.
       2. Selects it in the trip planner.
       3. Scrolls to the budget calculator.
    */

    $$("[data-destination]").forEach((button) => {
        button.addEventListener("click", (event) => {
            const destination = button.dataset.destination;

            if (!destination) return;

            const budgetDestination = $("#budgetDestination");
            const plannerDestination = $("#destination");

            if (
                budgetDestination &&
                [...budgetDestination.options].some(
                    (option) => option.value === destination
                )
            ) {
                budgetDestination.value = destination;
                calculateBudget();
            }

            if (
                plannerDestination &&
                [...plannerDestination.options].some(
                    (option) => option.value === destination
                )
            ) {
                plannerDestination.value = destination;
            }

            /*
               The card itself also carries data-destination.
               Clicking the card background should not trigger this.
            */
            if (button.tagName === "BUTTON") {
                event.stopPropagation();
                $("#budget")?.scrollIntoView({ behavior: "smooth" });
            }
        });
    });


    /* ==================== BUDGET CALCULATOR ==================== */

    const budgetForm = $("#budgetForm");
    const resetBudgetButton = $("#resetBudget");

    const budgetInputs = {
        destination: $("#budgetDestination"),
        travelers: $("#budgetTravelers"),
        days: $("#budgetDays"),
        travel: $("#budgetTravel"),
        stay: $("#budgetStay"),
        rooms: $("#budgetRooms"),
        food: $("#budgetFood"),
        activities: $("#budgetActivities"),
        other: $("#budgetOther"),
        limit: $("#budgetLimit")
    };

    const defaultBudget = {
        destination: "Ooty",
        travelers: 2,
        days: 3,
        travel: 2000,
        stay: 1500,
        rooms: 1,
        food: 400,
        activities: 1000,
        other: 500,
        limit: 10000
    };

    /*
       Calculation assumptions:
       - Travel: total for the entire group.
       - Accommodation: price per room per night.
       - Nights: days minus one; a 3-day trip normally has 2 nights.
       - Food: per person per day.
       - Activities and other expenses: total for the group.
       - The entered budget limit applies to the entire trip.
    */

    function getBudgetValues() {
        return {
            destination: budgetInputs.destination.value,
            travelers: Number(budgetInputs.travelers.value),
            days: Number(budgetInputs.days.value),
            travel: Number(budgetInputs.travel.value),
            stay: Number(budgetInputs.stay.value),
            rooms: Number(budgetInputs.rooms.value),
            food: Number(budgetInputs.food.value),
            activities: Number(budgetInputs.activities.value),
            other: Number(budgetInputs.other.value),
            limit: Number(budgetInputs.limit.value)
        };
    }

    function calculateBudget() {
        if (!budgetForm) return null;

        if (!budgetForm.checkValidity()) {
            budgetForm.reportValidity();
            return null;
        }

        const values = getBudgetValues();

        const nights = Math.max(0, values.days - 1);

        const accommodationTotal =
            values.stay * values.rooms * nights;

        const foodTotal =
            values.food * values.travelers * values.days;

        const total =
            values.travel +
            accommodationTotal +
            foodTotal +
            values.activities +
            values.other;

        const perPerson = total / values.travelers;

        const hasBudgetLimit = values.limit > 0;

        const percentage = hasBudgetLimit
            ? (total / values.limit) * 100
            : 0;

        const safePercentage = Math.min(percentage, 100);

        $("#resultDestination").textContent =
            `Your trip to ${values.destination}`;

        $("#resultTotal").textContent = formatINR(total);
        $("#resultPerPerson").textContent = formatINR(perPerson);

        $("#resultTravel").textContent = formatINR(values.travel);
        $("#resultStay").textContent = formatINR(accommodationTotal);
        $("#resultFood").textContent = formatINR(foodTotal);
        $("#resultActivities").textContent = formatINR(values.activities);
        $("#resultOther").textContent = formatINR(values.other);

        const progress = $("#budgetProgress");
        const percentageLabel = $("#budgetPercentage");
        const status = $("#budgetStatus");
        const message = $("#budgetMessage");

        progress.classList.remove("over-budget");

        if (!hasBudgetLimit) {
            progress.style.width = "0%";
            percentageLabel.textContent = "No limit";
            status.textContent = "Budget limit not set";

            message.textContent =
                "Enter a budget limit above to compare your estimated expenses.";
        } else {
            progress.style.width = `${safePercentage}%`;
            percentageLabel.textContent = `${Math.round(percentage)}%`;

            if (total > values.limit) {
                progress.classList.add("over-budget");
                status.textContent = "Over budget";

                message.textContent =
                    `You're ${formatINR(total - values.limit)} above your limit.`;
            } else if (total === values.limit) {
                status.textContent = "Budget reached";

                message.textContent =
                    "Your estimated trip cost exactly matches your budget limit.";
            } else {
                status.textContent = "Within budget";

                message.textContent =
                    `${formatINR(values.limit - total)} remains in your budget.`;
            }
        }

        $("#budgetFeedback").textContent = "";

        return {
            destination: values.destination,
            travelers: values.travelers,
            days: values.days,
            nights,
            travel: values.travel,
            accommodation: accommodationTotal,
            food: foodTotal,
            activities: values.activities,
            other: values.other,
            limit: values.limit,
            total,
            perPerson,
            createdAt: new Date().toISOString()
        };
    }

    budgetForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const result = calculateBudget();

        if (result) {
            showToast("Your travel budget has been calculated.");
        }
    });

    /*
       Recalculate as the user changes valid values.
       Invalid temporary input is left for the browser to flag.
    */

    Object.values(budgetInputs).forEach((input) => {
        input?.addEventListener("input", () => {
            if (budgetForm.checkValidity()) {
                calculateBudget();
            }
        });

        input?.addEventListener("change", () => {
            if (budgetForm.checkValidity()) {
                calculateBudget();
            }
        });
    });

    resetBudgetButton?.addEventListener("click", () => {
        Object.entries(defaultBudget).forEach(([key, value]) => {
            if (budgetInputs[key]) {
                budgetInputs[key].value = value;
            }
        });

        calculateBudget();
        showToast("Calculator values reset.");
    });


    /* ==================== SAVED TRIPS ==================== */

    const savedTripsContainer = $("#savedTrips");

    function getSavedTrips() {
        const saved = readStorage("tripvistaTrips", []);

        return Array.isArray(saved) ? saved : [];
    }

    function saveTrips(trips) {
        return writeStorage("tripvistaTrips", trips);
    }

    function renderSavedTrips() {
        if (!savedTripsContainer) return;

        const trips = getSavedTrips();

        savedTripsContainer.replaceChildren();

        if (trips.length === 0) {
            const empty = document.createElement("div");

            empty.className = "empty-trips";

            const icon = document.createElement("span");
            icon.className = "empty-trips-icon";
            icon.textContent = "✈";
            icon.setAttribute("aria-hidden", "true");

            const heading = document.createElement("h3");
            heading.textContent = "Your next adventure starts here.";

            const description = document.createElement("p");
            description.textContent =
                "Calculate a budget or create a trip to see it here.";

            const link = document.createElement("a");
            link.className = "text-link";
            link.href = "#budget";
            link.textContent = "Calculate a budget ↗";

            empty.append(icon, heading, description, link);
            savedTripsContainer.append(empty);

            return;
        }

        trips.forEach((trip) => {
            const card = document.createElement("article");
            card.className = "saved-trip-card";

            const eyebrow = document.createElement("span");
            eyebrow.className = "eyebrow";
            eyebrow.textContent = trip.type === "plan"
                ? "TRIP PLAN"
                : "BUDGET ESTIMATE";

            const heading = document.createElement("h3");
            heading.textContent = trip.destination || "My Trip";

            const description = document.createElement("p");

            if (trip.type === "plan") {
                description.textContent =
                    `${trip.travelers} traveller(s) · ` +
                    `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`;
            } else {
                description.textContent =
                    `${trip.travelers} traveller(s) · ${trip.days} day(s)`;
            }

            const cost = document.createElement("strong");
            cost.className = "saved-trip-cost";
            cost.textContent = trip.total != null
                ? formatINR(trip.total)
                : "Budget not calculated";

            const actions = document.createElement("div");
            actions.className = "saved-trip-actions";

            const loadButton = document.createElement("button");
            loadButton.className = "small-action";
            loadButton.type = "button";
            loadButton.textContent = "View / Load";

            loadButton.addEventListener("click", () => {
                if (trip.type === "budget") {
                    loadBudgetTrip(trip);
                } else {
                    loadPlannedTrip(trip);
                }
            });

            const deleteButton = document.createElement("button");
            deleteButton.className = "small-action danger";
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                const updatedTrips = getSavedTrips().filter(
                    (item) => item.id !== trip.id
                );

                if (saveTrips(updatedTrips)) {
                    renderSavedTrips();
                    showToast("Saved item deleted.");
                }
            });

            actions.append(loadButton, deleteButton);

            card.append(eyebrow, heading, description, cost, actions);
            savedTripsContainer.append(card);
        });
    }

    function saveBudgetEstimate() {
        const result = calculateBudget();

        if (!result) return;

        const trips = getSavedTrips();

        trips.unshift({
            ...result,
            id: crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,
            type: "budget"
        });

        if (saveTrips(trips.slice(0, 30))) {
            renderSavedTrips();

            $("#budgetFeedback").textContent =
                "Your estimate was saved in My Trips on this browser.";

            showToast("Budget estimate saved!");
        }
    }

    $("#saveBudgetTrip")?.addEventListener("click", saveBudgetEstimate);

    function loadBudgetTrip(trip) {
        const values = {
            destination: trip.destination,
            travelers: trip.travelers,
            days: trip.days,
            travel: trip.travel,
            stay: trip.nights > 0
                ? trip.accommodation / trip.nights / Math.max(1, trip.rooms || 1)
                : 0,
            rooms: trip.rooms || 1,
            food: trip.days > 0 && trip.travelers > 0
                ? trip.food / trip.days / trip.travelers
                : 0,
            activities: trip.activities,
            other: trip.other,
            limit: trip.limit
        };

        Object.entries(values).forEach(([key, value]) => {
            if (budgetInputs[key] && value !== undefined) {
                budgetInputs[key].value = value;
            }
        });

        calculateBudget();

        $("#budget").scrollIntoView({ behavior: "smooth" });
        showToast("Estimate loaded into the calculator.");
    }
        /* ==================== QUICK TRIP PLANNER ==================== */

    const quickPlanForm = $("#quickPlanForm");
    const startDate = $("#startDate");
    const endDate = $("#endDate");
    const planMessage = $("#planMessage");
    const tripPlanResult = $("#tripPlanResult");

    function todayISO() {
        const now = new Date();
        const localDate = new Date(
            now.getTime() - now.getTimezoneOffset() * 60000
        );

        return localDate.toISOString().slice(0, 10);
    }

    if (startDate && endDate) {
        startDate.min = todayISO();
        endDate.min = startDate.value || todayISO();
    }

    startDate?.addEventListener("change", () => {
        if (!startDate.value || !endDate) return;

        endDate.min = startDate.value;

        if (endDate.value && endDate.value < startDate.value) {
            endDate.value = "";
        }
    });

    let currentTripPlan = null;

    quickPlanForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!quickPlanForm.checkValidity()) {
            quickPlanForm.reportValidity();
            return;
        }

        const destination = $("#destination").value;
        const travelers = Number($("#travellers").value);
        const start = startDate.value;
        const end = endDate.value;

        if (end < start) {
            planMessage.textContent =
                "Your return date must be on or after your departure date.";

            return;
        }

        const startTime = new Date(`${start}T00:00:00`).getTime();
        const endTime = new Date(`${end}T00:00:00`).getTime();

        const days = Math.round(
            (endTime - startTime) / (1000 * 60 * 60 * 24)
        ) + 1;

        currentTripPlan = {
            id: crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,
            type: "plan",
            destination,
            travelers,
            startDate: start,
            endDate: end,
            days,
            nights: Math.max(0, days - 1),
            travelStyle: $("#travelStyle").value,
            createdAt: new Date().toISOString()
        };

        planMessage.textContent =
            "Your trip details are ready. You can save this plan below.";

        tripPlanResult.replaceChildren();

        const heading = document.createElement("h4");
        heading.textContent = `${destination} adventure`;

        const dates = document.createElement("p");
        dates.textContent =
            `${formatDate(start)} – ${formatDate(end)}`;

        const duration = document.createElement("p");
        duration.textContent =
            `${days} day(s), ${Math.max(0, days - 1)} night(s) · ` +
            `${travelers} traveller(s)`;

        const style = document.createElement("p");
        style.textContent = `Travel style: ${currentTripPlan.travelStyle}`;

        const note = document.createElement("p");
        note.textContent =
            "This is a trip outline. It does not book transport or accommodation.";

        const saveButton = document.createElement("button");
        saveButton.type = "button";
        saveButton.className = "btn btn-primary btn-full";
        saveButton.textContent = "Save This Trip";

        saveButton.addEventListener("click", saveCurrentTripPlan);

        const budgetButton = document.createElement("button");
        budgetButton.type = "button";
        budgetButton.className = "btn btn-outline btn-full";
        budgetButton.textContent = "Estimate Trip Budget";

        budgetButton.addEventListener("click", () => {
            const budgetDestination = $("#budgetDestination");
            const budgetTravelers = $("#budgetTravelers");
            const budgetDays = $("#budgetDays");

            if (
                [...budgetDestination.options].some(
                    (option) => option.value === destination
                )
            ) {
                budgetDestination.value = destination;
            }

            budgetTravelers.value = travelers;
            budgetDays.value = days;

            calculateBudget();

            $("#budget").scrollIntoView({ behavior: "smooth" });
        });

        tripPlanResult.append(
            heading,
            dates,
            duration,
            style,
            note,
            saveButton,
            budgetButton
        );

        tripPlanResult.hidden = false;

        showToast("Trip outline created.");
    });

    function saveCurrentTripPlan() {
        if (!currentTripPlan) return;

        const trips = getSavedTrips();

        if (trips.some((trip) => trip.id === currentTripPlan.id)) {
            showToast("This trip has already been saved.");
            return;
        }

        trips.unshift(currentTripPlan);

        if (saveTrips(trips.slice(0, 30))) {
            renderSavedTrips();
            showToast("Trip saved in My Trips!");
        }
    }

    function loadPlannedTrip(trip) {
        $("#destination").value = trip.destination;
        $("#travellers").value = trip.travelers;
        $("#startDate").value = trip.startDate;
        $("#endDate").value = trip.endDate;
        $("#travelStyle").value = trip.travelStyle || "Relaxed";

        endDate.min = trip.startDate;

        $("#planner").scrollIntoView({ behavior: "smooth" });

        showToast("Trip details loaded into the planner.");
    }


    /* ==================== AUTH MODAL ==================== */

    const authModal = $("#authModal");
    const closeAuthButton = $("#closeAuth");
    const signinForm = $("#signinForm");
    const signupForm = $("#signupForm");
    const authTitle = $("#authTitle");
    const authEyebrow = $("#authEyebrow");
    const authDescription = $("#authDescription");
    const authSwitchText = $("#authSwitchText");
    const switchAuthButton = $("#switchAuth");
    const authMessage = $("#authMessage");

    let authMode = "signin";
    let lastFocusedElement = null;

    function setAuthMessage(message, isError = false) {
        authMessage.textContent = message;
        authMessage.classList.toggle("error", isError);
    }

    function updateAuthMode(mode) {
        authMode = mode === "signup" ? "signup" : "signin";

        const isSignup = authMode === "signup";

        signinForm.hidden = isSignup;
        signupForm.hidden = !isSignup;

        authEyebrow.textContent = isSignup
            ? "START YOUR JOURNEY"
            : "WELCOME BACK";

        authTitle.textContent = isSignup
            ? "Create your demo account."
            : "Your next adventure awaits.";

        authDescription.textContent = isSignup
            ? "Set up a local front-end demo profile."
            : "Try the sign-in form for this project demo.";

        authSwitchText.firstChild.textContent = isSignup
            ? "Already explored TripVista? "
            : "New to TripVista? ";

        switchAuthButton.textContent = isSignup
            ? "Sign in"
            : "Create a demo account";

        setAuthMessage("");
    }

    function openAuth(mode = "signin") {
        if (!authModal) return;

        lastFocusedElement = document.activeElement;

        authModal.hidden = false;
        document.body.classList.add("modal-open");

        updateAuthMode(mode);

        const firstInput = isSignupMode()
            ? $("#signupName")
            : $("#signinEmail");

        firstInput?.focus();
    }

    function isSignupMode() {
        return authMode === "signup";
    }

    function closeAuth() {
        if (!authModal) return;

        authModal.hidden = true;
        document.body.classList.remove("modal-open");

        lastFocusedElement?.focus?.();
    }

    closeAuthButton?.addEventListener("click", closeAuth);

    authModal?.addEventListener("click", (event) => {
        if (event.target === authModal) {
            closeAuth();
        }
    });

    switchAuthButton?.addEventListener("click", () => {
        updateAuthMode(authMode === "signin" ? "signup" : "signin");
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            if (authModal && !authModal.hidden) {
                closeAuth();
            }

            closeChat();
            closeMobileMenu();
        }
    });

    /*
       Demo account handling:
       - No password is stored.
       - No real authentication occurs.
       - The sign-in form only demonstrates validation and UI.
    */

    signupForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!signupForm.checkValidity()) {
            signupForm.reportValidity();
            return;
        }

        const password = $("#signupPassword").value;
        const confirmPassword = $("#confirmPassword").value;

        if (password.length < 8) {
            setAuthMessage(
                "Use at least 8 characters for the demo password.",
                true
            );

            return;
        }

        if (password !== confirmPassword) {
            setAuthMessage("The passwords do not match.", true);
            $("#confirmPassword").focus();
            return;
        }

        const name = safeText($("#signupName").value);

        setAuthMessage(
            `Demo form validated, ${name}. No account was created and no password was saved.`
        );

        showToast("Demo sign-up form validated.");
    });

    signinForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!signinForm.checkValidity()) {
            signinForm.reportValidity();
            return;
        }

        setAuthMessage(
            "The form is valid, but real sign-in requires a secure authentication backend."
        );

        showToast("Sign-in demo validated.");
    });

    $$("[data-toggle-password]").forEach((button) => {
        button.addEventListener("click", () => {
            const input = document.getElementById(
                button.dataset.togglePassword
            );

            if (!input) return;

            const showing = input.type === "text";

            input.type = showing ? "password" : "text";
            button.textContent = showing ? "Show" : "Hide";
        });
    });


    /* ==================== CHATBOT ==================== */

    const chatLauncher = $("#chatLauncher");
    const openChatButton = $("#openChat");
    const footerChatButton = $("#footerChat");
    const chatPanel = $("#chatPanel");
    const closeChatButton = $("#closeChat");
    const chatForm = $("#chatForm");
    const chatInput = $("#chatInput");
    const chatMessages = $("#chatMessages");

    function openChat() {
        chatPanel.hidden = false;
        chatLauncher.setAttribute("aria-expanded", "true");
        chatInput.focus();
    }

    function closeChat() {
        if (!chatPanel || chatPanel.hidden) return;

        chatPanel.hidden = true;
        chatLauncher.setAttribute("aria-expanded", "false");
    }

    chatLauncher?.addEventListener("click", () => {
        if (chatPanel.hidden) {
            openChat();
        } else {
            closeChat();
        }
    });

    openChatButton?.addEventListener("click", openChat);
    footerChatButton?.addEventListener("click", openChat);
    closeChatButton?.addEventListener("click", closeChat);

    function addChatMessage(message, type = "assistant") {
        const bubble = document.createElement("div");

        bubble.className = type === "user"
            ? "chat-bubble user-bubble"
            : "chat-bubble assistant-bubble";

        // textContent prevents user-entered HTML from being interpreted.
        bubble.textContent = message;

        chatMessages.append(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return bubble;
    }

    function getChatReply(message) {
        const text = message.toLowerCase();

        if (
            text.includes("budget") ||
            text.includes("cheap") ||
            text.includes("afford") ||
            text.includes("cost")
        ) {
            return (
                "For budget planning, open the Travel Budget Calculator. " +
                "Enter your travel, accommodation, food and activity expenses, " +
                "then set a budget limit. Compare several estimates before booking."
            );
        }

        if (
            text.includes("pack") ||
            text.includes("packing") ||
            text.includes("luggage")
        ) {
            return (
                "Packing checklist: ID documents, booking details, suitable clothes, " +
                "comfortable shoes, toiletries, medicines you normally use, a charger, " +
                "a power bank and a reusable water bottle. Check the weather and " +
                "transport rules for your destination."
            );
        }

        if (
            text.includes("ooty") ||
            text.includes("munnar") ||
            text.includes("coorg") ||
            text.includes("manali") ||
            text.includes("mountain") ||
            text.includes("hill")
        ) {
            return (
                "For a hill escape, consider Ooty, Munnar, Coorg or Manali. " +
                "Compare travel time, season, accommodation and local transport. " +
                "Use the destination cards to select a place and start your estimate."
            );
        }

        if (
            text.includes("goa") ||
            text.includes("beach") ||
            text.includes("andaman")
        ) {
            return (
                "For a beach holiday, explore Goa or the Andaman Islands. " +
                "Compare transport and accommodation costs, and check local weather " +
                "and any activity restrictions before confirming your plans."
            );
        }

        if (
            text.includes("plan") ||
            text.includes("itinerary") ||
            text.includes("trip")
        ) {
            return (
                "Start by choosing a destination and dates in the Trip Planner. " +
                "Check the trip duration, estimate the budget, and then organise " +
                "your daily activities. This demo creates an outline, not a booking."
            );
        }

        if (
            text.includes("food") ||
            text.includes("eat") ||
            text.includes("restaurant")
        ) {
            return (
                "Include daily meals and drinking water in your budget. " +
                "Research local food options and current opening hours before you go. " +
                "TripVista's calculator lets you adjust food costs per person per day."
            );
        }

        if (
            text.includes("hello") ||
            text.includes("hi") ||
            text.includes("hey")
        ) {
            return (
                "Hey, traveller! 👋 Where are you thinking of going? " +
                "I can offer demo guidance about destinations, packing and budgeting."
            );
        }

        if (
            text.includes("help") ||
            text.includes("what can you do")
        ) {
            return (
                "I can provide predefined tips about trip planning, destination ideas, " +
                "packing and budgeting. Try asking: 'Suggest a budget trip' or " +
                "'What should I pack?' I'm a rule-based demo, not a real AI model."
            );
        }

        return (
            "That sounds like something worth planning! I can help with basic " +
            "destination ideas, packing tips and budget planning. Try asking about " +
            "Ooty, Goa, a budget trip, packing or how to plan an itinerary."
        );
    }

    function sendChatMessage(message) {
        const cleanMessage = safeText(message).slice(0, 500);

        if (!cleanMessage) return;

        addChatMessage(cleanMessage, "user");

        const prompts = $(".chat-prompts", chatMessages);

        if (prompts) prompts.remove();

        const reply = getChatReply(cleanMessage);

        // Keep the demo chat from growing without limit.
        const existingBubbles = $$(".chat-bubble", chatMessages);

        if (existingBubbles.length > 24) {
            existingBubbles.slice(0, 4).forEach((bubble) => bubble.remove());
        }

        addChatMessage(reply, "assistant");
    }

    chatForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const message = chatInput.value;

        if (!safeText(message)) return;

        chatInput.value = "";
        sendChatMessage(message);
        chatInput.focus();
    });

    $$("[data-prompt]").forEach((button) => {
        button.addEventListener("click", () => {
            sendChatMessage(button.dataset.prompt);
        });
    });


    /* ==================== FOOTER ==================== */

    $("#currentYear").textContent = new Date().getFullYear();


    /* ==================== INITIALISE ==================== */

    calculateBudget();
    renderSavedTrips();

});