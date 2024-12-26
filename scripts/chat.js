"use strict";
import { formatCode, scrollToBottom } from "./utility.js";
import { getBotResponse } from "./api.js";

function copyToClipboard(button) {
  const tempTextarea = document.createElement('textarea');
  tempTextarea.value = button.parentElement.querySelector('pre code').innerText;
  document.body.appendChild(tempTextarea);

  tempTextarea.select();
  document.execCommand('copy');

  document.body.removeChild(tempTextarea);

  button.innerText = 'Copied!';
  setTimeout(() => {
    button.innerText = 'Copy';
  }, 1000);
}

async function handleSendMessage(database, element) {
  const chatInput = element.querySelector(".chat-input");
  const chatContent = element.querySelector(".chat-content");
  const userMessage = chatInput.value.trim();

  if (userMessage) {
    const userMessageElement = document.createElement("div");
    userMessageElement.className = "chat-message user";
    userMessageElement.textContent = userMessage;
    chatContent.appendChild(userMessageElement);

    chatInput.value = "";
    scrollToBottom(chatContent);

    await database.addMessage({ type: "user", text: userMessage });

    try {
      const res = await getBotResponse(userMessage);

      if (res && res.status === "success") {
        const botResponse = res.data.queryAnswer;

        // Add bot's message to the chat UI
        const botMessageElement = document.createElement("div");
        botMessageElement.className = "chat-message bot";
        const queryMessage = document.createElement("p");
        queryMessage.textContent = botResponse;
        botMessageElement.appendChild(queryMessage);

        // Add AI Recommendations
        if (res.data.aiRecommendations && res.data.aiRecommendations.length > 0) {
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
        chatContent.appendChild(botMessageElement);
        await database.addMessage({ type: "bot", text: botResponse });
      } else {
        throw new Error("Failed to get a successful response.");
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);

      // Add error message to the chat UI
      const errorMessageElement = document.createElement("div");
      errorMessageElement.className = "chat-message bot";
      errorMessageElement.textContent =
        "Something went wrong. Please try again.";
      chatContent.appendChild(errorMessageElement);
    }

    scrollToBottom(chatContent);
  }
}

async function openChatBox(database) {
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
                  message =>
                    `<div class="chat-message ${message.type}">${message.text}</div>`
                )
                .join("")}
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

    sendButton.addEventListener("click", async () =>
      handleSendMessage(database, element)
    );
    chatInput.addEventListener("keypress", async event => {
      if (event.key === "Enter") {
        event.preventDefault();
        await handleSendMessage(database, element);
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
      openChatBox(database);
    });
  } else {
    console.error("Tab list not found!");
  }
}

export { addAiTab };
