import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ExportButton from "../../../components/ExportButton";
import { getAllLogsForExport } from "../../../app/actions";
import toast from "react-hot-toast";

// Mock dependencies
vi.mock("../../../app/actions", () => ({
  getAllLogsForExport: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    loading: vi.fn(() => "loading-toast-id"),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("xlsx", () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

describe("ExportButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the export button correctly", () => {
    render(<ExportButton />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/นำออกข้อมูล/i);
  });

  it("disables the button while exporting", async () => {
    (getAllLogsForExport as any).mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve([]), 100)));
    
    render(<ExportButton />);
    const button = screen.getByRole("button");
    
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/กำลัง/i); // "กำลัง" is Thai for "in progress / -ing"
    
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("calls getAllLogsForExport and shows success toast on successful export", async () => {
    const mockData = [
      { id: 1, status: "OPEN", priority: "HIGH" },
    ];
    (getAllLogsForExport as any).mockResolvedValue(mockData);

    render(<ExportButton selectedIds={[1]} />);
    const button = screen.getByRole("button");
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(getAllLogsForExport).toHaveBeenCalledWith([1]);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("shows error toast if export fails", async () => {
    (getAllLogsForExport as any).mockRejectedValue(new Error("Network error"));

    render(<ExportButton />);
    const button = screen.getByRole("button");
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
