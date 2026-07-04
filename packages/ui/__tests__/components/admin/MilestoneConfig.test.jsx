import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import MilestoneConfig from "../../../src/components/admin/MilestoneConfig";
import { instance } from "../../../src/api/api_instance";
import { ToastContext } from "../../../src/contexts/Contexts";
import { MILESTONE_CONFIG } from "../../../src/utils/Constants";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("../../../src/api/api_instance", () => ({
  instance: vi.fn(),
}));

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

vi.mock("../../../src/hooks/useToast.js", () => ({
  useToast: () => mockToast,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeConfig = (overrides = {}) => ({
  _id: "config-1",
  name: "Q1 2026 Campaign",
  thresholds: [
    { at: 5, points: 10 },
    { at: 10, points: 20 },
    { at: 25, points: 50 },
  ],
  is_active: false,
  is_deleted: false,
  created_by: "admin-1",
  createdAt: "2025-11-23T16:47:48.000Z",
  updatedAt: "2025-11-23T16:47:48.000Z",
  ...overrides,
});

const makeListResponse = (configs = []) => ({
  data: { data: configs, count: configs.length },
});

const wrapper = ({ children }) => (
  <ToastContext.Provider value={mockToast}>{children}</ToastContext.Provider>
);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("MilestoneConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    instance.mockResolvedValue(makeListResponse([]));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the panel with title and subtitle", async () => {
    render(<MilestoneConfig />, { wrapper });

    expect(screen.getByTestId("milestone-config-panel")).toBeInTheDocument();
    expect(screen.getByText(MILESTONE_CONFIG.title)).toBeInTheDocument();
    expect(screen.getByText(MILESTONE_CONFIG.subtitle)).toBeInTheDocument();
    expect(screen.getByText(MILESTONE_CONFIG.createButton)).toBeInTheDocument();
  });

  it("shows a loading spinner while fetching", async () => {
    instance.mockReturnValue(new Promise(() => {}));
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });
  });

  it("shows empty state when no configs are returned", async () => {
    instance.mockResolvedValueOnce(makeListResponse([]));
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText(MILESTONE_CONFIG.emptyState)).toBeInTheDocument()
    );
  });

  it("shows error toast when fetch fails", async () => {
    instance.mockRejectedValueOnce({
      response: { data: { message: "Unauthorized" } },
    });
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith(
        MILESTONE_CONFIG.toasts.loadError
      )
    );
  });

  it("renders all table headers", async () => {
    instance.mockResolvedValueOnce(makeListResponse([makeConfig()]));
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Thresholds")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });
  });

  it("renders config rows after successful fetch", async () => {
    const configs = [
      makeConfig({ _id: "c1", name: "Q1 Campaign", is_active: true }),
      makeConfig({ _id: "c2", name: "Q2 Campaign", is_active: false }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(configs));

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Q1 Campaign")).toBeInTheDocument()
    );
    expect(screen.getByText("Q2 Campaign")).toBeInTheDocument();
  });

  it("renders status badges correctly", async () => {
    const configs = [
      makeConfig({ _id: "c1", name: "Active Config", is_active: true }),
      makeConfig({ _id: "c2", name: "Inactive Config", is_active: false }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(configs));

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() => {
      const activeBadges = screen.getAllByText(MILESTONE_CONFIG.status.active);
      const inactiveBadges = screen.getAllByText(
        MILESTONE_CONFIG.status.inactive
      );
      expect(activeBadges).toHaveLength(1);
      expect(inactiveBadges).toHaveLength(1);
    });
  });

  it("renders threshold summary correctly", async () => {
    const config = makeConfig({
      thresholds: [
        { at: 5, points: 10 },
        { at: 10, points: 20 },
        { at: 25, points: 50 },
      ],
    });
    instance.mockResolvedValueOnce(makeListResponse([config]));

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/3 tiers/)).toBeInTheDocument();
      expect(screen.getByText(/5→10pts/)).toBeInTheDocument();
    });
  });

  it("shows '+N more' when thresholds exceed 3", async () => {
    const config = makeConfig({
      thresholds: [
        { at: 5, points: 10 },
        { at: 10, points: 20 },
        { at: 25, points: 50 },
        { at: 50, points: 100 },
        { at: 100, points: 200 },
      ],
    });
    instance.mockResolvedValueOnce(makeListResponse([config]));

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/\+2 more/)).toBeInTheDocument();
    });
  });

  // ── Create Modal ───────────────────────────────────────────────────────────

  it("opens create modal when Create Config button is clicked", async () => {
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));

    expect(
      screen.getByText(MILESTONE_CONFIG.modal.createTitle)
    ).toBeInTheDocument();
    expect(
      screen.getByText(MILESTONE_CONFIG.modal.nameLabel)
    ).toBeInTheDocument();
    expect(
      screen.getByText(MILESTONE_CONFIG.modal.thresholdsLabel)
    ).toBeInTheDocument();
  });

  it("closes create modal when Cancel is clicked", async () => {
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));
    expect(
      screen.getByText(MILESTONE_CONFIG.modal.createTitle)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.cancelButton));
    expect(
      screen.queryByText(MILESTONE_CONFIG.modal.createTitle)
    ).not.toBeInTheDocument();
  });

  it("adds a new threshold row when Add Threshold is clicked", async () => {
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));

    const addBtn = screen.getByText(MILESTONE_CONFIG.modal.addThreshold);
    expect(addBtn).toBeInTheDocument();

    // Initially one threshold row
    const atInputs = screen.getAllByPlaceholderText("5");
    expect(atInputs).toHaveLength(1);

    // Fill in the first row
    fireEvent.change(atInputs[0], { target: { value: "5" } });
    const pointsInputs = screen.getAllByPlaceholderText("10");
    fireEvent.change(pointsInputs[0], { target: { value: "10" } });

    // Add another row
    fireEvent.click(addBtn);

    // Now should have two threshold rows
    const newAtInputs = screen.getAllByPlaceholderText("5");
    expect(newAtInputs).toHaveLength(2);
  });

  it("prevents adding threshold when previous row is empty", async () => {
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));

    const addBtn = screen.getByText(MILESTONE_CONFIG.modal.addThreshold);
    fireEvent.click(addBtn);

    expect(mockToast.error).toHaveBeenCalledWith(
      "Please fill in the current threshold before adding another."
    );

    // Should still have only one row
    const atInputs = screen.getAllByPlaceholderText("5");
    expect(atInputs).toHaveLength(1);
  });

  it("removes a threshold row when remove button is clicked", async () => {
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));

    // Add a second row
    const atInputs = screen.getAllByPlaceholderText("5");
    fireEvent.change(atInputs[0], { target: { value: "5" } });
    const pointsInputs = screen.getAllByPlaceholderText("10");
    fireEvent.change(pointsInputs[0], { target: { value: "10" } });

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.addThreshold));

    // Should have two rows
    expect(screen.getAllByPlaceholderText("5")).toHaveLength(2);

    // Remove the second row
    const removeButtons = screen.getAllByTitle(
      MILESTONE_CONFIG.modal.removeThreshold
    );
    fireEvent.click(removeButtons[1]);

    // Should have one row again
    expect(screen.getAllByPlaceholderText("5")).toHaveLength(1);
  });

  it("validates form before saving - name required", async () => {
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));

    // Fill in thresholds but not name
    const atInputs = screen.getAllByPlaceholderText("5");
    fireEvent.change(atInputs[0], { target: { value: "5" } });
    const pointsInputs = screen.getAllByPlaceholderText("10");
    fireEvent.change(pointsInputs[0], { target: { value: "10" } });

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.saveButton));

    expect(mockToast.error).toHaveBeenCalledWith("Name is required.");
  });

  it("validates form before saving - thresholds required", async () => {
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));

    // Fill in name but remove all thresholds
    const nameInput = screen.getByLabelText(MILESTONE_CONFIG.modal.nameLabel);
    fireEvent.change(nameInput, { target: { value: "Test Config" } });

    // Can't remove the only threshold row, so this test validates the logic exists
    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.saveButton));

    // Should fail because thresholds are empty
    expect(mockToast.error).toHaveBeenCalled();
  });

  it("creates a new config successfully", async () => {
    instance.mockResolvedValueOnce(makeListResponse([])); // Initial fetch
    instance.mockResolvedValueOnce({ data: makeConfig() }); // POST
    instance.mockResolvedValueOnce(makeListResponse([makeConfig()])); // Refetch

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));

    const nameInput = screen.getByLabelText(MILESTONE_CONFIG.modal.nameLabel);
    fireEvent.change(nameInput, { target: { value: "Q1 2026 Campaign" } });

    const atInputs = screen.getAllByPlaceholderText("5");
    fireEvent.change(atInputs[0], { target: { value: "5" } });
    const pointsInputs = screen.getAllByPlaceholderText("10");
    fireEvent.change(pointsInputs[0], { target: { value: "10" } });

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.saveButton));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        MILESTONE_CONFIG.toasts.createSuccess
      );
    });

    expect(
      screen.queryByText(MILESTONE_CONFIG.modal.createTitle)
    ).not.toBeInTheDocument();
  });

  it("shows error toast when create fails", async () => {
    instance.mockResolvedValueOnce(makeListResponse([])); // Initial fetch
    instance.mockRejectedValueOnce({
      response: { data: { message: "Validation failed" } },
    });

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));

    const nameInput = screen.getByLabelText(MILESTONE_CONFIG.modal.nameLabel);
    fireEvent.change(nameInput, { target: { value: "Test Config" } });

    const atInputs = screen.getAllByPlaceholderText("5");
    fireEvent.change(atInputs[0], { target: { value: "5" } });
    const pointsInputs = screen.getAllByPlaceholderText("10");
    fireEvent.change(pointsInputs[0], { target: { value: "10" } });

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.saveButton));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Validation failed");
    });
  });

  // ── Edit Modal ─────────────────────────────────────────────────────────────

  it("opens edit modal when Edit action is clicked", async () => {
    const config = makeConfig({ _id: "c1", name: "Test Config" });
    instance.mockResolvedValueOnce(makeListResponse([config]));

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Test Config")).toBeInTheDocument()
    );

    // Click kebab menu
    fireEvent.click(screen.getByLabelText("Row actions"));

    // Click Edit
    fireEvent.click(screen.getByText("Edit"));

    expect(
      screen.getByText(MILESTONE_CONFIG.modal.editTitle)
    ).toBeInTheDocument();

    const dialog = screen.getByTestId("dialog");
    expect(within(dialog).getByDisplayValue("Test Config")).toBeInTheDocument();
  });

  it("updates a config successfully", async () => {
    const config = makeConfig({ _id: "c1", name: "Old Name" });
    instance.mockResolvedValueOnce(makeListResponse([config])); // Initial fetch
    instance.mockResolvedValueOnce({ data: makeConfig({ name: "New Name" }) }); // PATCH
    instance.mockResolvedValueOnce(
      makeListResponse([makeConfig({ name: "New Name" })])
    ); // Refetch

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Old Name")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText("Edit"));

    const nameInput = screen.getByLabelText(MILESTONE_CONFIG.modal.nameLabel);
    fireEvent.change(nameInput, { target: { value: "New Name" } });

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.saveButton));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        MILESTONE_CONFIG.toasts.updateSuccess
      );
    });
  });

  it("shows error toast when update fails", async () => {
    const config = makeConfig({ _id: "c1", name: "Test Config" });
    instance.mockResolvedValueOnce(makeListResponse([config])); // Initial fetch
    instance.mockRejectedValueOnce({
      response: { data: { message: "Cannot edit active config" } },
    });

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Test Config")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText("Edit"));

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.saveButton));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Cannot edit active config");
    });
  });

  // ── Activate ───────────────────────────────────────────────────────────────

  it("opens activate confirmation modal", async () => {
    const config = makeConfig({ _id: "c1", name: "Test Config" });
    instance.mockResolvedValueOnce(makeListResponse([config]));

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Test Config")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText("Activate"));

    expect(
      screen.getByText(MILESTONE_CONFIG.activate.heading)
    ).toBeInTheDocument();
    expect(
      screen.getByText(MILESTONE_CONFIG.activate.description)
    ).toBeInTheDocument();
  });

  it("activates a config successfully", async () => {
    const config = makeConfig({ _id: "c1", name: "Test Config" });
    instance.mockResolvedValueOnce(makeListResponse([config])); // Initial fetch
    instance.mockResolvedValueOnce({
      data: makeConfig({ is_active: true }),
    }); // PATCH activate
    instance.mockResolvedValueOnce(
      makeListResponse([makeConfig({ is_active: true })])
    ); // Refetch

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Test Config")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText("Activate"));

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.activate.confirmButton));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        MILESTONE_CONFIG.toasts.activateSuccess
      );
    });
  });

  it("shows error toast when activate fails", async () => {
    const config = makeConfig({ _id: "c1", name: "Test Config" });
    instance.mockResolvedValueOnce(makeListResponse([config])); // Initial fetch
    instance.mockRejectedValueOnce({
      response: { data: { message: "Config already active" } },
    });

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Test Config")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText("Activate"));

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.activate.confirmButton));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Config already active");
    });
  });

  it("closes activate modal when Cancel is clicked", async () => {
    const config = makeConfig({ _id: "c1", name: "Test Config" });
    instance.mockResolvedValueOnce(makeListResponse([config]));

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Test Config")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText("Activate"));

    expect(
      screen.getByText(MILESTONE_CONFIG.activate.heading)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));

    expect(
      screen.queryByText(MILESTONE_CONFIG.activate.heading)
    ).not.toBeInTheDocument();
  });

  // ── Delete ─────────────────────────────────────────────────────────────────

  it("opens delete confirmation modal", async () => {
    const config = makeConfig({ _id: "c1", name: "Test Config" });
    instance.mockResolvedValueOnce(makeListResponse([config]));

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Test Config")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText("Delete"));

    expect(
      screen.getByText(MILESTONE_CONFIG.delete.heading)
    ).toBeInTheDocument();
    expect(
      screen.getByText(MILESTONE_CONFIG.delete.description)
    ).toBeInTheDocument();
  });

  it("deletes a config successfully", async () => {
    const config = makeConfig({ _id: "c1", name: "Test Config" });
    instance.mockResolvedValueOnce(makeListResponse([config])); // Initial fetch
    instance.mockResolvedValueOnce({ data: config }); // DELETE
    instance.mockResolvedValueOnce(makeListResponse([])); // Refetch

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Test Config")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText("Delete"));

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.delete.confirmButton));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        MILESTONE_CONFIG.toasts.deleteSuccess
      );
    });
  });

  it("shows error toast when delete fails", async () => {
    const config = makeConfig({ _id: "c1", name: "Test Config" });
    instance.mockResolvedValueOnce(makeListResponse([config])); // Initial fetch
    instance.mockRejectedValueOnce({
      response: { data: { message: "Cannot delete active config" } },
    });

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Test Config")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText("Delete"));

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.delete.confirmButton));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Cannot delete active config"
      );
    });
  });

  // ── View Thresholds Modal ──────────────────────────────────────────────────

  it("opens view thresholds modal when threshold summary is clicked", async () => {
    const config = makeConfig({
      _id: "c1",
      name: "Test Config",
      thresholds: [
        { at: 5, points: 10 },
        { at: 10, points: 20 },
        { at: 25, points: 50 },
      ],
    });
    instance.mockResolvedValueOnce(makeListResponse([config]));

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Test Config")).toBeInTheDocument()
    );

    // Click the threshold summary button
    fireEvent.click(screen.getByText(/3 tiers/));

    // Modal should be open with threshold details
    expect(screen.getByText("3 thresholds")).toBeInTheDocument();
    expect(screen.getByText("5 submissions")).toBeInTheDocument();
    expect(screen.getByText("10 points")).toBeInTheDocument();
  });

  it("closes view thresholds modal when Close is clicked", async () => {
    const config = makeConfig({
      _id: "c1",
      name: "Test Config",
      thresholds: [{ at: 5, points: 10 }],
    });
    instance.mockResolvedValueOnce(makeListResponse([config]));

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Test Config")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(/1 tier/));

    expect(screen.getByText("1 threshold")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close"));

    expect(screen.queryByText("1 threshold")).not.toBeInTheDocument();
  });

  // ── Action Menu ────────────────────────────────────────────────────────────

  it("does not show action menu for active configs", async () => {
    const config = makeConfig({
      _id: "c1",
      name: "Active Config",
      is_active: true,
    });
    instance.mockResolvedValueOnce(makeListResponse([config]));

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Active Config")).toBeInTheDocument()
    );

    // No kebab menu for active configs
    expect(screen.queryByLabelText("Row actions")).not.toBeInTheDocument();
  });

  it("closes action menu when clicking outside", async () => {
    const config = makeConfig({ _id: "c1", name: "Test Config" });
    instance.mockResolvedValueOnce(makeListResponse([config]));

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Test Config")).toBeInTheDocument()
    );

    // Open menu
    fireEvent.click(screen.getByLabelText("Row actions"));
    expect(screen.getByText("Edit")).toBeInTheDocument();

    // Click outside (on the panel title)
    fireEvent.mouseDown(screen.getByText(MILESTONE_CONFIG.title));

    await waitFor(() => {
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });
  });

  it("toggles action menu on kebab click", async () => {
    const config = makeConfig({ _id: "c1", name: "Test Config" });
    instance.mockResolvedValueOnce(makeListResponse([config]));

    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Test Config")).toBeInTheDocument()
    );

    const kebab = screen.getByLabelText("Row actions");

    // Open
    fireEvent.click(kebab);
    expect(screen.getByText("Edit")).toBeInTheDocument();

    // Close
    fireEvent.click(kebab);
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  // ── Ordering Validation ────────────────────────────────────────────────────

  it("validates that 'at' values must be in strictly ascending order", async () => {
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));

    const nameInput = screen.getByLabelText(MILESTONE_CONFIG.modal.nameLabel);
    fireEvent.change(nameInput, { target: { value: "Test Config" } });

    // Fill first threshold
    const atInputs = screen.getAllByPlaceholderText("5");
    fireEvent.change(atInputs[0], { target: { value: "10" } });
    const pointsInputs = screen.getAllByPlaceholderText("10");
    fireEvent.change(pointsInputs[0], { target: { value: "20" } });

    // Add second threshold with lower 'at' value
    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.addThreshold));

    const newAtInputs = screen.getAllByPlaceholderText("5");
    fireEvent.change(newAtInputs[1], { target: { value: "5" } });
    const newPointsInputs = screen.getAllByPlaceholderText("10");
    fireEvent.change(newPointsInputs[1], { target: { value: "30" } });

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.saveButton));

    expect(mockToast.error).toHaveBeenCalledWith(
      "Threshold 'at' values must be in strictly ascending order."
    );
  });

  it("validates that 'at' values cannot have duplicates", async () => {
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));

    const nameInput = screen.getByLabelText(MILESTONE_CONFIG.modal.nameLabel);
    fireEvent.change(nameInput, { target: { value: "Test Config" } });

    // Fill first threshold
    const atInputs = screen.getAllByPlaceholderText("5");
    fireEvent.change(atInputs[0], { target: { value: "10" } });
    const pointsInputs = screen.getAllByPlaceholderText("10");
    fireEvent.change(pointsInputs[0], { target: { value: "20" } });

    // Add second threshold with same 'at' value
    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.addThreshold));

    const newAtInputs = screen.getAllByPlaceholderText("5");
    fireEvent.change(newAtInputs[1], { target: { value: "10" } });
    const newPointsInputs = screen.getAllByPlaceholderText("10");
    fireEvent.change(newPointsInputs[1], { target: { value: "30" } });

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.saveButton));

    expect(mockToast.error).toHaveBeenCalledWith(
      "Threshold 'at' values must be in strictly ascending order."
    );
  });

  it("validates that 'points' values must be in ascending order", async () => {
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));

    const nameInput = screen.getByLabelText(MILESTONE_CONFIG.modal.nameLabel);
    fireEvent.change(nameInput, { target: { value: "Test Config" } });

    // Fill first threshold
    const atInputs = screen.getAllByPlaceholderText("5");
    fireEvent.change(atInputs[0], { target: { value: "5" } });
    const pointsInputs = screen.getAllByPlaceholderText("10");
    fireEvent.change(pointsInputs[0], { target: { value: "50" } });

    // Add second threshold with lower 'points' value
    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.addThreshold));

    const newAtInputs = screen.getAllByPlaceholderText("5");
    fireEvent.change(newAtInputs[1], { target: { value: "10" } });
    const newPointsInputs = screen.getAllByPlaceholderText("10");
    fireEvent.change(newPointsInputs[1], { target: { value: "20" } });

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.saveButton));

    expect(mockToast.error).toHaveBeenCalledWith(
      "Threshold 'points' values must be in ascending order."
    );
  });

  // ── Integer Validation ─────────────────────────────────────────────────────

  it("validates that 'at' values must be integers", async () => {
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));

    const nameInput = screen.getByLabelText(MILESTONE_CONFIG.modal.nameLabel);
    fireEvent.change(nameInput, { target: { value: "Test Config" } });

    const atInputs = screen.getAllByPlaceholderText("5");
    fireEvent.change(atInputs[0], { target: { value: "5.5" } });
    const pointsInputs = screen.getAllByPlaceholderText("10");
    fireEvent.change(pointsInputs[0], { target: { value: "10" } });

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.saveButton));

    expect(mockToast.error).toHaveBeenCalledWith(
      "Each threshold must have a positive integer 'at' value."
    );
  });

  it("validates that 'points' values must be integers", async () => {
    render(<MilestoneConfig />, { wrapper });

    await waitFor(() =>
      expect(
        screen.getByText(MILESTONE_CONFIG.createButton)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.createButton));

    const nameInput = screen.getByLabelText(MILESTONE_CONFIG.modal.nameLabel);
    fireEvent.change(nameInput, { target: { value: "Test Config" } });

    const atInputs = screen.getAllByPlaceholderText("5");
    fireEvent.change(atInputs[0], { target: { value: "5" } });
    const pointsInputs = screen.getAllByPlaceholderText("10");
    fireEvent.change(pointsInputs[0], { target: { value: "10.5" } });

    fireEvent.click(screen.getByText(MILESTONE_CONFIG.modal.saveButton));

    expect(mockToast.error).toHaveBeenCalledWith(
      "Each threshold must have a positive integer 'points' value."
    );
  });
});
