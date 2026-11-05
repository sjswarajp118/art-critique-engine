import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UploadPanel from "@/components/UploadPanel";
import { loadImage } from "@/lib/image";

// ---------- FAKES (module level; vi.mock is moved to the top of the file) ----------

// The face-finder engine: no CDN, no wasm, no model file.
vi.mock("@mediapipe/tasks-vision", () => ({
  FilesetResolver: { forVisionTasks: vi.fn(async () => ({})) },
  FaceLandmarker: {
    createFromOptions: vi.fn(async () => ({ detect: vi.fn(() => ({})) })),
  },
}));

// jsdom never fires img.onload, so the real loadImage would hang.
vi.mock("@/lib/image", () => ({ loadImage: vi.fn() }));

// extractLandmarks says "a face was found". The data is only passed along
// (JSON.stringify and setLandmarks), so a stand-in is enough here.
vi.mock("@/lib/landmarks", () => ({
  extractLandmarks: vi.fn(() => ({
    ok: true,
    // same shape as the Landmarks type; left eye x is smaller than right eye x
    data: {
      leftEye: { x: 0.3, y: 0.4 },
      rightEye: { x: 0.7, y: 0.4 },
      nose: { x: 0.5, y: 0.55 },
      jaw: { x: 0.5, y: 0.85 },
    },
  })),
}));

// The overlay uses canvas and ResizeObserver, which jsdom lacks. Not under test.
vi.mock("@/components/PointsOverlay", () => ({ default: () => null }));

// ---------- HELPERS ----------

// Only naturalWidth and naturalHeight are read from the image.
// The cast is test-only: this is a stand-in, not a real <img>.
const fakeImage = { naturalWidth: 100, naturalHeight: 100 } as unknown as HTMLImageElement;

// Wait long enough for a wrongly-allowed second request to show up.
// Without this, a "called once" check could pass before call 2 had a chance to happen.
async function letEverythingSettle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

// Picks a file, then returns the Analyse button element.
// The test keeps THIS element and clicks it twice. It does not look the button
// up again by its text, because the text changes with the state under test
// (a lookup by "Working" would crash instead of reaching the assertion).
async function pickFileAndGetAnalyseButton(user: ReturnType<typeof userEvent.setup>) {
  const file = new File(["x"], "face.png", { type: "image/png" });
  await user.upload(screen.getByLabelText(/choose a portrait/i), file);
  return screen.getByRole("button", { name: /analyse portrait/i });
}

// ---------- TESTS ----------

describe("UploadPanel: double click on Analyse", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // fetch that never finishes: request 1 stays in flight
    fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", fetchMock);

    // missing in jsdom (called on pick and in the cleanup effect)
    URL.createObjectURL = vi.fn(() => "blob:fake");
    URL.revokeObjectURL = vi.fn();

    vi.mocked(loadImage).mockResolvedValue(fakeImage);
  });

  afterEach(() => {
    cleanup(); // Vitest does not auto-clean unless globals are on
    vi.unstubAllGlobals();
  });

  it("sends one request when clicked again while the upload is in flight", async () => {
    const user = userEvent.setup();
    render(<UploadPanel />);
    const analyse = await pickFileAndGetAnalyseButton(user);

    await user.click(analyse);
    // request 1 has reached fetch; the page is in "uploading"
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    // click 2 on the same button element
    await user.click(analyse);
    await letEverythingSettle();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("starts one analysis when clicked again while the image is still being read", async () => {
    // first loadImage call never finishes: the page stays in "analyzing"
    vi.mocked(loadImage).mockReturnValueOnce(new Promise<HTMLImageElement>(() => {}));

    const user = userEvent.setup();
    render(<UploadPanel />);
    const analyse = await pickFileAndGetAnalyseButton(user);

    await user.click(analyse);
    await waitFor(() => expect(loadImage).toHaveBeenCalledTimes(1));

    // click 2 on the same button element
    await user.click(analyse);
    await letEverythingSettle();

    expect(loadImage).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});