document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");
    const chatLauncher = document.getElementById("chatLauncher");
    const chatPanel = document.getElementById("chatPanel");
    const closeChat = document.getElementById("closeChat");

    if (!chatForm || !chatInput || !chatMessages) return;

    // Open chatbot
    chatLauncher?.addEventListener("click", () => {
        chatPanel.hidden = false;
        chatLauncher.setAttribute("aria-expanded", "true");
        chatInput.focus();
    });

    // Close chatbot
    closeChat?.addEventListener("click", () => {
        chatPanel.hidden = true;
        chatLauncher?.setAttribute("aria-expanded", "false");
    });

    // Generate chatbot response
    function getBotResponse(message) {
        const text = message.toLowerCase();

        if (text.includes("hello") || text.includes("hi")) {
            return "Hello! Welcome to TripVista. How can I help you plan your trip?";
        }

        if (text.includes("destination") || text.includes("places")) {
            return "You can explore destinations like Paris, Tokyo, Bali, London and many more!";
        }

        if (text.includes("budget") || text.includes("cost")) {
            return "Use our travel budget calculator to estimate your trip expenses.";
        }

        if (text.includes("hotel") || text.includes("stay")) {
            return "You can compare accommodation options based on your destination and budget.";
        }

        if (text.includes("flight")) {
            return "Compare different airlines and book early to find better prices.";
        }

        if (text.includes("packing")) {
            return "Pack comfortable clothes, travel documents, chargers, toiletries and essential medicines.";
        }

        if (text.includes("thank")) {
            return "You're welcome! Happy travelling!";
        }

        return "I'm here to help with destinations, travel budgets, hotels, packing and trip planning. Could you ask me something about these?";
    }

    // Display messages
    function addMessage(message, sender) {
        const messageElement = document.createElement("div");

        messageElement.classList.add(
            sender === "user" ? "user-msg" : "bot-msg"
        );

        messageElement.textContent = message;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message
    chatForm.addEventListener("submit", event => {
        event.preventDefault();

        const message = chatInput.value.trim();

        if (!message) return;

        addMessage(message, "user");

        chatInput.value = "";

        setTimeout(() => {
            addMessage(getBotResponse(message), "bot");
        }, 400);
    });
});