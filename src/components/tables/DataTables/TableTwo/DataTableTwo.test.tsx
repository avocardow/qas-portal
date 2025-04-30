// Remove manual JSDOM setup and polyfills

import React from "react";
import "@testing-library/jest-dom";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, type Mock } from "vitest";
import { PermissionProvider } from '@/contexts/PermissionContext';
import { SessionProvider } from 'next-auth/react';

// Mock useAbility hook and provide alias for tests
vi.mock('@/hooks/useAbility', () => ({
  __esModule: true,
  useAbility: vi.fn(),
}));
import { useAbility } from '@/hooks/useAbility';
const mockUseAbility = useAbility as Mock;

// Mock icon components to avoid invalid tag names from SVG imports
vi.mock("@/icons", () => {
  return {
    __esModule: true,
    AngleUpIcon: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="angle-up-icon" {...props} />,  
    AngleDownIcon: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="angle-down-icon" {...props} />,  
    PencilIcon: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="pencil-icon" aria-label="Edit" {...props} />,  
    XMarkIcon: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="xmark-icon" {...props} />,  
  };
});

// Mock ViewActionButton to simplify rendering action button
vi.mock("@/components/common/ViewActionButton", () => {
  return {
    __esModule: true,
    default: (props: { onClick: () => void }) => <button onClick={props.onClick} aria-label="View">View</button>,
  };
});

import DataTableTwo, { DataTableTwoProps } from "./DataTableTwo";

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

function renderWithPermissionProvider(ui: React.ReactElement) {
  return render(
    <SessionProvider session={null}>
      <PermissionProvider>{ui}</PermissionProvider>
    </SessionProvider>
  );
}

describe("DataTableTwo action buttons", () => {
  beforeEach(() => {
    mockUseAbility.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders View and Edit buttons for Admin role and triggers onView", async () => {
    mockUseAbility.mockReturnValue({ can: () => true, cannot: () => false });
    const handleView = vi.fn();
    const handleEdit = vi.fn();
    renderWithPermissionProvider(
      <DataTableTwo
        data={mockData}
        columns={baseColumns}
        onView={handleView}
        onEdit={handleEdit}
        searchTerm=""
        setSearchTerm={() => {}}
      />
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

  it("renders only View button when edit permission is denied", () => {
    // Only view permission granted
    mockUseAbility.mockReturnValue({ can: (permission: string) => permission === 'view', cannot: (permission: string) => permission !== 'view' });
    cleanup();
    const handleView = vi.fn();
    renderWithPermissionProvider(
      <DataTableTwo
        data={mockData}
        columns={baseColumns}
        onView={handleView}
        searchTerm=""
        setSearchTerm={() => {}}
      />
    );
    expect(screen.getAllByRole("button", { name: /view/i })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
  });

  it("renders no action buttons if no permissions", () => {
    mockUseAbility.mockReturnValue({ can: () => false, cannot: () => true });
    renderWithPermissionProvider(
      <DataTableTwo
        data={mockData}
        columns={baseColumns}
        searchTerm=""
        setSearchTerm={() => {}}
      />
    );
    expect(screen.queryByRole("button", { name: /view/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /edit/i })).toBeNull();
  });
});

// Accessibility tests for DataTableTwo header sorting
describe("DataTableTwo accessibility", () => {
  beforeEach(() => {
    mockUseAbility.mockReset();
    mockUseAbility.mockReturnValue({ can: () => true, cannot: () => false });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders table headers with correct scope and aria-sort attributes", async () => {
    const columns = [
      { key: "name", header: "Name", sortable: true },
      { key: "age", header: "Age", sortable: true },
    ];
    const data = [{ id: 1, name: "Alice", age: 30 }];
    renderWithPermissionProvider(
      <DataTableTwo
        data={data}
        columns={columns}
        onView={() => {}}
        totalDbEntries={1}
        currentPage={1}
        pageSize={10}
        searchTerm=""
        setSearchTerm={() => {}}
      />
    );
    const headerName = screen.getByRole("columnheader", { name: /Name/ });
    expect(headerName).toHaveAttribute("scope", "col");
    expect(headerName).toHaveAttribute("aria-sort", "ascending");
    
    // Click to change to descending
    const headerButton = screen.getByRole("button", { name: /Name/ });
    await userEvent.click(headerButton);
    
    // Wait for the state update to be reflected
    await vi.waitFor(() => {
      expect(headerName).toHaveAttribute("aria-sort", "descending");
    });
  });

  it("renders a caption for screen readers for accessibility", () => {
    // Render with caption in DataTableTwo
    const columns = [{ key: "name", header: "Name", sortable: true }];
    const data = [{ id: 1, name: "Alice" }];
    renderWithPermissionProvider(
      <DataTableTwo
        data={data}
        columns={columns}
        onView={() => {}}
        totalDbEntries={1}
        currentPage={1}
        pageSize={10}
        searchTerm=""
        setSearchTerm={() => {}}
      />
    );
    // The caption should be present but only visible to screen readers
    const caption = screen.getByText("Clients table");
    expect(caption.tagName).toBe("CAPTION");
  });
});

describe("DataTableTwo performance", () => {
  beforeEach(() => {
    // Reset and mock ability hook for performance tests
    mockUseAbility.mockReset();
    mockUseAbility.mockReturnValue({ can: () => true, cannot: () => false });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders only the specified pageSize of rows when given a large dataset", () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `User${i + 1}`,
      position: "Test",
      location: "Test",
      age: 20 + (i % 30),
      date: "2023-01-01",
      salary: "$100",
    }));
    renderWithPermissionProvider(
      <DataTableTwo
        data={largeData}
        columns={baseColumns}
        onView={() => {}}
        totalDbEntries={largeData.length}
        currentPage={1}
        pageSize={10}
        searchTerm=""
        setSearchTerm={() => {}}
      />
    );
    // Count rows: header row + pageSize rows
    const rows = screen.getAllByRole("row");
    // header row is first, so rows.length - 1 should equal pageSize
    expect(rows.length - 1).toBe(10);
  });
});
