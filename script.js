let selectedNumber = "";
let conversations = {};

async function loadConversations() {
  try {
    const res = await fetch("https://twilio-whatsapp-backend.onrender.com/api/conversations");
    const data = await res.json();
    conversations = data;

    const list = document.getElementById("conversationList");
    list.innerHTML = "";

    const sorted = Object.entries(data).sort((a, b) => {
      const aMsgs = a[1];
      const bMsgs = b[1];
      const aTime = new Date(aMsgs[aMsgs.length - 1].timestamp).getTime();
      const bTime = new Date(bMsgs[bMsgs.length - 1].timestamp).getTime();
      return bTime - aTime;
    });

    for (const [number, msgs] of sorted) {
      const last = msgs[msgs.length - 1]?.message || "";
      const div = document.createElement("div");
      div.className = "conversation" + (number === selectedNumber ? " selected" : "");
      div.innerHTML = `<strong>${number}</strong><br/><small>${last}</small>`;
      div.onclick = () => loadMessages(number);
      list.appendChild(div);
    }
  } catch (err) {
    console.error("Erreur de chargement des conversations", err);
  }
}

function loadMessages(number) {
  selectedNumber = number;
  const msgs = conversations[number] || [];
  const box = document.getElementById("messages");
  box.innerHTML = "";

  msgs.forEach(msg => {
    const div = document.createElement("div");
    div.className = "message " + (msg.sent ? "sent" : "received");
    div.textContent = msg.message;
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

async function sendMessage() {
  const text = document.getElementById("messageInput").value;
  if (!text || !selectedNumber) return;

  try {
    await fetch("https://twilio-whatsapp-backend.onrender.com/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: selectedNumber, message: text })
    });

    document.getElementById("messageInput").value = "";
    await loadConversations();
    loadMessages(selectedNumber);
  } catch (err) {
    console.error("Erreur envoi message", err);
  }
}

loadConversations();
setInterval(loadConversations, 5000);
