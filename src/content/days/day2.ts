import type { Day } from "../../types";

const day2: Day = {
  id: "day2",
  number: 2,
  title: "APIs, tool use, and structured outputs",
  summary: "Follow one customer question through a request, a tool, a permission check, and a final answer.",
  agenda: [
    { minutes: "10", item: "Overview: the application owns side effects." },
    { minutes: "20", item: "Lesson: what is in a Messages request and response." },
    { minutes: "20", item: "Lesson: tool requests versus execution." },
    { minutes: "40", item: "Lab: step through order status, including failures and a simulated CRM note." },
    { minutes: "15", item: "Practice and the evidence note on where validation belongs." },
  ],
  lessons: [
    {
      id: "day2-anatomy",
      title: "What a request actually contains",
      minutes: 20,
      overview: "You will name the parts of a Messages API call and read a stop reason without treating it as a business result.",
      customerProblem: "An integration partner says “the API failed” whenever a user does not get the sentence they hoped for. Engineering and support are debugging different things.",
      firstPrinciples: {
        constraint: "The API returns a structured response, not a promise that the sentence is true or that a downstream system changed.",
        mechanism: "A call sends a model ID, a token cap, and a list of messages with roles. The response includes content blocks, a stop reason, and token usage.",
        tradeoff: "A higher max token cap lets the model finish a long answer. It also raises the worst-case output bill and can hit the model’s output limit.",
      },
      walkthrough: {
        title: "Request in, response out",
        summary: "Authentication proves the caller may use the API. It does not prove the end user may see a particular order.",
        steps: [
          { id: "auth", label: "API credential", input: "An API key or other Console credential on the request.", output: "The platform accepts or rejects the call.", note: "Keys are secrets. This lab never asks you to paste one." },
          { id: "roles", label: "Roles", input: "System instructions, then user and assistant turns.", output: "The conversation the model sees.", note: "System text is not an authorization policy." },
          { id: "cap", label: "max_tokens", input: "The most output you will pay for on this call.", output: "A stop if the model hits the cap.", note: "A stopped answer can be valid-looking and incomplete." },
          { id: "stop", label: "stop_reason", input: "Why generation stopped.", output: "end_turn, tool_use, max_tokens, refusal, or another documented reason.", note: "Read it before you show the text to a customer." },
        ],
      },
      predict: {
        prompt: "The model hits max_tokens halfway through a JSON object. What should the application do?",
        choices: [
          { id: "parse", label: "Parse whatever text came back and store it." },
          { id: "retry", label: "Treat the output as incomplete, raise the cap or tighten the task, and do not store a partial object as success." },
          { id: "trust", label: "Trust it because the stop reason is present, so the API succeeded." },
        ],
        correctChoiceId: "retry",
        rationale: "A stop reason of max_tokens means the answer was cut. Cut JSON is not a successful extraction.",
        controlLabel: "Change the output cap",
        initialOptionId: "enough",
        options: [
          { id: "enough", label: "Cap larger than the answer", observation: "stop_reason is end_turn. Usage shows the tokens you actually wrote.", outcome: "You can validate the body next. Success is still not truth." },
          { id: "tight", label: "Cap of 16 tokens", observation: "Generation stops early. The JSON is truncated.", outcome: "Do not mark the business task successful." },
        ],
      },
      failure: {
        title: "Support files a model outage for a refusal",
        symptoms: ["HTTP 200 with stop_reason refusal.", "No downstream system was contacted.", "The user-facing text says the assistant cannot help with that request."],
        recovery: "Branch on stop_reason. A refusal is a product decision to surface, not a timeout to retry in a tight loop.",
      },
      depth: {
        quick: [
          { type: "p", text: "Separate transport success from task success. The call can succeed and still be the wrong answer, a refusal, or a tool request that your code must handle." },
          { type: "term", id: "stop-reason", term: "Stop reason", definition: "The response field that tells you why the model stopped writing." },
        ],
        how: [
          { type: "p", text: "A typical teaching request has model, max_tokens, system, and messages. The response content is a list of blocks. A text block is prose. A tool_use block is a request for your application to do something." },
          { type: "term", id: "system-prompt", term: "System prompt", definition: "Developer-supplied instructions. People sometimes talk about them as if they were security policy. They are not." },
        ],
        deeper: [
          { type: "callout", kind: "concept", text: "Authentication to Anthropic answers “may this application call the API?” Authorization inside your application answers “may this person see this order?” Those checks sit in different systems." },
          { type: "callout", kind: "needs-verification", text: "The full set of stop_reason values can change. Before you write production handling, check the current Messages API reference rather than copying a list from memory." },
        ],
      },
      practice: [
        {
          id: "day2-q1",
          prompt: "Where should the API key live?",
          choices: [
            { id: "a", text: "In the browser of every end user, so the model can personalize answers.", correct: false, why: "A browser key is a leaked key. End-user identity is a different problem." },
            { id: "b", text: "On the application server or a secret store, never in this learning lab or a public client.", correct: true, why: "The key authenticates the application. User permissions are checked separately." },
            { id: "c", text: "Inside the system prompt so the model can pass it to tools.", correct: false, why: "Putting a secret in the prompt exposes it to logs, traces, and the model context." },
          ],
        },
        {
          id: "day2-q2",
          prompt: "A response has stop_reason tool_use. What happened?",
          choices: [
            { id: "a", text: "The order database was already updated.", correct: false, why: "tool_use means the model asked. Your code has not necessarily run anything." },
            { id: "b", text: "The model requested a tool. Your application must validate and decide whether to run it.", correct: true, why: "The tool call is a proposal until your code executes it." },
            { id: "c", text: "The model finished the user-facing answer.", correct: false, why: "The user-facing answer usually comes after the tool result is sent back." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Share of calls by stop reason", "Truncated outputs", "Authentication errors versus empty business results"],
        outcome: "Support stops calling every disappointing sentence an outage, and engineering sees the real failure class.",
      },
      interview: {
        prompt: "Explain a Claude API request without reading code line by line.",
        outline: ["Credential, model, messages, max tokens.", "Response blocks, stop reason, usage.", "One sentence on what the API does not do."],
        exemplar: "Example response — not your work. The application sends a model ID, instructions, the user turn, and a cap on output tokens. Claude returns blocks of text or a tool request, a stop reason, and token counts. I use the stop reason to see whether we finished, hit the cap, refused, or asked for a tool. The HTTP call succeeding does not mean the order changed.",
      },
      sourceIds: ["models", "pricing"],
      glossaryIds: ["stop-reason", "system-prompt"],
    },
    {
      id: "day2-tools",
      title: "A tool request is not permission",
      minutes: 25,
      overview: "You will trace a tool call from the model to your code and back, and point to the step that must authorize it.",
      customerProblem: "A prototype lets the model “update the CRM” whenever it feels confident. A sales manager sees notes on the wrong account after a confusing email.",
      firstPrinciples: {
        constraint: "The model does not hold your company’s authority. It can only emit a request.",
        mechanism: "Your application checks the arguments against a schema, checks the caller’s permission, then calls the system of record with a timeout.",
        tradeoff: "Letting the model call tools makes the product useful. Every tool is a new way to do the wrong thing quickly if the check is missing.",
      },
      walkthrough: {
        title: "Six hops for an order status",
        summary: "The lab animates this path. The middle hops belong to your application.",
        steps: [
          { id: "q", label: "Customer question", input: "“Where is order 1001?”", output: "A user message.", note: "The question is not proof they own the order." },
          { id: "ask", label: "Model tool request", input: "tool_use get_order with an order id.", output: "JSON arguments.", note: "This is a proposal." },
          { id: "check", label: "Validate and authorize", input: "Schema plus the signed-in user.", output: "Allow or deny.", note: "Deny means the order service is not called." },
          { id: "svc", label: "Order service", input: "A mocked lookup.", output: "Found, missing, timeout, or rate limit.", note: "The lab does not call a real service." },
          { id: "result", label: "Tool result", input: "The service payload.", output: "A tool_result block tied to the tool_use id.", note: "The model sees what you chose to return." },
          { id: "final", label: "Final answer", input: "The conversation including the tool result.", output: "A sentence for the customer.", note: "Still review the sentence if the stakes are high." },
        ],
      },
      predict: {
        prompt: "The model requests get_order for an id the signed-in user does not own. Where does the path stop?",
        choices: [
          { id: "model", label: "Inside the model, because it knows your permissions." },
          { id: "app", label: "In the application authorization check, before the order service." },
          { id: "crm", label: "After the CRM write, so you can undo it." },
        ],
        correctChoiceId: "app",
        rationale: "The model was not given your permission tables. The safe place to enforce them is your application, before the side effect.",
        controlLabel: "Who is signed in?",
        initialOptionId: "owner",
        options: [
          { id: "owner", label: "The order owner", observation: "Authorization passes. The mock service can return a status.", outcome: "The final answer may quote that status." },
          { id: "stranger", label: "A different customer", observation: "Authorization fails. The service is not called.", outcome: "The user sees a denial, not someone else’s shipment." },
        ],
      },
      failure: {
        title: "The model invents a status the service never returned",
        symptoms: ["Tool result says not found.", "The final sentence says the order shipped yesterday.", "No row in the order service matches that sentence."],
        recovery: "Constrain the final answer to the tool result, or render the status from the service payload directly when the task is a lookup.",
      },
      depth: {
        quick: [
          { type: "p", text: "Say this sentence out loud: the application executes tools. The model requests them." },
          { type: "term", id: "tool-use", term: "Tool use", definition: "A structured request from the model naming a tool and arguments." },
        ],
        how: [
          { type: "p", text: "After tool_use, your code returns a tool_result with the same tool_use id. A second model call can then write the user-facing sentence. If you skip the second call and render the JSON yourself, the user sees the service data with less chance of paraphrase error." },
        ],
        deeper: [
          { type: "callout", kind: "verified", text: "Strict tool use is documented as a way to constrain tool inputs to a schema. Release notes also say that on Fable 5.1, forcing a specific tool with tool_choice any or tool returns a 400, while auto and none remain. Check the current page before you design a forced-tool flow on that model." },
          { type: "p", text: "Schema-valid arguments can still point at the wrong order. Validity is shape. Authorization is a business rule." },
        ],
      },
      practice: [
        {
          id: "day2-q3",
          prompt: "A teammate wants the model to delete CRM records “only when it is sure.” What do you say?",
          choices: [
            { id: "a", text: "Allow it. Self-reported confidence is a calibrated probability.", correct: false, why: "Model confidence is not a calibrated reliability score, and it is not an approval." },
            { id: "b", text: "The application should require a permission check and, for deletes, an explicit human confirmation.", correct: true, why: "Destructive actions need a control outside the model’s prose." },
            { id: "c", text: "Put “do not delete” in the system prompt and skip other controls.", correct: false, why: "A prompt is not an access-control system." },
          ],
        },
        {
          id: "day2-q4",
          prompt: "The order service times out. What is a sound user-facing result?",
          choices: [
            { id: "a", text: "“Your order shipped.”", correct: false, why: "The service did not say that. Inventing a status is worse than the timeout." },
            { id: "b", text: "“I could not confirm the status. Nothing was changed. You can retry.”", correct: true, why: "Timeout is unknown, not success and not a missing order." },
            { id: "c", text: "“That order does not exist.”", correct: false, why: "Not found and timed out are different facts." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Unauthorized tool attempts blocked", "Timeouts versus not-found", "Answers that contradict the tool result"],
        outcome: "The assistant can look up an order without becoming a way to read or write records the user should not touch.",
      },
      interview: {
        prompt: "Where do validation and permissions belong in a tool workflow?",
        outline: ["Model proposes.", "Schema checks shape.", "Application checks the user.", "Service is called with a timeout.", "The answer stays inside the tool result."],
        exemplar: "Example response — not your work. I put permissions in the application, between the model’s tool request and the system of record. The model can ask for order 1001. My code checks the schema and whether this user may see that order. Only then do I call the service. If the user is not allowed, I never make the call. A prompt that says “be careful” is not the control.",
      },
      sourceIds: ["structured", "release-notes"],
      glossaryIds: ["tool-use", "json-schema"],
    },
    {
      id: "day2-validation",
      title: "Schemas, retries, and doing it once",
      minutes: 35,
      overview: "You will distinguish valid JSON from a correct fact, and see why a retry needs an idempotency key.",
      customerProblem: "After a timeout, the integration retries a “add a note to the CRM” call. The account ends up with three identical notes. Separately, a schema-valid extraction lists the wrong renewal date.",
      firstPrinciples: {
        constraint: "Networks fail in the middle. A client often cannot tell whether the write happened.",
        mechanism: "An idempotency key lets the service return the original result instead of applying the write again. Schema checks catch malformed payloads before that call.",
        tradeoff: "Retries heal timeouts and rate limits. Retries without a key multiply side effects.",
      },
      walkthrough: {
        title: "A note that must be written once",
        summary: "Use the CRM scenario in the lab. Run it twice and watch the mock store.",
        steps: [
          { id: "schema", label: "Schema", input: "order_id and note text.", output: "Accept or reject the shape.", note: "Empty ids never reach the service." },
          { id: "key", label: "Idempotency key", input: "A stable key for this business action.", output: "The service can recognize a retry.", note: "The key is not a random number per attempt." },
          { id: "write", label: "First write", input: "The note.", output: "Stored once in the mock CRM.", note: "Simulation only. Nothing leaves the browser." },
          { id: "retry", label: "Same key again", input: "The identical request.", output: "The original note, with a flag that it already existed.", note: "The customer sees one note." },
        ],
      },
      predict: {
        prompt: "A rate-limit response arrives after you sent a CRM note, and you are not sure the note landed. What retry is safe?",
        choices: [
          { id: "new", label: "Send it again immediately with a new idempotency key." },
          { id: "same", label: "Back off, then retry with the same idempotency key." },
          { id: "loop", label: "Loop as fast as possible so the note is not lost." },
        ],
        correctChoiceId: "same",
        rationale: "Rate limits want a delay. The same key makes the retry collapse into the original write if it actually succeeded.",
        controlLabel: "What does the service return?",
        initialOptionId: "ok",
        options: [
          { id: "ok", label: "200 and a stored note", observation: "One note. A second call with the same key does not add another.", outcome: "Safe to tell the user the note was saved." },
          { id: "429", label: "429 rate limit", observation: "The write may or may not have happened. Hammering makes the limit worse.", outcome: "Wait for the indicated delay and retry with the same key." },
          { id: "bad", label: "Schema rejection", observation: "The service was not called. There is nothing to retry until the arguments change.", outcome: "Fix the arguments. Do not burn a retry budget." },
        ],
      },
      failure: {
        title: "Valid JSON, wrong renewal date",
        symptoms: ["The payload parses.", "Every required field is present.", "A reviewer compares the date to the contract and it is off by a year."],
        recovery: "Add a deterministic check against the source span, and sample expert review. Structured output removed parse failures. It did not remove factual failures.",
      },
      depth: {
        quick: [
          { type: "p", text: "Schema validity means the shape matches. Factual correctness means the values match the source. You need both, and they are different tests." },
          { type: "term", id: "json-schema", term: "JSON schema", definition: "A machine-readable description of required fields and types." },
          { type: "term", id: "idempotency", term: "Idempotency", definition: "The same logical request applied twice has the same effect as applying it once." },
        ],
        how: [
          { type: "callout", kind: "verified", text: "Structured outputs on the Claude API use output_config.format for JSON schemas, and strict tool use can constrain tool inputs. The documented guarantee is schema conformance, not truth. The quick-start example on the structured outputs page uses model ID claude-opus-5-5." },
          { type: "term", id: "rate-limit", term: "Rate limit", definition: "A throttle. Retry with backoff. Do not treat it as a business “not found.”" },
        ],
        deeper: [
          { type: "p", text: "Timeouts, 429s, and connection resets are retryable only when the operation is safe to repeat. A read is usually safe. A write is safe when the server honors an idempotency key. A blind second POST is not." },
          { type: "callout", kind: "concept", text: "If you render a lookup directly from the service, you do not need the model to be factually perfect about that field. Use the model where language helps, and use the service where the record lives." },
        ],
      },
      practice: [
        {
          id: "day2-q5",
          prompt: "An extraction returns valid JSON with the wrong party name. What failed?",
          choices: [
            { id: "a", text: "Schema validation. The JSON should have been rejected.", correct: false, why: "The schema cannot know the party name in this contract unless you add a check against the source." },
            { id: "b", text: "Factual correctness. The shape is fine and the value is wrong.", correct: true, why: "This is why evals and human review still exist after structured output." },
            { id: "c", text: "Idempotency. Retrying will correct the name.", correct: false, why: "Retrying the same prompt can repeat the same mistake." },
          ],
        },
        {
          id: "day2-q6",
          prompt: "Why does the lab’s CRM button store a note locally and label it a simulation?",
          choices: [
            { id: "a", text: "So you can see confirmation and a second click without writing to a real CRM.", correct: true, why: "The lesson is the control, not a live integration." },
            { id: "b", text: "Because a simulated note is legally the same as a production audit log.", correct: false, why: "It is illustrative data in the browser." },
            { id: "c", text: "Because idempotency only matters in demos.", correct: false, why: "It matters more in production, where retries meet real customers." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Duplicate writes per 100 retries", "Schema-invalid calls blocked", "Reviewed extractions that were valid and wrong"],
        outcome: "Operations trusts the assistant with a note because a retry does not spam the account, and reviewers still catch bad facts.",
      },
      interview: {
        prompt: "Give a 60 second explanation of validation and idempotency.",
        outline: ["Shape versus truth.", "Where the check runs.", "One retry story with a stable key."],
        exemplar: "Example response — not your work. I validate tool arguments in the application before any write. Structured output can force a JSON shape, and a shape can still hold the wrong date, so I keep a review sample. When a timeout happens on a CRM note, I retry with the same idempotency key after backing off, so a note that actually landed is not written three times.",
      },
      labId: "tool-walkthrough",
      sourceIds: ["structured", "release-notes"],
      glossaryIds: ["json-schema", "idempotency", "rate-limit", "tool-use"],
    },
  ],
};

export default day2;
