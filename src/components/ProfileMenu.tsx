"use client";

import { useEffect, useState } from "react";
import { Copy, RefreshCcw, User } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfileMenu() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchApiKey() {
    setLoading(true);
    try {
      const res = await fetch("/api/users/api-key/get");
      const data = await res.json();
      if (res.ok) setApiKey(data.apiKey);
      else throw new Error(data.error || "Failed to load API key");
    } catch {
      toast.error("Failed to fetch API key");
    } finally {
      setLoading(false);
    }
  }

  async function regenerateApiKey() {
    const confirm = window.confirm("Regenerate your API key? This will invalidate the old one.");
    if (!confirm) return;

    setLoading(true);
    try {
      const res = await fetch("/api/users/api-key/regenerate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setApiKey(data.apiKey);
        toast.success("API Key regenerated");
      } else {
        throw new Error(data.error || "Failed to regenerate");
      }
    } catch {
      toast.error("Error regenerating API key");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success("Copied to clipboard");
    }
  }

  useEffect(() => {
    fetchApiKey();
  }, []);

  return (
    <div className="bg-[#161b22] text-white p-6 rounded-xl shadow-lg max-w-md mx-auto mt-10 border border-[#30363d]">
      <div className="flex items-center gap-2 mb-4">
        <User className="text-purple-400" size={20} />
        <h2 className="text-lg font-semibold">Admin Profile</h2>
      </div>

      <div className="mb-2 text-sm text-slate-400">API Key</div>
      <div className="flex items-center justify-between bg-[#0d1117] p-2 rounded border border-[#30363d]">
        <code className="truncate text-purple-300 text-sm max-w-[220px]">{apiKey || "Loading..."}</code>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="hover:text-purple-400 transition-colors"
            disabled={!apiKey}
          >
            <Copy size={16} />
          </button>
          <button
            onClick={regenerateApiKey}
            className="hover:text-purple-400 transition-colors"
            disabled={loading}
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
