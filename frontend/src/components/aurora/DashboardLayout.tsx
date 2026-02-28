import { useState } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import LeadPipelinePage from "./LeadPipelinePage";
import BookingsOverviewPage from "./BookingsOverviewPage";

export default function DashboardLayout() {
    const [activePage, setActivePage] = useState("lead-pipeline");

    const renderPage = () => {
        switch (activePage) {
            case "calendar":
            case "all-bookings":
                return <BookingsOverviewPage />;
            case "lead-pipeline":
            default:
                return <LeadPipelinePage />;
        }
    };

    return (
        <div className="aurora-root">
            <Sidebar activeItemId={activePage} onNavigate={setActivePage} />

            <div className="aurora-main-wrapper">
                <TopHeader />
                <main
                    className="aurora-content"
                    style={{
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}
