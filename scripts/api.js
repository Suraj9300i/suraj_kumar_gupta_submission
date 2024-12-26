const apiUrl = "http://localhost:3000/chat";

function getProblemContext() {
  return {
    problemExplanation:
      "Given an array of integers, find the maximum sum of a contiguous subarray.",
    inputFormat:
      "An integer N (size of array) followed by N integers (elements of the array).",
    outputFormat:
      "An integer representing the maximum sum of a contiguous subarray.",
    hints: "Use a single loop and maintain running sums.",
    editorial:
      "Iterate through the array, maintaining a running sum and updating the maximum sum found so far.",
    correctSolution:
      "int maxSubArray(int[] nums) { int maxSum = nums[0], currentSum = nums[0]; for (int i = 1; i < nums.length; i++) { currentSum = Math.max(nums[i], currentSum + nums[i]); maxSum = Math.max(maxSum, currentSum); } return maxSum; }"
  };
}

function getPreviousMessage() {
  const messages = [];
  messages.push({
    role: "user",
    parts: [{ text: "Can you explain Kadane's Algorithm?" }]
  });
  return messages;
}

function getBotResponse(userMessage) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          problemContext: getProblemContext(),
          history: getPreviousMessage(),
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
