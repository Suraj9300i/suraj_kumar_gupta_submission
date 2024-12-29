"use strict";

try {
  const mainScript = document.createElement("script");
  mainScript.setAttribute("type", "module");
  mainScript.setAttribute("src", chrome.runtime.getURL("scripts/main.js"));

  const interceptorScript = document.createElement("script");
  interceptorScript.setAttribute(
    "src",
    chrome.runtime.getURL("scripts/interceptor.js")
  );

  const head =
    document.head ||
    document.getElementsByTagName("head")[0] ||
    document.documentElement;
  head.insertBefore(mainScript, head.lastChild);
  head.insertBefore(interceptorScript, head.lastChild);

  console.log("Script injected successfully.");
} catch (error) {
  console.error("Failed to inject script:", error);
}
