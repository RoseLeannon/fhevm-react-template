'use client';

import { useState } from 'react';
import { useFhevm, useEncrypt, useDecrypt, useWallet } from '@fhevm/universal-sdk/react';

export default function Home() {
  const { connect, isConnected, address } = useWallet();
  const [contractAddress, setContractAddress] = useState('');

  // Initialize FHEVM
  const { fhevm, isInitialized, isInitializing, error: fhevmError } = useFhevm({
    network: 'sepolia',
    contractAddress: contractAddress || '0x0000000000000000000000000000000000000000',
  });

  // Encryption
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt(fhevm);

  // Decryption
  const { decrypt, isDecrypting, error: decryptError } = useDecrypt(fhevm);

  // State for demonstration
  const [inputValue, setInputValue] = useState('42');
  const [encryptedResult, setEncryptedResult] = useState<string>('');
  const [decryptedValue, setDecryptedValue] = useState<string>('');

  const handleEncrypt = async () => {
    if (!contractAddress) {
      alert('Please enter contract address');
      return;
    }

    const result = await encrypt(contractAddress, {
      value: {
        type: 'uint8',
        value: parseInt(inputValue),
      },
    });

    if (result) {
      setEncryptedResult(result.handles[0] || 'Encrypted successfully');
    }
  };

  const handleDecrypt = async () => {
    if (!contractAddress || !address) {
      alert('Please connect wallet and enter contract address');
      return;
    }

    const result = await decrypt({
      contractAddress,
      handle: encryptedResult,
      userAddress: address,
    });

    if (result) {
      setDecryptedValue(String(result.value));
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            FHEVM Universal SDK
          </h1>
          <p className="text-xl text-gray-600">
            Framework-agnostic SDK for confidential smart contracts
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Wallet Connection</h2>
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-mono text-sm">{address}</span>
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">FHEVM Instance</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-600">Status:</span>
              {isInitializing && (
                <span className="text-blue-600 animate-pulse">Initializing...</span>
              )}
              {isInitialized && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-green-600 font-semibold">Ready</span>
                </div>
              )}
              {fhevmError && <span className="text-red-600">Error: {fhevmError.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Address
              </label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Encryption Demo */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Encryption</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value to Encrypt
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleEncrypt}
              disabled={isEncrypting || !isInitialized}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
            </button>
            {encryptError && <p className="text-red-600 text-sm">{encryptError.message}</p>}
            {encryptedResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Encrypted Handle:</p>
                <p className="font-mono text-sm break-all">{encryptedResult}</p>
              </div>
            )}
          </div>
        </div>

        {/* Decryption Demo */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Decryption</h2>
          <div className="space-y-4">
            <button
              onClick={handleDecrypt}
              disabled={isDecrypting || !isInitialized || !encryptedResult}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDecrypting ? 'Decrypting...' : 'Decrypt Value'}
            </button>
            {decryptError && <p className="text-red-600 text-sm">{decryptError.message}</p>}
            {decryptedValue && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Decrypted Value:</p>
                <p className="font-mono text-2xl font-bold">{decryptedValue}</p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-lg font-semibold mb-2">Quick Setup</h3>
            <p className="text-sm text-gray-600">Less than 10 lines of code to get started</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-3">🔧</div>
            <h3 className="text-lg font-semibold mb-2">Framework Agnostic</h3>
            <p className="text-sm text-gray-600">Works with React, Vue, Node.js, or vanilla JS</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Fully Encrypted</h3>
            <p className="text-sm text-gray-600">End-to-end FHE encryption for complete privacy</p>
          </div>
        </div>
      </div>
    </main>
  );
}
