// Medical records use case example demonstrating FHE for healthcare data
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
 * Medical record interface
 */
interface MedicalRecord {
  id: string;
  type: string;
  encryptedValue: EncryptedValue;
  timestamp: number;
  authorized: boolean;
}

/**
 * Medical Example Component
 * Demonstrates private health data management using FHE
 */
export const MedicalExample: React.FC = () => {
  const { config, isInitialized } = useFHEContext();
  const { encrypt, isEncrypting, encryptMultiple } = useEncryption();
  const { compare, isComputing, result } = useComputation();

  const [contractAddress] = useState(
    config.contractAddress || '0x0000000000000000000000000000000000000000'
  );

  // Medical records
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  // Input fields
  const [patientAge, setPatientAge] = useState('');
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [temperature, setTemperature] = useState('');

  // Threshold values for alerts
  const [highBPThreshold] = useState('140');
  const [highHeartRateThreshold] = useState('100');

  /**
   * Encrypt and store patient vitals
   */
  const handleStoreVitals = async () => {
    const vitals = [];

    if (patientAge) {
      const encrypted = await encrypt(contractAddress, {
        type: 'uint8',
        value: Number(patientAge),
      });
      if (encrypted) {
        vitals.push({
          id: `age-${Date.now()}`,
          type: 'Age',
          encryptedValue: encrypted,
          timestamp: Date.now(),
          authorized: true,
        });
      }
    }

    if (bloodPressureSystolic) {
      const encrypted = await encrypt(contractAddress, {
        type: 'uint8',
        value: Number(bloodPressureSystolic),
      });
      if (encrypted) {
        vitals.push({
          id: `bp-sys-${Date.now()}`,
          type: 'Blood Pressure (Systolic)',
          encryptedValue: encrypted,
          timestamp: Date.now(),
          authorized: true,
        });
      }
    }

    if (bloodPressureDiastolic) {
      const encrypted = await encrypt(contractAddress, {
        type: 'uint8',
        value: Number(bloodPressureDiastolic),
      });
      if (encrypted) {
        vitals.push({
          id: `bp-dia-${Date.now()}`,
          type: 'Blood Pressure (Diastolic)',
          encryptedValue: encrypted,
          timestamp: Date.now(),
          authorized: true,
        });
      }
    }

    if (heartRate) {
      const encrypted = await encrypt(contractAddress, {
        type: 'uint8',
        value: Number(heartRate),
      });
      if (encrypted) {
        vitals.push({
          id: `hr-${Date.now()}`,
          type: 'Heart Rate',
          encryptedValue: encrypted,
          timestamp: Date.now(),
          authorized: true,
        });
      }
    }

    if (bloodSugar) {
      const encrypted = await encrypt(contractAddress, {
        type: 'uint16',
        value: Number(bloodSugar),
      });
      if (encrypted) {
        vitals.push({
          id: `bs-${Date.now()}`,
          type: 'Blood Sugar',
          encryptedValue: encrypted,
          timestamp: Date.now(),
          authorized: true,
        });
      }
    }

    if (temperature) {
      const encrypted = await encrypt(contractAddress, {
        type: 'uint8',
        value: Math.round(Number(temperature) * 10), // Store as integer (e.g., 98.6 -> 986)
      });
      if (encrypted) {
        vitals.push({
          id: `temp-${Date.now()}`,
          type: 'Temperature',
          encryptedValue: encrypted,
          timestamp: Date.now(),
          authorized: true,
        });
      }
    }

    setRecords(prev => [...prev, ...vitals]);

    // Clear inputs
    setPatientAge('');
    setBloodPressureSystolic('');
    setBloodPressureDiastolic('');
    setHeartRate('');
    setBloodSugar('');
    setTemperature('');
  };

  /**
   * Check if blood pressure exceeds threshold (encrypted comparison)
   */
  const handleCheckBloodPressure = async () => {
    const bpRecord = records.find(r => r.type === 'Blood Pressure (Systolic)');
    if (!bpRecord) {
      alert('No blood pressure record found');
      return;
    }

    const threshold = await encrypt(contractAddress, {
      type: 'uint8',
      value: Number(highBPThreshold),
    });

    if (threshold) {
      await compare(contractAddress, bpRecord.encryptedValue, threshold, 'gt');
    }
  };

  /**
   * Check if heart rate exceeds threshold
   */
  const handleCheckHeartRate = async () => {
    const hrRecord = records.find(r => r.type === 'Heart Rate');
    if (!hrRecord) {
      alert('No heart rate record found');
      return;
    }

    const threshold = await encrypt(contractAddress, {
      type: 'uint8',
      value: Number(highHeartRateThreshold),
    });

    if (threshold) {
      await compare(contractAddress, hrRecord.encryptedValue, threshold, 'gt');
    }
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardBody>
          <p className="text-gray-600">Please initialize FHE to use medical features.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Private Medical Records Example</CardTitle>
          <CardDescription>
            Demonstrates confidential health data management using Fully Homomorphic Encryption
          </CardDescription>
        </CardHeader>
        <CardBody>
          <div className="flex items-start space-x-3 text-sm text-gray-600">
            <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium mb-1">Privacy Features:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Patient data encrypted at rest and in transit</li>
                <li>Threshold checks without revealing actual values</li>
                <li>HIPAA-compliant data handling</li>
                <li>Selective access control for authorized personnel</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Vital Signs Input */}
      <Card>
        <CardHeader>
          <CardTitle>Record Patient Vitals</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Age (years)"
              type="number"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder="e.g., 45"
              fullWidth
            />
            <Input
              label="Heart Rate (bpm)"
              type="number"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              placeholder="e.g., 72"
              fullWidth
            />
            <Input
              label="BP Systolic (mmHg)"
              type="number"
              value={bloodPressureSystolic}
              onChange={(e) => setBloodPressureSystolic(e.target.value)}
              placeholder="e.g., 120"
              fullWidth
            />
            <Input
              label="BP Diastolic (mmHg)"
              type="number"
              value={bloodPressureDiastolic}
              onChange={(e) => setBloodPressureDiastolic(e.target.value)}
              placeholder="e.g., 80"
              fullWidth
            />
            <Input
              label="Blood Sugar (mg/dL)"
              type="number"
              value={bloodSugar}
              onChange={(e) => setBloodSugar(e.target.value)}
              placeholder="e.g., 100"
              fullWidth
            />
            <Input
              label="Temperature (°F)"
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="e.g., 98.6"
              step="0.1"
              fullWidth
            />
          </div>
        </CardBody>
        <CardFooter>
          <Button
            onClick={handleStoreVitals}
            isLoading={isEncrypting}
            variant="primary"
            disabled={!patientAge && !bloodPressureSystolic && !heartRate && !bloodSugar && !temperature}
          >
            Encrypt and Store Vitals
          </Button>
        </CardFooter>
      </Card>

      {/* Medical Records */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Encrypted Medical Records</CardTitle>
            <CardDescription>
              {records.length} record{records.length !== 1 ? 's' : ''} stored securely
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">{record.type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {record.encryptedValue.handle.substring(0, 12)}...
                    </code>
                    <p className="text-xs text-green-600 mt-1">Encrypted</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Health Checks */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Encrypted Health Checks</CardTitle>
            <CardDescription>
              Perform threshold checks without revealing actual values
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Blood Pressure Check</h4>
                  <span className="text-xs text-gray-500">Threshold: {highBPThreshold} mmHg</span>
                </div>
                <Button
                  onClick={handleCheckBloodPressure}
                  isLoading={isComputing}
                  variant="outline"
                  size="sm"
                  fullWidth
                  disabled={!records.find(r => r.type === 'Blood Pressure (Systolic)')}
                >
                  Check if BP is High
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Heart Rate Check</h4>
                  <span className="text-xs text-gray-500">Threshold: {highHeartRateThreshold} bpm</span>
                </div>
                <Button
                  onClick={handleCheckHeartRate}
                  isLoading={isComputing}
                  variant="outline"
                  size="sm"
                  fullWidth
                  disabled={!records.find(r => r.type === 'Heart Rate')}
                >
                  Check if HR is High
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Check Result */}
      {result && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Health Check Result</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 mb-2">
                Encrypted comparison completed successfully.
              </p>
              <p className="text-xs text-blue-600">
                The result is encrypted and can only be decrypted by authorized medical personnel.
              </p>
              <code className="block mt-3 text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                Result Handle: {result.result.handle.substring(0, 30)}...
              </code>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Info Card */}
      <Card variant="outlined">
        <CardBody>
          <div className="flex items-start space-x-3">
            <svg className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Use Case Benefits:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Protects patient privacy while enabling analytics</li>
                <li>Enables secure data sharing between healthcare providers</li>
                <li>Maintains compliance with healthcare regulations</li>
                <li>Allows risk assessment without exposing sensitive data</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
