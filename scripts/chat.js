'use strict';
import { scrollToBottom } from "./utility.js";

async function openAiChatBox(database) {
  const element = document.querySelector(".coding_leftside_scroll__CMpky");

  if (!element) {
    console.error("Target element not found!");
    return;
  }

  try {
    const messages = await database.getAllMessages();

    element.innerHTML = `
      <div class="chat-container">
          <div class="chat-content">
              ${messages
                .map(
                  (message) =>
                    `<div class="chat-message ${message.type}">${message.text}</div>`
                )
                .join('')}
          </div>
          <div class="chat-footer">
              <input type="text" class="chat-input" placeholder="Type your message...">
              <button class="chat-send">Send</button>
          </div>
      </div>
    `;

    element.style.overflowY = "hidden";

    const sendButton = element.querySelector(".chat-send");
    const chatInput = element.querySelector(".chat-input");
    const chatContent = element.querySelector(".chat-content");
    chatContent.scrollTop = chatContent.scrollHeight;

    async function handleSendMessage() {
      const userMessage = chatInput.value.trim();
      if (userMessage) {
        chatContent.innerHTML += `<div class="chat-message user">${userMessage}</div>`;
        chatInput.value = "";
    
        scrollToBottom(chatContent);
    
        await database.addMessage({ type: "user", text: userMessage });
    
        const botResponse = "I'm here to help!";
        chatContent.innerHTML += `<div class="chat-message bot">${botResponse}</div>`;
        scrollToBottom(chatContent);
        await database.addMessage({ type: "bot", text: botResponse });
      }
    }

    sendButton.addEventListener("click", handleSendMessage);
    chatInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSendMessage();
      }
    });
  } catch (error) {
    console.error("Failed to initialize AI chat box:", error);

    element.innerHTML = `
      <div class="chat-container">
          <div class="chat-content">
              Failed to initialize AI chat box.
          </div>
      </div>
    `;
  }
}

function addAiTab(database) {
  const tabList = document.querySelector(
    ".d-flex.flex-row.p-0.gap-2.justify-content-between.m-0.hide-scrollbar"
  );

  if (tabList) {
    const existingTab = tabList.querySelector(".ai-help-tab");
    if (existingTab) {
      console.log("AI Help tab already exists!");
      return;
    }

    const newTab = document.createElement("li");
    newTab.className =
      "d-flex flex-row rounded-3 dmsans align-items-center coding_list__V_ZOZ coding_card_mod_unactive__O_IEq ai-help-tab";
    newTab.style.padding = "0.36rem 1rem";

    newTab.innerHTML = `
            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" class="me-1" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            AI Help
        `;

    tabList.appendChild(newTab);

    newTab.addEventListener("click", () => {
      console.log("AI Help tab clicked!");
      openAiChatBox(database);
    });
  } else {
    console.error("Tab list not found!");
  }
}

export { addAiTab };