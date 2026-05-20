import { useCallback, useEffect, useState } from "react";
import type { MFCartItem } from "@/lib/mercado-facil/types";

const STORAGE_KEY = "mf_cart_v1";

function readStorage(): MFCartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MFCartItem[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: MFCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("mf-cart-change"));
}

export function useMFCart() {
  const [items, setItems] = useState<MFCartItem[]>(() => readStorage());

  useEffect(() => {
    const handler = () => setItems(readStorage());
    window.addEventListener("mf-cart-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("mf-cart-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const add = useCallback((item: Omit<MFCartItem, "quantidade">, qty = 1) => {
    const cur = readStorage();
    const idx = cur.findIndex((i) => i.produto_id === item.produto_id);
    if (idx >= 0) cur[idx].quantidade += qty;
    else cur.push({ ...item, quantidade: qty });
    writeStorage(cur);
  }, []);

  const setQty = useCallback((produto_id: string, qty: number) => {
    let cur = readStorage();
    if (qty <= 0) cur = cur.filter((i) => i.produto_id !== produto_id);
    else cur = cur.map((i) => (i.produto_id === produto_id ? { ...i, quantidade: qty } : i));
    writeStorage(cur);
  }, []);

  const remove = useCallback((produto_id: string) => setQty(produto_id, 0), [setQty]);

  const clearLoja = useCallback((loja_id: string) => {
    const cur = readStorage().filter((i) => i.loja_id !== loja_id);
    writeStorage(cur);
  }, []);

  const clearAll = useCallback(() => writeStorage([]), []);

  const byLoja = items.reduce<Record<string, MFCartItem[]>>((acc, i) => {
    (acc[i.loja_id] ||= []).push(i);
    return acc;
  }, {});

  const totalItens = items.reduce((s, i) => s + i.quantidade, 0);

  return { items, byLoja, totalItens, add, setQty, remove, clearLoja, clearAll };
}
