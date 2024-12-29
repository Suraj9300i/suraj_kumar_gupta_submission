import { getCurrentProblemCode, getProblem } from "./utility.js";

const apiUrl = "https://ai-doubt-solver.netlify.app/.netlify/functions/api/chat";

function getProblemContext() {
  const problem = getProblem();
  const userCode = getCurrentProblemCode();

  return {
    problemExplanation: problem?.data?.body,
    inputFormat : problem?.data?.input_format,
    outputFormat : problem?.data?.output_format,
    hints : problem?.data?.hints,
    editorial: problem?.data?.hints?.solution_approach,
    correctSolution: problem?.data?.editorial_code[problem.data.editorial_code.length - 1]?.code,
    userCode: userCode
  };
}

async function getPreviousMessage(database) {
  const dbMessages = await database.getAllMessages();
  const lastMessages = 7;
  const messages = [];
  if(dbMessages.length > lastMessages){
    const temp = dbMessages.slice(-lastMessages);
    for(let i=0; i<lastMessages; i++){
      messages.unshift({
        role: temp[i].type,
        parts: [{ text: temp[i].text }]
      });
    }
  }
  else{
    for(let i=0; i<dbMessages.length; i++){
      messages.push({
        role: dbMessages[i].type,
        parts: [{ text: dbMessages[i].text }]
      });
    }
  }
  return messages;
}

async function getBotResponse(database, userMessage) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          problemContext: getProblemContext(),
          history: await getPreviousMessage(database),
          message: userMessage
        })
      });

      if (!response || response.status != 200) {
        reject(`API request failed with status ${response.status}`);
        return;
      }

      const data = await response.json();
      resolve(data);
    } catch (err) {
      console.error("Error in getBotResponse:", err);
      reject(err);
    }
  });
}

export { getBotResponse };
