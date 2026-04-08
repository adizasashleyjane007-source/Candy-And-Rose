/**
 * Supabase data access layer for the Salon Dashboard.
 * All CRUD operations for every entity live here.
 */
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Customer {
  id?: number;
  created_at?: string;
  name: string;
  email?: string;
  phone?: string;
  visits?: number;
  last_visit?: string | null;
  total_spent?: number;
  status?: string;
  membership_type?: string;
}

export interface Staff {
  id?: number;
  created_at?: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  status?: string;
  schedule?: string;
}

export interface Service {
  id?: number;
  created_at?: string;
  name: string;
  category?: string;
  price?: number;
  duration?: number;
  description?: string;
  status?: string;
}

export interface Appointment {
  id?: number;
  created_at?: string;
  customer_id?: number | null;
  staff_id?: number | null;
  service_id?: number | null;
  appointment_date: string;
  appointment_time?: string | null;
  status?: string;
  notes?: string;
  // Joined fields
  customers?: { name: string } | null;
  staff?: { name: string } | null;
  services?: { name: string; price: number } | null;
}

export interface InventoryItem {
  id?: number;
  created_at?: string;
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  reorder_level?: number;
  cost_price?: number | null;
  status?: string;
}

export interface BillingRecord {
  id?: number;
  created_at?: string;
  customer_id?: number | null;
  appointment_id?: number | null;
  amount: number;
  payment_method?: string;
  status?: string;
  notes?: string;
  // Joined fields
  customers?: { name: string } | null;
}

export interface Notification {
  id?: number;
  created_at?: string;
  title: string;
  message?: string;
  type?: string;
  is_read?: boolean;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function supabase() {
  return createClient();
}

// ─── Customers ────────────────────────────────────────────────────────────────

export const Customers = {
  async list() {
    const { data, error } = await supabase()
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Customer[];
  },

  async create(payload: Omit<Customer, "id" | "created_at">) {
    const { data, error } = await supabase()
      .from("customers")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Customer;
  },

  async update(id: number, payload: Partial<Customer>) {
    const { data, error } = await supabase()
      .from("customers")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Customer;
  },

  async remove(id: number) {
    const { error } = await supabase()
      .from("customers")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ─── Staff ────────────────────────────────────────────────────────────────────

export const StaffDB = {
  async list() {
    const { data, error } = await supabase()
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Staff[];
  },

  async create(payload: Omit<Staff, "id" | "created_at">) {
    const { data, error } = await supabase()
      .from("staff")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Staff;
  },

  async update(id: number, payload: Partial<Staff>) {
    const { data, error } = await supabase()
      .from("staff")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Staff;
  },

  async remove(id: number) {
    const { error } = await supabase()
      .from("staff")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const Services = {
  async list() {
    const { data, error } = await supabase()
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Service[];
  },

  async create(payload: Omit<Service, "id" | "created_at">) {
    const { data, error } = await supabase()
      .from("services")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Service;
  },

  async update(id: number, payload: Partial<Service>) {
    const { data, error } = await supabase()
      .from("services")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Service;
  },

  async remove(id: number) {
    const { error } = await supabase()
      .from("services")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ─── Appointments ─────────────────────────────────────────────────────────────

export const Appointments = {
  async list() {
    const { data, error } = await supabase()
      .from("appointments")
      .select(`
        *,
        customers(name),
        staff(name),
        services(name, price)
      `)
      .order("appointment_date", { ascending: false });
    if (error) throw error;
    return data as Appointment[];
  },

  async create(payload: Omit<Appointment, "id" | "created_at" | "customers" | "staff" | "services">) {
    const { data, error } = await supabase()
      .from("appointments")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Appointment;
  },

  async update(id: number, payload: Partial<Omit<Appointment, "customers" | "staff" | "services">>) {
    const { data, error } = await supabase()
      .from("appointments")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Appointment;
  },

  async remove(id: number) {
    const { error } = await supabase()
      .from("appointments")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ─── Inventory ────────────────────────────────────────────────────────────────

export const Inventory = {
  async list() {
    const { data, error } = await supabase()
      .from("inventory")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as InventoryItem[];
  },

  async create(payload: Omit<InventoryItem, "id" | "created_at">) {
    const { data, error } = await supabase()
      .from("inventory")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as InventoryItem;
  },

  async update(id: number, payload: Partial<InventoryItem>) {
    const { data, error } = await supabase()
      .from("inventory")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as InventoryItem;
  },

  async remove(id: number) {
    const { error } = await supabase()
      .from("inventory")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ─── Billing ──────────────────────────────────────────────────────────────────

export const Billing = {
  async list() {
    const { data, error } = await supabase()
      .from("billing")
      .select(`
        *,
        customers(name)
      `)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as BillingRecord[];
  },

  async create(payload: Omit<BillingRecord, "id" | "created_at" | "customers">) {
    const { data, error } = await supabase()
      .from("billing")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as BillingRecord;
  },

  async update(id: number, payload: Partial<BillingRecord>) {
    const { data, error } = await supabase()
      .from("billing")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as BillingRecord;
  },

  async remove(id: number) {
    const { error } = await supabase()
      .from("billing")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const NotificationsDB = {
  async list() {
    const { data, error } = await supabase()
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Notification[];
  },

  async add(title: string, message: string, type: string) {
    const { data, error } = await supabase()
      .from("notifications")
      .insert({ title, message, type, is_read: false })
      .select()
      .single();
    if (error) throw error;
    return data as Notification;
  },

  async markRead(id: number) {
    const { error } = await supabase()
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (error) throw error;
  },

  async markAllRead() {
    const { error } = await supabase()
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);
    if (error) throw error;
  },

  async remove(id: number) {
    const { error } = await supabase()
      .from("notifications")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
