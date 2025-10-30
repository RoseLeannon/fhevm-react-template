// Key management component
'use client';

import React, { useState, useEffect } from 'react';
import {
  generateKeyPair,
  storeKeyPair,
  retrieveKeyPair,
  clearKeyPair,
  hasStoredKeyPair,
  getKeyTimestamp,
  areKeysExpired,
  exportKeyPair,
  importKeyPair,
  rotateKeys,
} from '@/lib/fhe/keys';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardBody, CardFooter, CardDescription } from '@/components/ui/Card';
import type { KeyPair } from '@/lib/fhe/types';

/**
 * Key Manager Component
 * Manages FHE encryption keys
 */
export const KeyManager: React.FC = () => {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyTimestamp, setKeyTimestamp] = useState<number | null>(null);
  const [keysExpired, setKeysExpired] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  /**
   * Load existing keys on mount
   */
  useEffect(() => {
    loadKeys();
  }, []);

  /**
   * Load keys from storage
   */
  const loadKeys = () => {
    const stored = retrieveKeyPair();
    if (stored) {
      setKeyPair(stored);
      const timestamp = getKeyTimestamp();
      setKeyTimestamp(timestamp);
      setKeysExpired(areKeysExpired(30));
    }
  };

  /**
   * Generate new key pair
   */
  const handleGenerateKeys = async () => {
    setIsGenerating(true);
    try {
      const newKeyPair = await generateKeyPair();
      storeKeyPair(newKeyPair);
      setKeyPair(newKeyPair);
      setKeyTimestamp(Date.now());
      setKeysExpired(false);
    } catch (error) {
      console.error('Failed to generate keys:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Rotate keys (generate and store new ones)
   */
  const handleRotateKeys = async () => {
    setIsGenerating(true);
    try {
      const newKeyPair = await rotateKeys();
      setKeyPair(newKeyPair);
      setKeyTimestamp(Date.now());
      setKeysExpired(false);
    } catch (error) {
      console.error('Failed to rotate keys:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Clear stored keys
   */
  const handleClearKeys = () => {
    if (confirm('Are you sure you want to delete your keys? This action cannot be undone.')) {
      clearKeyPair();
      setKeyPair(null);
      setKeyTimestamp(null);
      setKeysExpired(false);
    }
  };

  /**
   * Export keys as JSON
   */
  const handleExportKeys = () => {
    if (!keyPair) return;

    const exported = exportKeyPair(keyPair);
    const blob = new Blob([exported], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fhe-keys-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Import keys from JSON
   */
  const handleImportKeys = () => {
    try {
      const imported = importKeyPair(importText);
      storeKeyPair(imported);
      setKeyPair(imported);
      setKeyTimestamp(Date.now());
      setKeysExpired(false);
      setImportText('');
      setImportError('');
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed');
    }
  };

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  /**
   * Calculate key age
   */
  const getKeyAge = (timestamp: number | null) => {
    if (!timestamp) return 'Unknown';
    const age = Date.now() - timestamp;
    const days = Math.floor(age / (1000 * 60 * 60 * 24));
    const hours = Math.floor((age % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} days, ${hours} hours`;
  };

  return (
    <div className="space-y-6">
      {/* Current Keys Status */}
      <Card variant={keysExpired ? 'outlined' : 'default'}>
        <CardHeader>
          <CardTitle>Key Pair Status</CardTitle>
          <CardDescription>
            {keyPair
              ? keysExpired
                ? 'Your keys are expired. Consider rotating them.'
                : 'Your keys are active and ready to use.'
              : 'No keys found. Generate a new key pair to get started.'}
          </CardDescription>
        </CardHeader>
        <CardBody>
          {keyPair ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Public Key:</span>
                  <code className="block mt-1 text-sm bg-white px-3 py-2 rounded border border-gray-200 break-all">
                    {keyPair.publicKey}
                  </code>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Private Key:</span>
                  <code className="block mt-1 text-sm bg-white px-3 py-2 rounded border border-gray-200 break-all">
                    {keyPair.privateKey.substring(0, 20)}...
                    <span className="text-gray-400">(hidden for security)</span>
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p className="text-gray-600">{formatTimestamp(keyTimestamp)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Age:</span>
                  <p className="text-gray-600">{getKeyAge(keyTimestamp)}</p>
                </div>
              </div>

              {keysExpired && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-yellow-800">
                      Your keys are older than 30 days. Consider rotating them for enhanced security.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <p className="mt-2 text-gray-600">No keys generated yet</p>
            </div>
          )}
        </CardBody>
        <CardFooter justify="between">
          {keyPair ? (
            <>
              <Button onClick={handleRotateKeys} isLoading={isGenerating} variant="outline">
                Rotate Keys
              </Button>
              <div className="space-x-2">
                <Button onClick={handleExportKeys} variant="secondary">
                  Export
                </Button>
                <Button onClick={handleClearKeys} variant="danger">
                  Delete Keys
                </Button>
              </div>
            </>
          ) : (
            <Button onClick={handleGenerateKeys} isLoading={isGenerating} variant="primary" fullWidth>
              Generate Key Pair
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Import Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Import Keys</CardTitle>
          <CardDescription>
            Import a previously exported key pair
          </CardDescription>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Pair JSON
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"publicKey": "...", "privateKey": "..."}'
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                rows={6}
              />
              {importError && (
                <p className="mt-1 text-sm text-red-600">{importError}</p>
              )}
            </div>
          </div>
        </CardBody>
        <CardFooter>
          <Button
            onClick={handleImportKeys}
            disabled={!importText}
            variant="primary"
          >
            Import
          </Button>
        </CardFooter>
      </Card>

      {/* Security Info */}
      <Card variant="outlined">
        <CardBody>
          <div className="flex items-start space-x-3">
            <svg className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Security Best Practices:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Keep your private key secure and never share it</li>
                <li>Export and backup your keys in a safe location</li>
                <li>Rotate keys regularly (recommended every 30 days)</li>
                <li>Clear keys from browser if using a shared device</li>
                <li>Keys are stored in browser local storage only</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
