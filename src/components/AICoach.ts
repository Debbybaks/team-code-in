import { iconString, ICONS } from "../icons";
import { parseMarkdown } from "../markdown";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

let chatMessages: ChatMessage[] = [
  { role: "bot", text: "Hi! I'm your AI Pricing Coach. Ask me anything about pricing your products, reducing costs, or growing your business." },
];

let isProcessing = false;
let panelInitialized = false;

export function renderAICoach(): void {
  if (panelInitialized) return;

  const panel = document.createElement("div");
  panel.className = "coach-panel";
  panel.id = "aiCoachPanel";
  panel.innerHTML = `
    <div class="coach-panel-handle"></div>
    <div class="coach-panel-header">
      <span class="coach-panel-title">${iconString(ICONS.sparkles, 18)} AI Pricing Coach <span style="font-size:0.7rem;font-weight:600;padding:0.1rem 0.35rem;border-radius:10px;background:rgba(224,86,118,0.12);color:var(--rose);margin-left:0.4rem;display:inline-block;vertical-align:middle;">₦2,400/mo</span></span>
      <button class="coach-panel-close" id="coachClose">${iconString(ICONS.close, 20)}</button>
    </div>
    <div class="coach-messages" id="coachMessages"></div>
    <div class="coach-input-wrap">
      <input type="text" id="coachInput" placeholder="Ask about pricing, costs, or strategy…" />
      <button id="coachSendBtn" disabled>${iconString(ICONS.arrowRight, 18)}</button>
    </div>
  `;

  document.body.appendChild(panel);
  panelInitialized = true;

  // Render initial messages
  renderMessages();

  // Close button
  document.getElementById("coachClose")!.addEventListener("click", () => {
    panel.classList.remove("open");
  });

  // Input handler
  const input = document.getElementById("coachInput") as HTMLInputElement;
  const sendBtn = document.getElementById("coachSendBtn") as HTMLButtonElement;

  input.addEventListener("input", () => {
    sendBtn.disabled = !input.value.trim() || isProcessing;
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !sendBtn.disabled) sendMessage();
  });

  sendBtn.addEventListener("click", sendMessage);
}

function renderMessages(): void {
  const container = document.getElementById("coachMessages")!;
  container.innerHTML = chatMessages.map(msg => `
    <div class="coach-msg ${msg.role}">${parseMarkdown(msg.text)}</div>
  `).join("");
  container.scrollTop = container.scrollHeight;
}

function showTyping(): void {
  const container = document.getElementById("coachMessages")!;
  container.innerHTML += `
    <div class="coach-msg bot" id="typingIndicator">
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>
  `;
  container.scrollTop = container.scrollHeight;
}

function removeTyping(): void {
  document.getElementById("typingIndicator")?.remove();
}

async function sendMessage(): Promise<void> {
  const input = document.getElementById("coachInput") as HTMLInputElement;
  const text = input.value.trim();
  if (!text || isProcessing) return;

  isProcessing = true;
  input.value = "";
  (document.getElementById("coachSendBtn") as HTMLButtonElement).disabled = true;

  // Add user message
  chatMessages.push({ role: "user", text });
  renderMessages();

  // Show typing
  showTyping();

  try {
    const response = await getCoachResponse(text);
    removeTyping();
    chatMessages.push({ role: "bot", text: response });
    renderMessages();
  } catch {
    removeTyping();
    chatMessages.push({
      role: "bot",
      text: "I couldn't process that right now. Please try asking in a different way, or check that your API key is configured.",
    });
    renderMessages();
  }

  isProcessing = false;
  (document.getElementById("coachSendBtn") as HTMLButtonElement).disabled = false;
}

async function getCoachResponse(userMessage: string): Promise<string> {
  const API_KEY = typeof import.meta !== "undefined" ? import.meta.env?.VITE_OPENROUTER_API_KEY : "";

  if (!API_KEY) {
    // Rule-based fallback responses
    const lower = userMessage.toLowerCase();
    if (lower.includes("margin") || lower.includes("profit")) {
      return "A healthy profit margin for most SMEs is between 20–40%. If your margin is below 10%, you're at risk — focus on reducing costs or increasing prices. Below 20% means room for improvement. Above 25% is sustainable and gives you room to reinvest.";
    }
    if (lower.includes("cost") || lower.includes("reduce") || lower.includes("save")) {
      return "To reduce costs, start with your biggest expense. Common wins: negotiate with suppliers for bulk discounts, combine delivery trips to save fuel, switch to energy-efficient equipment, and review subscriptions you no longer use. Even small savings per unit add up fast.";
    }
    if (lower.includes("price") || lower.includes("charge") || lower.includes("how much")) {
      return "Your price should cover: raw materials + packaging + overhead per unit + logistics per unit + labour + contingency + desired profit. Never price based on what others charge — price based on what it costs you to create and deliver value.";
    }
    if (lower.includes("competitor") || lower.includes("market")) {
      return "Comparing to competitors is useful, but don't let them set your floor. If you're charging more, make sure your value proposition is clear — better quality, unique ingredients, premium packaging, or faster delivery. If you're charging less, check you're not undervaluing your work.";
    }
    if (lower.includes("thank")) {
      return "You're welcome! I'm always here to help with your pricing questions. Come back anytime you need to run numbers or get a second opinion. You've got this!";
    }
    return "That's a great question! To help you better, here are some things you can ask me:\n\n• \"What should my profit margin be?\"\n• \"How can I reduce my costs?\"\n• \"How do I price against competitors?\"\n• \"Am I charging enough?\"\n\nFor AI-powered responses, add your OpenRouter API key to the .env file.";
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "SMLife AI Pricing Coach",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages: [
        {
          role: "system",
          content: "You are SMLife's AI Pricing Coach. You help women-led small businesses with pricing, cost optimization, and business strategy. Be warm, supportive, and specific. Keep responses to 3-5 sentences. Use plain language, no jargon. Never give legal or financial advice — just practical business guidance.",
        },
        ...chatMessages.map(m => ({ role: m.role, content: m.text })),
      ],
      max_tokens: 300,
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "I'm not sure how to answer that. Could you rephrase?";
}

export function cleanupAICoach(): void {
  // Keep panel instance but hide it
  const panel = document.getElementById("aiCoachPanel");
  if (panel) panel.classList.remove("open");
}
