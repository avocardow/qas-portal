import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import DataTableTwo, { DataTableTwoProps } from "./DataTableTwo";

// Mock useRole from RbacContext
vi.mock("@/context/RbacContext", () => ({
  useRole: vi.fn(),
}));
import { useRole } from "@/context/RbacContext";

const mockData = [
  {
    id: 1,
    name: "Alice",
    position: "Dev",
    location: "NY",
    age: 30,
    date: "2023-01-01",
    salary: "$100",
  },
];
const baseColumns: DataTableTwoProps["columns"] = [
  { key: "name", header: "Name" },
];

describe("DataTableTwo action buttons", () => {
  beforeEach(() => {
    (useRole as jest.Mock).mockReset();
  });

  it("renders View and Edit buttons for Admin role and triggers onView", async () => {
    (useRole as jest.Mock).mockReturnValue("Admin");
    const handleView = vi.fn();
    render(
      <DataTableTwo data={mockData} columns={baseColumns} onView={handleView} />
    );
    // View button should be present
    const viewBtn = screen.getByRole("button", { name: /view/i });
    expect(viewBtn).toBeInTheDocument();
    // Edit button should be present
    const editBtn = screen.getByRole("button", { name: /edit/i });
    expect(editBtn).toBeInTheDocument();
    // Click view
    await userEvent.click(viewBtn);
    expect(handleView).toHaveBeenCalledWith(mockData[0]);
  });

  it("renders only View button for Manager and Client roles", () => {
    ["Manager", "Client"].forEach((role) => {
      (useRole as jest.Mock).mockReturnValue(role);
      const handleView = vi.fn();
      render(
        <DataTableTwo
          data={mockData}
          columns={baseColumns}
          onView={handleView}
        />
      );
      // View button should exist
      expect(screen.getByRole("button", { name: /view/i })).toBeInTheDocument();
      // Edit button should not exist
      expect(
        screen.queryByRole("button", { name: /edit/i })
      ).not.toBeInTheDocument();
    });
  });

  it("renders no action buttons if no onView or insufficient role", () => {
    (useRole as jest.Mock).mockReturnValue("Staff");
    render(<DataTableTwo data={mockData} columns={baseColumns} />);
    expect(screen.queryByRole("button", { name: /view/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /edit/i })).toBeNull();
  });
});
