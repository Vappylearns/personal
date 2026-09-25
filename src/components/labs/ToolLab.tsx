import { useState } from "react";
import { useLearning } from "../../state/LearningContext";
import { SimLabel } from "../Blocks";

type ScenarioId = "success" | "missing" | "unauthorized" | "invalid" | "timeout" | "rate" | "crm";

const code = [
  "response = messages.create(model, tools, messages)",
  "tool_use = find block type tool_use",
  "args = OrderArgs.parse(tool_use.input)",
  "if not caller.can_read(args.order_id): deny",
  "order = orders.get(args.order_id, timeout, idempotency_key)",
  "return tool_result(tool_use.id, order)",
  "final = messages.create(messages + tool_result)",
];

const highlight: Record<string, number[]> = {
  question: [0],
  request: [0, 1],
  validation: [2, 3],
  service: [4],
  result: [5],
  final: [6],
  crm: [4, 5],
};

type Stage = { id: string; title: string; json: unknown; narrative: string };

const stages: Record<ScenarioId, Stage[]> = {
  success: [
    { id: "question", title: "Customer question", narrative: "The signed-in user asks about their own order.", json: { role: "user", content: "Where is order ORD-1001?" } },
    { id: "request", title: "Model tool request", narrative: "The model proposes a lookup. Nothing has been fetched yet.", json: { stop_reason: "tool_use", content: [{ type: "tool_use", id: "toolu_1", name: "get_order", input: { order_id: "ORD-1001" } }] } },
    { id: "validation", title: "Validation and authorization", narrative: "The schema accepts the id. The application checks that this user owns ORD-1001.", json: { schema: "ok", authorized: true, caller: "user_aisha" } },
    { id: "service", title: "Mock order service", narrative: "The service returns a record. This is fixture data.", json: { order_id: "ORD-1001", status: "shipped", city: "Pune" } },
    { id: "result", title: "Tool result", narrative: "The application returns the payload with the same tool use id.", json: { type: "tool_result", tool_use_id: "toolu_1", content: { status: "shipped", city: "Pune" } } },
    { id: "final", title: "Final answer", narrative: "A second model call may phrase the sentence. The fact came from the service.", json: { stop_reason: "end_turn", text: "ORD-1001 is shipped and headed to Pune." } },
  ],
  missing: [
    { id: "question", title: "Customer question", narrative: "The id is well formed and the user is allowed to ask.", json: { role: "user", content: "Where is order ORD-404?" } },
    { id: "request", title: "Model tool request", narrative: "The model asks for that id.", json: { stop_reason: "tool_use", content: [{ type: "tool_use", name: "get_order", input: { order_id: "ORD-404" } }] } },
    { id: "validation", title: "Validation and authorization", narrative: "Shape and permission pass. Missing is a service fact, not a schema fact.", json: { schema: "ok", authorized: true } },
    { id: "service", title: "Mock order service", narrative: "404 means the record is absent. It is not a timeout.", json: { http: 404, error: "not_found" } },
    { id: "result", title: "Tool result", narrative: "Return the not-found payload. Do not substitute a guessed status.", json: { type: "tool_result", content: { error: "not_found" } } },
    { id: "final", title: "Final answer", narrative: "The user hears that the order was not found.", json: { stop_reason: "end_turn", text: "I could not find ORD-404." } },
  ],
  unauthorized: [
    { id: "question", title: "Customer question", narrative: "A different user asks for Aisha’s order.", json: { role: "user", caller: "user_ravi", content: "Where is order ORD-1001?" } },
    { id: "request", title: "Model tool request", narrative: "The model can still request the id. It does not know the permission table.", json: { stop_reason: "tool_use", content: [{ type: "tool_use", name: "get_order", input: { order_id: "ORD-1001" } }] } },
    { id: "validation", title: "Validation and authorization", narrative: "The application denies the call. The order service is not contacted.", json: { schema: "ok", authorized: false, service_called: false } },
    { id: "final", title: "Final answer", narrative: "The denial is the result. No shipment data is available to leak.", json: { text: "You do not have access to that order." } },
  ],
  invalid: [
    { id: "question", title: "Customer question", narrative: "The question never named an order.", json: { role: "user", content: "Where is my order?" } },
    { id: "request", title: "Model tool request", narrative: "The model emits an empty id.", json: { stop_reason: "tool_use", content: [{ type: "tool_use", name: "get_order", input: { order_id: "" } }] } },
    { id: "validation", title: "Validation and authorization", narrative: "Schema validation fails before authorization and before the service.", json: { schema: "invalid", reason: "order_id must be a non-empty string", service_called: false } },
    { id: "final", title: "Recovery", narrative: "Ask the user for the id. Do not retry the empty call.", json: { text: "Which order id should I look up?" } },
  ],
  timeout: [
    { id: "question", title: "Customer question", narrative: "A normal lookup.", json: { role: "user", content: "Where is order ORD-1001?" } },
    { id: "request", title: "Model tool request", narrative: "Arguments are valid.", json: { stop_reason: "tool_use", content: [{ type: "tool_use", name: "get_order", input: { order_id: "ORD-1001" } }] } },
    { id: "validation", title: "Validation and authorization", narrative: "Checks pass.", json: { schema: "ok", authorized: true } },
    { id: "service", title: "Mock order service", narrative: "The service does not answer before the timeout. Status is unknown.", json: { error: "timeout", timeout_ms: 2000, status_known: false } },
    { id: "result", title: "Tool result", narrative: "Tell the model the lookup failed. Do not invent shipped.", json: { type: "tool_result", content: { error: "timeout" } } },
    { id: "final", title: "Recovery", narrative: "Retry the read later. A read has no idempotency problem. Do not claim a status.", json: { text: "I could not confirm the status. Nothing was changed." } },
  ],
  rate: [
    { id: "question", title: "Customer question", narrative: "Traffic is above the limit.", json: { role: "user", content: "Where is order ORD-1001?" } },
    { id: "request", title: "Model tool request", narrative: "The model still proposes one lookup.", json: { stop_reason: "tool_use", content: [{ type: "tool_use", name: "get_order", input: { order_id: "ORD-1001" } }] } },
    { id: "validation", title: "Validation and authorization", narrative: "Local checks pass. The limit is at the service.", json: { schema: "ok", authorized: true } },
    { id: "service", title: "Mock order service", narrative: "429 means slow down. It does not mean the order is missing.", json: { http: 429, retry_after_seconds: 2 } },
    { id: "final", title: "Recovery", narrative: "Back off, then retry. Hammering extends the limit.", json: { action: "wait 2s and retry the read", text: "The lookup is throttled. I will not guess the status." } },
  ],
  crm: [
    { id: "question", title: "Customer question", narrative: "The user wants a note, not only a lookup.", json: { role: "user", content: "Add a note that the customer asked for a delivery update on ORD-1001." } },
    { id: "request", title: "Model tool request", narrative: "The model proposes a write.", json: { stop_reason: "tool_use", content: [{ type: "tool_use", name: "add_crm_note", input: { order_id: "ORD-1001", note: "Asked for a delivery update." } }] } },
    { id: "validation", title: "Validation and authorization", narrative: "Shape is valid. The user may annotate this order. A human confirmation is the extra gate for a write.", json: { schema: "ok", authorized: true, confirmation: "required" } },
    { id: "crm", title: "Mock CRM write", narrative: "Use the button below. The same idempotency key must not create a second note.", json: { idempotency_key: "crm-note-ORD-1001-delivery-update", external_call: false } },
  ],
};

