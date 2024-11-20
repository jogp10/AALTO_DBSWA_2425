import * as databaseService from "./qaService.js";
import { connect } from "../deps.js";

const redis = await connect({ hostname: "redis", port: 6379 });

// Add job to queue
const addJobToQueue = async (job) => {
  await redis.rpush("questionQueue", JSON.stringify(job));
};

const processQueue = async () => {
  while (true) {
    const job = await redis.lpop("questionQueue");
    if (job) {
      const { user, questionId, question } = JSON.parse(job);
      console.log(`Processing job: ${questionId}`);
      // Add logic to process the job here, e.g., calling LLM API
      try {
        const generatedAnswers = [];
        console.log(`Generating answers for questionId ${questionId} with content: ${question}`);
        for (let i = 0; i < 3; i++) {
            console.log(`Generating answer for ${questionId} + iteration ${i}`);
          const response = await fetch("http://llm-api:7000/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user, question }),
          });

          const text = await response.json();
          let answer = text[0].generated_text
          
          // If answer starts with question, remove it
            if (answer.startsWith(question)) {
                answer = answer.replace(question, '');
            }

            // If answer starts with newline, remove it
            if (answer.startsWith('\n')) {
                answer = answer.replaceAll('\n', '');
            }

          console.log(`Generated answer ${i}:`, answer);
          console.log(text);
          generatedAnswers.push(answer);
        }

        // Simulate storing generated answers in the database
        console.log(
          `Storing answers for questionId ${questionId}:`,
          generatedAnswers
        );

        // Here you can add the logic to store the answers in your database.
        await databaseService.saveGeneratedAnswers({
            questionId,
            generatedAnswers,
          });
      } catch (error) {
        console.error(
          `Failed to process job for questionId ${questionId}:`,
          error
        );
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before checking again
    }
  }
};

processQueue();

export { addJobToQueue };
