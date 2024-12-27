'use-strict'

export function getProblemName(url) {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/");
  return pathParts[pathParts.length - 1];
}

export function scrollToBottom(container) {
  container.scrollTo({
    top: container.scrollHeight,
    behavior: "smooth",
  });
}

export function saveProblem(data){
  window.localStorage.setItem("problem_description", data);
}

export function getProblem(){
  return JSON.parse(window.localStorage.getItem("problem_description"));
}

export function formatCode(code, language) {
  let formattedCode = code;

  formattedCode = formattedCode
    .replace(/\r\n/g, '\n')
    .replace(/\n\s*\n/g, '\n')
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

        formattedCode = formattedCode.split("\n").map(line => {
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
          }).join("\n");
          formattedCode = formattedCode.replace(/(\}\n\s*)(public|private|protected|static|void|int|String|boolean|float|double|class|namespace)\s/g, "$1\n$2 ");
      break;
    case "python":
      formattedCode = formattedCode.replace(/\:/g, ":\n");
      formattedCode = formattedCode.split("\n").map(line => {
        if (line.endsWith(":")) {
          const indentedLine = indent.repeat(indentLevel) + line.trim();
          indentLevel++;
          return indentedLine;
        } else if (line.trim().startsWith("return") || line.trim().startsWith("pass") || line.trim().startsWith("break") || line.trim().startsWith("continue")) {
            indentLevel = Math.max(0, indentLevel - 1);
            return indent.repeat(indentLevel) + line.trim();
        }
         else {
          return indent.repeat(indentLevel) + line.trim();
        }
      }).join("\n");

      break;
    default:
      console.warn("Unknown language:", language);
      return code;
  }

  formattedCode = formattedCode.split('\n').map(line => line.trimEnd()).join('\n');
  return formattedCode.trim();
}