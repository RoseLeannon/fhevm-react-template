// Decryption API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { serverDecryptValue } from '@/lib/fhe/server';
import { validateDecryptionInput } from '@/lib/utils/validation';
import { checkRateLimit, sanitizeErrorMessage, validateDataSize } from '@/lib/utils/security';
import type { DecryptionInput } from '@/lib/fhe/types';

/**
 * POST handler - Decrypt value
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
    if (!validateDataSize(body, 1024 * 50)) { // 50KB limit
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413 }
      );
    }

    const { contractAddress, handle, userAddress } = body;

    // Validate input
    const validation = validateDecryptionInput({
      contractAddress,
      handle,
      userAddress,
    } as DecryptionInput);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      );
    }

    // Decrypt value
    const decrypted = await serverDecryptValue({
      contractAddress,
      handle,
      userAddress,
    } as DecryptionInput);

    return NextResponse.json({
      success: true,
      decrypted: {
        value: decrypted.value.toString(),
        type: decrypted.type,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Decryption error:', error);
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
