
let selectedNumber = "";
let conversations = {};

async function loadConversations() {
  const res = await fetch("https://twilio-whatsapp-backend.onrender.com/api/conversations");
  const data = await res.json();
  conversations = data;

  const list = document.getElementById("conversationList");
  list.innerHTML = "";

  const sorted = Object.entries(data).sort((a, b) => {
    const aTime = new Date(a[1][a[1].length - 1].timestamp).getTime();
    const bTime = new Date(b[1][b[1].length - 1].timestamp).getTime();
    return bTime - aTime;
  });

  for (const [number, msgs] of sorted) {
    const last = msgs[msgs.length - 1].message;
    const unread = msgs.some(m => !m.read);
    const div = document.createElement("div");
    div.className = "conversation" + (unread ? " unread" : "");
    div.innerText = number + ": " + last;
    div.onclick = () => loadMessages(number);
    list.appendChild(div);
  }
}

function loadMessages(number) {
  selectedNumber = number;
  const msgs = conversations[number];
  const box = document.getElementById("messages");
  box.innerHTML = "";
  msgs.forEach(msg => {
    const div = document.createElement("div");
    div.className = "message" + (msg.sent ? " sent" : "");
    div.innerText = msg.message;
    box.appendChild(div);
  });
}

async function sendMessage() {
  const text = document.getElementById("messageInput").value;
  if (!text || !selectedNumber) return;

  await fetch("https://twilio-whatsapp-backend.onrender.com/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: selectedNumber, message: text })
  });

  document.getElementById("messageInput").value = "";
  loadConversations();
}

loadConversations();
setInterval(loadConversations, 5000);
