"use strict";
import { formatCode, scrollToBottom } from "./utility.js";
import { getBotResponse } from "./api.js";

let chatbotIcon = null;
let chatbotWindow = null;
let chatbotHeader = null;
let chatbotBody = null;
let chatbotMessages = null;
let chatbotInput = null;
let closeBtn = null;

// We’ll store references to event listeners here so we can remove them later
let onIconClick = null;
let onCloseClick = null;
let onMouseDown = null;
let onMouseMove = null;
let onMouseUp = null;
let onSendClick = null;

export async function addBot(database) {
  if (chatbotIcon && chatbotWindow) return;

  const messages = await database.getAllMessages();

  // Floating icon
  chatbotIcon = document.createElement("div");
  chatbotIcon.classList.add("chatbot-icon");
  chatbotIcon.textContent = "AI";

  // Chat window
  chatbotWindow = document.createElement("div");
  chatbotWindow.classList.add("chatbot-window");

  // Header
  chatbotHeader = document.createElement("div");
  chatbotHeader.classList.add("chatbot-header");
  chatbotHeader.id = "chatbotHeader";
  chatbotHeader.innerHTML = `
    <span>AZ AI</span>
    <span class="close-btn" id="closeBtn">&times;</span>
  `;

  // Body
  chatbotBody = document.createElement("div");
  chatbotBody.classList.add("chatbot-body");

  // Messages
  chatbotMessages = document.createElement("div");
  chatbotMessages.classList.add("chatbot-messages");
  if (messages && messages.length > 0) {
    chatbotMessages.innerHTML = `
        ${messages
          .map(
            (message) =>
              `<div class="chat-message-${message.type}">${message.text}</div>`
          )
          .join("")}
    `;
  }

  // Input
  chatbotInput = document.createElement("div");
  chatbotInput.classList.add("chatbot-input");
  chatbotInput.innerHTML = `
    <input type="text" placeholder="Type your message..." />
    <button>Send</button>
  `;

  // Combine elements
  chatbotBody.appendChild(chatbotMessages);
  chatbotBody.appendChild(chatbotInput);
  chatbotWindow.appendChild(chatbotHeader);
  chatbotWindow.appendChild(chatbotBody);

  // Insert into the document
  document.body.appendChild(chatbotIcon);
  document.body.appendChild(chatbotWindow);

  // 2) EVENT LISTENERS

  // Toggle chat window on icon click
  onIconClick = () => {
    chatbotWindow.style.display =
      chatbotWindow.style.display === "flex" ? "none" : "flex";
  };
  chatbotIcon.addEventListener("click", onIconClick);

  // Close button inside chat window
  closeBtn = chatbotHeader.querySelector("#closeBtn");
  onCloseClick = () => {
    chatbotWindow.style.display = "none";
  };
  closeBtn.addEventListener("click", onCloseClick);

  // 3) SEND BUTTON LOGIC (to add user messages)
  const inputField = chatbotInput.querySelector("input");
  const sendButton = chatbotInput.querySelector("button");

  onSendClick = async () => {
    const userText = inputField.value.trim();
    if (!userText) return;

    await database.addMessage({ type: "user", text: userText });

    // Add the user's message to the chat window
    const userMsgPara = document.createElement("div");
    userMsgPara.classList.add("chat-message-user");
    userMsgPara.textContent = userText;
    chatbotMessages.appendChild(userMsgPara);

    // Clear input
    inputField.value = "";

    // Create a loading message element
    const loadingMessageElement = document.createElement("div");
    loadingMessageElement.className = "chat-message-bot loading";
    loadingMessageElement.innerHTML = `
      <div class="loading-wave">
        <div class="dot dot1"></div>
        <div class="dot dot2"></div>
        <div class="dot dot3"></div>
      </div>
    `;

    chatbotMessages.appendChild(loadingMessageElement);

    try {
      const res = await getBotResponse(database, userText);

      if (res && res.status === "success") {
        const botResponse = res.data.queryAnswer;

        chatbotMessages.removeChild(loadingMessageElement);

        const botMessageElement = document.createElement("div");
        botMessageElement.className = "chat-message-bot";
        const queryMessage = document.createElement("p");
        queryMessage.textContent = botResponse;
        botMessageElement.appendChild(queryMessage);

        if (
          res.data.aiRecommendations &&
          res.data.aiRecommendations.length > 0
        ) {
          res.data.aiRecommendations.forEach((recommendation) => {
            const recommendationBox = document.createElement("div");
            recommendationBox.className = "recommendation-container";

            recommendationBox.innerHTML = `
          <div class="recommendation">
            <p class="recommendation-text">${recommendation.text}</p>
            <div class="code-block">
              <pre><code>
              ${formatCode(recommendation.code, "cpp")}
              </code></pre>
              <button class="copy-button" onclick="copyToClipboard(this)">Copy</button>
            </div>
          </div>
        `;
            botMessageElement.appendChild(recommendationBox);
          });
        }

        chatbotMessages.appendChild(botMessageElement);

        await database.addMessage({ type: "model", text: botResponse });
      } else {
        throw new Error("Failed to get a successful response.");
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);

      if (chatbotMessages.contains(loadingMessageElement)) {
        chatbotMessages.removeChild(loadingMessageElement);
      }

      const errorMessageElement = document.createElement("div");
      errorMessageElement.className = "chat-message-bot";
      errorMessageElement.textContent =
        "Something went wrong. Please try again.";
      chatbotMessages.appendChild(errorMessageElement);

      await database.addMessage({
        type: "model",
        text: "Something went wrong. Please try again."
      });
    }
  };

  sendButton.addEventListener("click", onSendClick);
  inputField.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      onSendClick();
    }
  });
}

