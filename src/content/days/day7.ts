import type { Day } from "../../types";

const day7: Day = {
  id: "day7",
  number: 7,
  title: "Consumption CS and interview rehearsal",
  summary: "Diagnose four accounts, then practice four interview prompts without pretending a rubric is an examiner.",
  agenda: [
    { minutes: "15", item: "Seat health versus consumption health." },
    { minutes: "35", item: "Lab: four synthetic accounts. Form a hypothesis and request evidence." },
    { minutes: "40", item: "Interview practice: timer, scaffold, exemplar, self-check." },
    { minutes: "15", item: "Export notes and the account plan." },
  ],
  lessons: [
    {
      id: "day7-health",
      title: "Segment the workload before you judge the account",
      minutes: 20,
      overview: "You will separate seat activity, token consumption, errors, and completed work.",
      customerProblem: "Quarterly business review is next week. One executive wants every account’s token chart to go up. Your renewal lead wants to know who is actually getting work done.",
      firstPrinciples: {
        constraint: "Seat plans and API consumption are different contracts. A healthy number on one can hide a failure on the other.",
        mechanism: "Segment by workflow. For each workflow, read requests, errors, latency, cache efficiency, and cost per successful outcome, plus a human sponsor.",
        tradeoff: "A single health score is easy to sort and easy to game. A short narrative with evidence takes longer and survives a question.",
      },
      walkthrough: {
        title: "Signals that need a pair",
        summary: "No single arrow is health. Pair the usage signal with an outcome signal.",
        steps: [
          { id: "seat", label: "Seats", input: "People entitled and people active.", output: "Reach on the chat plan.", note: "A subscription does not pay the API by itself." },
          { id: "tokens", label: "Tokens", input: "Requests and spend.", output: "Consumption.", note: "Up or down is not good or bad yet." },
          { id: "errors", label: "Errors and latency", input: "Timeouts, 429s, schema failures.", output: "Friction.", note: "A fall in requests after an error spike is a failure until proven otherwise." },
          { id: "success", label: "Successful workflows", input: "Tasks a reviewer accepted.", output: "The denominator for value.", note: "Cost per success is the consumption metric I would defend." },
        ],
      },
      predict: {
        prompt: "Cache hit rate jumps, spend falls, and completed tickets stay flat. What is the first hypothesis?",
        choices: [
          { id: "churn", label: "The customer is churning." },
          { id: "opt", label: "They removed repeated cost and kept the workflow." },
          { id: "buy", label: "We should sell them more tokens immediately so the chart recovers." },
        ],
        correctChoiceId: "opt",
        rationale: "Optimization is a success for the customer. Treating it as churn damages trust. Confirm with error rate and completed tasks.",
        controlLabel: "Which pair of signals do you have?",
        initialOptionId: "opt",
        options: [
          { id: "opt", label: "Spend down, successes flat, errors flat", observation: "The work remains.", outcome: "Investigate caching or a shorter prompt before you call it risk." },
          { id: "bad", label: "Spend down, successes down, errors up", observation: "The work stopped.", outcome: "This is an incident, not a cost win." },
        ],
      },
      failure: {
        title: "The QBR applauds the account with the worst accepted-draft rate",
        symptoms: ["Spend is the highest.", "Reviewers reject most outputs.", "The action item is a bigger commit."],
        recovery: "Sort the room by cost per accepted outcome. Decline the commit until the workflow is redesigned.",
      },
      depth: {
        quick: [
          { type: "term", id: "consumption", term: "Consumption", definition: "Usage billed from API tokens and features, as distinct from a per-seat subscription." },
        ],
        how: [
          { type: "callout", kind: "verified", text: "Anthropic’s help center states that a paid Claude subscription and the Claude API are billed separately. Seat activity and API consumption can move independently." },
        ],
        deeper: [
          { type: "p", text: "Expansion is a new workflow with an owner, a quality bar, and a sponsor. It is not an unplanned spike from a retry loop. Ask what changed in the product before you congratulate a chart." },
        ],
      },
      practice: [
        {
          id: "day7-q1",
          prompt: "Which pair suggests useful consumption growth?",
          choices: [
            { id: "a", text: "Spend up, accepted workflows up, a named sponsor for the new job.", correct: true, why: "The extra tokens bought extra completed work." },
            { id: "b", text: "Spend up, acceptance down, no owner.", correct: false, why: "That is waste, even if the invoice grew." },
            { id: "c", text: "API keys up, outcomes unknown.", correct: false, why: "Keys are not health." },
          ],
        },
        {
          id: "day7-q2",
          prompt: "A seat report is green and the API workflow is erroring. What do you tell the sponsor?",
          choices: [
            { id: "a", text: "The account is healthy because people log into chat.", correct: false, why: "The failing surface is the API workflow." },
            { id: "b", text: "Chat seats and the API job are different. The job needs a repair before we discuss expansion.", correct: true, why: "You keep the planes separate and you lead with the broken outcome." },
            { id: "c", text: "Buy a stronger model first.", correct: false, why: "A stronger model does not fix a schema or a missing owner." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Cost per successful workflow", "Error rate", "Cache hit rate", "Active seats", "Sponsor engagement"],
        outcome: "The QBR spends its time on the workflow that is stuck, not on the chart that is merely large.",
      },
      interview: {
        prompt: "How would you drive useful Claude API consumption growth?",
        outline: ["Pick a workflow.", "Instrument success.", "Remove waste such as uncached repetition or a broken schema.", "Expand to a second team only after quality holds."],
        exemplar: "Example response — not your work. I would grow completed, reviewed work, not tokens. I would segment the account by workflow, watch cost per success, and fix a retry loop or an uncached handbook before I ask for more volume. Expansion is a second team copying a workflow that already has an owner. I would not set a target that rewards the customer for turning caching off.",
      },
      sourceIds: ["console-separate", "pricing"],
      glossaryIds: ["consumption", "prompt-caching"],
    },
    {
      id: "day7-diagnosis",
      title: "Four accounts, four different actions",
      minutes: 35,
      overview: "You will inspect trends drawn from fixtures, request evidence, and choose an action that is not “spend more.”",
      customerProblem: "Four synthetic accounts moved this month. The charts are not labeled with the answer. You have to earn the diagnosis.",
      firstPrinciples: {
        constraint: "A chart is a compression. The action depends on evidence you do not see until you ask.",
        mechanism: "Form a hypothesis, request one of the prepared findings, then choose an action. The lab tells you whether the reasoning matched the fixture.",
        tradeoff: "Asking for evidence slows the meeting and prevents a confident mistake.",
      },
      walkthrough: {
        title: "Hypothesis, evidence, action",
        summary: "The four patterns are expansion, optimization, failure, and waste. The charts are computed from the same weekly rows as the metrics.",
        steps: [
          { id: "see", label: "See the trend", input: "Requests, successes, errors, cache, spend.", output: "A candidate story.", note: "Simulation — illustrative data. These companies are fictional." },
          { id: "ask", label: "Request evidence", input: "Sponsor, errors, or review notes.", output: "A finding written for that account.", note: "You cannot unlock a finding by guessing the action first." },
          { id: "act", label: "Choose", input: "Repair, protect a saving, redesign, or document expansion.", output: "Feedback on the reasoning.", note: "Maximizing tokens is not the rewarded path." },
        ],
      },
      predict: {
        prompt: "Successes collapse in the same week errors spike. Cache hit rate is almost unchanged. Which story is more likely?",
        choices: [
          { id: "cache", label: "Caching removed the work." },
          { id: "break", label: "A release broke the workflow and people stopped." },
          { id: "expand", label: "The account is expanding." },
        ],
        correctChoiceId: "break",
        rationale: "Optimization keeps successes. Expansion grows them. An error spike plus a collapse is a break until the sample says otherwise.",
        controlLabel: "Pattern",
        initialOptionId: "break",
        options: [
          { id: "break", label: "Errors up, successes down", observation: "The week of the change is visible.", outcome: "Ask for a sample error before you propose training." },
          { id: "cache", label: "Cache up, successes flat", observation: "Spend can fall.", outcome: "Do not “repair” it by turning the cache off." },
        ],
      },
      failure: {
        title: "The action plan maximizes spend",
        symptoms: ["Every account is told to upgrade models.", "The optimized account is told to disable caching.", "The broken schema is given a training session."],
        recovery: "Rewrite the plan so each account has evidence, a hypothesis, and an action that a workflow owner would recognize.",
      },
      depth: {
        quick: [
          { type: "p", text: "The fixtures are coherent on purpose. Weekly spend is an input to the chart, not a second hidden formula, so you can reconcile a bar with the table." },
        ],
        how: [
          { type: "ul", items: ["Northwind: spend and successes rise after a sponsored workflow.", "Sutlej: requests fall, successes hold, cache hits rise.", "Deccan: errors rise and successes collapse.", "Malabar: spend rises and accepted work falls."] },
        ],
        deeper: [
          { type: "callout", kind: "assumption", text: "The rupee-free dollar figures are illustrative. They are not invoices. Do not quote them as a customer result." },
        ],
      },
      practice: [
        {
          id: "day7-q3",
          prompt: "Sutlej’s requests fall and completed tickets hold. What is the wrong call?",
          choices: [
            { id: "a", text: "Ask them to disable caching to restore consumption.", correct: true, why: "That call is wrong. The question asks for the mistake, and this is it. Restoring spend by destroying a saving hurts the customer." },
            { id: "b", text: "Confirm quality and look for the next repeated prefix.", correct: false, why: "That is a sound action, so it is not the wrong call." },
            { id: "c", text: "Check that errors did not spike.", correct: false, why: "That is the evidence that separates optimization from failure." },
          ],
        },
        {
          id: "day7-q4",
          prompt: "Malabar spends more on a stronger model and reviewers accept fewer drafts. What do you recommend first?",
          choices: [
            { id: "a", text: "An even stronger model.", correct: false, why: "The lesson is that model strength did not fix a bad packet." },
            { id: "b", text: "A smaller, relevant packet and a checklist, measured by accepted drafts.", correct: true, why: "Change the task design before you change the price tier." },
            { id: "c", text: "A larger prepaid commit so finance can forecast the waste.", correct: false, why: "A commit locks in the poor outcome." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Hypothesis matched to evidence", "Cost per accepted outcome", "Owner named in the action"],
        outcome: "Each account leaves with a next step that matches its actual pattern.",
      },
      interview: {
        prompt: "Tell me about a consumption account that looked worse and was actually better.",
        outline: ["The chart that scared people.", "The evidence you asked for.", "The action you refused.", "The metric you kept."],
        exemplar: "Example response — not your work, and not a claim that I ran this account. In the fixture, requests fell after caching while completed tickets held. I would thank the customer, confirm reviewers are still satisfied, and look for the next stable prefix. I would not propose turning caching off to make the invoice grow. Use your own history in the real interview. Do not borrow this fixture as a personal story.",
      },
      labId: "health-investigation",
      sourceIds: ["console-separate", "pricing", "caching"],
      glossaryIds: ["consumption", "cache-read"],
    },
    {
      id: "day7-interview",
      title: "Rehearse without a fake examiner",
      minutes: 40,
      overview: "You will use a timer, a scaffold, and a rubric you fill in yourself. The lab will not score your prose.",
      customerProblem: "The interview is a conversation under a clock. You want four drafts that sound like a customer-success leader who can trace a system, not like a glossary.",
      firstPrinciples: {
        constraint: "Without a human examiner, semantic scoring of free text would be a costume. This product refuses it.",
        mechanism: "A scaffold reminds you of the decision. An exemplar shows one shape. A checklist asks whether you included a problem, a mechanism, a tradeoff, a measurement, and your own example.",
        tradeoff: "Exemplars are easy to memorize and dangerous to perform as autobiography. The page labels them as examples.",
      },
      walkthrough: {
        title: "Four prompts",
        summary: "Open the interview studio for the full timer. This lesson lists the prompts so they are part of the day.",
        steps: [
          { id: "p1", label: "Useful consumption", input: "How would you drive useful Claude API consumption growth?", output: "A workflow, a metric, a limit.", note: "Token growth is not the goal." },
          { id: "p2", label: "How technical", input: "Demonstrate with a concrete workflow.", output: "Five hops and a permission boundary.", note: "The order-status lab is a fair prop if you say it is practice." },
          { id: "p3", label: "Why this work", input: "Why Anthropic, and why enterprise AI adoption in India?", output: "Your motive and the buyer’s constraints.", note: "Do not invent an office, a headcount, or a personal trophy." },
          { id: "p4", label: "From zero", input: "Build a motion from zero.", output: "30/60/90 with an owner.", note: "Activity, completion, quality, value." },
        ],
      },
      predict: {
        prompt: "You paste the exemplar into the draft box and check every rubric box. What is true?",
        choices: [
          { id: "ready", label: "The lab has certified you as interview-ready." },
          { id: "not", label: "You have a self-check only. Completion of this lab is not evidence you are ready for the job." },
          { id: "score", label: "The lab semantically scored the text at 100%." },
        ],
        correctChoiceId: "not",
        rationale: "The product is practice. It does not award a probability of an offer, and it does not grade free text.",
        controlLabel: "What did you submit?",
        initialOptionId: "own",
        options: [
          { id: "own", label: "Your own outline with a real example", observation: "The checklist is still your judgment.", outcome: "Useful practice. Not a certificate." },
          { id: "copy", label: "The exemplar verbatim", observation: "It is labeled as not your work.", outcome: "Saying it as autobiography would be a false claim. Rewrite it." },
        ],
      },
      failure: {
        title: "A polished answer uses a fictional deal as if it were yours",
        symptoms: ["“I saved Sutlej 40% last quarter.”", "The numbers came from this lab.", "The story has no name the interviewer can ask you to expand."],
        recovery: "Use a real account you are allowed to describe, or speak hypothetically and say so. Keep the mechanism. Drop the costume.",
      },
      depth: {
        quick: [
          { type: "p", text: "A 75-second answer is about four sentences: situation, what you decided, what you did, what you would measure. Stop before you recite a taxonomy." },
        ],
        how: [
          { type: "p", text: "STAR (situation, task, action, result) fits a story you lived. A decision scaffold fits a design question: constraint, mechanism, tradeoff, measurement. Use the one the prompt asks for. The interview page has both shapes available in the scaffold text." },
        ],
        deeper: [
          { type: "p", text: "For the India question, talk about buyers you understand: services firms and capability centers, client confidentiality, and the need to verify residency and commercial terms. Skip market-size theatrics you cannot source." },
          { type: "callout", kind: "concept", text: "Finishing every lesson does not mean you are ready for the role. It means you practiced the explanations. The interviewer will test judgment on a case you have not seen." },
        ],
      },
      practice: [
        {
          id: "day7-q5",
          prompt: "What will this product refuse to do with your interview draft?",
          choices: [
            { id: "a", text: "Give it an automatic semantic score and an offer probability.", correct: true, why: "That refusal is intentional. The question’s correct choice is the thing the product will not do." },
            { id: "b", text: "Save the draft locally so you can edit it.", correct: false, why: "Saving is supported. It is not the refusal." },
            { id: "c", text: "Show a labeled example answer.", correct: false, why: "Exemplars are shown and labeled." },
          ],
        },
        {
          id: "day7-q6",
          prompt: "Which closing line is honest?",
          choices: [
            { id: "a", text: "“I completed a lab, therefore I am qualified.”", correct: false, why: "Completion is practice, not proof of readiness." },
            { id: "b", text: "“Here is how I would trace the workflow and what I would measure. I have not run this particular account.”", correct: true, why: "It shows fluency without inventing a trophy." },
            { id: "c", text: "“The model’s confidence was 0.93, so the customer is healthy.”", correct: false, why: "Confidence text is not a health score." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Drafts you rewrote in your own words", "Checks you left blank on purpose", "Time spent speaking, not reading"],
        outcome: "You walk into the conversation with four structures you understand well enough to abandon if the interviewer changes the question.",
      },
      interview: {
        prompt: "Why Anthropic, and why enterprise AI adoption in India?",
        outline: ["The adoption problem you want.", "The buyer you know how to serve.", "A control you would verify.", "No invented biography."],
        exemplar: "Example response — not your work. I want the work of making a model useful inside a company that already has customers of its own. In India that often means a services firm or a global capability center with client constraints and delivery pressure. I would keep Enterprise seats, API consumption, and coding-agent approvals separate, and I would verify residency and contract terms rather than recite them. My customer-success background is the asset. I would not claim a deal I did not do.",
      },
      sourceIds: ["models", "console-separate", "enterprise-identity"],
      glossaryIds: ["consumption", "sso", "tool-use"],
    },
  ],
};

export default day7;
