import { describe, expect, it } from "vitest";
import { releaseGate } from "./evalMetrics";
import { EVAL_FIXTURE } from "../data/evalFixture";

describe("eval release gate", () => {
  it("blocks when high-risk case fails variant B", () => {
    const gate = releaseGate(EVAL_FIXTURE, "variantB");
    expect(gate.allowed).toBe(false);
    expect(gate.reasons.length).toBeGreaterThan(0);
  });
});
