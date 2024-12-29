const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.get("/", (req, res) => {
  res.send("Hello! The server is working.");
});

router.post("/chat", async (req, res) => {
  const { problemContext, history, message } = req.body;

  if (!problemContext || !history || !message) {
    return res.status(400).json({
        status: "error",
        message: "Missing required fields: 'problemContext', 'history', and 'message'.",
      });
  }

  const {
    problemExplanation,
    inputFormat,
    outputFormat,
    hints,
    editorial,
    correctSolution,
    userCode
  } = problemContext;

  if (
    !problemExplanation ||
    !inputFormat ||
    !outputFormat ||
    !correctSolution
  ) {
    return res
      .status(400)
      .json({ error: "Invalid 'problemContext' details provided." });
  }

  try {
    const chat = model.startChat({
        generationConfig : {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
      history: [
        {
          role: "user",
          parts: [
            {
              text:
                "Please help me with debugging and solving problems related to the given context."
            }
          ]
        },
        {
          role: "model",
          parts: [
            {
              text: `
              You are an expert programmer mentor specializing in Data Structures and Algorithms. 
              Your task is to assist users by answering their queries, analyzing their code, and providing feedback in a constructive, mentoring tone.
              Always behave as a mentor and guide the user to learn and improve. 
              Your responses must always follow the specific format below and should strictly focus on the provided context or topic.
              you are here to assist users with:
              Greeting them politely (e.g., “Hi”, “Hello”),
              Answering questions related to this problem’s concepts, hints, solutions, or debugging,
              Analyzing users’ code, finding bugs, explaining errors, and suggesting corrections,
              write users' code in c++ by default

                ### Mentor Guidelines:
                1. **Constructive Tone**: Be friendly, positive, and supportive.
                2. **Concise Explanations**: Explain concepts clearly without unnecessary technical jargon.
                3. **Precise Debugging Help**:
                  - Pinpoint the mistake (e.g., "Error on line 19").
                  - Explain why it is incorrect.
                  - Provide a fix or improvement.
                4. **Actionable Feedback**: Include suggestions for better coding practices or alternative solutions.
                5. **Problem-Focused Scope**: 
                  - Answer greetings briefly but politely.
                  - If a query is fully unrelated to the current problem, respond with: "This query is outside the scope of the current topic."

                  

              ### Response Format:
              {
              "queryAnswer": "[Direct answer to the user's current query]",
              "aiRecommendations": [
                  {
                  "text": "[Description of the recommendation or correction]",
                  "code": "[Suggested or corrected code snippet. Code snippet in the appropriate language or C++ by default]"
                  }
              ]
              }
      
              ### Guidelines:
                1. **Relevant Topics**:
                  - DSA concepts, hints, or approaches for the problem,
                  - Debugging user code,
                  - Coding best practices and optimizations relevant to the problem.
                2. **Greetings**: Acknowledge greetings in a friendly manner, but do not engage in off-topic conversation.
                3. **Query Answer**: Provide a concise and accurate response.
                4. **AI Recommendations**: If applicable, add one or more recommendations with explanations and code snippets.

              ### Problem Details:
              - **Problem Explanation**: ${problemExplanation}
              - **Input Format**: ${inputFormat}
              - **Output Format**: ${outputFormat}
              - **Hints**: ${hints || "No hints provided."}
              - **Editorial**: ${editorial || "No editorial provided."}
              - **Correct Solution**: ${correctSolution}

              ### User Code:
              - **Code Provided by User**: ${userCode || "No user code provided."}

              
              Users will ask questions related to this problem or provide their solutions for analysis. Please only respond to queries related to this problem.
              `
            }
          ]
        },
        ...history,
        {
          role: "user",
          parts: [{ text: message }]
        }
      ]
    });

    const result = await chat.sendMessage(message);
    const rawResponse = result.response.text();
    
      const response = rawResponse.replace(/\\n/g, "")
      .replace(/\\t/g, "")
      .replace(/,\s*]/g, "]")
      .replace(/,\s*}/g, "}")
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
      .replace(/\\(?![\\/bfnrtu"])/g, "");

      console.log("raw: ". rawResponse);

    let parsedResponse = JSON.parse(response);

    try{
      parsedResponse = JSON.parse(response);
    }catch(err){
      const queryAnswerRegex = /"queryAnswer":\s*"([^"]+)"/;
      const match = rawResponse.match(queryAnswerRegex);
    
      const queryAnswer = match ? match[1] : "Default answer if not found.";
      parsedResponse = {
        "queryAnswer": queryAnswer,
        "aiRecommendations": []
      };
    }
  
    res.json({
        status: "success",
        message: "Response generated successfully.",
        data: {
          ...parsedResponse
        }
    });
  } catch (error) {
    res.status(500).json({
        status: "error",
        message: "Failed to process the chat message.",
        error: {
          code: error.response?.status || 500,
          details: error.response?.data || error.message || "An unexpected error occurred."
        }
      });
  }
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);