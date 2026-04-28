import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: string;
  list_id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  is_purchased: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useShoppingLists = () => {
  const { user } = useAuth();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    if (!user) {
      setLists([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[useShoppingLists] fetch error:", error);
      toast.error("Erro ao carregar suas listas");
    } else {
      setLists(data ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = async (name: string): Promise<ShoppingList | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("shopping_lists")
      .insert({ user_id: user.id, name })
      .select()
      .single();
    if (error) {
      toast.error("Erro ao criar lista");
      return null;
    }
    setLists((prev) => [data, ...prev]);
    return data;
  };

  const renameList = async (id: string, name: string) => {
    const { error } = await supabase
      .from("shopping_lists")
      .update({ name })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao renomear lista");
      return;
    }
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));
  };

  const deleteList = async (id: string) => {
    const { error } = await supabase.from("shopping_lists").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir lista");
      return;
    }
    setLists((prev) => prev.filter((l) => l.id !== id));
    toast.success("Lista excluída");
  };

  return { lists, loading, createList, renameList, deleteList, refresh: fetchLists };
};

export const useShoppingListDetail = (listId: string | undefined) => {
  const { user } = useAuth();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || !listId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [listRes, itemsRes] = await Promise.all([
      supabase.from("shopping_lists").select("*").eq("id", listId).maybeSingle(),
      supabase
        .from("shopping_list_items")
        .select("*")
        .eq("list_id", listId)
        .order("created_at", { ascending: true }),
    ]);

    if (listRes.error) {
      console.error("[useShoppingListDetail] list error:", listRes.error);
    }
    if (itemsRes.error) {
      console.error("[useShoppingListDetail] items error:", itemsRes.error);
    }
    setList(listRes.data ?? null);
    setItems(itemsRes.data ?? []);
    setLoading(false);
  }, [user, listId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addItem = async (input: {
    name: string;
    quantity: number;
    unit: string;
    category: string;
  }) => {
    if (!user || !listId) return;
    const { data, error } = await supabase
      .from("shopping_list_items")
      .insert({
        list_id: listId,
        user_id: user.id,
        name: input.name,
        quantity: input.quantity,
        unit: input.unit,
        category: input.category,
      })
      .select()
      .single();
    if (error) {
      toast.error("Erro ao adicionar item");
      return;
    }
    setItems((prev) => [...prev, data]);
  };

  const addItemsBulk = async (
    inputs: Array<{ name: string; quantity: number; unit: string; category: string }>,
    targetListId?: string,
  ): Promise<number> => {
    const lid = targetListId ?? listId;
    if (!user || !lid || inputs.length === 0) return 0;
    const rows = inputs.map((i) => ({
      list_id: lid,
      user_id: user.id,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      category: i.category,
    }));
    const { data, error } = await supabase
      .from("shopping_list_items")
      .insert(rows)
      .select();
    if (error) {
      console.error("[addItemsBulk] error:", error);
      toast.error("Erro ao adicionar itens");
      return 0;
    }
    if (lid === listId) {
      setItems((prev) => [...prev, ...(data ?? [])]);
    }
    return data?.length ?? 0;
  };

  const updateItem = async (id: string, patch: Partial<ShoppingListItem>) => {
    const { error } = await supabase
      .from("shopping_list_items")
      .update(patch)
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar item");
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const togglePurchased = async (id: string, value: boolean) => {
    await updateItem(id, { is_purchased: value });
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("shopping_list_items").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover item");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearPurchased = async () => {
    if (!listId) return;
    const purchasedIds = items.filter((i) => i.is_purchased).map((i) => i.id);
    if (purchasedIds.length === 0) return;
    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .in("id", purchasedIds);
    if (error) {
      toast.error("Erro ao limpar itens");
      return;
    }
    setItems((prev) => prev.filter((i) => !i.is_purchased));
    toast.success("Itens comprados removidos");
  };

  return {
    list,
    items,
    loading,
    addItem,
    addItemsBulk,
    updateItem,
    togglePurchased,
    deleteItem,
    clearPurchased,
    refresh: fetchData,
  };
};
