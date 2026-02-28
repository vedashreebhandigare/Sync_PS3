import { useState, useEffect, useCallback } from "react";
import type { InventoryItem, InventoryItemInput } from "../types";
import * as api from "../api/client";

interface UseInventoryReturn {
    inventory: InventoryItem[];
    toBuy: InventoryItem[];
    loading: boolean;
    refreshList: () => Promise<void>;
    createItem: (data: InventoryItemInput) => Promise<void>;
    updateItem: (id: string, data: InventoryItemInput) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}

export default function useInventory(): UseInventoryReturn {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [toBuy, setToBuy] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const refreshList = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const [list, buyList] = await Promise.all([
                api.fetchInventory(),
                api.fetchToBuy(),
            ]);
            setInventory(list);
            setToBuy(buyList);
        } catch (err) {
            console.error("Failed to fetch inventory:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshList();
    }, [refreshList]);

    const createItem = useCallback(async (data: InventoryItemInput): Promise<void> => {
        await api.createInventoryItem(data);
        await refreshList();
    }, [refreshList]);

    const updateItem = useCallback(async (id: string, data: InventoryItemInput): Promise<void> => {
        await api.updateInventoryItem(id, data);
        await refreshList();
    }, [refreshList]);

    const deleteItem = useCallback(async (id: string): Promise<void> => {
        await api.deleteInventoryItem(id);
        await refreshList();
    }, [refreshList]);

    return {
        inventory,
        toBuy,
        loading,
        refreshList,
        createItem,
        updateItem,
        deleteItem,
    };
}
