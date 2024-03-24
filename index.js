const { PDFDocument, Agent, TextDocument } = require("./librarian");
const fs = require("fs");
async function scrape() {
  const EWS7 = new TextDocument("./documents/EWS7.txt");
  const question =
    "Explain the 1924 Immigration Act, the dual citizenship of the Nisei, and JACL.";
  const Thinker = new Agent(
    "You are a researcher, and you make sure that with the evidence you've gathered, you can answer the question correctly."
  );
  let answer = await EWS7.query(question);

  let thought_process = {
    is_correct: false,
  };

  let aggregate_answer = {
    question: question,
    answer: answer.answer,
    relevant_passages: answer.relevant_passages,
  };
  while (
    !thought_process.is_correct ||
    thought_process.is_correct === "false"
  ) {
    console.log(aggregate_answer);

    thought_process = await Thinker.query(
      `Evidence:\n${JSON.stringify(
        aggregate_answer
      )}\nDo the relevant_passages support the answer? If not, write a short question that would cover the parts of the answer that is not .`,
      { thought: "short sentence", is_correct: "boolean", question: "string" }
    );

    console.log("thought process:", thought_process);

    if (!thought_process.is_correct) {
      answer = aggregateAnswer(
        question,
        answer,
        await EWS7.query(thought_process.question)
      );
    }
  }
  console.log(answer);
}

async function scrape2(question, Text, phrases) {
  const Researcher = new Agent(
    "You are a researcher, and you make sure that with the evidence you've gathered, you can answer the question correctly."
  );

  let keyphrases = null;
  if (phrases === undefined) {
    const result = await Researcher.query(
      `Question:\n${question}\nFrom the question, come up with an array of two word key phrases that capture what is being asked effectively. These phrases will be used for a semantic search.`,
      { keyphrases: ["keyphrase : string", "..."] },
      {
        model: "gpt-3.5-turbo-0125",
      }
    );
    keyphrases = result.keyphrases;
  } else {
    keyphrases = phrases;
  }

  const aggregate_answer = {
    question: question,
    answer: "",
    relevant_passages: [],
  };
  console.log(aggregate_answer);
  for (const keyphrase of [question, ...keyphrases]) {
    console.log(keyphrase);
    aggregate_answer.relevant_passages = [
      ...aggregate_answer.relevant_passages,
      ...(await Text.relevant_passages(keyphrase)),
    ];
  }
  console.log(aggregate_answer);
  const result = await Researcher.query(
    `Relevant Passages:\n${JSON.stringify(
      aggregate_answer.relevant_passages
    )}\nQuestion:\n${question}\nStrictly based on the relevant passages, answer the question. Provide the parts that you could not answer with the passages`,
    {
      answer_to_the_question: "string",
      could_not_answer: ["string..."],
      relevant_passages: ["string..."],
    }
  );

  console.log(result);
}

function aggregateAnswer(question, answer1, answer2) {
  return {
    question: question,
    answer: answer2.answer,
    relevant_passages: [
      ...answer1.relevant_passages,
      ...answer2.relevant_passages,
    ],
  };
}

scrape2(
  `Describe and discuss what kind of laborers Sam Chang hired on his farm`,
  new TextDocument("./documents/liu5.txt")
);
