'use client';

import { useState } from 'react';
import { useFhevm, useEncrypt, useContract, useWallet } from '@fhevm/universal-sdk/react';
import { CONTRACT_ABI } from '../lib/abi';

export default function TrafficAnalytics() {
  const { connect, isConnected, address } = useWallet();

  // Contract address (update after deployment)
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

  // FHEVM initialization
  const { fhevm, isInitialized, error: fhevmError } = useFhevm({
    network: 'sepolia',
    contractAddress,
  });

  // SDK hooks
  const { encrypt, isEncrypting } = useEncrypt(fhevm);
  const { contract, call, isLoading } = useContract(fhevm, contractAddress, CONTRACT_ABI);

  // Form state
  const [region, setRegion] = useState('Downtown');
  const [congestion, setCongestion] = useState(50);
  const [vehicles, setVehicles] = useState(100);
  const [speed, setSpeed] = useState(45);

  // Status
  const [submitStatus, setSubmitStatus] = useState('');
  const [regions, setRegions] = useState<string[]>(['Downtown', 'Suburb', 'Highway']);

  // Submit encrypted traffic report using SDK
  const handleSubmitReport = async () => {
    if (!fhevm || !isConnected) {
      setSubmitStatus('Please connect wallet and initialize FHEVM');
      return;
    }

    try {
      setSubmitStatus('Encrypting traffic data...');

      // Encrypt all values using SDK
      const encrypted = await encrypt(contractAddress, {
        congestion: { type: 'uint8', value: congestion },
        vehicles: { type: 'uint8', value: vehicles },
        speed: { type: 'uint16', value: speed },
      });

      if (!encrypted) {
        throw new Error('Encryption failed');
      }

      setSubmitStatus('Submitting encrypted report...');

      // Call contract function using SDK
      const tx = await call('submitTrafficReport', [
        region,
        congestion,
        vehicles,
        speed,
      ]);

      setSubmitStatus('Waiting for confirmation...');
      await tx.wait();

      setSubmitStatus('✅ Report submitted successfully!');
      setTimeout(() => setSubmitStatus(''), 5000);
    } catch (error: any) {
      console.error('Error submitting report:', error);
      setSubmitStatus(`❌ Error: ${error.message || 'Failed to submit report'}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🚦 Private Traffic Analytics
          </h1>
          <p className="text-xl text-gray-300">
            Real-world FHEVM SDK example - Privacy-preserving traffic monitoring
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl mb-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4">Wallet Connection</h2>
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="font-mono text-sm text-gray-200">{address}</span>
            </div>
          ) : (
            <button
              onClick={connect}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* FHEVM Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl mb-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4">FHEVM SDK Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-gray-300">Initialization:</span>
              {isInitialized ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-green-400 font-semibold">Ready</span>
                </div>
              ) : (
                <span className="text-yellow-400">Initializing...</span>
              )}
            </div>
            {fhevmError && (
              <div className="text-red-400 text-sm">{fhevmError.message}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit Report Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Submit Traffic Report</h2>

            <div className="space-y-4">
              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {regions.map((r) => (
                    <option key={r} value={r} className="bg-gray-800">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Congestion Level */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Congestion Level: {congestion}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={congestion}
                  onChange={(e) => setCongestion(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Vehicle Count */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vehicle Count: {vehicles}
                </label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={vehicles}
                  onChange={(e) => setVehicles(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>255</span>
                </div>
              </div>

              {/* Average Speed */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Average Speed: {speed} km/h
                </label>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0 km/h</span>
                  <span>120 km/h</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitReport}
                disabled={!isInitialized || !isConnected || isEncrypting || isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEncrypting || isLoading ? 'Processing...' : 'Submit Encrypted Report'}
              </button>

              {/* Status Message */}
              {submitStatus && (
                <div className={`p-4 rounded-lg ${
                  submitStatus.includes('✅') ? 'bg-green-500/20 text-green-200' :
                  submitStatus.includes('❌') ? 'bg-red-500/20 text-red-200' :
                  'bg-blue-500/20 text-blue-200'
                }`}>
                  {submitStatus}
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* How It Works */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">🔒 How It Works</h3>
              <ol className="space-y-3 text-gray-300 text-sm">
                <li className="flex gap-2">
                  <span className="font-bold text-purple-400">1.</span>
                  <span>SDK encrypts your traffic data using FHE</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-purple-400">2.</span>
                  <span>Encrypted data is submitted to smart contract</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-purple-400">3.</span>
                  <span>Contract aggregates encrypted values</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-purple-400">4.</span>
                  <span>Individual reports remain private forever</span>
                </li>
              </ol>
            </div>

            {/* Privacy Benefits */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">✨ Privacy Benefits</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Your individual reports stay encrypted</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Only aggregated stats are visible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>No one can link data to you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>GDPR compliant by design</span>
                </li>
              </ul>
            </div>

            {/* SDK Features */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">🚀 SDK Features Used</h3>
              <ul className="space-y-2 text-gray-300 text-sm font-mono">
                <li>• useFhevm() - Instance management</li>
                <li>• useEncrypt() - Data encryption</li>
                <li>• useContract() - Contract interaction</li>
                <li>• useWallet() - Wallet connection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