export function ToolLab() {
  const { setArtifact } = useLearning();
  const [scenario, setScenario] = useState<ScenarioId>("success");
  const [index, setIndex] = useState(0);
  const [notes, setNotes] = useState<{ key: string; note: string }[]>([]);
  const [crmMessage, setCrmMessage] = useState("No note stored yet.");
  const flow = stages[scenario];
  const stage = flow[Math.min(index, flow.length - 1)];

  function choose(id: ScenarioId) {
    setScenario(id);
    setIndex(0);
  }

  function writeCrm() {
    const key = "crm-note-ORD-1001-delivery-update";
    const existing = notes.find((item) => item.key === key);
    if (existing) {
      setCrmMessage("Already stored. The mock CRM returned the original note and did not write a second one.");
      return;
    }
    setNotes((prev) => [...prev, { key, note: "Asked for a delivery update." }]);
    setCrmMessage("Stored once in this browser session. No external CRM was called.");
  }

  function saveEvidence() {
    const text = [
      "Sequence: customer question → model tool_use → application schema and authorization → mock service → tool_result → final answer.",
      "Validation and permissions belong in the application, after the model request and before the service.",
      "A timeout is unknown, a 404 is missing, a 429 is backoff, and an empty id never reaches the service.",
      "The CRM note uses one idempotency key. A second click returns the original note.",
      "This trace is simulated in the browser.",
    ].join("\n");
    setArtifact("day2-sequence", text);
  }

  return (
    <div className="card">
      <div className="row"><h3>Order-status tool walkthrough</h3><SimLabel /></div>
      <div className="row" role="group" aria-label="Scenarios">
        {(Object.keys(stages) as ScenarioId[]).map((id) => (
          <button key={id} type="button" className="btn-ghost" aria-pressed={scenario === id} onClick={() => choose(id)}>{id}</button>
        ))}
      </div>
      <div className="row">
        <button type="button" className="btn" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>Back</button>
        <button type="button" className="btn" onClick={() => setIndex((value) => Math.min(flow.length - 1, value + 1))} disabled={index >= flow.length - 1}>Forward</button>
        <button type="button" className="btn-ghost" onClick={() => { setIndex(0); setNotes([]); setCrmMessage("No note stored yet."); }}>Reset</button>
        <span>Step {index + 1} of {flow.length}: {stage.title}</span>
      </div>
      <p>{stage.narrative}</p>
      <div className="grid-2">
        <pre className="json" aria-label="JSON at this stage">{JSON.stringify(stage.json, null, 2)}</pre>
        <pre className="code" aria-label="Annotated example">
          {code.map((line, lineIndex) => (
            <div key={line} className={highlight[stage.id]?.includes(lineIndex) ? "hit" : undefined}>{lineIndex + 1}. {line}</div>
          ))}
        </pre>
      </div>
      {scenario === "crm" && stage.id === "crm" ? (
        <div>
          <button type="button" className="btn" onClick={writeCrm}>Confirm and store simulated note</button>
          <p>{crmMessage}</p>
          <p className="fine">Stored notes: {notes.length}. Key: crm-note-ORD-1001-delivery-update.</p>
        </div>
      ) : null}
      <button type="button" className="btn" onClick={saveEvidence}>Save sequence note to my evidence</button>
    </div>
  );
}
