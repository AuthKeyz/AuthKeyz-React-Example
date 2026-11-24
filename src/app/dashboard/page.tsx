"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { TwoFASetup } from "@/components/TwoFASetup";

export default function Dashboard() {
  const { isAuthenticated, user, logout, loading, authkeyz } = useAuth();
  // Rewrite function name to AuthKeyzApp to match other examples
  const AuthKeyzApp = authkeyz;
  const AuthKeyzAppData = AuthKeyzApp?.app_data;
  const router = useRouter();
  const [showTwoFASetup, setShowTwoFASetup] = useState(false);
  const [twoFAMode, setTwoFAMode] = useState<"enable" | "disable">("enable");
  const [userVariable, setUserVariable] = useState<string | null>(null);
  const [varValue, setVarValue] = useState('');
  const [varMessage, setVarMessage] = useState('');
  const [varLoading, setVarLoading] = useState(false);
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));

  const formatCountdown = (expiryUnix?: number) => {
    if (!expiryUnix) return "N/A";
    const diff = expiryUnix - nowSec;
    if (diff <= 0) return "Expired";
    const d = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${d}d ${h}h ${m}m ${s}s left`;
  };

  useEffect(() => {
    const tick = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }

    async function fetchUserVariable() {
      if (AuthKeyzApp) {
        await AuthKeyzApp.getvar("example").then((value) => {
          setUserVariable(value);
        });
      }
    }

    fetchUserVariable();

    const heartbeat = setInterval(async () => {
      if (AuthKeyzApp && typeof (AuthKeyzApp as any).check === "function") {
        try {
          const ok = await (AuthKeyzApp as any).check();
          if (ok === false) {
            await logout();
            router.push("/");
          }
        } catch {
          // Ignore transient network errors
        }
      }
    }, 60000);

    return () => clearInterval(heartbeat);
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleTwoFASetup = (mode: "enable" | "disable") => {
    setTwoFAMode(mode);
    setShowTwoFASetup(true);
  };

  const handleCloseTwoFASetup = () => {
    setShowTwoFASetup(false);
  };

  const handleAddUserVariable = async () => {
    if (!varValue.trim()) {
      setVarMessage('Please enter a value');
      return;
    }

    setVarLoading(true);
    setVarMessage('');

    try {
      await AuthKeyzApp?.setvar('example', varValue.trim());
      setVarMessage(`Successfully set variable 'example' to: ${varValue}`);
      setVarValue('');
    } catch (error) {
      setVarMessage(`Error: ${error instanceof Error ? error.message : 'Failed to add variable'}`);
    } finally {
      setVarLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-custom-back rounded-xl p-4 md:p-10 w-full max-w-4xl flex flex-col justify-center mx-2">
        <div className="flex justify-center mb-3">
          <a href="../">
            <img
              src="https://authkeyz.bond/assets/img/authkeyz-logo.png"
              alt="AuthKeyz Logo"
              className="h-12 md:h-20 w-auto"
            />
          </a>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-blue-500/10 rounded-full p-6">
            <svg
              className="w-16 h-16 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 00-2-2m0 0a2 2 0 012 2v2a2 2 0 00-2 2"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-3 text-2xl md:text-3xl text-center font-bold text-white">
          Welcome, {user?.username}
        </h1>
        <p className="mb-4 text-sm md:text-base text-center font-normal text-gray-300">
          Manage your account settings and security preferences
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 mr-2 rounded-full bg-emerald-400 animate-pulse"></span>
            API 1.3 Ed25519 Verified
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30">
            Replay Protection Active
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-400 border border-purple-500/30">
            Clock Drift: {AuthKeyzApp?.security_status?.lastClockDriftSec ?? 0}s
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Subscription: {formatCountdown(user?.expires)}
          </span>
        </div>

        {user && (
          <div className="space-y-6">
            <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Username:</span>
                    <p className="text-white font-medium">{user.username}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">IP Address:</span>
                    <p className="text-white font-medium">{user.ip}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Subscription(s):</span>
                    <p className="text-white font-medium">
                      {Array.isArray(user.subscriptions)
                        ? user.subscriptions
                            .map((sub: any, index: number) => sub.subscription)
                            .join(", ")
                        : user.subscription}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Hardware-Id:</span>
                    <p className="text-white font-medium">{user.hwid}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Account Created:</span>
                    <p className="text-white font-medium">
                      {new Date(user.createdate * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Login:</span>
                    <p className="text-white font-medium">
                      {new Date(user.lastlogin * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Expires:</span>
                    <p className="text-white font-medium">
                      {new Date(user.expires * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">User Variable:</span>
                    <p className="text-white font-medium">{userVariable || "No Variable"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Application Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Application Version:</span>
                    <p className="text-white font-medium">
                      {AuthKeyzAppData?.app_ver}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Customer Panel:</span>
                    <p className="text-white font-medium">
                      {AuthKeyzAppData?.customer_panel}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">
                      Number of Online Users:
                    </span>
                    <p className="text-white font-medium">
                      {AuthKeyzAppData?.onlineUsers}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Number of Keys:</span>
                    <p className="text-white font-medium">
                      {AuthKeyzAppData?.numKeys}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Number of Users:</span>
                    <p className="text-white font-medium">
                      {AuthKeyzAppData?.numUsers}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Changeable Settings
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleTwoFASetup("enable")}
                  className="bg-custom-back-1 cursor-pointer text-white hover:!bg-blue-600 focus:ring-0 focus:outline-none transition duration-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center w-full"
                >
                  <span className="inline-flex">
                    Enable 2FA
                    <svg
                      className="w-3.5 h-3.5 ml-2 mt-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                      />
                    </svg>
                  </span>
                </button>
                <button
                  onClick={() => handleTwoFASetup("disable")}
                  className="bg-custom-back-1 cursor-pointer text-white hover:!bg-blue-600 focus:ring-0 focus:outline-none transition duration-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center w-full"
                >
                  <span className="inline-flex">
                    Disable 2FA
                    <svg
                      className="w-3.5 h-3.5 ml-2 mt-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                      />
                    </svg>
                  </span>
                </button>
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Set User Variable 'example'
                      </label>
                      <input
                        type="text"
                        value={varValue}
                        onChange={(e) => setVarValue(e.target.value)}
                        placeholder="Enter value for 'example' variable"
                        className="w-full px-3 py-2 bg-custom-back-1 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleAddUserVariable}
                      disabled={varLoading}
                      className="bg-custom-back-1 cursor-pointer text-white hover:!bg-blue-600 focus:ring-0 focus:outline-none transition duration-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="inline-flex">
                        {varLoading ? 'Setting...' : 'Set User Variable'}
                        {!varLoading && (
                          <svg
                            className="w-3.5 h-3.5 ml-2 mt-1"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 10"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M1 5h12m0 0L9 1m4 4L9 9"
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                    {varMessage && (
                      <div className={`text-sm p-3 rounded-lg ${
                        varMessage.startsWith('Successfully') 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {varMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>


            <div className="text-center pt-4">
              <button
                onClick={logout}
                className="bg-custom-back-1 cursor-pointer text-white hover:!bg-blue-600 focus:ring-0 focus:outline-none transition duration-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center w-full"
              >
                <span className="inline-flex">
                  Logout
                  <svg
                    className="w-3.5 h-3.5 ml-2 mt-1"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 5h12m0 0L9 1m4 4L9 9"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showTwoFASetup && (
        <TwoFASetup mode={twoFAMode} onClose={handleCloseTwoFASetup} />
      )}
    </section>
  );
}
