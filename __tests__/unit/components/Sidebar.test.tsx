import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "../../../components/Sidebar";
import { LanguageProvider } from "../../../app/LanguageContext";

describe("Sidebar", () => {
  const setActiveTabMock = vi.fn();

  const renderSidebar = (activeTab: any = "dashboard") => {
    return render(
      <LanguageProvider>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTabMock} />
      </LanguageProvider>
    );
  };

  it("renders basic menu items", () => {
    renderSidebar();
    expect(screen.getByText(/แดชบอร์ด/i)).toBeInTheDocument();
    expect(screen.getByText(/โครงการ/i)).toBeInTheDocument();
    expect(screen.getByText(/ยานพาหนะ/i)).toBeInTheDocument();
  });

  it("toggles maintenance sub-menu visibility", () => {
    renderSidebar();
    
    const maintenanceButton = screen.getByText("ซ่อมบำรุง", { exact: true }).closest("button");
    expect(maintenanceButton).toBeInTheDocument();
    
    // Default is open, so submenu items should be visible
    expect(screen.getByText(/ทีมช่าง\/ศูนย์ซ่อม/i)).toBeInTheDocument();
    
    const svg = maintenanceButton?.querySelector("svg");
    expect(svg).toBeInTheDocument();
    
    // Initially has rotate-180 (because default is open)
    expect(svg).toHaveClass("rotate-180");
    
    // Click to close
    fireEvent.click(maintenanceButton!);
    expect(svg).not.toHaveClass("rotate-180");
    
    // Click to open again
    fireEvent.click(maintenanceButton!);
    expect(svg).toHaveClass("rotate-180");
  });

  it("calls setActiveTab when a maintenance tab is clicked", () => {
    renderSidebar();
    
    const teamsTab = screen.getByText(/ทีมช่าง\/ศูนย์ซ่อม/i);
    fireEvent.click(teamsTab);
    
    expect(setActiveTabMock).toHaveBeenCalledWith("teams");
  });

  it("highlights the active tab", () => {
    renderSidebar("teams");
    const teamsTab = screen.getByText(/ทีมช่าง\/ศูนย์ซ่อม/i);
    // Should have active styles (text-[#0B603A])
    expect(teamsTab).toHaveClass("text-[#0B603A]");
  });
});
