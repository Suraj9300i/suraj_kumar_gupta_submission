"use strict";

import ChatDatabase from "./db.js";
import { addAiTab } from "./chat.js";
import { getProblemName, saveProblem } from "./utility.js";

let currentProblemName = getProblemName(window.location.href);

function startConnection(storeName) {
  const database = new ChatDatabase();
  database.init(storeName);
  addAiTab(database);
}

function handleProblemNameChange(problemName) {
  console.log(`Problem changed to: ${problemName}`);
  startConnection(problemName);
}

function initObserver() {
  const observer = new MutationObserver(() => {
    const newProblemName = getProblemName(window.location.href);

    if (newProblemName !== currentProblemName) {
      console.log(`Problem name changed: ${newProblemName}`);
      currentProblemName = newProblemName;

      handleProblemNameChange(newProblemName);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

window.addEventListener("xhrDataFetched",(event)=>{
  const response = event.detail;
  if(response.url.startsWith("https://api2.maang.in/problems/user/401")){
    saveProblem(response.response);
  }
});

startConnection(currentProblemName);
initObserver();
