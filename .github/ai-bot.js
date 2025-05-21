const { Octokit } = require("@octokit/core");
const { OpenAI } = require("openai");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const event = require(process.env.GITHUB_EVENT_PATH);

  // Only respond to opened issues
  if (!event.issue || event.action !== "opened") return;

  const prompt = `Reply helpfully to this GitHub issue:\n\n${event.issue.title}\n${event.issue.body}`;

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
  });

  const aiResponse = chatCompletion.choices[0].message.content;

  await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
    owner: event.repository.owner.login,
    repo: event.repository.name,
    issue_number: event.issue.number,
    body: aiResponse,
  });
}

main().catch(console.error);
