/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

type SettingsState = {
  storeName: string;
  currency: string;
  supportEmail: string;
  flwPublicKey: string;
  webhookUrl: string;
};

const DEFAULTS: SettingsState = {
  storeName: "28th Hide Luxe",
  currency: "NGN",
  supportEmail: "",
  flwPublicKey: "",
  webhookUrl: "",
};

const Settings: React.FC = () => {
  const [state, setState] = useState<SettingsState>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // load saved admin settings from localStorage as fallback
    try {
      const raw = localStorage.getItem("admin_settings");
      if (raw) {
        setState(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleChange =
    (k: keyof SettingsState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setState((s) => ({ ...s, [k]: e.target.value }));
    };

  const validate = () => {
    if (!state.storeName.trim()) return "Store name is required";
    if (!state.currency.trim()) return "Currency is required";
    if (
      state.supportEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.supportEmail)
    )
      return "Invalid support email";
    return null;
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setMessage(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      // try saving to admin API if available (server should persist securely)
      if (API_BASE) {
        const res = await fetch(`${API_BASE}/api/admin/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Server: ${res.status} ${txt}`);
        }
        setMessage("Settings saved to server.");
      } else {
        // fallback: save to localStorage for dev
        localStorage.setItem("admin_settings", JSON.stringify(state));
        setMessage("Settings saved locally (dev).");
      }
    } catch (err: any) {
      console.error("Save settings error", err);
      setError(err?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setState(DEFAULTS);
    setMessage("Reset to defaults (not persisted until you click Save).");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">Settings</h1>
        <p className="text-sm text-gray-500 mb-6">
          Configure store, payment integration and webhooks. Sensitive keys
          should be set server-side in production.
        </p>

        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Store Name
            </label>
            <input
              value={state.storeName}
              onChange={handleChange("storeName")}
              className="mt-1 input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              value={state.currency}
              onChange={handleChange("currency")}
              className="mt-1 input w-full"
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Support Email
            </label>
            <input
              value={state.supportEmail}
              onChange={handleChange("supportEmail")}
              className="mt-1 input w-full"
              placeholder="support@example.com"
            />
          </div>

          <div className="md:col-span-2">
            <h2 className="text-sm font-medium text-gray-800 mb-2">
              Payment (Flutterwave)
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Do not store secret keys in the client for production. Use
              server-side env variables instead.
            </p>
            <label className="block text-sm text-gray-700">Public Key</label>
            <input
              value={state.flwPublicKey}
              onChange={handleChange("flwPublicKey")}
              className="mt-1 input w-full"
              placeholder="FLWPUBK_xxx"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Webhook URL
            </label>
            <input
              value={state.webhookUrl}
              onChange={handleChange("webhookUrl")}
              className="mt-1 input w-full"
              placeholder="https://example.com/webhook/flutterwave"
            />
          </div>

          <div className="md:col-span-2 flex gap-3 items-center mt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Saving…" : "Save Settings"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-outline"
            >
              Reset
            </button>
            <div className="ml-auto text-sm">
              {message && <span className="text-green-600">{message}</span>}
              {error && <span className="text-red-600">{error}</span>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
