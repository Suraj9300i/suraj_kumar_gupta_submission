# AI-Powered DSA Doubt Solver Extension

This Chrome extension is designed to assist students by providing real-time solutions and debugging assistance for DSA problems. Leveraging advanced AI capabilities via the Gemini model, this extension offers interactive guidance directly within your browser.

## Features

- **Instant DSA Solutions**: Get explanations, optimizations, solutions, and step-by-step debugging help for a DSA problems.

  <img width="1502" alt="Screenshot 2024-12-29 at 8 59 48 PM" src="https://github.com/user-attachments/assets/f8c08dcc-21f2-49ca-a2ee-9c3282aca011" />


- **Dynamic AI Bot**: Whenever we change the problem, the AI bot will reset the conversation. And the new AI Bot will be tailored according to the current problem context, generating more precise response.
  ***Note*** :
  - Sometimes changing to new problem leads to delay of adding new AI button due to adding a separate store and upgrading indexed db, in this case, it is better to refresh page
  - But moving to previous problems, always reset the conversation and loads the previous conversation
  
<img width="1500" alt="Screenshot 2024-12-29 at 9 07 12 PM" src="https://github.com/user-attachments/assets/6e2c19f0-4d6d-4441-883c-12c290a5f423" />

- **Session Management**: All the previous conversations are stored in Indexed DB where (problem name + problem id) is key of each store's

    <img width="1490" alt="Screenshot 2024-12-29 at 9 10 03 PM" src="https://github.com/user-attachments/assets/9688ea5e-8ed3-47b6-b7eb-2e5c8d110dd5" />
    
- **Generates Code**: It also generate the code, with copy button inside,

## How It Works

The extension uses a combination of HTML, CSS, JavaScript for the frontend, and Node.js along with the Gemini AI model for the backend to process and respond to user queries effectively.

1. Clone the repository
2. Go to the Chrome extension management page and load the unpacked folder.

### Code Explanation

This section provides a brief description of key files in the project:

1.	/backend/src/api.js: Contains the code for the Node.js server and the prompts used by the doubt solver.
2.	/content.js: Manages the injection of scripts into the DOM.
3.	/main.js: Contains the main logic for initializing the database according to the problem, adding, and removing the chatbot from the screen.
4.	/db.js: Includes all the logic related to database initialization, store creation, message addition, and message retrieval.
5.	/bot.js: Manages the UI for the AI button and chatbox, and includes all functionalities related to message handling.
6.	/interceptor.js: Contains logic for API interception to modify or handle HTTP requests.
7.	/utility.js: Provides reusable functions that support various features of the extension.
