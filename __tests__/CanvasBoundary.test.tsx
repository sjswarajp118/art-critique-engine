import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CanvasBoundary from "@/components/CanvasBoundary";

function Bomb(): never {            // a child that always crashes
  throw new Error("boom");
}
function Fine() {
  return <p>all good</p>;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("CanvasBoundary", () => {
  it("shows the fallback when a child throws", () => {
    // React and our boundary both log the error; keep the test output quiet
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <CanvasBoundary fallback={<p>fallback text</p>}>
        <Bomb />
      </CanvasBoundary>
    );

    expect(screen.queryByText("fallback text")).not.toBeNull();
  });

  it("shows its children when nothing throws", () => {
    render(
      <CanvasBoundary fallback={<p>fallback text</p>}>
        <Fine />
      </CanvasBoundary>
    );

    expect(screen.queryByText("all good")).not.toBeNull();
    expect(screen.queryByText("fallback text")).toBeNull();
  });
});