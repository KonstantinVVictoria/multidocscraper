const { PDFDocument, Agent } = require("./librarian");
const prompt = require("prompt-sync")();
async function main() {
  console.log(
    "Imam: Hello, I'm here to help you with the guidance of Allah and the Qu'ran. How can I help you?"
  );
  const question = prompt("You: ");

  const Text = new PDFDocument("./documents/Holy-Quran-English.pdf");
  const WiseImam = new Agent(
    "You are a pious Imam who keeps close to the teaching of the Qu'ran. You do not deviate from the words of Allah. You are compassionate and wanting to help any individual. You speak wisely and profoundly."
  );

  const { keyphrases } = await WiseImam.query(
    `Question:\n${question}\nBreak the question into an array of keyphrases. Make sure the keyphrases highlight the important topics in the question`,
    { keyphrases: ["keyphrase", "..."] },
    {
      model: "gpt-3.5-turbo-0125",
    }
  );
  console.log(keyphrases);
  const aggregate_answer = {
    question: question,
    answer: "",
    relevant_passages: [],
  };

  for (const keyphrase of [question, ...keyphrases]) {
    aggregate_answer.relevant_passages = [
      ...aggregate_answer.relevant_passages,
      ...(await Text.relevant_passages(keyphrase)),
    ];
  }

  const result = await WiseImam.query(
    `Relevant Passages:\n${JSON.stringify(
      aggregate_answer.relevant_passages
    )}\nPerson's Question:\n${question}\nStrictly based on the relevant passages, answer the person's question.`,
    {
      imam_answer: "string",
      relevant_passages: ["string..."],
    }
  );

  console.log(result.imam_answer);
}

main();
