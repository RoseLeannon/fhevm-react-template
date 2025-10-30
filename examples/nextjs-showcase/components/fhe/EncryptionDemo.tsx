// Encryption demonstration component
'use client';

import React, { useState } from 'react';
import { useEncryption } from '@/hooks/useEncryption';
import { useFHEContext } from './FHEProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/Card';
import type { FHEDataType } from '@/lib/fhe/types';

/**
 * Encryption Demo Component
 * Demonstrates FHE encryption and decryption operations
 */
export const EncryptionDemo: React.FC = () => {
  const { config, isInitialized } = useFHEContext();
  const {
    encrypt,
    decrypt,
    isEncrypting,
    isDecrypting,
    encryptionError,
    decryptionError,
    lastEncrypted,
    lastDecrypted,
  } = useEncryption();

  const [contractAddress, setContractAddress] = useState(
    config.contractAddress || '0x0000000000000000000000000000000000000000'
  );
  const [dataType, setDataType] = useState<FHEDataType>('uint32');
  const [value, setValue] = useState('42');
  const [userAddress, setUserAddress] = useState('');

  /**
   * Handle encryption
   */
  const handleEncrypt = async () => {
    let parsedValue: number | bigint | boolean | string;

    // Parse value based on data type
    if (dataType === 'bool') {
      parsedValue = value.toLowerCase() === 'true';
    } else if (dataType === 'address') {
      parsedValue = value;
    } else {
      // Numeric types
      const numValue = Number(value);
      if (dataType.includes('64') || dataType.includes('128') || dataType.includes('256')) {
        parsedValue = BigInt(value);
      } else {
        parsedValue = numValue;
      }
    }

    await encrypt(contractAddress, {
      type: dataType,
      value: parsedValue,
    });
  };

  /**
   * Handle decryption
   */
  const handleDecrypt = async () => {
    if (!lastEncrypted) {
      return;
    }

    await decrypt({
      contractAddress,
      handle: lastEncrypted.handle,
      userAddress,
    });
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardBody>
          <p className="text-gray-600">Please initialize FHE to use encryption features.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encryption Section */}
      <Card>
        <CardHeader>
          <CardTitle>Encrypt Data</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Input
              label="Contract Address"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              fullWidth
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Type
              </label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value as FHEDataType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="uint8">uint8</option>
                <option value="uint16">uint16</option>
                <option value="uint32">uint32</option>
                <option value="uint64">uint64</option>
                <option value="uint128">uint128</option>
                <option value="uint256">uint256</option>
                <option value="bool">bool</option>
                <option value="address">address</option>
              </select>
            </div>

            <Input
              label="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={dataType === 'bool' ? 'true or false' : dataType === 'address' ? '0x...' : 'Enter number'}
              fullWidth
              error={encryptionError?.message}
            />
          </div>
        </CardBody>
        <CardFooter>
          <Button
            onClick={handleEncrypt}
            isLoading={isEncrypting}
            disabled={!contractAddress || !value}
            variant="primary"
          >
            Encrypt
          </Button>
        </CardFooter>
      </Card>

      {/* Encrypted Result */}
      {lastEncrypted && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Encrypted Result</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">Handle:</span>
                <code className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                  {lastEncrypted.handle}
                </code>
              </div>
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-sm">{lastEncrypted.type}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Data Size:</span>
                <span className="ml-2 text-sm">{lastEncrypted.data.length} bytes</span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Decryption Section */}
      {lastEncrypted && (
        <Card>
          <CardHeader>
            <CardTitle>Decrypt Data</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="User Address"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="0x..."
                helperText="Address authorized to decrypt this value"
                fullWidth
                error={decryptionError?.message}
              />
            </div>
          </CardBody>
          <CardFooter>
            <Button
              onClick={handleDecrypt}
              isLoading={isDecrypting}
              disabled={!userAddress}
              variant="secondary"
            >
              Decrypt
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Decrypted Result */}
      {lastDecrypted && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Decrypted Result</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">Value:</span>
                <code className="ml-2 text-lg bg-green-100 px-3 py-1 rounded font-bold text-green-800">
                  {String(lastDecrypted.value)}
                </code>
              </div>
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-sm">{lastDecrypted.type}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Info Card */}
      <Card variant="outlined">
        <CardBody>
          <div className="flex items-start space-x-3">
            <svg
              className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Enter a value and select its data type</li>
                <li>Click "Encrypt" to create an encrypted version</li>
                <li>The encrypted data gets a unique handle for identification</li>
                <li>Use the handle and authorized address to decrypt</li>
                <li>Only authorized addresses can decrypt the data</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
