import type { Day } from "../../types";

const day1: Day = {
  id: "day1",
  number: 1,
  title: "Model selection and context",
  summary: "Choose a model for a job by tracing limits, cost, and what you still need to measure.",
  agenda: [
    { minutes: "10", item: "Read the day overview and the customer decision." },
    { minutes: "25", item: "Lesson: capability, routing, and why the strongest model is not the default." },
    { minutes: "25", item: "Lesson: context budgets and why extra text can hurt." },
    { minutes: "30", item: "Lab: run the three scenarios and write a recommendation." },
    { minutes: "15", item: "Practice questions and a 60–90 second answer outline." },
  ],
  lessons: [
    {
      id: "day1-routing",
      title: "Route the job, then the model",
      minutes: 25,
      overview: "You will be able to explain why a customer picks a model for a workload, and what a model ID does not decide for them.",
      customerProblem: "A support director wants one model for ticket classification, contract extraction, and a weekly brief across twenty policy documents. Procurement has asked you which API model to standardize.",
      firstPrinciples: {
        constraint: "Each call has a price, a context limit, an output cap, and a comparative speed class. Those limits are properties of the model ID you send.",
        mechanism: "Routing means different jobs can call different model IDs. A cheap, fast model can classify. A more capable model can take the rare, messy synthesis.",
        tradeoff: "One standard model simplifies support and evaluation. It also makes the easy traffic pay the price and latency of the hardest job.",
      },
      walkthrough: {
        title: "One request chooses one model",
        summary: "The application, not the end user, usually sets the model field. The response does not tell you whether the answer is true.",
        steps: [
          { id: "job", label: "Name the job", input: "Classify a ticket, or extract clauses, or synthesize documents.", output: "A quality bar and a latency need.", note: "The job comes before the model brand." },
          { id: "id", label: "Send a model ID", input: "model: claude-sonnet-5", output: "That request is priced and limited as Sonnet 5.", note: "Aliases and dated IDs are easy to confuse. Pin what you evaluated." },
          { id: "bill", label: "Read the usage", input: "input tokens and output tokens", output: "List-price cost for this call only.", note: "Usage is not a quality score." },
          { id: "retire", label: "Check the retirement floor", input: "Published “not sooner than” date", output: "A migration window, not a promise of quality.", note: "Haiku 4.5’s floor is 15 October 2026. That means it will not retire before then." },
        ],
      },
      predict: {
        prompt: "If classification volume grows tenfold and the text per ticket stays short, what should happen to the default model?",
        choices: [
          { id: "stronger", label: "Move everyone to the strongest model so quality cannot drop." },
          { id: "route", label: "Keep a fast model on the short job and reserve a stronger model for the hard jobs." },
          { id: "context", label: "Increase the context window so volume is cheaper." },
        ],
        correctChoiceId: "route",
        rationale: "Volume multiplies the price of every token. A larger window does not discount short tickets. Routing lets you pay for capability where the job needs it.",
        controlLabel: "What changed in the workload?",
        initialOptionId: "same",
        options: [
          { id: "same", label: "Same mix of jobs", observation: "One model is easier to explain to procurement.", outcome: "You still write down which job is allowed to use it." },
          { id: "volume", label: "Ten times more short tickets", observation: "Cost scales with requests × tokens. The short job dominates the bill.", outcome: "A fast, lower list price is the first design to test, then an eval confirms accuracy." },
          { id: "hard", label: "The hard synthesis becomes the main job", observation: "The quality bar moved. The cheap route may no longer fit your own threshold.", outcome: "Re-run the eval. Do not assume the previous winner still fits." },
        ],
      },
      failure: {
        title: "The alias moved underneath the evaluation",
        symptoms: ["Weekend quality drops after no application release.", "The model string in code is a floating alias.", "The dated ID in last month’s eval is not the ID in production."],
        recovery: "Pin the model ID you evaluated, alarm on unexpected model changes, and re-run the held-out set before accepting a new ID.",
      },
      depth: {
        quick: [
          { type: "p", text: "A model profile is a bundle of price, window, output cap, and a vendor description of what it is for. Your eval decides whether that description holds for this customer." },
          { type: "callout", kind: "verified", title: "Checked 2026-09-25", text: "Headline API IDs in the models overview include claude-fable-5-1, claude-opus-5, claude-sonnet-5, and claude-haiku-4-5-20251001. Comparative latency is a label (slower, moderate, fast, fastest), not a millisecond SLA." },
        ],
        how: [
          { type: "p", text: "The request body includes a model string. Anthropic prices that call from the input and output tokens the API reports, plus modifiers such as cache and batch when they apply. The lab uses list prices and ignores negotiated discounts until you type them in." },
          { type: "term", id: "token", term: "Token", definition: "The unit the API counts and prices. The same paragraph can be a different token count on a newer tokenizer." },
        ],
        deeper: [
          { type: "callout", kind: "verified", text: "Claude 4.7 and later models, including Sonnet 5, use a tokenizer that produces roughly 30% more tokens for the same text. The exact change depends on the content. Do not budget with a universal words-to-tokens ratio." },
          { type: "callout", kind: "assumption", text: "The lab’s quality bands (routine, careful, deep) are an editorial map of Anthropic’s positioning. They are not benchmark scores. A customer eval can overturn them." },
          { type: "callout", kind: "needs-verification", text: "Prompt-caching and structured-output examples also mention claude-opus-5-5. A complete price row for that ID was not in the pricing table captured for this lab, so it is not a selectable priced model here." },
        ],
      },
      practice: [
        {
          id: "day1-q1",
          prompt: "A bank wants the lowest list price that still meets a careful extraction bar. What is the sound next step?",
          choices: [
            { id: "a", text: "Pick the cheapest model and skip evaluation because the vendor description sounds close.", correct: false, why: "Positioning is a hypothesis. Extraction errors have a business cost the list price does not show." },
            { id: "b", text: "Shortlist models that fit the window, then measure accuracy on held-out contracts before standardizing.", correct: true, why: "Limits remove impossible options. An evaluation set chooses among the rest." },
            { id: "c", text: "Always buy the strongest model so the bank never has to revisit the choice.", correct: false, why: "The strongest model raises cost and may be slower. It also does not remove the need to re-check when IDs change." },
          ],
        },
        {
          id: "day1-q2",
          prompt: "Haiku 4.5’s published retirement note says “not sooner than 15 October 2026.” What does that mean on 25 September 2026?",
          choices: [
            { id: "a", text: "The model shuts off on 15 October 2026.", correct: false, why: "“Not sooner than” is a floor. It does not say the model ends that day." },
            { id: "b", text: "You have a planning signal to confirm the current retirement note before a long commitment, not a shutdown clock.", correct: true, why: "Deprecation awareness means reading the current note and pinning an ID, then rechecking." },
            { id: "c", text: "Retirement dates do not matter if the customer is on an Enterprise plan.", correct: false, why: "Commercial plan and model lifecycle are different. Enterprise access does not freeze a model ID forever." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Cost per successful task, not cost per token alone", "Share of traffic on each model ID", "Held-out accuracy by job type", "Latency on the customer’s own traffic"],
        outcome: "The customer pays for capability where it changes a decision, and can explain the choice at renewal.",
      },
      interview: {
        prompt: "How do you choose a Claude model for an enterprise workload?",
        outline: ["Name the job and the failure that matters.", "State the hard limits: window, output cap, price, retirement.", "Say you would measure quality and latency rather than trust a league table.", "Mention routing if jobs differ.", "Say a stronger model does not replace review."],
        exemplar: "Example response — not your work. I start with the job. Ticket classification is short, high volume, and latency sensitive, so I test a fast lower-priced model against a held-out set. Contract synthesis is rarer and the cost of a miss is higher, so I test a more capable model and reserve output for the fields I need. I pin the model ID I evaluated, because an alias can move. I do not treat a larger context window as quality, and I do not treat the strongest model as a permission system.",
      },
      sourceIds: ["models", "pricing"],
      glossaryIds: ["token"],
    },
    {
      id: "day1-context",
      title: "Budget the context window",
      minutes: 25,
      overview: "You will trace where tokens go before the model answers, and predict what breaks when one section grows.",
      customerProblem: "A research team pastes five full policy manuals into every question because “the model has a million tokens.” Answers have become slower, costlier, and occasionally about the wrong manual.",
      firstPrinciples: {
        constraint: "The window is finite. Input tokens plus the output you reserve have to fit. Everything in the window is priced as input, whether or not it helped.",
        mechanism: "A context budget assigns the window to instructions, tool definitions, conversation history, retrieved passages, and reserved output.",
        tradeoff: "Keeping more source text can avoid a missed passage. It also crowds out instructions and raises the chance the model attends to the wrong page.",
      },
      walkthrough: {
        title: "Five stacks share one window",
        summary: "Click each stack. The sum is what the request sends, plus room for the answer.",
        steps: [
          { id: "instructions", label: "Instructions", input: "Role, tone, and the answer shape.", output: "A stable prefix you might cache later.", note: "Long instructions are still input tokens." },
          { id: "tools", label: "Tools", input: "Tool names, descriptions, and schemas.", output: "Extra input, including a tool-use system prompt when tools are present.", note: "Pricing docs list additional tool-use tokens by model. They are easy to forget in a spreadsheet." },
          { id: "history", label: "History", input: "Prior user and assistant turns.", output: "A growing prefix.", note: "Unbounded chat history will eventually hit the window." },
          { id: "retrieved", label: "Retrieved material", input: "The passages your search selected.", output: "The evidence the answer should use.", note: "If search is weak, a bigger stack makes a confident wrong answer more likely." },
          { id: "output", label: "Reserved output", input: "max tokens you allow the model to write.", output: "Room that cannot be filled with more source text.", note: "The output cap and the context window are both limits." },
        ],
      },
      predict: {
        prompt: "The retrieved stack grows until the total exceeds the window. What fails first?",
        choices: [
          { id: "quality-up", label: "Quality automatically improves because the model saw more." },
          { id: "reject", label: "The request no longer fits, or you must drop something else to make room." },
          { id: "free", label: "Tokens beyond the old 200k mark are free on every model." },
        ],
        correctChoiceId: "reject",
        rationale: "A window is a capacity limit. Overflow is a failed request or a silent trim you did not design. Extra text is not free quality.",
        controlLabel: "Grow one stack",
        initialOptionId: "balanced",
        options: [
          { id: "balanced", label: "Balanced budget", observation: "Instructions, a few tools, a short history, and a handful of passages fit with room to answer.", outcome: "The call can proceed. You can still ask whether every passage was needed." },
          { id: "history", label: "History grows for 40 turns", observation: "Old turns push retrieved passages toward the edge of the window.", outcome: "Summarize or drop old turns. Do not hope the model will ignore them for free." },
          { id: "dump", label: "Paste every manual", observation: "Retrieved tokens dominate cost. The instruction to cite a source is a small fraction of the bill.", outcome: "Retrieve a few relevant passages instead. More context is not automatically better." },
        ],
      },
      failure: {
        title: "The answer quotes a superseded appendix",
        symptoms: ["The correct clause was in the prompt, buried under older manuals.", "The citation looks formal and points at the old appendix.", "Cost per question jumped with the paste-everything change."],
        recovery: "Cut the packet to current, permitted passages. Ask the model to abstain when the packet is insufficient. Judge answers against a set of known clauses.",
      },
      depth: {
        quick: [
          { type: "p", text: "Think of the window as a suitcase. A bigger suitcase still charges you for every item and can hide the one document you needed." },
          { type: "term", id: "context-window", term: "Context window", definition: "The maximum combined size of what you send and what the model writes back on that call." },
        ],
        how: [
          { type: "callout", kind: "verified", text: "Fable 5.1, Opus 5, and Sonnet 5 are documented at a 1M token window. Haiku 4.5 is documented at 200K. Max output is 128K on the 1M models and 64K on Haiku 4.5. Claude 4.6 and later include the full 1M window at standard per-token rates, not a surcharge that starts at 200K." },
          { type: "p", text: "Haiku 4.5 cannot hold a 300k-token paste even though other current models can. Routing only works if the application checks the window before the call." },
        ],
        deeper: [
          { type: "p", text: "Tool definitions count as input. The pricing page also documents an automatic tool-use system prompt of a few hundred tokens, and the count differs by model and tool choice. A budget that ignores tools will look fine until the first production call." },
          { type: "callout", kind: "concept", text: "Long context and retrieval solve different failures. Long context helps when you truly must reason across a large packet you already trust. Retrieval helps when the corpus is larger than the window, permissioned, or changing. Neither guarantees recall." },
        ],
      },
      practice: [
        {
          id: "day1-q3",
          prompt: "A 900k-token request on Sonnet 5 is billed how, according to current pricing docs?",
          choices: [
            { id: "a", text: "At a higher long-context rate above 200k tokens.", correct: false, why: "For Claude 4.6 and later, the full 1M window is at standard per-token rates." },
            { id: "b", text: "At the same per-token list price as a much shorter Sonnet 5 request, before cache or batch modifiers.", correct: true, why: "The docs say a 900k request is billed at the same per-token rate as a 9k request. Modifiers such as cache still apply on top." },
            { id: "c", text: "It is free because it fits in the window.", correct: false, why: "Fitting is permission to send it, not a discount." },
          ],
        },
        {
          id: "day1-q4",
          prompt: "Why can adding more handbook pages make a support answer worse?",
          choices: [
            { id: "a", text: "The model is required to use the oldest page first.", correct: false, why: "There is no such guarantee. The risk is distraction and cost, not a documented oldest-page rule." },
            { id: "b", text: "Irrelevant or stale pages still occupy the window and can be quoted.", correct: true, why: "Presence in the prompt is not relevance. The application should select and filter first." },
            { id: "c", text: "Pages beyond 10,000 tokens are silently deleted for free.", correct: false, why: "Do not assume a silent free deletion. Design the budget and handle overflow." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Input tokens per successful answer", "Share of requests rejected for window overflow", "Rate of answers citing a stale source"],
        outcome: "Analysts spend their time on the right packet instead of paying to reprocess entire manuals.",
      },
      interview: {
        prompt: "Why is a larger context window not automatically better?",
        outline: ["Define the window as a shared budget.", "Name the five stacks.", "Give the stale-manual failure.", "Say you would measure citation accuracy, not window size."],
        exemplar: "Example response — not your work. The window is a budget shared by instructions, tools, history, retrieved text, and the answer. Every token is priced, and extra pages can be quoted even when they are old. On current Claude 4.6-and-later pricing the long window is not a separate surcharge, which makes over-pasting look cheap to design and expensive in production. I would rather retrieve the current permitted pages and measure whether answers cite them.",
      },
      sourceIds: ["models", "pricing"],
      glossaryIds: ["context-window", "token"],
    },
    {
      id: "day1-decision",
      title: "Recommend a model before production",
      minutes: 40,
      overview: "You will run three workloads, read constraint violations, and write the evaluation you still owe the customer.",
      customerProblem: "The same director wants a written recommendation this week. You may choose a model profile and change volume, tokens, latency need, and quality threshold. You may not invent a benchmark.",
      firstPrinciples: {
        constraint: "Hard limits remove options. Preferences such as “deep synthesis” are hypotheses until an eval says otherwise.",
        mechanism: "The simulator prices list cost from the context budget and checks the published window, output cap, and comparative latency label.",
        tradeoff: "A recommendation that only optimizes list price can miss a high-cost error. A recommendation that only picks the strongest model can miss a latency and cost constraint.",
      },
      walkthrough: {
        title: "From scenario to recommendation",
        summary: "The lab is the walkthrough. Use the scenario buttons, then inspect the budget and the checks.",
        steps: [
          { id: "scenario", label: "Pick a scenario", input: "Support, contracts, or multi-document synthesis.", output: "A starting budget and a quality need.", note: "The numbers are a teaching workload, not the customer’s production logs." },
          { id: "edit", label: "Change a parameter", input: "Volume, stack sizes, latency, quality.", output: "Cost and violations update.", note: "If nothing changes, the parameter was not on the path you are looking at." },
          { id: "recommend", label: "Read the reason", input: "All four priced models.", output: "The lowest list price that fits, plus what to evaluate.", note: "Editorial fit is labeled as an assumption." },
        ],
      },
      predict: {
        prompt: "You switch the support scenario from Haiku’s window to a 250,000-token paste. What do you expect?",
        choices: [
          { id: "ok", label: "Haiku still works because classification is easy." },
          { id: "window", label: "Haiku fails the context check because its documented window is 200k." },
          { id: "price", label: "The paste is free on Haiku because it is the cheapest model." },
        ],
        correctChoiceId: "window",
        rationale: "Difficulty does not expand the window. Haiku 4.5 is documented at 200k tokens. The paste does not fit.",
        controlLabel: "Preview the idea, then confirm in the lab",
        initialOptionId: "short",
        options: [
          { id: "short", label: "Short ticket", observation: "A few hundred tokens fit every current headline model.", outcome: "Window is not the deciding constraint. Cost, latency, and accuracy are." },
          { id: "long", label: "250k paste on Haiku", observation: "200k window is smaller than the paste plus an answer.", outcome: "The simulator should mark a hard failure. Open the lab and check." },
        ],
      },
      failure: {
        title: "The recommendation quotes a benchmark the vendor did not publish",
        symptoms: ["The slide says “Haiku is 4.2× faster” with no measurement.", "Quality is a single number with no dataset.", "The model ID in the slide does not match the API ID."],
        recovery: "Replace invented ratios with the comparative labels you can cite, and add a line that says latency and accuracy will be measured on the customer’s traffic.",
      },
      depth: {
        quick: [
          { type: "p", text: "Write the recommendation as a decision memo: job, constraints, choice, what you still need to measure, and what would change your mind." },
        ],
        how: [
          { type: "ul", items: ["Support classification: short input, high volume, interactive latency, routine bar.", "Contract extraction: medium input, field-level accuracy, careful bar.", "Multi-document synthesis: large retrieved stack, deep bar, waiting is acceptable."] },
          { type: "callout", kind: "assumption", text: "Illustrative token counts in the scenarios are round teaching numbers. They are not measured customer workloads." },
        ],
        deeper: [
          { type: "p", text: "Priority Tier is a capacity product with its own terms, and release notes say it is not available on Sonnet 5. Do not promise a latency tier you have not confirmed for the model ID in the contract. Fast mode is a separate premium path documented for specific Opus models and is not in this calculator." },
          { type: "callout", kind: "concept", text: "Deprecation awareness is a customer-success habit. Put the model ID, the date you checked the docs, and the next review date in the recommendation." },
        ],
      },
      practice: [
        {
          id: "day1-q5",
          prompt: "The simulator recommends Sonnet 5 for careful extraction. What must you still say in the memo?",
          choices: [
            { id: "a", text: "The recommendation is proven because the lab produced it.", correct: false, why: "The lab applies list prices and an editorial fit band. It does not see the customer’s contracts." },
            { id: "b", text: "We will evaluate field accuracy on held-out contracts and measure latency on their traffic before production.", correct: true, why: "The lab narrows the design. Production evidence is still required." },
            { id: "c", text: "Sonnet 5 is always the right enterprise model.", correct: false, why: "It is a strong default hypothesis for some jobs, not a universal answer." },
          ],
        },
        {
          id: "day1-q6",
          prompt: "Which claim is safe to put in front of a customer?",
          choices: [
            { id: "a", text: "“Haiku is the fastest comparative class on the current models overview.”", correct: true, why: "That matches a documented label. It is not a millisecond promise." },
            { id: "b", text: "“Haiku responds in 400 milliseconds for this bot.”", correct: false, why: "The lab does not have a measured latency for their traffic." },
            { id: "c", text: "“A 1M window makes retrieval unnecessary.”", correct: false, why: "Window size does not filter permissions, freshness, or relevance." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Monthly list-price estimate by model", "Constraint violations avoided", "Eval pass rate before launch"],
        outcome: "Procurement gets a choice they can revisit when the model ID, the price, or the job changes.",
      },
      interview: {
        prompt: "Walk me through a model-selection recommendation.",
        outline: ["One sentence on the job.", "The constraint that removed an option.", "The model you would test first and why.", "The measurement still outstanding."],
        exemplar: "Example response — not your work. For high-volume ticket classification I would test Haiku 4.5 first because the input is small and the documented latency class is the fastest. I would not use it for a 250k paste, because its window is 200k. For multi-document synthesis I would test Opus or Fable and budget the retrieved pages explicitly. The memo names the API ID, the list price I used, and the held-out set I still need. I do not claim a benchmark I did not run.",
      },
      labId: "model-decision",
      sourceIds: ["models", "pricing", "release-notes"],
      glossaryIds: ["context-window", "token"],
    },
  ],
};

export default day1;
