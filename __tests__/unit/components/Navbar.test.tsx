import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Navbar from "../../../components/Navbar";

vi.mock("../../../components/ImportButton", () => ({
  default: () => <button>Mock Import Button</button>,
}));

describe("Navbar", () => {
  it("renders the dashboard title", () => {
    render(<Navbar onSearch={() => {}} />);
    expect(screen.getByText(/Maintenance-Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/DEV VERSION/i)).toBeInTheDocument();
  });

  it("updates search input value", () => {
    render(<Navbar onSearch={() => {}} />);
    const input = screen.getByPlaceholderText(/เลขทะเบียน/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "1234" } });
    expect(input.value).toBe("1234");
  });

  it("calls onSearch with trimmed query when submitted", () => {
    const onSearchMock = vi.fn();
    render(<Navbar onSearch={onSearchMock} />);
    
    const input = screen.getByPlaceholderText(/เลขทะเบียน/i);
    fireEvent.change(input, { target: { value: "  AB-1234  " } });
    
    const button = screen.getByRole("button", { name: /ค้นหา/i });
    fireEvent.click(button);
    
    expect(onSearchMock).toHaveBeenCalledWith("AB-1234");
  });

  it("does not call onSearch if query is empty", () => {
    const onSearchMock = vi.fn();
    render(<Navbar onSearch={onSearchMock} />);
    
    const button = screen.getByRole("button", { name: /ค้นหา/i });
    fireEvent.click(button);
    
    expect(onSearchMock).not.toHaveBeenCalled();
  });

  it("renders ImportButton", () => {
    render(<Navbar onSearch={() => {}} />);
    expect(screen.getByText("Mock Import Button")).toBeInTheDocument();
  });
});
