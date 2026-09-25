import type { Day } from "../../types";

const day6: Day = {
  id: "day6",
  number: 6,
  title: "Evals and Claude Code adoption",
  summary: "Score a change from the cases, then trace a coding task to a human merge.",
  agenda: [
    { minutes: "15", item: "What an evaluation is allowed to claim." },
    { minutes: "25", item: "Lesson: datasets, metrics, and judge limits." },
    { minutes: "30", item: "Lab: compare two variants and apply a release gate." },
    { minutes: "30", item: "Lab: a failing test, an inspectable fix, and what the test proves." },
    { minutes: "10", item: "Write the release note and the adoption measures." },
  ],
  lessons: [
    {
      id: "day6-evals",
      title: "Score the cases you can defend",
      minutes: 25,
      overview: "You will describe a dataset, a held-out slice, and the difference between a retrieval miss and a bad answer.",
      customerProblem: "A team says the assistant “improved to 92%” after a prompt change. Nobody can find the 50 examples, and the 92% mixes formatting wins with a missed privacy case.",
      firstPrinciples: {
        constraint: "A percentage without a denominator is a slogan. The examples you tuned on will flatter you.",
        mechanism: "A representative set includes ordinary cases and the ugly ones. A held-out slice is not used for tuning. Some checks are deterministic: schema, exact fields, blocked accounts.",
        tradeoff: "Expert review catches nuance and does not scale. An automatic check scales and misses nuance. You publish both.",
      },
      walkthrough: {
        title: "From example to metric",
        summary: "The workbench uses 12 synthetic cases with expected labels. The math is in the lab, not in a pasted score.",
        steps: [
          { id: "set", label: "Dataset", input: "Cases with expected behavior.", output: "A denominator.", note: "These cases are synthetic fixtures." },
          { id: "hold", label: "Held-out", input: "Cases you did not peek at while editing the prompt.", output: "A less flattering score.", note: "If you tune on everything, you no longer have a held-out set." },
          { id: "split", label: "Split the question", input: "Did we retrieve the passage? Did we say the right thing?", output: "Two scores.", note: "A perfect answer metric can hide a retrieval miss that got lucky." },
          { id: "human", label: "Expert review", input: "A sample of high-impact cases.", output: "Judgment the script cannot make.", note: "Experts disagree. That is data." },
        ],
      },
      predict: {
        prompt: "You fix the prompt until the practice set is perfect, then ship without a held-out slice. What did you measure?",
        choices: [
          { id: "general", label: "General quality in production." },
          { id: "memory", label: "How well the prompt remembers the examples you optimized." },
          { id: "judge", label: "A calibrated probability of truth." },
        ],
        correctChoiceId: "memory",
        rationale: "Tuning on the only set you have rewards memorizing that set. Held-out cases are how you notice.",
        controlLabel: "Which set did the editor see?",
        initialOptionId: "held",
        options: [
          { id: "held", label: "Editor never saw the test slice", observation: "The score can still be wrong, but it was not fit by hand.", outcome: "You can talk about it as a check." },
          { id: "same", label: "Editor iterated on these exact cases", observation: "The score climbs.", outcome: "Call it a practice score, not a release score." },
        ],
      },
      failure: {
        title: "One blended score hides a privacy miss",
        symptoms: ["Average accuracy rose.", "The privacy case flipped from escalate to answer.", "The slide has no risk column."],
        recovery: "Report high-risk cases separately. A release gate fails if those regress, even when the average improves.",
      },
      depth: {
        quick: [
          { type: "term", id: "held-out", term: "Held-out set", definition: "Examples reserved from tuning." },
          { type: "term", id: "groundedness", term: "Groundedness", definition: "Whether the answer stays inside the sources you supplied." },
        ],
        how: [
          { type: "p", text: "Deterministic checks are equality, schema, and policy rules such as “never quote another customer’s invoice.” Model judgments are extra. They are not the source of truth when a rule is crisp." },
        ],
        deeper: [
          { type: "p", text: "Evaluate retrieval with labels on the passage: was the required document in the top k? Evaluate the answer with labels on the decision: answer, abstain, or escalate. A grounded wrong answer and an ungrounded right answer are different bugs." },
        ],
      },
      practice: [
        {
          id: "day6-q1",
          prompt: "Why keep retrieval scores separate from answer scores?",
          choices: [
            { id: "a", text: "Because a lucky answer can hide a search that missed the policy.", correct: true, why: "You would ship a prompt that does not survive the next wording of the question." },
            { id: "b", text: "Because retrieval always determines the answer exactly.", correct: false, why: "The model can still misread a correct passage." },
            { id: "c", text: "Because averages are the only number executives understand.", correct: false, why: "Executives can understand a missed privacy case if you show it." },
          ],
        },
        {
          id: "day6-q2",
          prompt: "A case was used to edit the prompt five times. Where does it belong in the story you tell?",
          choices: [
            { id: "a", text: "In the held-out accuracy you quote to the customer.", correct: false, why: "It is no longer held out." },
            { id: "b", text: "In the development set, with a different slice reserved for the quote.", correct: true, why: "Honesty about the split is part of the metric." },
            { id: "c", text: "It should be deleted so the denominator looks smaller and the percent looks larger.", correct: false, why: "Shrinking the set to move the percent is not evaluation." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Held-out exact match", "High-risk misses", "Retrieval hit rate", "Expert agreement on a sample"],
        outcome: "A release conversation is about cases, not a single flattering percent.",
      },
      interview: {
        prompt: "How do you evaluate an assistant before a customer turns it up?",
        outline: ["Representative cases, including ugly ones.", "Held-out split.", "Deterministic checks versus reviewers.", "High-risk cases called out."],
        exemplar: "Example response — not your work. I want a set that includes ordinary questions and the ones we fear, such as another customer’s invoice. I tune on one slice and report another. Schema and permission checks are deterministic. Experts review the residue. I never replace that packet with one accuracy number, because a privacy miss can hide inside a higher average.",
      },
      sourceIds: ["structured"],
      glossaryIds: ["held-out", "groundedness"],
    },
    {
      id: "day6-gates",
      title: "Averages do not sign a release",
      minutes: 30,
      overview: "You will compute precision and recall from fixtures and fail a gate that improved the average.",
      customerProblem: "Variant B answers more routine questions correctly and answers a request for someone else’s invoice. The team wants to ship because accuracy went up.",
      firstPrinciples: {
        constraint: "Precision and recall describe one class you must define. They are not a vibe.",
        mechanism: "For the class “escalate,” precision asks how many escalations were warranted. Recall asks how many warranted escalations you caught. A gate can require zero high-risk misses.",
        tradeoff: "A strict gate blocks useful improvements that still have one bad case. That is the point when the bad case is a privacy incident.",
      },
      walkthrough: {
        title: "Counts, then ratios",
        summary: "The lab counts true positives, false positives, and false negatives from the 12 cases. It does not invent a delta.",
        steps: [
          { id: "tp", label: "True positive", input: "Expected escalate, predicted escalate.", output: "A caught risk.", note: "The positive class in this lab is escalate." },
          { id: "fp", label: "False positive", input: "Predicted escalate, expected something else.", output: "Needless handoff.", note: "Costly, usually less costly than a leak." },
          { id: "fn", label: "False negative", input: "Expected escalate, predicted answer or abstain.", output: "A missed risk.", note: "Variant B has one of these on purpose." },
          { id: "gate", label: "Gate", input: "High-risk misses and accuracy versus baseline.", output: "Pass or fail with reasons.", note: "Fail stays visible beside the higher average." },
        ],
      },
      predict: {
        prompt: "Variant B’s exact-match accuracy is higher and it misses one high-risk escalation. What should the gate do?",
        choices: [
          { id: "pass", label: "Pass, because the average improved." },
          { id: "fail", label: "Fail, and show the case id next to the average." },
          { id: "hide", label: "Hide the case so the steering committee stays focused." },
        ],
        correctChoiceId: "fail",
        rationale: "The gate in this lab fails high-risk misses even when the average rises. You can still discuss a waiver. You may not hide the case.",
        controlLabel: "Which number are you watching?",
        initialOptionId: "both",
        options: [
          { id: "avg", label: "Average only", observation: "Variant B can look better.", outcome: "You would ship the privacy miss." },
          { id: "both", label: "Average and high-risk misses", observation: "The miss is a named case.", outcome: "The gate fails until that case is fixed or explicitly waived." },
        ],
      },
      failure: {
        title: "Two judges disagree and the team averages them into a confidence score",
        symptoms: ["Judge A says abstain.", "Judge B says guess.", "The dashboard shows 50% model confidence as if it were a probability."],
        recovery: "Record the disagreement. Clarify the rubric. Do not present the average of judges, or the model’s own confidence, as a calibrated reliability score.",
      },
      depth: {
        quick: [
          { type: "term", id: "precision", term: "Precision", definition: "Of the items you flagged, how many truly belong." },
          { type: "term", id: "recall", term: "Recall", definition: "Of the items that belong, how many you flagged." },
        ],
        how: [
          { type: "p", text: "If there are no predicted escalations, precision is undefined, not zero. If there are no expected escalations, recall is undefined. The lab shows that instead of dividing by zero." },
        ],
        deeper: [
          { type: "callout", kind: "concept", text: "An LLM used as a judge is another model with its own errors. Agreement with a human on a sample is the check. Disagreement is a reason to read the case, not to add a decimal place." },
          { type: "p", text: "Latency and cost belong in the release note beside quality. A variant that is accurate and too slow for the phone channel is not a ship for that channel." },
        ],
      },
      practice: [
        {
          id: "day6-q3",
          prompt: "Recall for the escalate class is low. What is happening?",
          choices: [
            { id: "a", text: "Most true escalations are being missed.", correct: true, why: "Recall is about the cases that should have been caught." },
            { id: "b", text: "Most escalations you made were unnecessary.", correct: false, why: "That is a precision problem." },
            { id: "c", text: "The model’s self-confidence is low.", correct: false, why: "Recall is computed from labels, not from the model’s prose about being sure." },
          ],
        },
        {
          id: "day6-q4",
          prompt: "The fixtures are synthetic. What may you claim after the gate fails?",
          choices: [
            { id: "a", text: "Production will fail in the same proportion.", correct: false, why: "Twelve invented cases are a teaching instrument." },
            { id: "b", text: "On these cases, the candidate misses a high-risk item, so I would not describe it as an unqualified improvement.", correct: true, why: "The claim matches the denominator." },
            { id: "c", text: "The baseline is unsafe and the candidate is certified.", correct: false, why: "The gate did not certify either variant for production." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Precision and recall for escalate", "High-risk case ids", "Ungrounded answers", "Latency if you have a real measurement"],
        outcome: "The customer ships a waiver with eyes open, or fixes the case, instead of discovering it as an incident.",
      },
      interview: {
        prompt: "Would you ship a model change that raises average accuracy and fails one privacy case?",
        outline: ["Show the average.", "Name the case.", "Say no, or describe a waiver.", "Mention judge disagreement is not a probability."],
        exemplar: "Example response — not your work. I would show the higher average and the case where we answered with another customer’s invoice. I would not ship that as an improvement. If a leader wants a temporary waiver, I want it in writing and a test that fails the build if the case returns. I would not average two disagreeing reviewers into a confidence score.",
      },
      labId: "eval-workbench",
      sourceIds: ["structured"],
      glossaryIds: ["precision", "recall", "groundedness", "held-out"],
    },
    {
      id: "day6-code",
      title: "A coding agent still needs a reviewer",
      minutes: 30,
      overview: "You will trace a small legacy bug from repository to merge and state what a passing test does not prove.",
      customerProblem: "Developers at Narmada want Claude Code on a billing repo. Leadership asks you whether “AI wrote it” is enough to merge, and how you would measure adoption without a fantasy productivity multiplier.",
      firstPrinciples: {
        constraint: "The agent can propose an edit and a command. It does not own the repository, and this browser lab will not run commands you type.",
        mechanism: "A sound loop is: inspect, propose, run the existing tests, read a failure, patch, re-run, and ask a human to review the diff.",
        tradeoff: "Agents shorten the time to a plausible diff. They also create plausible diffs that pass a narrow test and miss the business rule.",
      },
      walkthrough: {
        title: "From red test to merge readiness",
        summary: "The lab’s test fails for a date parser. The fix is visible. You decide whether the evidence is enough.",
        steps: [
          { id: "inspect", label: "Inspect", input: "A function that splits dates on slashes.", output: "A hypothesis.", note: "ISO dates use hyphens. The code never looks for them." },
          { id: "propose", label: "Propose", input: "A patch.", output: "A diff a human can read.", note: "The proposal is not merged." },
          { id: "test", label: "Test", input: "One assertion for 2026-04-01.", output: "Red, then green after the fix.", note: "The lab does not execute a shell." },
          { id: "review", label: "Human review", input: "The diff and the test.", output: "A question: what about 01/04/2026 and empty input?", note: "Green means this assertion passed." },
        ],
      },
      predict: {
        prompt: "The ISO example turns green. What have you proved?",
        choices: [
          { id: "all", label: "All date formats and the billing rules are correct." },
          { id: "one", label: "This one example now parses. Other formats are untested." },
          { id: "prod", label: "Production incidents of this type are impossible." },
        ],
        correctChoiceId: "one",
        rationale: "A test proves the assertions it contains. Add the assertions you care about, or say they are still open.",
        controlLabel: "Evidence in hand",
        initialOptionId: "red",
        options: [
          { id: "red", label: "Failing test", observation: "The slash splitter returns the whole ISO string unchanged or rejects it.", outcome: "You have a reproduction." },
          { id: "green", label: "That test passes", observation: "2026-04-01 round-trips.", outcome: "You do not have evidence about slash dates, time zones, or nulls." },
        ],
      },
      failure: {
        title: "Auto-approved commands in a repo the team does not understand",
        symptoms: ["The agent installed packages and rewrote a migration.", "No one can explain the diff.", "The only check was “it compiled.”"],
        recovery: "Narrow the permission policy, require review on migrations, and keep a human merge. MCP servers that expose production systems need the same allow-list thinking as any other tool.",
      },
      depth: {
        quick: [
          { type: "term", id: "claude-code", term: "Claude Code", definition: "Anthropic’s coding assistant. Access via a plan or API is separate from which local commands it may run." },
          { type: "term", id: "mcp", term: "MCP", definition: "A protocol for connecting tools. A connection is not an authorization for every action." },
        ],
        how: [
          { type: "callout", kind: "verified", text: "Help articles document using Claude Code with Team or Enterprise plans, a code-review setup, and a migration note between Console and Enterprise. Platform release notes mention MCP connector, MCP tunnels in research preview, and an expanded Claude Code Auto mode. I would re-read those pages before describing a customer’s current entitlement." },
        ],
        deeper: [
          { type: "p", text: "Measure adoption with cycle time on a defined change type, review findings, escaped defects, and whether the team accepts the tool on the next sprint. A claim that “developers are 30% faster” needs a study design you do not have. Do not borrow one." },
          { type: "callout", kind: "needs-verification", text: "The exact names of Claude Code permission modes and what Auto mode approves should be checked in the current Claude Code docs before an implementation workshop." },
        ],
      },
      practice: [
        {
          id: "day6-q5",
          prompt: "What is a sound adoption metric for Claude Code?",
          choices: [
            { id: "a", text: "A universal productivity multiplier you quote without a baseline.", correct: false, why: "That is the claim the lesson refuses." },
            { id: "b", text: "Cycle time, review findings, and escaped defects on a named class of changes.", correct: true, why: "Those can be observed in the team’s own system." },
            { id: "c", text: "Lines of code generated.", correct: false, why: "More lines can be more review burden." },
          ],
        },
        {
          id: "day6-q6",
          prompt: "Why does this lab refuse to run a command you type?",
          choices: [
            { id: "a", text: "Because seeing a command and approving it are different from executing untrusted input in a lesson.", correct: true, why: "The walkthrough stays inspectable and local." },
            { id: "b", text: "Because Claude Code never runs commands.", correct: false, why: "It can propose commands. The product policy decides whether they run." },
            { id: "c", text: "Because tests are opinions.", correct: false, why: "Tests are evidence about their assertions. They are just not universal proof." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Cycle time for a defined change", "Defects found in review", "Escaped defects", "Share of diffs a human actually read"],
        outcome: "Engineering leadership can adopt an agent without treating a green test as a release approval.",
      },
      interview: {
        prompt: "How technical are you, using a coding-agent workflow?",
        outline: ["Inspect, propose, test, failure, fix, review.", "What the test proved.", "How you would measure adoption.", "Permissions are separate from the seat."],
        exemplar: "Example response — not your work. I would let the agent inspect a date parser that only splits on slashes, propose a diff, and show me a failing test for an ISO date. After the fix I would say the test proves that one example, not every format. A human reviews the merge. I would measure cycle time and escaped defects for that class of bug, not a borrowed productivity percentage. And I would keep command approval separate from whether the developer has an Enterprise seat.",
      },
      labId: "code-workflow",
      sourceIds: ["claude-code-enterprise", "claude-code-review", "release-notes"],
      glossaryIds: ["claude-code", "mcp"],
    },
  ],
};

export default day6;
