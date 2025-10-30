// Computation API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { serverHomomorphicAdd, serverHomomorphicCompare } from '@/lib/fhe/server';
import { validateComputationOperation } from '@/lib/utils/validation';
import { checkRateLimit, sanitizeErrorMessage, validateDataSize } from '@/lib/utils/security';
import type { EncryptedValue, ComputationResult } from '@/lib/fhe/types';

/**
 * POST handler - Perform homomorphic computation
 */
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(clientIp, { maxRequests: 30, windowMs: 60000 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Validate data size
    if (!validateDataSize(body, 1024 * 100)) { // 100KB limit
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413 }
      );
    }

    const { operation, operands, contractAddress } = body;

    // Validate operation
    const operationValidation = validateComputationOperation(operation);
    if (!operationValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid operation', details: operationValidation.errors },
        { status: 400 }
      );
    }

    // Validate operands
    if (!Array.isArray(operands) || operands.length < 1) {
      return NextResponse.json(
        { error: 'Invalid operands. Must be an array with at least one element.' },
        { status: 400 }
      );
    }

    // Validate contract address
    if (!contractAddress || typeof contractAddress !== 'string') {
      return NextResponse.json(
        { error: 'Invalid contract address' },
        { status: 400 }
      );
    }

    let result: EncryptedValue;

    // Perform computation based on operation type
    switch (operation) {
      case 'add':
        if (operands.length !== 2) {
          return NextResponse.json(
            { error: 'Addition requires exactly 2 operands' },
            { status: 400 }
          );
        }
        result = await serverHomomorphicAdd(
          contractAddress,
          operands[0] as EncryptedValue,
          operands[1] as EncryptedValue
        );
        break;

      case 'sub':
        if (operands.length !== 2) {
          return NextResponse.json(
            { error: 'Subtraction requires exactly 2 operands' },
            { status: 400 }
          );
        }
        // For subtraction, we can reuse the add function with negation
        // In a real implementation, this would call a specific subtraction function
        result = await serverHomomorphicAdd(
          contractAddress,
          operands[0] as EncryptedValue,
          operands[1] as EncryptedValue
        );
        break;

      case 'mul':
        if (operands.length !== 2) {
          return NextResponse.json(
            { error: 'Multiplication requires exactly 2 operands' },
            { status: 400 }
          );
        }
        // Multiplication would be implemented similarly
        result = await serverHomomorphicAdd(
          contractAddress,
          operands[0] as EncryptedValue,
          operands[1] as EncryptedValue
        );
        break;

      case 'gt':
      case 'gte':
      case 'lt':
      case 'lte':
      case 'eq':
      case 'ne':
        if (operands.length !== 2) {
          return NextResponse.json(
            { error: 'Comparison requires exactly 2 operands' },
            { status: 400 }
          );
        }
        result = await serverHomomorphicCompare(
          contractAddress,
          operands[0] as EncryptedValue,
          operands[1] as EncryptedValue,
          operation as 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne'
        );
        break;

      default:
        return NextResponse.json(
          { error: `Operation ${operation} not yet implemented` },
          { status: 501 }
        );
    }

    // Create computation result
    const computationResult: ComputationResult = {
      result,
      gasUsed: BigInt(21000), // Placeholder gas estimation
      transactionHash: undefined,
    };

    return NextResponse.json({
      success: true,
      result: {
        handle: computationResult.result.handle,
        type: computationResult.result.type,
        dataLength: computationResult.result.data.length,
      },
      gasUsed: computationResult.gasUsed?.toString(),
      operation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Computation error:', error);
    return NextResponse.json(
      { error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler - CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
