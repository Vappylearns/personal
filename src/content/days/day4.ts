import type { Day } from "../../types";

const day4: Day = {
  id: "day4",
  number: 4,
  title: "Enterprise adoption and governance",
  summary: "Stand up a 30/60/90 plan that separates access, activity, and value.",
  agenda: [
    { minutes: "15", item: "Separate Enterprise, Console, and Claude Code controls." },
    { minutes: "20", item: "Lesson: identity, roles, audit, and retention." },
    { minutes: "20", item: "Lesson: sponsors, owners, champions, and a center of excellence." },
    { minutes: "35", item: "Lab: build a rollout for a 5,000-person illustrative IT services firm." },
    { minutes: "15", item: "Practice and the value-metric note." },
  ],
  lessons: [
    {
      id: "day4-controls",
      title: "Three control planes",
      minutes: 25,
      overview: "You will explain who administers chat seats, who administers API keys, and who approves a coding agent’s commands.",
      customerProblem: "A security reviewer asks, “If we turn on SSO, is the API covered, and can Claude Code run shell commands on laptops?” The account team has been answering with one slide labeled “enterprise controls.”",
      firstPrinciples: {
        constraint: "A person’s identity, an API key’s scope, and a developer’s local approval are different decisions.",
        mechanism: "Claude Enterprise organizations document SSO, SCIM, custom roles, audit export, and retention. Claude Console workspaces administer API keys and usage. Claude Code has its own access and command-approval behavior.",
        tradeoff: "Central controls reduce shadow use. They also slow a pilot if every question waits on a control that does not actually govern that surface.",
      },
      walkthrough: {
        title: "The same person, three doors",
        summary: "Walk the doors before you promise a control.",
        steps: [
          { id: "enterprise", label: "Claude Enterprise", input: "Users and groups.", output: "SSO, SCIM, custom roles, retention, audit export.", note: "This is the chat and plan organization, not the API bill by itself." },
          { id: "console", label: "Claude Console", input: "API workspaces and keys.", output: "Who can create keys and see usage.", note: "A paid Claude subscription does not automatically pay the API." },
          { id: "code", label: "Claude Code", input: "A developer task on a repo.", output: "Proposed edits and commands that still need a permission policy.", note: "An Enterprise seat is not a blanket approval to run every command." },
        ],
      },
      predict: {
        prompt: "Security enables SSO for the Claude Enterprise organization. What is now true of existing API keys?",
        choices: [
          { id: "revoked", label: "Every API key is revoked because SSO replaced them." },
          { id: "separate", label: "API keys remain a Console concern until someone administers them there." },
          { id: "laptop", label: "Laptops stop executing shell commands automatically." },
        ],
        correctChoiceId: "separate",
        rationale: "SSO signs people into the organization. Console keys are a different object. Local command approval is a third one.",
        controlLabel: "Which door did they lock?",
        initialOptionId: "sso",
        options: [
          { id: "sso", label: "Enterprise SSO", observation: "People sign in through the identity provider.", outcome: "You still ask about Console keys and Claude Code approvals." },
          { id: "scim", label: "SCIM offboarding", observation: "Leavers lose the seat when the group sync runs.", outcome: "Confirm the sync actually removes access. A ticket to IT is not the control." },
          { id: "key", label: "Console workspace role", observation: "A developer can or cannot mint keys.", outcome: "This does not, by itself, set chat retention." },
        ],
      },
      failure: {
        title: "The review signs off on the wrong product",
        symptoms: ["The security appendix quotes chat retention.", "Production traffic uses API keys in a different org.", "No one can find an audit event for the key that leaked."],
        recovery: "Rewrite the review as three lines: Enterprise organization, Console workspace, and Claude Code. Attach the control that exists for each.",
      },
      depth: {
        quick: [
          { type: "p", text: "When a customer says “enterprise,” ask which surface they mean before you nod." },
          { type: "term", id: "sso", term: "SSO", definition: "Sign-in through the company identity provider." },
          { type: "term", id: "scim", term: "SCIM", definition: "Automatic provisioning of users and groups." },
        ],
        how: [
          { type: "callout", kind: "verified", text: "Anthropic’s help center documents SSO, JIT, and SCIM for organizations, custom roles on Enterprise plans, audit-log export for Enterprise, and custom retention controls. It also documents that a Claude subscription and the Claude API are billed separately, and that Console has workspaces." },
          { type: "term", id: "audit-log", term: "Audit log", definition: "An exportable record of organization activity. Enterprise export of the past 180 days is documented, with a different path when customer-managed encryption keys are on." },
        ],
        deeper: [
          { type: "p", text: "Custom roles can limit product capabilities and, in current help articles, connector tools. That is a seat-plane control. It does not replace an authorization check inside an API tool you built." },
          { type: "callout", kind: "needs-verification", text: "Exact Claude Code permission-mode names and commercial inclusions change. Use the current Claude Code Team and Enterprise article before you tell a customer which commands are auto-approved." },
        ],
      },
      practice: [
        {
          id: "day4-q1",
          prompt: "A buyer asks for SCIM. What are they asking for?",
          choices: [
            { id: "a", text: "A longer context window.", correct: false, why: "SCIM is identity provisioning, not a model limit." },
            { id: "b", text: "Joiner and leaver updates from their identity provider.", correct: true, why: "That is the job of SCIM, documented alongside SSO for organizations." },
            { id: "c", text: "A discount on cache reads.", correct: false, why: "Pricing and identity are unrelated controls." },
          ],
        },
        {
          id: "day4-q2",
          prompt: "Which statement respects the three planes?",
          choices: [
            { id: "a", text: "“Enterprise SSO covers API keys and laptop command approval.”", correct: false, why: "It collapses three controls into one." },
            { id: "b", text: "“SSO governs organization sign-in. Console roles govern keys. Claude Code still needs its own approval policy.”", correct: true, why: "Each sentence can be checked against a different document." },
            { id: "c", text: "“Audit logs are included on every free API key by default.”", correct: false, why: "The audit export article is about Enterprise organizations. Do not broaden it." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Time to provision and deprovision", "Keys without an owner", "Reviews that name the correct plane"],
        outcome: "Security can approve a pilot without believing one checkbox covered every product.",
      },
      interview: {
        prompt: "How do enterprise controls differ across Claude products?",
        outline: ["Name the three planes.", "Give one control for each.", "Say what you would recheck in the docs."],
        exemplar: "Example response — not your work. I separate the Claude Enterprise organization, the API Console, and Claude Code. Enterprise is where I look for SSO, SCIM, custom roles, retention, and audit export. Console workspaces are where keys and API usage live, and a seat subscription does not pay that bill by itself. Claude Code can propose commands, but approval is its own policy. I would read the current help article before quoting a commercial inclusion.",
      },
      sourceIds: ["enterprise-identity", "enterprise-roles", "audit-logs", "retention", "console-separate", "console-workspaces", "claude-code-enterprise"],
      glossaryIds: ["sso", "scim", "audit-log"],
    },
    {
      id: "day4-adoption",
      title: "Someone has to own the workflow",
      minutes: 20,
      overview: "You will spot a rollout that has training and no owner, and fix the operating model.",
      customerProblem: "An illustrative Indian IT services firm, Narmada Systems, has 5,000 knowledge workers. The CIO sponsored “AI for everyone.” Two months later the only metric is logins. Bid teams tried it once. Nobody owns the bid workflow.",
      firstPrinciples: {
        constraint: "A tool without a workflow owner becomes a demo. Training without a job to change becomes a course completion rate.",
        mechanism: "A sponsor removes blockers. A workflow owner accepts the output. Champions coach a team. A center of excellence keeps the patterns, the risks, and the metrics consistent.",
        tradeoff: "A center of excellence can speed the second team or become a gate that never ships. It needs a queue and a service level, not only a brand.",
      },
      walkthrough: {
        title: "Roles in the first 90 days",
        summary: "Each role has a decision they can actually make.",
        steps: [
          { id: "sponsor", label: "Sponsor", input: "A named executive.", output: "Air cover for security review and a decision at day 90.", note: "A logo on a slide is not a sponsor." },
          { id: "owner", label: "Workflow owner", input: "The person who lives with the output.", output: "Accept or reject the new way of working.", note: "For bids, this is a delivery leader, not the tool administrator." },
          { id: "champ", label: "Champions", input: "Practitioners in the team.", output: "Local coaching.", note: "Champions do not replace the owner." },
          { id: "coe", label: "Center of excellence", input: "Patterns, evaluations, and risks.", output: "A second team can copy a known path.", note: "It should not be the only place allowed to type a prompt." },
        ],
      },
      predict: {
        prompt: "Training is scheduled for all 5,000 people. No workflow owner is named. What do you expect at day 60?",
        choices: [
          { id: "value", label: "Realized value, because everyone heard the same course." },
          { id: "activity", label: "Activity without a changed workflow. The review queue should flag the missing owner." },
          { id: "security", label: "The security review completes itself." },
        ],
        correctChoiceId: "activity",
        rationale: "Training creates awareness. An owner creates a changed process. The lab flags training that has no owner.",
        controlLabel: "What did they staff?",
        initialOptionId: "both",
        options: [
          { id: "both", label: "Sponsor, owner, and a small pilot", observation: "Someone can say yes or no to the draft bids.", outcome: "You can measure accepted drafts, not only attendance." },
          { id: "train", label: "Company-wide training only", observation: "People log in after class.", outcome: "Logins rise. The bid cycle does not change. That is the failure mode." },
        ],
      },
      failure: {
        title: "Champions are blamed for a missing decision",
        symptoms: ["Champions collect prompts in a chat channel.", "No one will sign the customer-facing draft.", "The sponsor has not been in a review for a month."],
        recovery: "Pause the broad rollout. Name an owner for one workflow. Put a sponsor decision on the calendar.",
      },
      depth: {
        quick: [
          { type: "p", text: "Adoption is a chain of decisions: may we use it, on which job, who signs the output, and what will make us stop." },
        ],
        how: [
          { type: "ul", items: ["Executive sponsor: unblocks policy and attends the day-90 decision.", "Workflow owner: accountable for quality of that job.", "Champions: office hours and examples.", "Center of excellence: shared evals, prompt patterns, and risk reviews."] },
        ],
        deeper: [
          { type: "p", text: "In an IT services firm the economic buyer may be a delivery unit with a client contract, not the central innovation team. The owner has to be someone the client team already listens to." },
          { type: "callout", kind: "assumption", text: "Narmada Systems and its 5,000 people are fictional. Use them to practice the plan. Do not present them as a real Anthropic customer." },
        ],
      },
      practice: [
        {
          id: "day4-q3",
          prompt: "What is the best first use of a center of excellence?",
          choices: [
            { id: "a", text: "Approve every prompt in the company before it is sent.", correct: false, why: "That becomes a bottleneck and pushes people to shadow tools." },
            { id: "b", text: "Publish one approved workflow, its eval, and its owner, so the next team can copy it.", correct: true, why: "The center spreads a pattern that already has an owner." },
            { id: "c", text: "Replace workflow owners with a central help desk.", correct: false, why: "The help desk cannot accept a client deliverable." },
          ],
        },
        {
          id: "day4-q4",
          prompt: "A sponsor is “the innovation brand.” What is missing?",
          choices: [
            { id: "a", text: "Nothing. A brand is sponsorship.", correct: false, why: "A sponsor can remove a blocker and make the day-90 call." },
            { id: "b", text: "A named person who will unblock security and decide whether to expand.", correct: true, why: "The lab treats a blank sponsor as a gap." },
            { id: "c", text: "More licenses, which create sponsorship automatically.", correct: false, why: "Licenses are inventory. Sponsorship is a person." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Named owner per workflow", "Sponsor decisions held", "Teams that copied a pattern without a new security review"],
        outcome: "The second business unit starts faster because the first unit left a path, not a slide.",
      },
      interview: {
        prompt: "How do you staff an enterprise AI rollout?",
        outline: ["Sponsor, owner, champions, center of excellence.", "What each person decides.", "The failure when training has no owner."],
        exemplar: "Example response — not your work. I want one executive who can unblock policy, and one owner who lives with the workflow, such as a bid lead. Champions coach that team. A center of excellence keeps the eval and the pattern so the next unit does not start from zero. I would not train all 5,000 people before an owner has accepted the output. Attendance is not adoption.",
      },
      sourceIds: ["enterprise-roles"],
      glossaryIds: ["sso"],
    },
    {
      id: "day4-value",
      title: "Activity is not value",
      minutes: 35,
      overview: "You will build a 30/60/90 plan and label time-saved numbers as estimates.",
      customerProblem: "Narmada’s steering committee wants a plan they can fund. They also want a rupee savings number by Friday. You have no baseline cycle time.",
      firstPrinciples: {
        constraint: "You cannot know time saved if you never measured the old path.",
        mechanism: "Readiness gates block scale: sponsor, security review, baseline, workflow owner. Metrics are layered: seats active, workflows completed, quality accepted, value realized.",
        tradeoff: "A hard gate slows the announcement. Skipping it produces a large pilot that security or quality later shuts down.",
      },
      walkthrough: {
        title: "Four layers of evidence",
        summary: "The lab checks the plan for missing gates. The layers stay visible in the narrative you export.",
        steps: [
          { id: "seats", label: "Seat activity", input: "People who signed in.", output: "Reach.", note: "Necessary and not sufficient." },
          { id: "done", label: "Completed workflows", input: "Bids drafted in the new path.", output: "The process actually ran." , note: "A login that never drafts a bid does not count." },
          { id: "quality", label: "Quality", input: "Reviewer acceptance.", output: "The work was good enough to use.", note: "A fast draft that is rejected did not save the cycle." },
          { id: "value", label: "Realized value", input: "A baseline and an after measurement.", output: "A decision a finance partner can audit.", note: "Until then, call the figure an estimate." },
        ],
      },
      predict: {
        prompt: "The plan scales to all delivery units at day 30, before security review and before a baseline. What should the builder show?",
        choices: [
          { id: "green", label: "A green plan, because speed is the point." },
          { id: "gaps", label: "Gaps: unresolved security review and absent baseline, even if the dates look ambitious." },
          { id: "roi", label: "A guaranteed savings number, because 5,000 people times 30 minutes is precise." },
        ],
        correctChoiceId: "gaps",
        rationale: "Headcount times a guessed number of minutes is not a measurement. The gates exist so you do not scale a guess.",
        controlLabel: "Which gate is open?",
        initialOptionId: "ready",
        options: [
          { id: "ready", label: "Sponsor, security, baseline, owner", observation: "The plan can name a day-90 decision.", outcome: "Estimates stay labeled as estimates." },
          { id: "open", label: "Security still open, no baseline", observation: "You can still train a small group.", outcome: "You should not claim company-wide value or skip the review." },
        ],
      },
      failure: {
        title: "The steering deck promises ₹ crores from a minute estimate",
        symptoms: ["“5,000 people × 30 minutes × loaded cost.”", "No clock was ever run on the old bid process.", "Quality rework is missing from the formula."],
        recovery: "Replace the promise with a baseline study on one workflow. Publish the estimate as an estimate. Fund the measurement.",
      },
      depth: {
        quick: [
          { type: "p", text: "Day 30 proves access and a baseline. Day 60 proves a team can finish the workflow at an acceptable quality. Day 90 is a decision to expand, repair, or stop." },
        ],
        how: [
          { type: "ul", items: ["Pick departments and one workflow each.", "Name owners with the keyboard controls. Drag and drop is not required.", "Turn gates on only when they are truly done.", "Write success measures in the four layers."] },
        ],
        deeper: [
          { type: "callout", kind: "concept", text: "Client contracts in services firms often forbid pasting client data into unsanctioned tools. The security gate is not paperwork. It is whether this workflow is allowed to see this data." },
          { type: "p", text: "Value measurement can be cycle time, win rate, or review effort. Pick one the owner already believes. Do not invent a blended ROI." },
        ],
      },
      practice: [
        {
          id: "day4-q5",
          prompt: "Which metric is closest to realized value?",
          choices: [
            { id: "a", text: "Weekly active seats.", correct: false, why: "That is activity." },
            { id: "b", text: "Accepted bid drafts compared with a measured baseline cycle.", correct: true, why: "It connects quality to a before-and-after the owner recognizes." },
            { id: "c", text: "Number of prompts saved in a library.", correct: false, why: "A library is inventory." },
          ],
        },
        {
          id: "day4-q6",
          prompt: "How should a time-saved figure appear in the plan?",
          choices: [
            { id: "a", text: "As guaranteed financial savings.", correct: false, why: "The lab and the brief forbid that presentation." },
            { id: "b", text: "As an estimate, next to the baseline you still need or have.", correct: true, why: "Honest labeling keeps the steering committee from auditing a fiction." },
            { id: "c", text: "It should not be discussed at all, even as a hypothesis.", correct: false, why: "An estimate is useful if it is labeled and then measured." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Seat activity", "Completed workflows", "Acceptance quality", "Realized value against a baseline"],
        outcome: "The committee can fund day 60 without pretending day 30 already saved the year.",
      },
      interview: {
        prompt: "How would you run the first 90 days?",
        outline: ["One company, one workflow.", "The four gates.", "The four metric layers.", "The estimate label."],
        exemplar: "Example response — not your work. For a 5,000-person services firm I would not start with everyone. I would name a sponsor and a bid-desk owner, close the security review for that data, and measure today’s cycle time. Day 30 is a small group on that path. Day 60 asks whether reviewers accept the drafts. Day 90 expands or stops. Logins are activity. I would label any hours-saved math as an estimate until the baseline exists.",
      },
      labId: "rollout-builder",
      sourceIds: ["enterprise-identity", "retention", "audit-logs"],
      glossaryIds: ["audit-log", "sso", "scim"],
    },
  ],
};

export default day4;
