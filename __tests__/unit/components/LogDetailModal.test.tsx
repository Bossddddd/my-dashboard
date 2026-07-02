import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LogDetailModal from "../../../components/LogDetailModal";
import { LanguageProvider } from "../../../app/LanguageContext";
import { getHistoryByLogId, updateMaintenanceLog } from "../../../app/actions";
import toast from "react-hot-toast";

// Mock dependencies
vi.mock("../../../app/actions", () => ({
  updateMaintenanceLog: vi.fn(),
  getHistoryByLogId: vi.fn().mockResolvedValue([]),
  createMaintenanceLog: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    loading: vi.fn(() => "loading-toast-id"),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../components/MapComponent", () => ({
  default: () => <div data-testid="map-component">Map</div>,
}));

vi.mock("../../../lib/syncQueue", () => ({
  addOfflineTask: vi.fn(),
}));

describe("LogDetailModal", () => {
  const mockLog = {
    id: 1,
    maintenanceLogId: 1,
    vehiclePlate: "V-123",
    status: "OPEN",
    priority: "HIGH",
    description: "Engine oil change",
    technicianName: "John Doe",
  };

  const renderModal = (activeLogModal: any = mockLog, onClose = vi.fn(), onUpdate = vi.fn()) => {
    return render(
      <LanguageProvider language="th" setLanguage={vi.fn()}>
        <LogDetailModal 
          activeLogModal={activeLogModal} 
          onClose={onClose} 
          onUpdate={onUpdate} 
        />
      </LanguageProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders log details correctly", async () => {
    renderModal();
    
    // Using RegExp for partial matching
    expect(document.body.textContent).toMatch(/V-123/);
    expect(document.body.textContent).toMatch(/Engine oil change/i);
    
    // Check if getHistoryByLogId was called
    expect(getHistoryByLogId).toHaveBeenCalledWith(1);
  });

  it("calls onClose when close button is clicked", async () => {
    const onCloseMock = vi.fn();
    renderModal(mockLog, onCloseMock);
    
    const closeButtons = screen.getAllByRole("button").filter(btn => btn.textContent === "✕" || btn.getAttribute("aria-label") === "Close" || btn.className.includes("absolute right-4 top-4"));
    
    if (closeButtons.length > 0) {
      fireEvent.click(closeButtons[0]);
      expect(onCloseMock).toHaveBeenCalled();
    }
  });

  it("enters edit mode when Edit button is clicked", async () => {
    renderModal();
    
    // Find edit button
    const editButton = await screen.findByRole("button", { name: /แก้ไข/i });
    fireEvent.click(editButton);
    
    // Description text area should become available for editing
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe("Engine oil change");
  });

  it("saves changes and calls updateMaintenanceLog", async () => {
    (updateMaintenanceLog as any).mockResolvedValue({ success: true });
    
    renderModal();
    
    // Click edit
    const editButton = await screen.findByRole("button", { name: /แก้ไข/i });
    fireEvent.click(editButton);
    
    // Change description
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Updated description" } });
    
    // Click save
    const saveButton = await screen.findByRole("button", { name: /บันทึก/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(updateMaintenanceLog).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });
});
