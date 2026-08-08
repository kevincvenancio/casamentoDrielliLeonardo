/** LEGADO: gifts.status nao decide mais disponibilidade (ver stock.ts). */
export type GiftStatus = "available" | "reserved" | "paid";

export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded";

export interface Gift {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  /** Quantas vezes pode ser comprado. null = ilimitado. */
  stock_total: number | null;
  /** false esconde o presente da lista (sem apagar o historico). */
  active: boolean;
  /** @deprecated coluna legada; mantida so por compatibilidade. */
  status: GiftStatus;
  /** @deprecated a reserva agora vive em payments.reserved_until. */
  reserved_until: string | null;
  sort_order: number;
  created_at: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  attending: boolean;
  /** Sempre igual a companion_names.length -- quem grava e a API. */
  companions: number;
  companion_names: string[];
  message: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  gift_id: string | null;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  amount_cents: number | null;
  status: PaymentStatus;
  /** Ate quando este checkout pendente segura uma unidade. */
  reserved_until: string | null;
  raw_payload: unknown;
  created_at: string;
  updated_at: string;
}
