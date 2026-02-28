import { useState } from "react";
import { Header, FilterBar } from "./components/layout";
import { KanbanBoard, AddLeadModal, CSVImportModal } from "./components/leads";
import useLeads from "./hooks/useLeads";
import useReferenceData from "./hooks/useReferenceData";
import "./styles/index.css";

export default function App(): JSX.Element {
  const {
    leads,
    filters,
    setFilters,
    summary,
    hasActiveFilters,
    listLoading,
    selectedLead,
    detailLoading,
    selectLead,
    closeDetail,
    createLead,
    updateFields,
    moveStage,
    setHall,
    updateMenu,
    addRemark,
    updateAddOns,
    importCSV,
  } = useLeads();

  const { branches, contractors, catalog, loading: refLoading } = useReferenceData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);

  /* Show a simple loader until reference data arrives */
  if (refLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-primary)",
          color: "var(--text-muted)",
          fontSize: 15,
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-app)",
      }}
    >
      <Header
        totalLeads={leads.length}
        summary={summary}
        hasFilters={hasActiveFilters}
        onAddLead={() => setShowAddModal(true)}
        onImportCSV={() => setShowCSVModal(true)}
      />

      <FilterBar
        filters={filters}
        onChange={setFilters}
        branches={branches}
        hasActiveFilters={hasActiveFilters}
      />

      {listLoading && leads.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-primary)",
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          Loading leads…
        </div>
      ) : (
        <KanbanBoard
          leads={leads}
          selectedLead={selectedLead}
          detailLoading={detailLoading}
          onSelectLead={selectLead}
          onCloseDetail={closeDetail}
          onUpdateFields={updateFields}
          onMoveStage={moveStage}
          onSetHall={setHall}
          onUpdateMenu={updateMenu}
          onAddRemark={addRemark}
          onUpdateAddOns={updateAddOns}
          contractors={contractors}
          catalog={catalog}
        />
      )}

      {showAddModal && (
        <AddLeadModal
          branches={branches}
          onClose={() => setShowAddModal(false)}
          onAdd={async (data) => {
            await createLead(data);
            setShowAddModal(false);
          }}
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
