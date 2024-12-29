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

  // Function to load a script
  function loadScript(url, callback) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;

    script.onload = function() {
      if (callback) callback();
    };

    document.head.appendChild(script);
  }

  // Load Highlight.js core library
  loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js",
    function() {
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js",
        function() {
          hljs.highlightAll();
        }
      );
    }
  );

  console.log("Script injected successfully.");
} catch (error) {
  console.error("Failed to inject script:", error);
}
