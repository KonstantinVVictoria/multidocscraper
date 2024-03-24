const { readPdfText } = require("pdf-text-reader");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { FaissStore } = require("@langchain/community/vectorstores/faiss");
const { formatDocumentsAsString } = require("langchain/util/document");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const {
  RunnablePassthrough,
  RunnableSequence,
} = require("@langchain/core/runnables");
const {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} = require("@langchain/core/prompts");
const APIKEY = "";
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: APIKEY });

class Document {
  constructor(path, type) {
    this.path = path;
    this.type = type;
  }
}
class TextDocument extends Document {
  constructor(path) {
    super(path, "pdf");
  }
  async relevant_passages(query, max_tokens = 1000) {
    if (this.doc === undefined) {
      const loader = new TextLoader(this.path, {
        splitPages: false,
      });
      this.text_file = (await loader.load())[0];
      this.raw_text = this.text_file.pageContent;
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
      });
      this.docs = await textSplitter.createDocuments([this.raw_text]);
      this._model = new ChatOpenAI({
        openAIApiKey: APIKEY,
        modelName: "gpt-4-0125-preview",
        maxTokens: max_tokens,
      });
    }
    if (this.vector_store === undefined) {
      this.vector_store = (
        await FaissStore.fromDocuments(
          this.docs,
          new OpenAIEmbeddings({
            modelName: "text-embedding-3-large",
            openAIApiKey: APIKEY,
          })
        )
      ).asRetriever();
    }
    const relevant_passages = (
      await this.vector_store.getRelevantDocuments(query)
    ).map((Document) => Document.pageContent);

    return relevant_passages;
  }
  async query(query, max_tokens = 1000) {
    if (this.doc === undefined) {
      const loader = new TextLoader(this.path, {
        splitPages: false,
      });
      this.text_file = (await loader.load())[0];
      this.raw_text = this.text_file.pageContent;
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
      });
      this.docs = await textSplitter.createDocuments([this.raw_text]);
      this._model = new ChatOpenAI({
        openAIApiKey: APIKEY,
        modelName: "gpt-4-0125-preview",
        maxTokens: max_tokens,
      });
    }
    if (this.vector_store === undefined) {
      this.vector_store = (
        await FaissStore.fromDocuments(
          this.docs,
          new OpenAIEmbeddings({
            modelName: "text-embedding-3-large",
            openAIApiKey: APIKEY,
          })
        )
      ).asRetriever();
    }
    const relevant_passages = (
      await this.vector_store.getRelevantDocuments(query)
    ).map((Document) => Document.pageContent);

    const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`;
    const messages = [
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
      HumanMessagePromptTemplate.fromTemplate("{question}"),
    ];
    const prompt = ChatPromptTemplate.fromMessages(messages);
    const context = this.vector_store.pipe(formatDocumentsAsString);
    const chain = RunnableSequence.from([
      {
        context,
        question: new RunnablePassthrough(),
      },
      prompt,
      this._model,
      new StringOutputParser(),
    ]);

    const answer = await chain.invoke(query);

    return {
      answer,
      relevant_passages,
      text_output: () => QueryResult(query, answer, relevant_passages),
    };
  }
}

class PDFDocument extends Document {
  constructor(path) {
    super(path, "pdf");
  }
  async relevant_passages(query, max_tokens = 1000) {
    if (this.doc === undefined) {
      const loader = new PDFLoader(this.path, {
        splitPages: false,
      });
      this.pdf = (await loader.load())[0];
      this.raw_text = this.pdf.pageContent;
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
      });
      this.docs = await textSplitter.createDocuments([this.raw_text]);
      this._model = new ChatOpenAI({
        openAIApiKey: APIKEY,
        modelName: "gpt-4-0125-preview",
        maxTokens: max_tokens,
      });
    }
    if (this.vector_store === undefined) {
      this.vector_store = (
        await FaissStore.fromDocuments(
          this.docs,
          new OpenAIEmbeddings({
            modelName: "text-embedding-3-large",
            openAIApiKey: APIKEY,
          })
        )
      ).asRetriever();
    }
    const relevant_passages = (
      await this.vector_store.getRelevantDocuments(query)
    ).map((Document) => Document.pageContent);

    return relevant_passages;
  }
  async query(query, max_tokens = 1000) {
    if (this.doc === undefined) {
      const loader = new PDFLoader(this.path, {
        splitPages: false,
      });
      this.pdf = (await loader.load())[0];
      this.raw_text = this.pdf.pageContent;
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
      });
      this.docs = await textSplitter.createDocuments([this.raw_text]);
      this._model = new ChatOpenAI({
        openAIApiKey: APIKEY,
        modelName: "gpt-4-0125-preview",
        maxTokens: max_tokens,
      });
    }
    if (this.vector_store === undefined) {
      this.vector_store = (
        await FaissStore.fromDocuments(
          this.docs,
          new OpenAIEmbeddings({
            modelName: "text-embedding-3-large",
            openAIApiKey: APIKEY,
          })
        )
      ).asRetriever();
    }
    const relevant_passages = (
      await this.vector_store.getRelevantDocuments(query)
    ).map((Document) => Document.pageContent);

    const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`;
    const messages = [
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
      HumanMessagePromptTemplate.fromTemplate("{question}"),
    ];
    const prompt = ChatPromptTemplate.fromMessages(messages);
    const context = this.vector_store.pipe(formatDocumentsAsString);
    const chain = RunnableSequence.from([
      {
        context,
        question: new RunnablePassthrough(),
      },
      prompt,
      this._model,
      new StringOutputParser(),
    ]);

    const answer = await chain.invoke(query);

    return {
      answer,
      relevant_passages,
      text_output: () => QueryResult(query, answer, relevant_passages),
    };
  }
}

class Agent {
  constructor(identity) {
    this.identity = identity;
  }
  async query(query, format, config) {
    const response = async () => {
      return await openai.chat.completions.create({
        messages: [
          { role: "system", content: this.identity },
          {
            role: "user",
            content: `${query}\nAnswer in the following JSON format:\n${JSON.stringify(
              format
            )}`,
          },
        ],
        model: config?.model || "gpt-4-0125-preview",
        temperature: config?.temperature || 0.8,
        response_format: { type: "json_object" },
      });
    };
    let answer = null;
    while (answer === null) {
      try {
        let completion = await response();
        answer = JSON.parse(completion.choices[0].message.content);
      } catch (error) {
        console.error(error);
        console.error("Cannot parse object. Retrying...");
        answer = null;
      }
    }
    return answer;
  }
}

function QueryResult(query, answer, relevant_passages) {
  const answer_format = `Query:\n${query}\n\nAnswer:\n${answer}`;
  const relevant_passage_format = relevant_passages.reduce(
    (result, passage, i) => {
      return (result += `Quote ${i + 1}:\n${passage}\n\n`);
    },
    ""
  );
  return `${answer_format}\n=======================\n${relevant_passage_format}`;
}
module.exports = { PDFDocument, Agent, TextDocument };
