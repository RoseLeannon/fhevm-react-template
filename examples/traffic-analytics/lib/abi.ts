/**
 * PrivateTrafficAggregator Contract ABI
 */
export const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'cycle', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'totalReports', type: 'uint256' },
    ],
    name: 'CycleFinalized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'string', name: 'region', type: 'string' },
    ],
    name: 'RegionRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'reporter', type: 'address' },
    ],
    name: 'ReporterAuthorized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'reporter', type: 'address' },
    ],
    name: 'ReporterRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'reporter', type: 'address' },
      { indexed: false, internalType: 'string', name: 'region', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'cycle', type: 'uint256' },
    ],
    name: 'ReportSubmitted',
    type: 'event',
  },
  {
    inputs: [],
    name: 'admin',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'reporter', type: 'address' }],
    name: 'authorizeReporter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentReportCycle',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cycleInterval',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentCycleInfo',
    outputs: [
      { internalType: 'uint256', name: 'cycle', type: 'uint256' },
      { internalType: 'uint256', name: 'timeRemaining', type: 'uint256' },
      { internalType: 'uint256', name: 'totalRegions', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRegisteredRegions',
    outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'reporter', type: 'address' }],
    name: 'isReporterAuthorized',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'regionName', type: 'string' }],
    name: 'registerRegion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'reporter', type: 'address' }],
    name: 'revokeReporter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'region', type: 'string' },
      { internalType: 'uint8', name: 'congestionLevel', type: 'uint8' },
      { internalType: 'uint8', name: 'vehicleCount', type: 'uint8' },
      { internalType: 'uint16', name: 'averageSpeed', type: 'uint16' },
    ],
    name: 'submitTrafficReport',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
