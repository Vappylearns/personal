import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../App";
import { LearningProvider } from "../state/LearningContext";

function renderLab() {
  return render(
    <LearningProvider>
      <App />
    </LearningProvider>,
  );
}

describe("learning flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.location.hash = "#/";
  });

  it("opens the dashboard and a Day 2 lab", async () => {
    const user = userEvent.setup();
    renderLab();
    expect(screen.getByRole("heading", { name: "AI Deployment Learning Lab" })).toBeInTheDocument();
    window.location.hash = "#/lesson/day2-validation";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect(await screen.findByRole("heading", { name: "Schemas, retries, and doing it once" })).toBeInTheDocument();
    expect(screen.getByText("Simulation — illustrative data")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "success" }));
    expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
  });

  it("keeps a wrong answer in the review queue after reload state", async () => {
    const user = userEvent.setup();
    renderLab();
    window.location.hash = "#/lesson/day2-anatomy";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    const wrong = await screen.findByRole("button", { name: /In the browser of every end user/i });
    await user.click(wrong);
    expect(wrong.className).toMatch(/bad/);
    window.location.hash = "#/review";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect(await screen.findByText("incorrect")).toBeInTheDocument();
  });
});
