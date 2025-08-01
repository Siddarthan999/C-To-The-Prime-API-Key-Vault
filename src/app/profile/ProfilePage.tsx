"use client";

import { useEffect, useState } from "react";
import {
  Clipboard,
  ClipboardCheck,
  LogOut,
  ArrowLeft,
  RotateCcw,
  User
} from "lucide-react";

interface ProfilePageProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function ProfilePage({ onBack, onLogout }: ProfilePageProps) {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/users/api-key/get")
      .then((res) => res.json())
      .then((data) => {
        setApiKey(data.apiKey || "Not Found");
        setLoading(false);
      });
  }, []);

  const regenerateKey = async () => {
    setLoading(true);
    const res = await fetch("/api/users/api-key/regenerate", {
      method: "POST",
    });
    const data = await res.json();
    setApiKey(data.apiKey || "Error generating key");
    setLoading(false);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0d1117] p-8 rounded-xl border border-[#30363d] shadow-lg w-full max-w-xl mx-auto text-gray-200">
      <h2 className="text-2xl font-semibold flex items-center justify-center gap-2 mb-6">
        <User className="w-5 h-5 text-gray-400" />
        Admin Profile
      </h2>

      <div className="space-y-4 mb-6">
        <div>
          <span className="text-gray-400 font-medium">Username:</span>{" "}
          <span className="text-white">{process.env.NEXT_PUBLIC_KEY_VAULT_USERNAME}</span>
        </div>

        <div>
          <span className="text-gray-400 font-medium">API Key:</span>
          <div className="bg-[#161b22] border border-[#30363d] p-3 mt-2 rounded-md text-sm break-all font-mono flex items-center justify-between">
            <span>{loading ? "Loading..." : apiKey}</span>
            {!loading && (
              <button
                onClick={handleCopy}
                title="Copy to clipboard"
                className="ml-2 p-1 rounded hover:bg-[#21262d]"
              >
                {copied ? (
                  <ClipboardCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <Clipboard className="h-4 w-4 text-gray-400" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={regenerateKey}
          className="flex items-center gap-2 bg-[#21262d] hover:bg-[#30363d] text-gray-100 px-5 py-2 rounded-md border border-[#30363d] transition"
        >
          <RotateCcw className="w-4 h-4" />
          Regenerate Key
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 bg-[#21262d] hover:bg-[#30363d] text-gray-100 px-4 py-2 rounded-md border border-[#30363d] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 bg-[#e3194b] hover:bg-[#c21742] text-white px-4 py-2 rounded-md transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
