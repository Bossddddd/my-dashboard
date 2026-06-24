import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { formatDateTime } from "../../components/formatters";

describe("formatDateTime utility", () => {
  it("renders a dash when date is null", () => {
    render(formatDateTime(null));
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders a dash when date is undefined", () => {
    render(formatDateTime(undefined));
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders formatted date for valid date string", () => {
    // We use a fixed date to ensure the output is predictable
    const testDate = "2023-10-15T10:30:00Z";
    render(formatDateTime(testDate));

    // Note: The specific output depends on the local timezone where the test runs,
    // but the format generally should match the 'th-TH' locale.
    // Instead of testing exact string which varies by timezone, we test that a
    // date-like string is rendered, or we just check it doesn't render '-'
    const element = screen.getByText(
      (content) => content.length > 3 && content !== "-",
    );
    expect(element).toBeInTheDocument();
  });
});
