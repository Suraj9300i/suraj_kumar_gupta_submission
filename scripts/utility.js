"use-strict";

export function isOnProblemRoute() {
  return /^https:\/\/maang\.in\/problems\//.test(window.location.href);
}

export function getProblemName() {
  const url = window.location.href;
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/");
  return pathParts[pathParts.length - 1];
}

export function getCurrentProblemCode() {
  const problemName = getProblemName();
  const parts = problemName.split("-");
  const problemId = parts[parts.length - 1];
  // const userId = getUserDetails()?.data?.id;
  const elem = document.querySelector('.d-flex.align-items-center.gap-1.text-blue-dark');
  const language = elem?.textContent.trim(); 

  const problemLCId =  "course_" + "#"+ "_" + problemId + "_" + language;
  const matchedValue = localStorage.getItem(getCodeKey(problemLCId));
  return matchedValue;
}

export function setCurrentProblemCode(code) {
  const problemName = getProblemName();
  const parts = problemName.split("-");
  const problemId = parts[parts.length - 1];
  // const userId = getUserDetails()?.data?.id;
  const elem = document.querySelector('.d-flex.align-items-center.gap-1.text-blue-dark');
  const language = elem?.textContent.trim(); 

  const problemLCId =  "course_" + "#"+ "_" + problemId + "_" + language;
  localStorage.setItem(getCodeKey(problemLCId), code);
}

export function scrollToBottom(container) {
  container.scrollTo({
    top: container.scrollHeight,
    behavior: "smooth"
  });
}

export function saveProblem(data) {
  window.localStorage.setItem("ai_extension_problem_description", data);
}

export function getProblem() {
  return JSON.parse(
    window.localStorage.getItem("ai_extension_problem_description")
  );
}

export function saveUserDetails(data) {
  window.localStorage.setItem("ai_extension_user_details", data);
}

export function getUserDetails() {
  return JSON.parse(window.localStorage.getItem("ai_extension_user_details"));
}

function getCodeKey(partialKey) {
  const list1 = partialKey.split("_");

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const list2 = key.split("_");
    if (list1[0] === list2[0] && list1[2] === list2[2] && list1[3] === list2[3]) {
      return key;
    }
  }
  return "";
}

export function formatCode(code, language) {
  let formattedCode = code;

  formattedCode = formattedCode
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*\n/g, "\n")
    .trim();

  let indentLevel = 0;
  const indent = "    ";

  switch (language) {
    case "cpp":
    case "java":
      formattedCode = formattedCode
        .replace(/\{/g, "{\n")
        .replace(/\}/g, "\n}")
        .replace(/\;/g, ";\n");

      formattedCode = formattedCode
        .split("\n")
        .map(line => {
          if (line.includes("{")) {
            const indentedLine = indent.repeat(indentLevel) + line.trim();
            indentLevel++;
            return indentedLine;
          } else if (line.includes("}")) {
            indentLevel--;
            return indent.repeat(indentLevel) + line.trim();
          } else {
            return indent.repeat(indentLevel) + line.trim();
          }
        })
        .join("\n");
      formattedCode = formattedCode.replace(
        /(\}\n\s*)(public|private|protected|static|void|int|String|boolean|float|double|class|namespace)\s/g,
        "$1\n$2 "
      );
      break;
    case "python":
      formattedCode = formattedCode.replace(/\:/g, ":\n");
      formattedCode = formattedCode
        .split("\n")
        .map(line => {
          if (line.endsWith(":")) {
            const indentedLine = indent.repeat(indentLevel) + line.trim();
            indentLevel++;
            return indentedLine;
          } else if (
            line.trim().startsWith("return") ||
            line.trim().startsWith("pass") ||
            line.trim().startsWith("break") ||
            line.trim().startsWith("continue")
          ) {
            indentLevel = Math.max(0, indentLevel - 1);
            return indent.repeat(indentLevel) + line.trim();
          } else {
            return indent.repeat(indentLevel) + line.trim();
          }
        })
        .join("\n");

      break;
    default:
      console.warn("Unknown language:", language);
      return code;
  }

  formattedCode = formattedCode
    .split("\n")
    .map(line => line.trimEnd())
    .join("\n");
  return formattedCode.trim();
}


export function encodeHtml(code) {
  return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}