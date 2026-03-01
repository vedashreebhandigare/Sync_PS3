import { useState } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import LeadPipelinePage from "./LeadPipelinePage";
import LogisticsPage from "../logistics/LogisticsPage";
import MenuPage from "../menu/MenuPage";
import BookingsOverviewPage from "./BookingsOverviewPage";
import ReportsPage from "./ReportsPage";

export default function DashboardLayout() {
    const [activePage, setActivePage] = useState<string>("lead-pipeline");

    const renderPage = () => {
        switch (activePage) {
            case "logistics":
                return <LogisticsPage />;
            case "menu":
                return <MenuPage />;
            case "calendar":
            case "all-bookings":
                return <BookingsOverviewPage />;
            case "reports":
                return <ReportsPage />;
            case "lead-pipeline":
            default:
                return <LeadPipelinePage />;
        }
    };

    return (
        <div className="aurora-root">
            <Sidebar activeItemId={activePage} onItemClick={setActivePage} />

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
