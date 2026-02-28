import { useState, useEffect, useCallback } from "react";
import type { Branch, Hall } from "../types";
import * as api from "../api/client";
import type { CalendarEvent } from "../api/client";

export type CalendarView = "month" | "week" | "day";

interface UseCalendarReturn {
    events: CalendarEvent[];
    loading: boolean;
    currentDate: Date;
    view: CalendarView;
    setView: (v: CalendarView) => void;
    goNext: () => void;
    goPrev: () => void;
    goToday: () => void;
    branchFilter: string;
    setBranchFilter: (b: string) => void;
    hallFilter: string;
    setHallFilter: (h: string) => void;
    branches: Branch[];
    halls: Hall[];
}

function formatDate(d: Date): string {
    return d.toISOString().split("T")[0];
}

function getMonthRange(d: Date): [string, string] {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return [formatDate(start), formatDate(end)];
}

function getWeekRange(d: Date): [string, string] {
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return [formatDate(start), formatDate(end)];
}

function getDayRange(d: Date): [string, string] {
    const s = formatDate(d);
    return [s, s];
}

export default function useCalendar(): UseCalendarReturn {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>("month");
    const [branchFilter, setBranchFilter] = useState("");
    const [hallFilter, setHallFilter] = useState("");
    const [branches, setBranches] = useState<Branch[]>([]);
    const [halls, setHalls] = useState<Hall[]>([]);

    // Load branches on mount
    useEffect(() => {
        api.fetchBranches().then(setBranches).catch(console.error);
    }, []);

    // Load halls when branch changes
    useEffect(() => {
        if (branchFilter) {
            api.fetchHalls(branchFilter).then(setHalls).catch(console.error);
        } else {
            setHalls([]);
        }
        setHallFilter("");
    }, [branchFilter]);

    // Fetch calendar events
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            let range: [string, string];
            if (view === "month") range = getMonthRange(currentDate);
            else if (view === "week") range = getWeekRange(currentDate);
            else range = getDayRange(currentDate);

            const data = await api.fetchCalendarEvents(
                range[0],
                range[1],
                branchFilter || undefined,
                hallFilter || undefined,
            );
            setEvents(data);
        } catch (err) {
            console.error("Failed to fetch calendar events:", err);
        } finally {
            setLoading(false);
        }
    }, [currentDate, view, branchFilter, hallFilter]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const goNext = () => {
        setCurrentDate((prev) => {
            const d = new Date(prev);
            if (view === "month") d.setMonth(d.getMonth() + 1);
            else if (view === "week") d.setDate(d.getDate() + 7);
            else d.setDate(d.getDate() + 1);
            return d;
        });
    };

    const goPrev = () => {
        setCurrentDate((prev) => {
            const d = new Date(prev);
            if (view === "month") d.setMonth(d.getMonth() - 1);
            else if (view === "week") d.setDate(d.getDate() - 7);
            else d.setDate(d.getDate() - 1);
            return d;
        });
    };

    const goToday = () => setCurrentDate(new Date());

    return {
        events,
        loading,
        currentDate,
        view,
        setView,
        goNext,
        goPrev,
        goToday,
        branchFilter,
        setBranchFilter,
        hallFilter,
        setHallFilter,
        branches,
        halls,
    };
}
