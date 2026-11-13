document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    const savedTheme = localStorage.getItem("tripvista-theme") || "light";

    document.documentElement.setAttribute("data-theme", savedTheme);

    function updateIcon(theme) {
        if (themeIcon) {
            themeIcon.textContent = theme === "dark" ? "☀" : "☾";
        }
    }

    updateIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme =
                document.documentElement.getAttribute("data-theme");

            const newTheme = currentTheme === "dark" ? "light" : "dark";

            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("tripvista-theme", newTheme);

            updateIcon(newTheme);
        });
    }
});