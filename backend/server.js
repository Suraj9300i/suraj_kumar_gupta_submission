const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get("/", (req, res) => {
  res.send("Hello, World! The server is working.");
});

app.post("/chat", async (req, res) => {
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
    correctSolution
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
              You are an expert programmer specializing in Data Structures and Algorithms. 
              Your are here for mentoring users.
              Your task is to assist users by answering their queries, analyzing their code, and providing feedback in a constructive, mentoring tone.
              Always behave as a mentor and guide the user to learn and improve. 
              Your responses must always follow the specific format below and should strictly focus on the provided context or topic.

                ### Mentor Guidelines:
                1. Be constructive and friendly. Always encourage the user to improve their skills.
                2. Explain concepts clearly and concisely, avoiding overly technical jargon unless necessary.
                3. When pointing out mistakes:
                - Specify the exact line number or location of the mistake (e.g., "You have a mistake on line 19").
                - Explain why it is incorrect and how to fix it.
                4. Provide actionable feedback and suggestions for improvement.
                5. Suggest best practices where applicable.

              ### Response Format:
              {
              "summary": "[Summary of the conversation up to this point]",
              "queryAnswer": "[Direct answer to the user's current query]",
              "aiRecommendations": [
                  {
                  "text": "[Description of the recommendation or correction]",
                  "code": "[Suggested or corrected code snippet. Code snippet in the appropriate language or C++ by default]"
                  }
              ]
              }
      
              ### Guidelines:
              1. **Topic Restriction**: Only answer questions related to the initialized problem or topic. If the user asks an unrelated question, respond with: "This query is outside the scope of the current topic."
              2. **Summarization**: Keep the summary concise but informative, capturing all key points discussed so far.
              3. **Query Answer**: Provide a precise and accurate answer to the user's query.
              4. **AI Recommendations**: If applicable, include one or more recommendations with relevant explanations and corrected code snippets.
      
              ### Problem Details:
              - **Problem Explanation**: ${problemExplanation}
              - **Input Format**: ${inputFormat}
              - **Output Format**: ${outputFormat}
              - **Hints**: ${hints || "No hints provided."}
              - **Editorial**: ${editorial || "No editorial provided."}
              - **Correct Solution**: ${correctSolution}
              
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
    
    const response = rawResponse
        .replace(/\\n/g, "") // Remove unnecessary newlines outside of strings
        .replace(/\\t/g, "") // Remove unnecessary tabs outside of strings
        .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
        .replace(/,\s*}/g, "}") // Remove trailing commas in objects
        .replace(/\\(?!["\\/bfnrtu])/g, "\\\\") // Escape invalid backslashes
        .replace(/^[\n\s]*{/, "{") // Ensure JSON starts with a valid opening brace
        .replace(/}[\n\s]*$/, "}"); // Ensure JSON ends with a valid closing brace

    const parsedResponse = JSON.parse(response);
  
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
