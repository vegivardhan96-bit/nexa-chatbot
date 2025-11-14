// public/main.js
const messagesEl = document.getElementById("messages");
const form = document.getElementById("chat-form");
const promptInput = document.getElementById("prompt");
const sendBtn = document.getElementById("send-btn");

// Chat history (user + assistant) – kept on frontend and sent each time
const chatHistory = [
  {
    role: "assistant",
    content: "Hello! 😊 I’m your AI assistant for mechanical fault diagnosis. I analyze inputs like temperature, vibration, noise, rpm, pressure, and runtime hours to help identify issues such as overheating, bearing wear, misalignment, lubrication problems, cavitation, and general wear. I use a mix of rule-based reasoning and machine-learning logic to give accurate, maintenance-focused answers. Throughout the conversation, I’ll keep my responses strictly aligned with mechanical diagnostics and fault detection. If any question is unclear, I’ll interpret it in the context of this fault diagnosis system and avoid unrelated topics unless you ask for them.",
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

