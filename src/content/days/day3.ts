import type { Day } from "../../types";

const day3: Day = {
  id: "day3",
  number: 3,
  title: "Token economics, caching, and batching",
  summary: "Price a repeated handbook once, and see when a “saving” actually costs more.",
  agenda: [
    { minutes: "10", item: "Start from the bill, not the feature name." },
    { minutes: "20", item: "Lesson: input, output, and cost per successful task." },
    { minutes: "25", item: "Lesson: cache writes, reads, expiry, and cold starts." },
    { minutes: "30", item: "Lab: 10,000 documents a day and a 20,000-token handbook." },
    { minutes: "15", item: "Practice and a note on what you must measure." },
  ],
  lessons: [
    {
      id: "day3-unit-cost",
      title: "Price the successful outcome",
      minutes: 20,
      overview: "You will compute a baseline bill and explain why a cheap call that fails is not a saving.",
      customerProblem: "Finance sees a rising API invoice. The operations lead says the bot is “used a lot.” Neither can say what a successful ticket classification costs.",
      firstPrinciples: {
        constraint: "The invoice is mostly input tokens, output tokens, and modifiers. It is not a count of happy users.",
        mechanism: "Baseline cost is requests times input tokens times the input rate, plus output tokens times the output rate, divided by one million.",
        tradeoff: "Cutting output length saves money and can also cut the explanation a reviewer needed.",
      },
      walkthrough: {
        title: "From tokens to a monthly number",
        summary: "The formula uses mutually exclusive token buckets. In the baseline there is only one input bucket.",
        steps: [
          { id: "req", label: "Requests", input: "Requests per day × days in the period.", output: "The multiplier.", note: "A zero here makes the bill zero. It does not make a unit cost." },
          { id: "in", label: "Input", input: "Static handbook tokens plus the tokens that change every call.", output: "Input charge.", note: "Static means the text repeats. It is not free yet." },
          { id: "out", label: "Output", input: "Tokens the model writes.", output: "Output charge, often a higher rate.", note: "Output price and input price are different." },
          { id: "success", label: "Success", input: "Share of calls that complete the business task.", output: "Cost per success, if the share is not zero.", note: "Do not divide by zero." },
        ],
      },
      predict: {
        prompt: "Success rate falls from 90% to 45% and the token bill stays flat. What happens to cost per success?",
        choices: [
          { id: "same", label: "It stays flat because the invoice did not change." },
          { id: "up", label: "It roughly doubles, because the same spend produces half the successful tasks." },
          { id: "down", label: "It falls, because failed calls are free." },
        ],
        correctChoiceId: "up",
        rationale: "You already paid for the failed calls. Fewer successes spread that spend across a smaller denominator.",
        controlLabel: "Success rate",
        initialOptionId: "high",
        options: [
          { id: "high", label: "90% succeed", observation: "Most calls produce a completed task.", outcome: "Cost per success is close to cost per call." },
          { id: "low", label: "45% succeed", observation: "The invoice can look unchanged.", outcome: "Cost per successful task is about twice as high." },
          { id: "zero", label: "None succeed", observation: "The denominator is zero.", outcome: "Show “not defined” rather than a fake number." },
        ],
      },
      failure: {
        title: "A dashboard celebrates lower spend after the workflow was turned off",
        symptoms: ["Requests collapse.", "Successful tasks collapse with them.", "A slide calls it efficiency."],
        recovery: "Pair spend with completed tasks. A saving that removes the work is not a saving.",
      },
      depth: {
        quick: [
          { type: "p", text: "Ask “what is a success?” before you optimize. For support it might be a correctly routed ticket. For extraction it might be a reviewer-accepted document." },
          { type: "term", id: "mtok", term: "MTok", definition: "A million tokens, the unit on the price card." },
        ],
        how: [
          { type: "callout", kind: "verified", text: "List prices captured on 2026-09-25: Haiku 4.5 $1 / $5, Sonnet 5 $2 / $10, Opus 5 $5 / $25, Fable 5.1 $10 / $50 per million input and output tokens. Enterprise contracts can differ. The calculator starts from these numbers and lets you edit them." },
        ],
        deeper: [
          { type: "p", text: "Output is often several times the input rate, so a verbose answer dominates small requests. For a 20,000-token handbook the input dominates instead. Look at the mix before you pick a tactic." },
          { type: "callout", kind: "concept", text: "More tokens, more API keys, or a higher output-to-input ratio are not customer-health scores. They are clues that need a workflow attached." },
        ],
      },
      practice: [
        {
          id: "day3-q1",
          prompt: "Which formula matches the uncached baseline?",
          choices: [
            { id: "a", text: "requests × ((static + dynamic) × input rate + output × output rate) / 1,000,000", correct: true, why: "Static and dynamic input share the input rate when nothing is cached." },
            { id: "b", text: "requests × static × input rate, ignoring output", correct: false, why: "Output is priced too, and dynamic input is part of the call." },
            { id: "c", text: "users × seats × a fixed token-to-word ratio", correct: false, why: "There is no fixed word ratio, and seats are a different commercial model." },
          ],
        },
        {
          id: "day3-q2",
          prompt: "The bill is zero because requests are zero. What is cost per success?",
          choices: [
            { id: "a", text: "Zero dollars, which proves the workflow is efficient.", correct: false, why: "No work happened. Zero divided by zero is not an efficiency score." },
            { id: "b", text: "Undefined. There were no successful tasks to divide by.", correct: true, why: "The lab refuses the division instead of inventing a number." },
            { id: "c", text: "Equal to the output price.", correct: false, why: "A price card is not a unit cost for work you did not run." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Cost per successful task", "Success rate", "Input versus output share of the bill"],
        outcome: "Finance and operations can see whether the invoice bought completed work.",
      },
      interview: {
        prompt: "How do you talk about API cost with a customer?",
        outline: ["Define success.", "Show the baseline formula.", "Separate a smaller invoice from a worse outcome."],
        exemplar: "Example response — not your work. I price requests times input and output, then divide by successful tasks. If the success rate halves, cost per success rises even when the invoice is flat. I do not convert tokens to words with a fixed ratio, and I do not call a dropped workflow a saving.",
      },
      sourceIds: ["pricing"],
      glossaryIds: ["mtok", "token"],
    },
    {
      id: "day3-caching",
      title: "Why pay to reread the handbook?",
      minutes: 25,
      overview: "You will separate a reusable prefix from the text that changes, and predict when caching costs more.",
      customerProblem: "Every classification call resends the same 20,000-token help-center handbook plus a short ticket. The handbook barely changes. The ticket always changes.",
      firstPrinciples: {
        constraint: "A cache entry matches a prefix and then expires. If the prefix changes, the entry misses.",
        mechanism: "The first request in a lifetime pays a cache write, which is more expensive than normal input. Later requests pay a cheaper cache read for that same prefix. Changing tokens stay on the normal input rate.",
        tradeoff: "A write premium is worth it only if enough later requests read the prefix before it expires. One lonely request pays extra and gets nothing back.",
      },
      walkthrough: {
        title: "Write once, read while it lives",
        summary: "The handbook is the prefix. The ticket is the suffix. Do not put the cache point on the ticket.",
        steps: [
          { id: "prefix", label: "Stable prefix", input: "Handbook and instructions that stay identical.", output: "Eligible to cache if they clear the minimum length.", note: "Sonnet 5’s documented minimum is 1,024 tokens. Haiku 4.5’s is 4,096." },
          { id: "write", label: "Cache write", input: "The first request in the TTL.", output: "A 1.25× charge for a 5-minute write, or 2× for an hour.", note: "This is a premium, not a discount." },
          { id: "read", label: "Cache read", input: "The next request with the same prefix.", output: "0.1× the input price, or 0.025× on Fable 5.1.", note: "The handbook is not also billed as normal input." },
          { id: "miss", label: "Expiry or edit", input: "The TTL passed, or someone edited a word.", output: "A new write.", note: "A breakpoint on the changing ticket never hits." },
        ],
      },
      predict: {
        prompt: "You cache a 20,000-token handbook but only send one request per hour, with a 5-minute TTL. What happens to cost?",
        choices: [
          { id: "down", label: "Cost falls by about 90% because cache reads are cheap." },
          { id: "up", label: "Cost rises, because each request is a cold write and there is no read." },
          { id: "same", label: "Cost is identical because writes are billed at the normal input rate." },
        ],
        correctChoiceId: "up",
        rationale: "A 5-minute entry expires before the next hourly request. You pay the write premium every time.",
        controlLabel: "How often does the same prefix repeat inside the TTL?",
        initialOptionId: "many",
        options: [
          { id: "many", label: "Many requests per 5 minutes", observation: "One write, then mostly reads.", outcome: "The handbook portion of the bill drops sharply." },
          { id: "one", label: "One request, then silence until expiry", observation: "Every request is a write at 1.25× or 2×.", outcome: "Caching increased cost. The lab should show a negative saving." },
          { id: "short", label: "Prefix under the model minimum", observation: "The platform processes it as ordinary input and does not error.", outcome: "You do not get a discount. Check the usage fields." },
        ],
      },
      failure: {
        title: "The cache point sits on a timestamp",
        symptoms: ["cache_creation_input_tokens is high on every call.", "cache_read_input_tokens stays near zero.", "The prefix includes “today’s date” or the user message."],
        recovery: "Move the breakpoint to the last byte that is identical across calls. Keep timestamps and tickets after it.",
      },
      depth: {
        quick: [
          { type: "p", text: "Caching is a discount on repetition. It is not a discount on unique text, and it is not free to set up." },
          { type: "term", id: "prompt-caching", term: "Prompt caching", definition: "Reusing a processed prefix within its lifetime." },
        ],
        how: [
          { type: "callout", kind: "verified", text: "5-minute writes are 1.25× base input and 1-hour writes are 2×. Reads are 0.1×, except 0.025× on Fable 5.1. A 5-minute cache pays for itself after one read. A 1-hour cache pays for itself after two reads at the 0.1× rate. The pricing page says these multipliers stack with Batch." },
          { type: "term", id: "cache-write", term: "Cache write", definition: "The premium charge for storing a prefix." },
          { type: "term", id: "cache-read", term: "Cache read", definition: "The discounted charge for reusing it. Do not add the full input price on top." },
        ],
        deeper: [
          { type: "p", text: "The cache becomes readable after the first response starts. A burst of parallel calls at a cold start can all miss and all pay a write. The calculator assumes one write per TTL window and says so. It is an assumption, not a trace of your traffic." },
          { type: "p", text: "Minimum lengths differ by model. A handbook that caches on Sonnet 5 may be too short for Haiku 4.5. Routing can change cache eligibility." },
        ],
      },
      practice: [
        {
          id: "day3-q3",
          prompt: "Which tokens are billed as a cache read in a healthy handbook design?",
          choices: [
            { id: "a", text: "The stable handbook, on requests after the write, and not also as normal input.", correct: true, why: "The categories are mutually exclusive." },
            { id: "b", text: "The handbook and the unique ticket.", correct: false, why: "The ticket changes, so it stays uncached." },
            { id: "c", text: "The handbook twice: once at full price and once at the read price.", correct: false, why: "That double count invents a bill the API does not charge." },
          ],
        },
        {
          id: "day3-q4",
          prompt: "A prefix is 400 tokens on Haiku 4.5. What should you expect?",
          choices: [
            { id: "a", text: "A cache discount, because caching was requested.", correct: false, why: "Haiku 4.5’s documented minimum is 4,096 tokens. Shorter prompts are not cached, and no error is returned." },
            { id: "b", text: "Ordinary input pricing. Confirm both cache usage fields are zero.", correct: true, why: "Eligibility is a length check, not a hope." },
            { id: "c", text: "An error that stops the assistant.", correct: false, why: "The docs say the request is processed without caching." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Cache hit rate on the stable prefix", "Write versus read tokens", "Cost per success before and after"],
        outcome: "The customer stops paying full price to reread a handbook that did not change.",
      },
      interview: {
        prompt: "Explain prompt caching to a finance partner.",
        outline: ["The repeated handbook.", "Write premium, then cheap reads.", "Expiry and the case where it costs more.", "What you would measure."],
        exemplar: "Example response — not your work. If every call resends the same handbook, I cache that prefix and leave the ticket uncached. The first call in each five-minute window pays a 25% premium to store it. Later calls read it at a tenth of the input price. If traffic is rarer than the lifetime, I only pay the premium, so caching can increase cost. I would watch cache read tokens and cost per successful ticket, not a slide that assumes a hit rate.",
      },
      sourceIds: ["pricing", "caching"],
      glossaryIds: ["prompt-caching", "cache-write", "cache-read"],
    },
    {
      id: "day3-batch",
      title: "Wait, or pay for now",
      minutes: 30,
      overview: "You will decide when a 50% batch discount applies, and when it can sit on top of caching.",
      customerProblem: "Overnight, the company classifies a backlog of 10,000 documents. Each document includes the same 20,000-token handbook. Nobody is waiting on the phone.",
      firstPrinciples: {
        constraint: "Batch is asynchronous. It is the wrong tool when a person is waiting in a chat.",
        mechanism: "The Batch API discounts input and output. Current pricing docs say cache multipliers stack with that discount.",
        tradeoff: "Stacking is the cheapest path only if the workload can wait and the prefix actually hits. A realtime bot cannot take the batch discount just because the spreadsheet looks better.",
      },
      walkthrough: {
        title: "Four bills, one workload",
        summary: "The calculator shows baseline, cache only, batch only, and combined. Combined is enabled because the docs currently say the modifiers stack.",
        steps: [
          { id: "base", label: "Baseline", input: "Full input and output rates.", output: "The number to beat.", note: "This is the formula in the lesson brief." },
          { id: "cache", label: "Cache", input: "Writes, reads, and uncached tickets.", output: "A bill that can be higher or lower.", note: "Look at requests per cache window." },
          { id: "batch", label: "Batch", input: "Half of input and output, no cache.", output: "A 50% path if waiting is acceptable.", note: "Fast mode is documented as incompatible with Batch. This lab does not model fast mode." },
          { id: "both", label: "Both", input: "Cache multipliers and the batch multiplier.", output: "The stacked bill.", note: "If the stack flag in config is turned off, the lab compares them separately instead." },
        ],
      },
      predict: {
        prompt: "The handbook workload runs overnight and the prefix clears the cache minimum. Which design should you compare first?",
        choices: [
          { id: "chat", label: "Keep it on the interactive endpoint and ignore batch, because batch is obscure." },
          { id: "stack", label: "Compare cache, batch, and the stacked price, and ship the stack only if the job can wait." },
          { id: "always", label: "Always stack them for chat support, because the docs mention both." },
        ],
        correctChoiceId: "stack",
        rationale: "The discount is real in the price card and still depends on the product constraint: someone may be waiting.",
        controlLabel: "Can the user wait?",
        initialOptionId: "overnight",
        options: [
          { id: "overnight", label: "Overnight backlog", observation: "Latency of minutes or hours is acceptable.", outcome: "Batch is in play. Caching still helps if the handbook repeats inside the cache lifetime." },
          { id: "phone", label: "Agent on the phone", observation: "They need an answer now.", outcome: "Do not put this call on the batch path. Caching can still help." },
        ],
      },
      failure: {
        title: "The business case double-counts the handbook",
        symptoms: ["The sheet charges 20,000 tokens at the full input rate and again at the cache-read rate.", "Savings look smaller than production.", "Or the reverse sheet claims a 90% cut with one request per day."],
        recovery: "Reconcile token categories so static tokens appear in exactly one of uncached, write, or read. State the TTL and the cold-start assumption beside the percentage.",
      },
      depth: {
        quick: [
          { type: "p", text: "The example to load in the lab is 10,000 documents a day and a 20,000-token handbook. Edit every assumption. The point is the measurement plan, not a single dollar figure." },
          { type: "term", id: "batch-api", term: "Batch API", definition: "Asynchronous requests at a lower list price." },
        ],
        how: [
          { type: "callout", kind: "verified", text: "The pricing page says cache multipliers stack with the Batch API discount and with data residency. This lab stacks cache and batch for that reason. The flag lives in pricing config so a doc change does not require a hunt through the interface." },
        ],
        deeper: [
          { type: "p", text: "A 1.1× US inference geography multiplier is documented for Claude 4.6 and later when inference_geo is us. The calculator does not apply it unless you fold it into the edited prices. Say so in the customer note." },
          { type: "callout", kind: "assumption", text: "Operating minutes default to a continuous workday pattern you can edit. Real queues burst. Use production usage fields to replace the assumption." },
        ],
      },
      practice: [
        {
          id: "day3-q5",
          prompt: "When may this lab add cache and batch discounts together?",
          choices: [
            { id: "a", text: "Whenever it makes the slide look better.", correct: false, why: "The combination has to be supported by the current price rules, and the workload has to be allowed to wait." },
            { id: "b", text: "When the pricing config says they stack, which matches the docs checked for this lab, and the job is asynchronous.", correct: true, why: "The product constraint and the price rule are both required." },
            { id: "c", text: "Never, because discounts cannot combine.", correct: false, why: "The current pricing page explicitly says the multipliers stack. Recheck before you rely on that in a contract." },
          ],
        },
        {
          id: "day3-q6",
          prompt: "What would you measure before telling a CFO the handbook saving is real?",
          choices: [
            { id: "a", text: "Only the percentage in this calculator.", correct: false, why: "The calculator is a model of assumptions." },
            { id: "b", text: "Production cache write and read tokens, expiry, and cost per successful document.", correct: true, why: "Those fields tell you whether the prefix hit and whether the work still completed." },
            { id: "c", text: "The number of API keys created.", correct: false, why: "Keys are not a value metric." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Baseline versus optimized dollars", "Savings percentage, which may be negative", "Cost per successful document", "Share of tokens written, read, and uncached"],
        outcome: "The customer can fund caching or batching with a measurement plan instead of a rounded slogan.",
      },
      interview: {
        prompt: "A customer resends a 20,000-token handbook 10,000 times a day. What do you do?",
        outline: ["Separate prefix and ticket.", "Explain write, read, and expiry.", "Say batch only if they can wait.", "Say what you would measure.", "Mention the saving can be negative."],
        exemplar: "Example response — not your work. I would cache the handbook and keep each document’s unique text uncached. With a five-minute cache and steady daytime traffic, most calls should be reads at a tenth of the input price, after a write premium on each cold start. If this is an overnight backlog I would also price the Batch discount, and current docs say those modifiers stack. I would not promise the spreadsheet until we see cache read tokens and cost per successful document. If traffic is sparse, caching can cost more, and I would show that case on purpose.",
      },
      labId: "cost-calculator",
      sourceIds: ["pricing", "caching"],
      glossaryIds: ["batch-api", "prompt-caching", "cache-read", "cache-write"],
    },
  ],
};

export default day3;
