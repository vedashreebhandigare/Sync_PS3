import { useState } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import LeadPipelinePage from "./LeadPipelinePage";
import LogisticsPage from "../logistics/LogisticsPage";
import MenuPage from "../menu/MenuPage";

export default function DashboardLayout() {
    const [activeView, setActiveView] = useState<string>("lead-pipeline");

    return (
        <div className="aurora-root">
            {/* Left sidebar */}
            <Sidebar activeItemId={activeView} onItemClick={setActiveView} />

            {/* Right: header + content */}
            <div className="aurora-main-wrapper">
                <TopHeader />
                <main className="aurora-content" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {activeView === "logistics" ? <LogisticsPage /> : activeView === "menu" ? <MenuPage /> : <LeadPipelinePage />}
                </main>
            </div>
        </div>
    );
}
