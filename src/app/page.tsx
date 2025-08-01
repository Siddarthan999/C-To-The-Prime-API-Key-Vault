"use client";

import { useState } from "react";
import CredentialsForm from "./credentials/CredentialsForm";
import ProfilePage from "./profile/ProfilePage";
import { FaUserCircle } from "react-icons/fa";

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [viewingProfile, setViewingProfile] = useState(false);

  const handleLogin = () => {
    const validUsername = process.env.NEXT_PUBLIC_KEY_VAULT_USERNAME;
    const validPassword = process.env.NEXT_PUBLIC_KEY_VAULT_PASSWORD;

    if (username === validUsername && password === validPassword) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setViewingProfile(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-purple-900 text-white flex items-center justify-center relative">
      <div className="absolute top-4 right-4">
        {isAuthenticated && (
          <button onClick={() => setViewingProfile(true)} title="View Profile">
            <FaUserCircle size={32} className="text-white hover:text-purple-300" />
          </button>
        )}
      </div>

      <div className="w-full max-w-xl p-6">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#e3194b]">C TO THE PRIME</h1>

        {!isAuthenticated ? (
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl mb-4">Login to API Key Vault</h2>
            <input
              type="text"
              placeholder="Username"
              className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <button
              onClick={handleLogin}
              className="bg-[#e3194b] hover:bg-[#c21742] text-white px-4 py-2 rounded w-full"
            >
              Login
            </button>
          </div>
        ) : viewingProfile ? (
          <ProfilePage onBack={() => setViewingProfile(false)} onLogout={handleLogout} />
        ) : (
          <>
            <h2 className="text-2xl mb-6 text-center text-purple-300">API Key Vault</h2>
            <CredentialsForm />
          </>
        )}
      </div>
    </main>
  );
}
