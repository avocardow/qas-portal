import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import AddContactModal from "./AddContactModal";

describe("AddContactModal", () => {
  it("renders children when open", () => {
    const handleClose = vi.fn();
    render(
      <AddContactModal isOpen={true} onClose={handleClose}>
        <div>Modal Content</div>
      </AddContactModal>
    );
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("does not render children when closed", () => {
    const handleClose = vi.fn();
    render(
      <AddContactModal isOpen={false} onClose={handleClose}>
        <div>Hidden Content</div>
      </AddContactModal>
    );
    expect(screen.queryByText("Hidden Content")).toBeNull();
  });

  it("calls onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <AddContactModal isOpen={true} onClose={handleClose}>
        <div>Content</div>
      </AddContactModal>
    );
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    expect(handleClose).toHaveBeenCalled();
  });
}); 