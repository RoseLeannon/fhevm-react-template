// Encryption API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { serverEncryptValue, serverEncryptValues } from '@/lib/fhe/server';
import { validateEncryptionInput, validateFHEValue } from '@/lib/utils/validation';
import { checkRateLimit, sanitizeErrorMessage, validateDataSize } from '@/lib/utils/security';
import type { FHEValue } from '@/lib/fhe/types';

/**
 * POST handler - Encrypt value(s)
 */
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(clientIp, { maxRequests: 50, windowMs: 60000 });

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

    const { contractAddress, value, values } = body;

    // Single value encryption
    if (value) {
      // Validate input
      const valueValidation = validateFHEValue(value as FHEValue);
      if (!valueValidation.isValid) {
        return NextResponse.json(
          { error: 'Invalid value', details: valueValidation.errors },
          { status: 400 }
        );
      }

      // Encrypt value
      const encrypted = await serverEncryptValue(contractAddress, value as FHEValue);

      return NextResponse.json({
        success: true,
        encrypted: {
          handle: encrypted.handle,
          type: encrypted.type,
          dataLength: encrypted.data.length,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Multiple values encryption
    if (values) {
      // Validate input
      const inputValidation = validateEncryptionInput({
        contractAddress,
        values: values as Record<string, FHEValue>,
      });
      if (!inputValidation.isValid) {
        return NextResponse.json(
          { error: 'Invalid input', details: inputValidation.errors },
          { status: 400 }
        );
      }

      // Encrypt values
      const encrypted = await serverEncryptValues(
        contractAddress,
        values as Record<string, FHEValue>
      );

      return NextResponse.json({
        success: true,
        encrypted: {
          handles: encrypted.handles,
          dataLength: encrypted.data.length,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Either value or values must be provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Encryption error:', error);
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
