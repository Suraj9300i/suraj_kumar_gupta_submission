"use strict";

import ChatDatabase from "./db.js";
import {
  getProblemName,
  saveProblem,
  isOnProblemRoute,
  saveUserDetails
} from "./utility.js";
import { addBot, removeBot } from "./bot.js";

let currentProblemName = "";

async function connectDB(problemName) {
  console.log(`Problem changed to: ${problemName}`);
  const database = new ChatDatabase();

  return database
    .init(problemName)
    .then(() => {
      console.log(`DB init success for store: ${problemName}`);
      return database;
    })
    .catch(err => {
      console.error(`Error initializing DB for ${problemName}:`, err);
      throw err;
    });
}

function checkAndInitOrReset() {
  if (isOnProblemRoute()) {
    const newProblemName = getProblemName();
    if (!currentProblemName) {
      currentProblemName = newProblemName;
      connectDB(newProblemName)
        .then(db => {
          addBot(db);
        })
        .catch(err => console.error(err));
    } else if (newProblemName !== currentProblemName) {
      currentProblemName = newProblemName;
      const db = connectDB(newProblemName);
      removeBot();

      connectDB(newProblemName)
        .then(db => {
          addBot(db);
        })
        .catch(err => console.error(err));
    }
  } else {
    currentProblemName = "";
    removeBot();
  }
}

function initObserver() {
  checkAndInitOrReset();

  const observer = new MutationObserver(() => {
    checkAndInitOrReset();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

window.addEventListener("xhrDataFetched", event => {
  const response = event.detail;
  console.log("url: ", response.url);

  if (response.url.startsWith("https://api2.maang.in/problems/user/")) {
    saveProblem(response.response);
  }

  if (response.url === "https://api2.maang.in/users/profile/private") {
    saveUserDetails(response.response);
  }
});

initObserver();

const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  console.log("Patched XHR open:", url);
  return originalOpen.apply(this, [method, url, ...rest]);
};
