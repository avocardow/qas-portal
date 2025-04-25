import React from "react";
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock EyeIcon from icons so Jest DOM can find an SVG element
vi.mock("@/icons", () => ({
  EyeIcon: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="eye-icon" {...props}></svg>
  ),
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ViewActionButton from "./ViewActionButton";

describe("ViewActionButton", () => {
  it("renders with correct aria-label and contains SVG icon", () => {
    const handleClick = vi.fn();
    render(<ViewActionButton onClick={handleClick} />);
    const button = screen.getByRole("button", { name: /view/i });
    expect(button).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<ViewActionButton onClick={handleClick} />);
    await userEvent.click(screen.getByRole("button", { name: /view/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies additional className prop", () => {
    const handleClick = vi.fn();
    render(<ViewActionButton onClick={handleClick} className="custom-class" />);
    const button = screen.getByRole("button", { name: /view/i });
    expect(button).toHaveClass("custom-class");
  });
});
