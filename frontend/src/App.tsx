import { useState } from "react";
import { Header, FilterBar } from "./components/layout";
import { KanbanBoard, AddLeadModal, CSVImportModal } from "./components/leads";
import useLeads from "./hooks/useLeads";
import "./styles/index.css";

export default function App(): JSX.Element {
  const {
    filteredLeads,
    filters,
    setFilters,
    stageCounts,
    hasActiveFilters,
    updateLead,
    moveStage,
    addLead,
    importCSV,
  } = useLeads();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showCSVModal, setShowCSVModal] = useState<boolean>(false);

  return (
    <div
      style={{
        fontFamily: "var(--font-primary)",
        background: "var(--bg-app)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header with stats + action buttons */}
      <Header
        totalLeads={filteredLeads.length}
        stageCounts={stageCounts}
        hasFilters={hasActiveFilters}
        onAddLead={() => setShowAddModal(true)}
        onImportCSV={() => setShowCSVModal(true)}
      />

      {/* Filter bar */}
      <FilterBar filters={filters} onChangeFilters={setFilters} />

      {/* Kanban board + detail panel */}
      <KanbanBoard
        leads={filteredLeads}
        onUpdateLead={updateLead}
        onMoveStage={moveStage}
      />

      {/* Modals */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onAdd={addLead}
        />
      )}
      {showCSVModal && (
        <CSVImportModal
          onClose={() => setShowCSVModal(false)}
          onImport={importCSV}
        />
      )}
    </div>
  );
}
