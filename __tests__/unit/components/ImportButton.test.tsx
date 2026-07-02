import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ImportButton from "../../../components/ImportButton";
import toast from "react-hot-toast";

// Mock dependencies
vi.mock("react-hot-toast", () => ({
  default: {
    loading: vi.fn(() => "loading-toast-id"),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("xlsx", () => ({
  read: vi.fn(() => ({
    SheetNames: ["Sheet1"],
    Sheets: {
      Sheet1: {}
    }
  })),
  utils: {
    sheet_to_json: vi.fn(() => [
      {
        "ID": 1,
        "Status": "OPEN",
        "Priority": "HIGH"
      }
    ]),
  },
}));

// We need to mock the server actions
vi.mock("../../../app/actions", () => ({
  uploadMaintenanceLogs: vi.fn().mockResolvedValue({ success: true, count: 1 })
}));

describe("ImportButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the import button correctly", () => {
    render(<ImportButton />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/นำเข้าข้อมูล/i);
  });

  it("triggers file input when button is clicked", () => {
    render(<ImportButton />);
    const button = screen.getByRole("button");
    
    // The input is hidden, but we can query it
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    
    const clickSpy = vi.spyOn(fileInput, 'click');
    fireEvent.click(button);
    expect(clickSpy).toHaveBeenCalled();
  });

  it("shows error if uploaded file is invalid (no data)", async () => {
    // Override sheet_to_json to return empty
    const xlsx = await import("xlsx");
    (xlsx.utils.sheet_to_json as any).mockReturnValueOnce([]);

    render(<ImportButton />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Mock a file selection
    const file = new File(["dummy content"], "test.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
