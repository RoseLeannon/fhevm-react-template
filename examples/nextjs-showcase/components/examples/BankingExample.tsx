// Banking use case example demonstrating FHE for financial data
'use client';

import React, { useState } from 'react';
import { useEncryption } from '@/hooks/useEncryption';
import { useComputation } from '@/hooks/useComputation';
import { useFHEContext } from '@/components/fhe/FHEProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardBody, CardFooter, CardDescription } from '@/components/ui/Card';
import type { EncryptedValue } from '@/lib/fhe/types';

/**
 * Banking Example Component
 * Demonstrates private financial transactions using FHE
 */
export const BankingExample: React.FC = () => {
  const { config, isInitialized } = useFHEContext();
  const { encrypt, isEncrypting } = useEncryption();
  const { add, subtract, compare, isComputing, result } = useComputation();

  const [contractAddress] = useState(
    config.contractAddress || '0x0000000000000000000000000000000000000000'
  );

  // Account balances (encrypted)
  const [encryptedBalance, setEncryptedBalance] = useState<EncryptedValue | null>(null);
  const [encryptedTransactionAmount, setEncryptedTransactionAmount] = useState<EncryptedValue | null>(null);
  const [encryptedMinimumBalance, setEncryptedMinimumBalance] = useState<EncryptedValue | null>(null);

  // Input values
  const [initialBalance, setInitialBalance] = useState('10000');
  const [transactionAmount, setTransactionAmount] = useState('500');
  const [minimumBalance, setMinimumBalance] = useState('1000');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');

  // Transaction history
  const [transactions, setTransactions] = useState<Array<{
    type: string;
    amount: string;
    timestamp: number;
    status: string;
  }>>([]);

  /**
   * Initialize account with encrypted balance
   */
  const handleInitializeAccount = async () => {
    const balance = await encrypt(contractAddress, {
      type: 'uint64',
      value: BigInt(initialBalance),
    });

    const minBalance = await encrypt(contractAddress, {
      type: 'uint64',
      value: BigInt(minimumBalance),
    });

    if (balance && minBalance) {
      setEncryptedBalance(balance);
      setEncryptedMinimumBalance(minBalance);
      setTransactions([{
        type: 'Account Opened',
        amount: initialBalance,
        timestamp: Date.now(),
        status: 'success',
      }]);
    }
  };

  /**
   * Process encrypted transaction
   */
  const handleTransaction = async () => {
    if (!encryptedBalance) {
      alert('Please initialize account first');
      return;
    }

    // Encrypt transaction amount
    const amount = await encrypt(contractAddress, {
      type: 'uint64',
      value: BigInt(transactionAmount),
    });

    if (!amount) return;
    setEncryptedTransactionAmount(amount);

    let newBalance: EncryptedValue | null = null;

    // Perform encrypted computation based on transaction type
    if (transactionType === 'deposit') {
      const computeResult = await add(contractAddress, encryptedBalance, amount);
      if (computeResult) {
        newBalance = computeResult.result;
      }
    } else {
      // For withdrawal, first check if balance is sufficient
      const comparisonResult = await compare(
        contractAddress,
        encryptedBalance,
        amount,
        'gte'
      );

      if (comparisonResult) {
        // Subtract from balance (encrypted operation)
        const computeResult = await subtract(contractAddress, encryptedBalance, amount);
        if (computeResult) {
          newBalance = computeResult.result;
        }
      }
    }

    if (newBalance) {
      setEncryptedBalance(newBalance);
      setTransactions(prev => [...prev, {
        type: transactionType === 'deposit' ? 'Deposit' : 'Withdrawal',
        amount: transactionAmount,
        timestamp: Date.now(),
        status: 'success',
      }]);
    } else {
      setTransactions(prev => [...prev, {
        type: transactionType === 'deposit' ? 'Deposit' : 'Withdrawal',
        amount: transactionAmount,
        timestamp: Date.now(),
        status: 'failed',
      }]);
    }
  };

  /**
   * Check if balance meets minimum requirement
   */
  const handleCheckMinimumBalance = async () => {
    if (!encryptedBalance || !encryptedMinimumBalance) {
      alert('Please initialize account first');
      return;
    }

    await compare(contractAddress, encryptedBalance, encryptedMinimumBalance, 'gte');
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardBody>
          <p className="text-gray-600">Please initialize FHE to use banking features.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Private Banking Example</CardTitle>
          <CardDescription>
            Demonstrates confidential financial transactions using Fully Homomorphic Encryption
          </CardDescription>
        </CardHeader>
        <CardBody>
          <div className="flex items-start space-x-3 text-sm text-gray-600">
            <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium mb-1">Key Features:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Account balances remain encrypted at all times</li>
                <li>Transactions computed on encrypted data</li>
                <li>Balance checks without revealing amounts</li>
                <li>Complete privacy for sensitive financial information</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Account Initialization */}
      {!encryptedBalance && (
        <Card>
          <CardHeader>
            <CardTitle>Initialize Account</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Initial Balance"
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="Enter initial balance"
                fullWidth
              />
              <Input
                label="Minimum Balance Requirement"
                type="number"
                value={minimumBalance}
                onChange={(e) => setMinimumBalance(e.target.value)}
                placeholder="Enter minimum balance"
                fullWidth
              />
            </div>
          </CardBody>
          <CardFooter>
            <Button
              onClick={handleInitializeAccount}
              isLoading={isEncrypting}
              variant="primary"
            >
              Open Account
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Account Status */}
      {encryptedBalance && (
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-700 font-medium">Current Balance</p>
                  <p className="text-xs text-green-600 mt-1">Encrypted and Private</p>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-mono text-green-700">***</span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <p>Balance Handle: <code className="bg-gray-100 px-2 py-1 rounded">{encryptedBalance.handle.substring(0, 20)}...</code></p>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <Button
              onClick={handleCheckMinimumBalance}
              isLoading={isComputing}
              variant="outline"
              size="sm"
            >
              Check Minimum Balance
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Transaction Form */}
      {encryptedBalance && (
        <Card>
          <CardHeader>
            <CardTitle>New Transaction</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTransactionType('deposit')}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      transactionType === 'deposit'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setTransactionType('withdrawal')}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      transactionType === 'withdrawal'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Withdrawal
                  </button>
                </div>
              </div>

              <Input
                label="Amount"
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder="Enter amount"
                fullWidth
              />
            </div>
          </CardBody>
          <CardFooter>
            <Button
              onClick={handleTransaction}
              isLoading={isEncrypting || isComputing}
              variant={transactionType === 'deposit' ? 'primary' : 'secondary'}
            >
              Process {transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Transaction History */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {transactions.slice().reverse().map((tx, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    tx.status === 'success' ? 'bg-gray-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      tx.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{tx.type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-medium ${
                      tx.type === 'Deposit' ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {tx.type === 'Deposit' ? '+' : tx.type === 'Withdrawal' ? '-' : ''}{tx.amount}
                    </p>
                    <p className="text-xs text-gray-500">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Computation Result */}
      {result && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Last Operation Result</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Operation completed successfully. New encrypted balance has been stored.
              </p>
              <code className="block mt-2 text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                Result Handle: {result.result.handle.substring(0, 30)}...
              </code>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
