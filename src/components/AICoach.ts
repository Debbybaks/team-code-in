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
  console.log("renderAICoach called");
  if (panelInitialized) {
    console.log("Panel already initialized");
    return;
  }

  console.log("Creating new panel");
  const panel = document.createElement("div");
  panel.className = "coach-panel";
  panel.id = "aiCoachPanel";
  panel.innerHTML = `
    <div class="coach-panel-handle"></div>
    <div class="coach-panel-header">
      <span class="coach-panel-title">${iconString(ICONS.sparkles, 18)} AI Pricing Coach <span style="font-size:0.7rem;font-weight:600;padding:0.1rem 0.35rem;border-radius:10px;background:rgba(224,86,118,0.12);color:var(--rose);margin-left:0.4rem;display:inline-block;vertical-align:middle;">₦1,200/mo</span></span>
      <button class="coach-panel-close" id="coachClose">${iconString(ICONS.close, 20)}</button>
    </div>
    <div class="coach-messages" id="coachMessages"></div>
    <div class="coach-input-wrap">
      <input type="text" id="coachInput" placeholder="Ask about pricing, costs, or strategy…" />
      <button id="coachSendBtn" disabled>${iconString(ICONS.arrowRight, 18)}</button>
    </div>
  `;

  console.log("Appending panel to body");
  document.body.appendChild(panel);
  console.log("Panel appended to body");
  panelInitialized = true;

  // Render initial messages
  console.log("Rendering initial messages");
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
    // Remove any offensive text
    if (input.value.includes("nigga")) {
      input.value = input.value.replace(/nigga/gi, "").trim();
    }
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
  
  if (text.length > 500) {
    chatMessages.push({
      role: "bot",
      text: "Please keep your question under 500 characters. Could you shorten it and try again?"
    });
    renderMessages();
    return;
  }

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
  console.log("API_KEY:", API_KEY ? "[REDACTED]" : "Not configured");
  
  // Add a test message to verify API key
  if (!API_KEY) {
    chatMessages.unshift({
      role: "bot",
      text: "⚠️ API Key not configured. Using fallback responses. Add VITE_OPENROUTER_API_KEY to your .env file to enable AI responses."
    });
    renderMessages();
    return ""; // Skip API call if no key
  }

  // Add status message when API is down
  let apiAvailable = false;
  try {
    // Test API availability
    const testResponse = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${API_KEY}`
      }
    });
    
    if (!testResponse.ok) {
      throw new Error("API unavailable");
    }
    
    apiAvailable = true;
  } catch (error) {
    console.error("API test failed:", error);
    chatMessages.unshift({
      role: "bot",
      text: "⚠️ OpenRouter API is currently unavailable. Using fallback responses. Please try again later."
    });
    renderMessages();
  }

  if (!apiAvailable) {
function getRuleBasedResponse(userMessage: string): string {
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
  return "That's a great question! I can help with pricing strategies, cost optimization, competitor analysis, and business growth. What specific question do you have about your business?";
}
  }

  try {
    // Try with different free models in sequence
    const freeModels = [
      "meta-llama/llama-3.1-8b-instruct:free",
      "mistralai/mistral-7b-instruct:free",
      "google/gemma-7b-it:free"
    ];
    
    let lastError = null;
    let response = null;
    
    for (const model of freeModels) {
      try {
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "SMLife AI Pricing Coach",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: "You are SMLife's AI Pricing Coach. You help women-led small businesses with pricing, cost optimization, and business strategy. Be warm, supportive, and specific. Keep responses to 3-5 sentences. Use plain language, no jargon. Never give legal or financial advice — just practical business guidance.",
              },
              ...chatMessages.slice(-5).map(m => ({ role: m.role, content: m.text })),
            ],
            max_tokens: 300,
          }),
        });
        
        if (response.ok) {
          break; // Success with this model
        }
        
        const errorData = await response.json();
        lastError = new Error(`API error with ${model}: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        console.error(`Failed with model ${model}:`, errorData);
        
      } catch (error) {
        lastError = error;
        console.error(`Error with model ${model}:`, error);
      }
    }
    
    if (!response || !response.ok) {
      throw lastError || new Error("All free models failed");
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    
    // Handle OpenRouter specific response format
    if (data.error) {
      throw new Error(data.error.message || "Unknown API error");
    }
    
    // Check if we got a response from a free model
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }
    
    // Fallback if no response content
    return "I'm not sure how to answer that. Could you rephrase your question about pricing or business strategy?";
  } catch (error) {
    console.error("API Request Failed:", error);
    let errorMessage = "I couldn't process that right now. ";
    
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        errorMessage += "Please check that your OpenRouter API key is valid.";
      } else if (error.message.includes("429")) {
        errorMessage += "We've reached the rate limit. Please try again later.";
      } else if (error.message.includes("400")) {
        errorMessage += "There was an issue with the request. Please try a different question.";
      } else if (error.message.includes("API unavailable")) {
        errorMessage += "The AI service is currently unavailable. Using fallback responses. Please try again later.";
      } else {
        errorMessage += "Please try asking in a different way.";
      }
    }
    
    // If API is down, switch to rule-based responses
    if (errorMessage.includes("unavailable")) {
      return getRuleBasedResponse(userMessage);
    }
    
    return errorMessage;
  }
}

export function cleanupAICoach(): void {
  // Keep panel instance but hide it
  const panel = document.getElementById("aiCoachPanel");
  if (panel) panel.classList.remove("open");
}
