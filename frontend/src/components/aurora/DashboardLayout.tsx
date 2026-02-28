import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import LeadPipelinePage from "./LeadPipelinePage";

export default function DashboardLayout(): JSX.Element {
    return (
        <div className="aurora-root">
            {/* Left sidebar */}
            <Sidebar activeItemId="lead-pipeline" />

            {/* Right: header + content */}
            <div className="aurora-main-wrapper">
                <TopHeader />
                <main className="aurora-content" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <LeadPipelinePage />
                </main>
            </div>
        </div>
    );
}
