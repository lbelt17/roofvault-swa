const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const { SearchClient, AzureKeyCredential: SearchKey } = require("@azure/search-documents");

module.exports = async function (context, req) {
  const searchEndpoint = process.env.SEARCH_ENDPOINT;
  const searchKey = process.env.SEARCH_API_KEY;
  const searchIndex = process.env.SEARCH_INDEX;
  const openaiEndpoint = process.env.OPENAI_ENDPOINT;
  const openaiKey = process.env.OPENAI_API_KEY;
  const model = process.env.DEFAULT_MODEL || "gpt-4o-mini";

  const count = req.body?.count || 50;
  const onlyIIBEC = !!req.body?.onlyIIBEC;
  const batchSize = 10;
  const delayMs = 3000; // 3 seconds delay between batches

  const search = new SearchClient(searchEndpoint, searchIndex, new SearchKey(searchKey));
  const ai = new OpenAIClient(openaiEndpoint, new AzureKeyCredential(openaiKey));

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function askAI(prompt) {
    const response = await ai.getChatCompletions(model, [
      { role: "system", content: "You are an expert in roofing, waterproofing, and building envelope systems. Write high-quality multiple-choice exam questions (A–D) with answers, rationales, and citations based on IIBEC/NRCA principles." },
      { role: "user", content: prompt }
    ]);
    const text = response.choices[0].message?.content || "";
    try { return JSON.parse(text); } catch { return text; }
  }

  // 🧠 Build context using indexed docs
  let filter = onlyIIBEC ? "metadata_storage_name ne null" : "";
  const results = await search.search("roof OR membrane OR flashing OR waterproofing", { top: 5, filter });
  const contextDocs = [];
  for await (const r of results.results) {
    const text = r.document?.content || "";
    if (text.length > 200) contextDocs.push(text.slice(0, 1500));
  }
  const context = contextDocs.join("\n\n");

  // 🧩 Generate in safe batches
  const totalBatches = Math.ceil(count / batchSize);
  const allQuestions = [];

  for (let i = 0; i < totalBatches; i++) {
    const n = Math.

cd $HOME\roofvault-swa

@'
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const { SearchClient, AzureKeyCredential: SearchKey } = require("@azure/search-documents");

module.exports = async function (context, req) {
  const searchEndpoint = process.env.SEARCH_ENDPOINT;
  const searchKey = process.env.SEARCH_API_KEY;
  const searchIndex = process.env.SEARCH_INDEX;
  const openaiEndpoint = process.env.OPENAI_ENDPOINT;
  const openaiKey = process.env.OPENAI_API_KEY;
  const model = process.env.DEFAULT_MODEL || "gpt-4o-mini";

  const count = req.body?.count || 50;
  const onlyIIBEC = !!req.body?.onlyIIBEC;
  const batchSize = 10;
  const delayMs = 3000; // 3 seconds delay between batches

  const search = new SearchClient(searchEndpoint, searchIndex, new SearchKey(searchKey));
  const ai = new OpenAIClient(openaiEndpoint, new AzureKeyCredential(openaiKey));

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function askAI(prompt) {
    const response = await ai.getChatCompletions(model, [
      { role: "system", content: "You are an expert in roofing, waterproofing, and building envelope systems. Write high-quality multiple-choice exam questions (A–D) with answers, rationales, and citations based on IIBEC/NRCA principles." },
      { role: "user", content: prompt }
    ]);
    const text = response.choices[0].message?.content || "";
    try { return JSON.parse(text); } catch { return text; }
  }

  // 🧠 Build context using indexed docs
  let filter = onlyIIBEC ? "metadata_storage_name ne null" : "";
  const results = await search.search("roof OR membrane OR flashing OR waterproofing", { top: 5, filter });
  const contextDocs = [];
  for await (const r of results.results) {
    const text = r.document?.content || "";
    if (text.length > 200) contextDocs.push(text.slice(0, 1500));
  }
  const context = contextDocs.join("\n\n");

  // 🧩 Generate in safe batches
  const totalBatches = Math.ceil(count / batchSize);
  const allQuestions = [];

  for (let i = 0; i < totalBatches; i++) {
    const n = Math.min(batchSize, count - i * batchSize);
    const prompt = `From the following roofing/waterproofing text, write ${n} multiple-choice questions (A–D) with answers, rationales, and cited publication titles.\n\nContext:\n${context}`;
    try {
      const data = await askAI(prompt);
      if (Array.isArray(data.items)) allQuestions.push(...data.items);
      else if (Array.isArray(data)) allQuestions.push(...data);
    } catch (err) {
      context.log("Batch failed:", err.message);
    }
    if (i < totalBatches - 1) await sleep(delayMs);
  }

  context.res = {
    status: 200,
    body: { items: allQuestions, total: allQuestions.length }
  };
};