export function removeBot() {
  // If there is no bot to remove, just return
  if (!chatbotIcon && !chatbotWindow) return;

  // Remove all event listeners
  if (chatbotIcon && onIconClick) {
    chatbotIcon.removeEventListener("click", onIconClick);
  }
  if (closeBtn && onCloseClick) {
    closeBtn.removeEventListener("click", onCloseClick);
  }
  if (chatbotHeader && onMouseDown) {
    chatbotHeader.removeEventListener("mousedown", onMouseDown);
  }
  if (onMouseMove) {
    document.removeEventListener("mousemove", onMouseMove);
  }
  if (onMouseUp) {
    document.removeEventListener("mouseup", onMouseUp);
  }
  if (onSendClick) {
    const sendButton = chatbotInput?.querySelector("button");
    const inputField = chatbotInput?.querySelector("input");
    sendButton?.removeEventListener("click", onSendClick);
    inputField?.removeEventListener("keyup", onSendClick);
  }

  // Nullify references to listeners
  onIconClick = null;
  onCloseClick = null;
  onMouseDown = null;
  onMouseMove = null;
  onMouseUp = null;
  onSendClick = null;

  // Remove the elements
  if (chatbotIcon && document.body.contains(chatbotIcon)) {
    document.body.removeChild(chatbotIcon);
  }
  if (chatbotWindow && document.body.contains(chatbotWindow)) {
    document.body.removeChild(chatbotWindow);
  }

  // Nullify references to DOM elements
  chatbotIcon = null;
  chatbotWindow = null;
  chatbotHeader = null;
  chatbotBody = null;
  chatbotMessages = null;
  chatbotInput = null;
  closeBtn = null;
}

function copyToClipboard(button) {
  const tempTextarea = document.createElement("textarea");
  tempTextarea.value = button.parentElement.querySelector("pre code").innerText;
  document.body.appendChild(tempTextarea);

  tempTextarea.select();
  document.execCommand("copy");

  document.body.removeChild(tempTextarea);

  button.innerText = "Copied!";
  setTimeout(() => {
    button.innerText = "Copy";
  }, 1000);
}