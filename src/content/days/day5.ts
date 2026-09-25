import type { Day } from "../../types";

const day5: Day = {
  id: "day5",
  number: 5,
  title: "RAG, long context, and trust",
  summary: "See which passage was selected, who was allowed to see it, and when the answer should stop.",
  agenda: [
    { minutes: "15", item: "Compare a long prompt with a search step." },
    { minutes: "20", item: "Lesson: the pipeline from document to answer." },
    { minutes: "20", item: "Lesson: permissions, freshness, and abstention." },
    { minutes: "35", item: "Lab: change chunking, top-k, date, and role on a fictional policy set." },
    { minutes: "15", item: "Write a failure diagnosis." },
  ],
  lessons: [
    {
      id: "day5-why",
      title: "Search is a filter, not a truth spell",
      minutes: 20,
      overview: "You will explain why retrieval exists even when a model has a long window.",
      customerProblem: "Narmada’s policy bot either pastes the entire handbook or “just knows” the answer. Employees quote a 2023 hotel cap that was replaced in 2025. Restricted salary bands have also appeared in a general chat.",
      firstPrinciples: {
        constraint: "The corpus can be larger than the window, change over time, and contain documents the current user must not see.",
        mechanism: "Retrieval selects a few passages and puts those passages into the prompt. Generation then writes from that packet.",
        tradeoff: "A small packet is cheaper and easier to inspect. If the right passage was not selected, the model cannot cite it, and it may still answer from habit.",
      },
      walkthrough: {
        title: "Long context and retrieval side by side",
        summary: "Both end in a prompt. They differ in who chooses the pages.",
        steps: [
          { id: "corpus", label: "Corpus", input: "Policies with dates and roles.", output: "More text than you should paste.", note: "The lab corpus is fictional." },
          { id: "long", label: "Long context", input: "Paste everything that fits.", output: "A large, expensive prompt.", note: "Fitting is not filtering." },
          { id: "rag", label: "Retrieval", input: "A query and a ranker.", output: "A handful of chunks.", note: "This lab’s ranker is lexical. It is not an embedding model." },
          { id: "gen", label: "Generation", input: "Instructions plus chunks.", output: "An answer that can still be wrong.", note: "Citations do not guarantee truth or recall." },
        ],
      },
      predict: {
        prompt: "You move from a 1M paste to retrieving three chunks. What is the new failure you must watch?",
        choices: [
          { id: "none", label: "None. Three chunks are always the relevant ones." },
          { id: "miss", label: "The right passage might never be selected, so the answer should be allowed to abstain." },
          { id: "free", label: "Cost rises, because search is always more expensive than a long prompt." },
        ],
        correctChoiceId: "miss",
        rationale: "Retrieval can miss. The product needs an abstain path. Cost often falls, but that is not the reason to trust the answer.",
        controlLabel: "How is the packet chosen?",
        initialOptionId: "paste",
        options: [
          { id: "paste", label: "Paste all public policies", observation: "The old and new hotel caps are both present.", outcome: "The model can quote the old one. You pay for both." },
          { id: "top3", label: "Top three lexical hits", observation: "You can inspect the hits.", outcome: "If the right page is absent, abstain. Do not fill the gap from memory." },
        ],
      },
      failure: {
        title: "A citation points at a real paragraph that does not answer the question",
        symptoms: ["The footnote is accurate.", "The paragraph is about laptops, the question was about cameras.", "The sentence sounds decisive."],
        recovery: "Treat weak overlap as insufficient evidence. Show the user the passage. Let a person decide.",
      },
      depth: {
        quick: [
          { type: "p", text: "RAG means the application searches first and then asks the model to write. It is a design to control evidence, not a promise the evidence was understood." },
          { type: "term", id: "rag", term: "RAG", definition: "Retrieval-augmented generation: selected source text is placed in the prompt." },
        ],
        how: [
          { type: "p", text: "Long context is a good fit when a trusted packet must be reasoned over as a whole and it fits the window. Retrieval is a good fit when you must filter by permission, date, or relevance. Many production systems do both: retrieve a packet, then give the model that packet in full." },
        ],
        deeper: [
          { type: "callout", kind: "concept", text: "Prompt instructions such as “only use the sources” reduce some failures and do not guarantee recall or truth. A model can ignore a passage, misread it, or answer from prior training anyway." },
        ],
      },
      practice: [
        {
          id: "day5-q1",
          prompt: "Why is a million-token window not a substitute for retrieval?",
          choices: [
            { id: "a", text: "Because the window cannot hold a million tokens.", correct: false, why: "Several current models are documented at 1M. The issue is selection, permission, freshness, and cost." },
            { id: "b", text: "Because the application still needs to choose permitted, current, relevant passages.", correct: true, why: "Capacity and selection are different problems." },
            { id: "c", text: "Because long context is deprecated.", correct: false, why: "It is a supported design when the packet is the right packet." },
          ],
        },
        {
          id: "day5-q2",
          prompt: "A confident answer has no selected passage. What should the product do?",
          choices: [
            { id: "a", text: "Show it. Confidence means it is reliable.", correct: false, why: "Self-reported confidence is not a calibrated score." },
            { id: "b", text: "Abstain or ask for a source, and log the miss.", correct: true, why: "No evidence should be visible as no evidence." },
            { id: "c", text: "Paste the entire corpus silently and hope.", correct: false, why: "That hides the miss and can include restricted text." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Answers with a selected passage", "Abstain rate on unanswerable questions", "Stale citations"],
        outcome: "Employees trust the bot because it can say “the handbook does not say,” which is a usable result.",
      },
      interview: {
        prompt: "When would you choose retrieval instead of a long paste?",
        outline: ["Permissions and freshness.", "Corpus bigger than the useful packet.", "The miss and abstain path.", "Citations are not truth."],
        exemplar: "Example response — not your work. I paste a long packet when I already trust every page and the task needs all of it. I retrieve when the corpus is permissioned or changing, because the window will not filter salary bands or a 2023 policy for me. Retrieval can miss, so the product must abstain. A citation proves we showed a paragraph, not that we answered the question.",
      },
      sourceIds: ["models", "pricing"],
      glossaryIds: ["rag", "context-window"],
    },
    {
      id: "day5-pipeline",
      title: "Follow a passage into the prompt",
      minutes: 25,
      overview: "You will name each stage from raw file to answer and change one stage on purpose.",
      customerProblem: "The policy bot returns a fragment: “capped at 8000” with no city. The sentence that says “metro cities” was cut into the previous chunk and not retrieved.",
      firstPrinciples: {
        constraint: "Rankers score chunks, not the document the author had in mind. A cut can separate a number from its condition.",
        mechanism: "Ingest and clean the file, split it into chunks with overlap, score chunks, optionally rerank, then assemble a prompt.",
        tradeoff: "Small chunks are precise and can lose context. Large chunks keep context and also keep irrelevant sentences in the window.",
      },
      walkthrough: {
        title: "A labeled pipeline",
        summary: "The lab shows the chunks that survived. Overlap and chunk size change those chunks.",
        steps: [
          { id: "clean", label: "Clean", input: "Headers, footers, duplicate titles.", output: "Text you are willing to retrieve.", note: "Garbage in is garbage cited." },
          { id: "chunk", label: "Chunk and overlap", input: "Word windows.", output: "Pieces with a shared edge.", note: "Overlap exists so a rule is less likely to be sliced in half." },
          { id: "rank", label: "Rank", input: "Query terms.", output: "A score.", note: "This lab counts term overlap and says so. It is not cosine similarity." },
          { id: "assemble", label: "Assemble", input: "Top-k chunks.", output: "The only evidence the answer may use.", note: "Reranking, in production, is a second model or heuristic. This lab does not pretend to rerank with a neural model." },
        ],
      },
      predict: {
        prompt: "You set overlap to zero and chunk size very small. What new symptom is plausible?",
        choices: [
          { id: "better", label: "Answers get universally better because chunks are “more precise.”" },
          { id: "split", label: "A cap is retrieved without the condition that was in the neighboring sentence." },
          { id: "embed", label: "The ranker becomes a real embedding model." },
        ],
        correctChoiceId: "split",
        rationale: "Overlap is a repair for splits. Turning it off does not change the ranker into an embedding model.",
        controlLabel: "Chunk setting",
        initialOptionId: "overlap",
        options: [
          { id: "overlap", label: "Moderate chunks with overlap", observation: "Neighboring words travel together.", outcome: "The metro-city condition is more likely to sit with the number." },
          { id: "tiny", label: "Tiny chunks, no overlap", observation: "Scores can attach to a bare number.", outcome: "Inspect the chunk text before you blame the model." },
        ],
      },
      failure: {
        title: "Top-k is 8 on a small corpus, so weak chunks fill the prompt",
        symptoms: ["The best chunk is relevant.", "Several later chunks share one accidental word.", "The answer mixes hotel policy with device policy."],
        recovery: "Lower k, require a minimum overlap, or drop chunks below a score. More k is not more recall if the extra chunks are noise.",
      },
      depth: {
        quick: [
          { type: "term", id: "chunk", term: "Chunk", definition: "A retrievable piece of a document." },
          { type: "term", id: "top-k", term: "Top-k", definition: "How many pieces you keep." },
          { type: "term", id: "embedding", term: "Embedding", definition: "A numeric vector for similarity. Not used by this lab’s ranker." },
        ],
        how: [
          { type: "p", text: "A production pipeline often embeds chunks and queries, retrieves candidates, then reranks them with a stronger scorer. This lab uses deterministic lexical overlap so you can explain every selected word. Do not describe it as “the embedding score” in an interview." },
        ],
        deeper: [
          { type: "p", text: "Metadata — title, date, role, source system — should travel with the chunk. A score without a date cannot enforce freshness. A score without a role cannot enforce access." },
        ],
      },
      practice: [
        {
          id: "day5-q3",
          prompt: "What does this lab’s ranker measure?",
          choices: [
            { id: "a", text: "Embedding cosine similarity from a live model.", correct: false, why: "The lab has no embedding model and must not claim one." },
            { id: "b", text: "How many query terms appear in the chunk.", correct: true, why: "It is a labeled lexical ranker." },
            { id: "c", text: "The author’s official relevance judgment.", correct: false, why: "Term overlap can prefer a lucky word." },
          ],
        },
        {
          id: "day5-q4",
          prompt: "Overlap is increased and the selected text changes. What did you learn?",
          choices: [
            { id: "a", text: "The control is decorative.", correct: false, why: "A real control changes the chunk or explains why it could not." },
            { id: "b", text: "Chunk boundaries are part of the product, not a preprocessing detail.", correct: true, why: "The answer can only quote what the chunk kept together." },
            { id: "c", text: "Overlap removes the need for permissions.", correct: false, why: "Overlap does not filter access." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Share of answers whose cited chunk contains the deciding sentence", "Chunks dropped for low overlap", "Token cost of top-k"],
        outcome: "A reviewer can see the packet and disagree with the ranker without blaming “the AI” in the abstract.",
      },
      interview: {
        prompt: "Walk through a retrieval pipeline.",
        outline: ["Clean, chunk, overlap, rank, assemble, generate.", "Say this demo is lexical.", "One split-sentence failure."],
        exemplar: "Example response — not your work. I clean the policy, split it into overlapping chunks so a number stays with its condition, score chunks, and put only the top few into the prompt. In a real system that score might be an embedding plus a reranker. In this lab it is term overlap, and I would say that plainly. If I set overlap to zero I can retrieve “8000” and lose “metro cities.”",
      },
      sourceIds: ["models"],
      glossaryIds: ["chunk", "embedding", "top-k", "rag"],
    },
    {
      id: "day5-trust",
      title: "Permissions before the prompt",
      minutes: 35,
      overview: "You will exclude a restricted document before assembly and diagnose stale, irrelevant, and thin evidence.",
      customerProblem: "An employee in delivery asks for the L5 salary band. The only document that contains it is restricted to HR. A previous prototype retrieved it and then told the model “do not reveal this.”",
      firstPrinciples: {
        constraint: "Anything in the prompt can be repeated, logged, or stolen from the client. A later instruction is not a lock.",
        mechanism: "Filter by role and by date before ranking. Assemble only what survives. If nothing survives, abstain.",
        tradeoff: "Strict filters increase abstentions. Loose filters leak. The business chooses which error is worse, and for salary data the leak is worse.",
      },
      walkthrough: {
        title: "Filter, then rank, then speak",
        summary: "The lab counts documents removed for role and for date. Those documents never become chunks.",
        steps: [
          { id: "role", label: "Role filter", input: "The signed-in role.", output: "Restricted docs dropped.", note: "Production enforcement belongs in trusted infrastructure, not in a prompt." },
          { id: "date", label: "Freshness", input: "A cutoff date.", output: "Old policies dropped.", note: "The 2023 travel policy is the trap." },
          { id: "rank", label: "Rank survivors", input: "Lexical overlap.", output: "Top-k among what remains.", note: "You cannot retrieve a document you already excluded. That is the point." },
          { id: "behavior", label: "Answer behavior", input: "Strong, weak, or empty evidence.", output: "Quote, insufficient, or abstain.", note: "The behavior is a rule in the lab, not a live model." },
        ],
      },
      predict: {
        prompt: "The role is “delivery” and the question is the L5 band. What should be in the assembled context?",
        choices: [
          { id: "band", label: "The salary document, with a sentence telling the model to keep it secret." },
          { id: "empty", label: "Nothing from that document. It is excluded before assembly." },
          { id: "mask", label: "The document with numbers replaced by the model." },
        ],
        correctChoiceId: "empty",
        rationale: "The model cannot be the security boundary. If the numbers are in the prompt, they can appear in the answer or the logs.",
        controlLabel: "Signed-in role",
        initialOptionId: "hr",
        options: [
          { id: "hr", label: "HR", observation: "The salary document is eligible.", outcome: "A hit can quote the band. The lab is still fictional data." },
          { id: "delivery", label: "Delivery", observation: "The salary document is counted as excluded.", outcome: "The answer should abstain, not tease the band." },
        ],
      },
      failure: {
        title: "The 2023 hotel cap outranks the 2025 policy",
        symptoms: ["The cutoff date is unset or earlier than 2023.", "Both documents share the words hotel and capped.", "The answer sounds specific."],
        recovery: "Raise the freshness cutoff, prefer the latest effective date in the ranker, and ask the owner which policy is authoritative.",
      },
      depth: {
        quick: [
          { type: "p", text: "Say “excluded before the prompt” rather than “the model is instructed not to look.”" },
        ],
        how: [
          { type: "ul", items: ["Irrelevant: terms overlap a different policy.", "Stale: the right topic, the wrong date.", "Restricted: the right topic, the wrong reader.", "Insufficient: nothing strong enough remains."] },
        ],
        deeper: [
          { type: "callout", kind: "concept", text: "Human review still matters when the answer leaves the company, even if retrieval looked clean. Grounding is a property you test, not a logo you add." },
          { type: "p", text: "A production system enforces permissions in the index or the query service using the user’s identity. The lab’s role dropdown is a stand-in for that check, and the write-up should say so." },
        ],
      },
      practice: [
        {
          id: "day5-q5",
          prompt: "Where must a restricted salary document be removed?",
          choices: [
            { id: "a", text: "In the model’s final sentence, after it has seen the numbers.", correct: false, why: "That is too late. The numbers were already in context." },
            { id: "b", text: "Before context assembly, in trusted application infrastructure.", correct: true, why: "The prompt is not a security boundary." },
            { id: "c", text: "Only in the user interface color of the citation.", correct: false, why: "Color does not remove data." },
          ],
        },
        {
          id: "day5-q6",
          prompt: "The lab abstains on a camera question that weakly hits the device policy. Is that a failure of honesty or of search?",
          choices: [
            { id: "a", text: "It is the desired behavior when evidence is thin. Search did not find a real rule, and the answer should not invent one.", correct: true, why: "Insufficient evidence is a successful abstention." },
            { id: "b", text: "The bot should answer from general knowledge so the user is never blocked.", correct: false, why: "General knowledge is how a policy bot invents rules." },
            { id: "c", text: "Abstention means the embedding service is down.", correct: false, why: "There is no embedding service in the lab." },
          ],
        },
      ],
      customerValue: {
        metrics: ["Restricted documents excluded", "Stale documents excluded", "Abstentions on thin evidence", "Human overrides"],
        outcome: "The company can put a policy bot in front of employees without using the prompt as a lock.",
      },
      interview: {
        prompt: "Diagnose a policy bot that leaked a stale or restricted rule.",
        outline: ["Was the bad document in the prompt?", "Where the filter should have run.", "What you would evaluate.", "What you would not claim."],
        exemplar: "Example response — not your work. I would ask whether the salary document was in the prompt. If it was, the model instruction failed as a control, and I would filter by role before assembly. If the hotel cap was the 2023 figure, I would check the freshness cutoff and whether both policies share the same words. I would evaluate retrieval separately from the final sentence, and I would not call a citation proof that the rule is current.",
      },
      labId: "retrieval-pipeline",
      sourceIds: ["models"],
      glossaryIds: ["rag", "chunk", "top-k"],
    },
  ],
};

export default day5;
