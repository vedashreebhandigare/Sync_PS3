import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { FoodIcon } from "../ui";

/* ─── Menu Data ─── */

interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  hasChevron?: boolean;
  badge?: string;
  subItems?: { id: string; label: string }[];
}

const MENU: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboardIcon /> },
  {
    id: "leads",
    label: "Leads",
    icon: <UsersIcon />,
    hasChevron: true,
    subItems: [
      { id: "add-lead", label: "Add Lead" },
      { id: "lead-pipeline", label: "Lead Pipeline" },
    ],
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: <CalendarIcon />,
    hasChevron: true,
    subItems: [
      { id: "calendar", label: "Calendar" },
      { id: "all-bookings", label: "All Bookings" },
    ],
  },
  { id: "events", label: "Events", icon: <StarIcon /> },
  {
    id: "call-coach",
    label: "Call Coach",
    icon: <PhoneIcon />,
    hasChevron: true,
    subItems: [
      { id: "new-call", label: "New Call" },
      { id: "call-history", label: "Call History" },
    ],
  },
  {
    id: "menu",
    label: "Menu",
    icon: <FoodIcon />,
  },
  { id: "logistics", label: "Logistics", icon: <PackageIcon /> },
  { id: "reports", label: "Reports", icon: <BarChartIcon /> },
  { id: "users", label: "Users", icon: <UserIcon /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon /> },
];

/* ─── Component ─── */

interface SidebarProps {
  activeItemId?: string;
  onItemClick?: (id: string) => void;
}

export default function Sidebar({ activeItemId = "dashboard", onItemClick }: SidebarProps) {
  const [activeId, setActiveId] = useState(activeItemId);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    leads: true,
    bookings: true,
    "call-coach": true,
  });

  useEffect(() => { setActiveId(activeItemId); }, [activeItemId]);

  const navigate = (id: string) => {
    setActiveId(id);
    onItemClick?.(id);
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="aurora-sidebar">
      {/* Logo */}
      <div className="aurora-sidebar-logo">
        <svg className="aurora-sidebar-logo-icon" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 2L6 15h6l-2 11 10-14h-6l4-10z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        </svg>
        <span className="aurora-sidebar-logo-text">Sync</span>
      </div>

      {/* Main Menu */}
      <div style={{ marginTop: 12 }}>
        {MENU.map((item) => (
          <div key={item.id}>
            <div
              className={`aurora-sidebar-item${activeId === item.id && !item.subItems ? " active" : ""}`}
              onClick={(e) => {
                if (item.subItems) {
                  toggleExpand(item.id, e);
                } else {
                  navigate(item.id);
                }
              }}
            >
              <span className="aurora-sidebar-item-icon">{item.icon}</span>
              <span className="aurora-sidebar-item-label">{item.label}</span>
              {item.badge && <span className="aurora-sidebar-badge">{item.badge}</span>}
              {item.hasChevron && (
                <svg
                  className={`aurora-sidebar-item-chevron ${expandedIds[item.id] ? "open" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </div>

            {/* Sub-items */}
            {item.subItems && expandedIds[item.id] && (
              <div className="aurora-sidebar-subitems" style={{ marginLeft: 36, marginTop: 2, marginBottom: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {item.subItems.map(sub => (
                  <div
                    key={sub.id}
                    className={`aurora-sidebar-subitem${activeId === sub.id ? " active" : ""}`}
                    onClick={() => navigate(sub.id)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12.5px",
                      color: activeId === sub.id ? "var(--aurora-accent)" : "var(--aurora-text-muted)",
                      cursor: "pointer",
                      borderRadius: "var(--aurora-radius-md)",
                      transition: "all var(--aurora-transition-fast)",
                      fontWeight: activeId === sub.id ? 500 : 400,
                      userSelect: "none"
                    }}
                    onMouseEnter={(e) => { if (activeId !== sub.id) e.currentTarget.style.color = "var(--aurora-text-primary)" }}
                    onMouseLeave={(e) => { if (activeId !== sub.id) e.currentTarget.style.color = "var(--aurora-text-muted)" }}
                  >
                    <span style={{ marginRight: 8, opacity: activeId === sub.id ? 1 : 0.5 }}>•</span>
                    {sub.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ─── SVG Icons (inline, lightweight) ─── */

function LayoutDashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
      <path d="M8 2v4M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
