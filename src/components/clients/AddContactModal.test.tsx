import { vi } from 'vitest';
// Stub TRPC api to avoid context errors
vi.mock('@/utils/api', () => ({
  api: {
    useContext: () => ({}),
    contact: { create: { useMutation: () => ({ mutate: () => {}, isLoading: false }) } },
    license: {
      create: { useMutation: () => ({ mutate: () => {} }) },
      getByLicenseNumber: { useQuery: () => ({ data: undefined }) },
    },
  },
}));
// Stub Modal to render children directly
vi.mock('@/components/ui/modal', () => ({ __esModule: true, Modal: ({ isOpen, children }) => isOpen ? <>{children}</> : null }));
// Stub ComponentCard to simplify layout
vi.mock('@/components/common/ComponentCard', () => ({ __esModule: true, default: ({ title, children }) => <div><h1>{title}</h1>{children}</div> }));
// Stub Notification to simplify layout
vi.mock('@/components/ui/notification/Notification', () => ({ __esModule: true, default: ({ title }) => <div>{title}</div> }));
// Stub Select to avoid SVG icons
vi.mock('@/components/form/Select', () => ({ __esModule: true, default: ({ options, onChange }) => (
  <select data-testid="select" onChange={e => onChange(e.target.value)}>
    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
)}));
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AddContactModal from "./AddContactModal";

describe("AddContactModal", () => {
  it("renders Add Contact form when open", () => {
    const handleClose = vi.fn();
    render(
      <AddContactModal clientId="test-client" isOpen={true} onClose={handleClose} />
    );
    // Heading indicates the modal is open
    expect(screen.getByRole('heading', { name: 'Add Contact' })).toBeInTheDocument();
  });

  it("does not render Add Contact form when closed", () => {
    const handleClose = vi.fn();
    render(
      <AddContactModal clientId="test-client" isOpen={false} onClose={handleClose} />
    );
    expect(screen.queryByRole('heading', { name: 'Add Contact' })).toBeNull();
  });

  it("calls onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(<AddContactModal clientId="test-client" isOpen={true} onClose={handleClose} />);
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    expect(handleClose).toHaveBeenCalled();
  });
}); 