"use strict";

try {
  const mainScript = document.createElement("script");
  mainScript.setAttribute("type", "module");
  mainScript.setAttribute("src", chrome.runtime.getURL("scripts/main.js"));

  const head =
    document.head ||
    document.getElementsByTagName("head")[0] ||
    document.documentElement;
  head.insertBefore(mainScript, head.lastChild);

  console.log("Main script injected successfully.");
} catch (error) {
  console.error("Failed to inject script:", error);
}