/**
 * Example Script: Submit Traffic Report using FHEVM SDK
 *
 * This demonstrates how to use the FHEVM Universal SDK in a Node.js environment
 * to encrypt and submit traffic data to the smart contract.
 *
 * Usage:
 *   ts-node scripts/submit-report.ts
 */

import { createFhevmInstance, batchEncrypt, createContract, callContractFunction } from '@fhevm/universal-sdk';
import { JsonRpcProvider, Wallet } from 'ethers';
import { CONTRACT_ABI } from '../lib/abi';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🚀 FHEVM SDK - Traffic Report Submission Example\n');

  // 1. Setup provider and signer
  console.log('📡 Connecting to Sepolia...');
  const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);

  console.log(`✅ Connected with address: ${wallet.address}\n`);

  // 2. Initialize FHEVM SDK
  console.log('🔧 Initializing FHEVM SDK...');
  const contractAddress = process.env.CONTRACT_ADDRESS!;

  const fhevm = await createFhevmInstance({
    network: 'sepolia',
    contractAddress,
    provider,
    signer: wallet,
  });

  console.log('✅ FHEVM SDK initialized\n');

  // 3. Prepare traffic data
  const trafficData = {
    region: 'Downtown',
    congestion: 75,
    vehicles: 150,
    speed: 35,
  };

  console.log('📊 Traffic Data to Submit:');
  console.log(`   Region: ${trafficData.region}`);
  console.log(`   Congestion: ${trafficData.congestion}%`);
  console.log(`   Vehicles: ${trafficData.vehicles}`);
  console.log(`   Speed: ${trafficData.speed} km/h\n`);

  // 4. Encrypt data using SDK
  console.log('🔒 Encrypting traffic data with FHE...');

  const encrypted = await batchEncrypt(fhevm, contractAddress, {
    congestion: { type: 'uint8', value: trafficData.congestion },
    vehicles: { type: 'uint8', value: trafficData.vehicles },
    speed: { type: 'uint16', value: trafficData.speed },
  });

  console.log('✅ Data encrypted successfully');
  console.log(`   Handles: ${encrypted.handles.length}\n`);

  // 5. Create contract instance
  console.log('📝 Creating contract instance...');
  const contract = createContract(fhevm, contractAddress, CONTRACT_ABI);
  console.log('✅ Contract instance created\n');

  // 6. Submit encrypted report
  console.log('📤 Submitting encrypted report to blockchain...');

  const tx = await callContractFunction(
    contract,
    'submitTrafficReport',
    [
      trafficData.region,
      trafficData.congestion,
      trafficData.vehicles,
      trafficData.speed,
    ],
    { gasLimit: 500000n }
  );

  console.log(`   Transaction hash: ${tx.hash}`);
  console.log('   Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log(`✅ Report submitted successfully!`);
  console.log(`   Block: ${receipt.blockNumber}`);
  console.log(`   Gas used: ${receipt.gasUsed.toString()}\n`);

  // 7. Verify submission
  console.log('🔍 Verifying submission...');
  const isAuthorized = await contract.isReporterAuthorized(wallet.address);
  console.log(`   Reporter authorized: ${isAuthorized}`);

  const cycleInfo = await contract.getCurrentCycleInfo();
  console.log(`   Current cycle: ${cycleInfo[0]}`);
  console.log(`   Time remaining: ${cycleInfo[1]} seconds\n`);

  console.log('✨ Example completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
