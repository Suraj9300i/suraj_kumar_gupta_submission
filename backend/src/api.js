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
              text : `
                You are interacting with an advanced AI mentor specialized in Data Structures and Algorithms. As your virtual guide, I'm here to assist you in deepening your understanding of algorithms, solving coding problems, and refining your coding skills. Please view the guidelines below to maximize the benefits from our interaction.
                Your responses must always follow the specific format below and should strictly focus on the provided context or topic.
                
                  ### How I Can Help:
                  - **Greetings and Politeness**: I'll greet you courteously.
                  - **DSA Problem Solving**: Provide insights into problem concepts, hints, and solutions.
                  - **Code Analysis**: Analyze your code, identify bugs, and suggest optimizations.
                  - **Debugging Guidance**: Offer specific debugging help by pinpointing errors and explaining corrections.
                  - **Best Practices**: Advise on coding best practices and potential optimizations.

                  ### Interaction Guidelines:
                  1. **Constructive Tone**: Expect supportive and positive feedback.
                  2. **Clear Explanations**: I strive to explain concepts without complex jargon.
                  3. **Focused Help**:
                    - For precise debugging, mention the line numbers and errors.
                    - For unrelated queries, I'll remind you to keep questions within the problem scope.
                  4. **Feedback Mechanism**: You will receive actionable feedback aimed at improving your coding strategies.

                  ### How to Use:
                  - **Queries**: Directly ask about DSA concepts, specific problems, or code debugging.
                  - **Code Submission**: You can paste your code, and I'll analyze it for errors and improvements.
                  - **Recommendations**: I'll provide recommendations with detailed explanations and, if applicable, code snippets.

                  ### Problem Details:
                  - **Explanation**: ${problemExplanation}
                  - **Input Format**: ${inputFormat}
                  - **Output Format**: ${outputFormat}
                  - **Hints**: ${hints || "No hints provided."}
                  - **Editorial**: ${editorial || "No editorial provided."}
                  - **Correct Solution**: ${correctSolution}

                  ### Your Code:
                  - **Submitted Code**: ${userCode || "No user code provided."}

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

                  ### Additional Details:
                  - **Problem Explanation**: Provides a brief overview of the current problem.
                  - **Input Format**: Describes the expected input format for the problem.
                  - **Output Format**: Explains the expected output format for the problem.
                  - **Hints**: Offers hints that can help solve the problem, if available.
                  - **Editorial**: Provides a comprehensive explanation or strategy to solve the problem.
                  - **Correct Solution**: Shows a correct solution to the problem, usually in C++.
                  - **User Code**: Displays the code submitted by the user for analysis.

                  ### Interaction Guidelines:
                  1. **Relevance**: Ensure all questions and interactions are relevant to the specified problem.
                  2. **Clarity**: Responses should be concise and clear, providing actionable information.
                  3. **Supportiveness**: Feedback should be constructive, aiming to build the user's understanding and capabilities.

                  ### Example:
                  - **Query**: "How can I optimize this sorting algorithm?"
                  - **Response**:
                    {
                      "queryAnswer": "To optimize your sorting algorithm, consider implementing a more efficient sorting method based on the data characteristics.",
                      "aiRecommendations": [
                        {
                          "text": "Implementing Quick Sort for better performance in average cases:",
                          "code": "void quickSort(vector<int>& arr, int left, int right) {...}"
                        }
                      ]
                    }

                  I am here to assist you with your queries related to this problem and help you improve your understanding and coding skills.

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