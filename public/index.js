// public/main.js
const messagesEl = document.getElementById("messages");
const form = document.getElementById("chat-form");
const promptInput = document.getElementById("prompt");
const sendBtn = document.getElementById("send-btn");

// Chat history (user + assistant) – kept on frontend and sent each time
const chatHistory = [
  {
    role: "assistant",
    content: "Hello ! I am an AI assistant here to help with an AI-based mechanical fault diagnosis system! 😊 My role is to support a project that uses a rule-based expert system and a Decision Tree ML model to detect faults such as overheating, bearing wear, misalignment, lubrication issues, cavitation, and general wear using inputs like temperature, vibration, noise, rpm, pressure, and runtime hours. I’ll always keep my responses focused on this project, predictive maintenance, mechanical diagnostics, rule-based reasoning, and machine learning for rotating machinery.\n\nIf anything you ask is unclear, I’ll interpret it within the context of this fault diagnosis bot, and I’ll avoid unrelated AI topics unless you specifically request them.",
  },
];

function renderMessages() {
  messagesEl.innerHTML = "";

  chatHistory.forEach((m) => {
    const wrapper = document.createElement("div");
    wrapper.className = `flex ${m.role === "user" ? "justify-end" : "justify-start"}`;

    const bubble = document.createElement("div");
    bubble.className =
      "max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap " +
      (m.role === "user"
        ? "bg-primary-500 text-slate-900 rounded-br-sm"
        : "bg-slate-800 text-slate-100 rounded-bl-sm");

    bubble.textContent = m.content;
    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
  });

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Initial render
renderMessages();

async function sendMessage(text) {
  // push user message
  chatHistory.push({ role: "user", content: text });
  renderMessages();

  // temporary "typing" bubble
  const thinkingMsg = { role: "assistant", content: "Thinking..." };
  chatHistory.push(thinkingMsg);
  renderMessages();

  sendBtn.disabled = true;
  promptInput.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory.slice(0, -1) }), // skip "Thinking..."
    });

    const data = await res.json();

    // replace the "Thinking..." with real reply
    chatHistory.pop();
    chatHistory.push({
      role: "assistant",
      content: data.reply ?? "No response 😅",
    });
  } catch (err) {
    console.error(err);
    chatHistory.pop();
    chatHistory.push({
      role: "assistant",
      content: "⚠️ Error talking to server.",
    });
  } finally {
    sendBtn.disabled = false;
    renderMessages();
    promptInput.focus();
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = promptInput.value.trim();
  if (!text) return;
  sendMessage(text);
});
