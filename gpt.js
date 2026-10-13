const form = document.getElementById("chatForm");
const promptBox = document.getElementById("prompt");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const history = document.getElementById("history");
const sidebar = document.getElementById("sidebar");
const sendButton = document.getElementById("sendButton");
const toast = document.getElementById("toast");

let isThinking = false;
let toastTimer;

// Show a small notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// Create message elements safely
function addMessage(text, sender) {
  const article = document.createElement("article");
  article.className = `message ${sender}-message`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";

  if (sender === "ai") {
    avatar.classList.add("ai-avatar");
    avatar.textContent = "✦";
  } else {
    avatar.textContent = "A";
  }

  const content = document.createElement("div");
  content.className = "message-content";

  const name = document.createElement("div");
  name.className = "message-name";
  name.textContent = sender === "user" ? "You" : "NovaGPT";

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  content.append(name, paragraph);
  article.append(avatar, content);
  messages.appendChild(article);

  // Add copy button for AI responses
  if (sender === "ai") {
    const actions = document.createElement("div");
    actions.className = "message-actions";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "copy-response";
    copyButton.textContent = "▢ Copy";
    copyButton.dataset.copy = text;

    actions.appendChild(copyButton);
    content.appendChild(actions);
  }

  article.scrollIntoView({
    behavior: "smooth",
    block: "end"
  });

  return article;
}

// Demo answers: replace this function when connecting
// your real AI API.
function replyFor(text) {
  const question = text.toLowerCase().trim();

  if (question.includes("html")) {
    return "HTML stands for HyperText Markup Language. " +
      "It creates the structure of a webpage using headings, " +
      "paragraphs, images, links and buttons.";
  }

  if (question.includes("css")) {
    return "CSS controls how your website looks. " +
      "It manages colors, fonts, spacing, layouts, " +
      "animations and mobile responsiveness.";
  }

  if (
    question.includes("javascript") ||
    question.includes(" java script")
  ) {
    return "JavaScript makes websites interactive. " +
      "It can respond to button clicks, validate forms, " +
      "update content and communicate with APIs.";
  }

  if (
    question.includes("c++") ||
    question.includes("cpp")
  ) {
    return "C++ is a programming language. Start with " +
      "variables, input/output, conditions, loops, arrays " +
      "and functions. Then practise small problems.";
  }

  if (question.includes("website")) {
    return "A website usually has three main parts:\n\n" +
      "1. HTML — structure\n" +
      "2. CSS — appearance\n" +
      "3. JavaScript — interactions\n\n" +
      "Build a small page first, then add features gradually.";
  }

  if (
    question.includes("hello") ||
    question === "hi" ||
    question.startsWith("hey")
  ) {
    return "Hey there! ♡ What would you like to learn or create today?";
  }

  if (question.includes("exercise") ||
      question.includes("practice")) {
    return "Try this beginner exercise:\n\n" +
      "Write a C++ program that takes a number as input " +
      "and prints whether it is even or odd.\n\n" +
      "Hint: use the % operator. Give it a try!";
  }

  return "Thanks for your question! ♡\n\n" +
    "I'm currently running in demo mode, so I can't " +
    "generate a real AI answer yet. Connect your Groq API " +
    "through a secure backend to enable real AI responses.";
}

// Add a topic to the sidebar
function addHistoryItem(text) {
  // Reuse an existing item for the same prompt
  const existing = [...history.children].find(
    item => item.dataset.prompt === text
  );

  if (existing) {
    history.prepend(existing);
    return;
  }

  const item = document.createElement("button");
  item.type = "button";
  item.className = "history-item";
  item.dataset.prompt = text;

  const icon = document.createElement("span");
  icon.textContent = "✧";

  const label = document.createElement("span");
  label.textContent =
    text.length > 25 ? text.slice(0, 25) + "…" : text;

  item.append(icon, label);

  item.addEventListener("click", () => {
    // Start a fresh conversation using the selected prompt
    resetChat();
    sendMessage(text);
  });

  history.prepend(item);
}

// Display the typing indicator
function showTyping() {
  const article = document.createElement("article");
  article.className = "message ai-message";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar ai-avatar";
  avatar.textContent = "✦";

  const content = document.createElement("div");
  content.className = "message-content";

  const name = document.createElement("div");
  name.className = "message-name";
  name.textContent = "NovaGPT";

  const typing = document.createElement("p");
  typing.className = "typing";
  typing.textContent = "Thinking...";

  content.append(name, typing);
  article.append(avatar, content);
  messages.appendChild(article);

  article.scrollIntoView({
    behavior: "smooth",
    block: "end"
  });

  return article;
}

// Send a message
async function sendMessage(text) {
  text = text.trim();

  if (!text || isThinking) return;

  isThinking = true;
  sendButton.disabled = true;

  welcome.style.display = "none";

  addMessage(text, "user");
  addHistoryItem(text);

  promptBox.value = "";
  promptBox.style.height = "auto";

  const loading = showTyping();

  try {
    // Demo mode: a short delay before showing a reply.
    // This is NOT a real AI API request.
    await new Promise(resolve => setTimeout(resolve, 650));

    loading.remove();
    addMessage(replyFor(text), "ai");

  } catch (error) {
    loading.remove();
    addMessage("Something went wrong. Please try again.", "ai");
  } finally {
    isThinking = false;
    sendButton.disabled = false;
    promptBox.focus();
  }
}

// Handle sending the form
form.addEventListener("submit", event => {
  event.preventDefault();
  sendMessage(promptBox.value);
});

// Send with Enter; use Shift + Enter for a new line
promptBox.addEventListener("keydown", event => {
  if (
    event.key === "Enter" &&
    !event.shiftKey &&
    !event.isComposing
  ) {
    event.preventDefault();
    form.requestSubmit();
  }
});

// Automatically resize the text area
promptBox.addEventListener("input", () => {
  promptBox.style.height = "auto";
  promptBox.style.height =
    Math.min(promptBox.scrollHeight, 130) + "px";
});

// Handle suggestion buttons
document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    sendMessage(button.dataset.prompt);
  });
});

// Reset the current conversation
function resetChat() {
  messages.replaceChildren();
  welcome.style.display = "block";
  promptBox.value = "";
  promptBox.style.height = "auto";
  sidebar.classList.remove("open");
  promptBox.focus();
}

document.getElementById("newChat")
  .addEventListener("click", resetChat);

document.getElementById("topNew")
  .addEventListener("click", resetChat);

// Mobile sidebar
document.getElementById("mobileMenu")
  .addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

// Help button
document.getElementById("helpButton")
  .addEventListener("click", () => {
    showToast("Tip: Ask a question or choose a suggestion ♡");
  });

// Copy responses
document.addEventListener("click", async event => {
  const button = event.target.closest(".copy-response");

  if (!button) return;

  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    button.textContent = "✓ Copied";
    showToast("Response copied!");

    setTimeout(() => {
      button.textContent = "▢ Copy";
    }, 1500);
  } catch {
    showToast("Copy unavailable. Try using HTTPS or localhost.");
  }
});