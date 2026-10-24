# Project rules for Claude

## Everything here has to sell something

On top of whatever the actual request is (code, bug fix, feature, refactor), cover the marketing and feasibility side:

- Is it sellable? Who would pay for it, and why?
- Which market is it for? Has that market been researched?
- Has the industry been researched (competitors, pricing, trends)?
- Is there a customer avatar? If not, flag it and propose one.

Scale it to the task: a typo fix gets a one line sell check at most; a new feature or app gets the full brief.

## Model split (saves Fable usage)

- **Cheaper models (Sonnet, Haiku):** do the work AND write a short seller brief answering the questions above.
- **Fable (any version):** the checker at milestones. Reviews the work plus the brief, pokes holes, and only researches deeper where there are gaps. In Claude Code, run the review as a subagent on the Fable model.
- **If Arthur forgets this process:** whatever model is running reminds him, or just runs it automatically. Never skip it silently.

## Working style

- When Arthur asks for something, just do it. Don't keep asking him to approve. Feedback before execution (pushback, a better idea) is very welcome; give it, then proceed.
- Arthur is not a developer: explain technical things in plain English.
- Never use em or en dashes in text you write; use commas, colons or full stops.

## Business tools

- Funnels, memberships and the contact database live in **Kartra**. Stay on Kartra until Groove becomes more robust. Do not build new integrations against Groove unless Arthur says so.
