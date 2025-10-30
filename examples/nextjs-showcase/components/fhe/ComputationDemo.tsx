// Computation demonstration component
'use client';

import React, { useState } from 'react';
import { useComputation, ComputationOperation } from '@/hooks/useComputation';
import { useEncryption } from '@/hooks/useEncryption';
import { useFHEContext } from './FHEProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardBody, CardFooter, CardDescription } from '@/components/ui/Card';
import type { FHEDataType, EncryptedValue } from '@/lib/fhe/types';

/**
 * Computation Demo Component
 * Demonstrates FHE homomorphic computations
 */
export const ComputationDemo: React.FC = () => {
  const { config, isInitialized } = useFHEContext();
  const { add, subtract, multiply, compare, isComputing, result, error } = useComputation();
  const { encrypt, isEncrypting } = useEncryption();

  const [contractAddress, setContractAddress] = useState(
    config.contractAddress || '0x0000000000000000000000000000000000000000'
  );
  const [operation, setOperation] = useState<ComputationOperation>('add');
  const [valueA, setValueA] = useState('10');
  const [valueB, setValueB] = useState('5');
  const [dataType, setDataType] = useState<FHEDataType>('uint32');

  const [encryptedA, setEncryptedA] = useState<EncryptedValue | null>(null);
  const [encryptedB, setEncryptedB] = useState<EncryptedValue | null>(null);

  /**
   * Encrypt both values
   */
  const handleEncryptValues = async () => {
    // Parse values based on type
    const parseValue = (val: string) => {
      if (dataType === 'bool') return val.toLowerCase() === 'true';
      if (dataType === 'address') return val;
      if (dataType.includes('64') || dataType.includes('128') || dataType.includes('256')) {
        return BigInt(val);
      }
      return Number(val);
    };

    const encA = await encrypt(contractAddress, {
      type: dataType,
      value: parseValue(valueA),
    });

    const encB = await encrypt(contractAddress, {
      type: dataType,
      value: parseValue(valueB),
    });

    if (encA && encB) {
      setEncryptedA(encA);
      setEncryptedB(encB);
    }
  };

  /**
   * Perform computation on encrypted values
   */
  const handleCompute = async () => {
    if (!encryptedA || !encryptedB) {
      return;
    }

    switch (operation) {
      case 'add':
        await add(contractAddress, encryptedA, encryptedB);
        break;
      case 'sub':
        await subtract(contractAddress, encryptedA, encryptedB);
        break;
      case 'mul':
        await multiply(contractAddress, encryptedA, encryptedB);
        break;
      case 'gt':
      case 'gte':
      case 'lt':
      case 'lte':
      case 'eq':
      case 'ne':
        await compare(contractAddress, encryptedA, encryptedB, operation);
        break;
    }
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardBody>
          <p className="text-gray-600">Please initialize FHE to use computation features.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Homomorphic Computation</CardTitle>
          <CardDescription>
            Perform operations on encrypted data without decrypting it
          </CardDescription>
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
                <option value="bool">bool</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Value A"
                value={valueA}
                onChange={(e) => setValueA(e.target.value)}
                placeholder="First value"
                fullWidth
              />
              <Input
                label="Value B"
                value={valueB}
                onChange={(e) => setValueB(e.target.value)}
                placeholder="Second value"
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operation
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value as ComputationOperation)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <optgroup label="Arithmetic">
                  <option value="add">Addition (+)</option>
                  <option value="sub">Subtraction (-)</option>
                  <option value="mul">Multiplication (×)</option>
                </optgroup>
                <optgroup label="Comparison">
                  <option value="gt">Greater Than (&gt;)</option>
                  <option value="gte">Greater Than or Equal (≥)</option>
                  <option value="lt">Less Than (&lt;)</option>
                  <option value="lte">Less Than or Equal (≤)</option>
                  <option value="eq">Equal (=)</option>
                  <option value="ne">Not Equal (≠)</option>
                </optgroup>
              </select>
            </div>
          </div>
        </CardBody>
        <CardFooter justify="between">
          <Button
            onClick={handleEncryptValues}
            isLoading={isEncrypting}
            disabled={!valueA || !valueB || !contractAddress}
            variant="outline"
          >
            1. Encrypt Values
          </Button>
          <Button
            onClick={handleCompute}
            isLoading={isComputing}
            disabled={!encryptedA || !encryptedB}
            variant="primary"
          >
            2. Compute
          </Button>
        </CardFooter>
      </Card>

      {/* Encrypted Values Status */}
      {(encryptedA || encryptedB) && (
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Encrypted Values</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {encryptedA && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <span className="font-medium text-blue-900">Value A:</span>
                    <code className="ml-2 text-sm text-blue-700">
                      {encryptedA.handle.substring(0, 10)}...
                    </code>
                  </div>
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {encryptedB && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <span className="font-medium text-green-900">Value B:</span>
                    <code className="ml-2 text-sm text-green-700">
                      {encryptedB.handle.substring(0, 10)}...
                    </code>
                  </div>
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Computation Result */}
      {result && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Computation Result</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div className="p-4 bg-purple-50 rounded-lg">
                <span className="font-medium text-purple-900">Result Handle:</span>
                <code className="ml-2 text-sm bg-purple-100 px-2 py-1 rounded text-purple-700">
                  {result.result.handle}
                </code>
              </div>
              <div className="text-sm text-gray-600">
                <p>The computation was performed on encrypted data. The result is also encrypted and can be decrypted by authorized users.</p>
              </div>
              {result.gasUsed && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Gas Used:</span>
                  <span className="ml-2">{result.gasUsed.toString()}</span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card variant="outlined">
          <CardBody>
            <div className="flex items-start space-x-3 text-red-600">
              <svg className="h-6 w-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Error:</p>
                <p className="text-sm">{error.message}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
