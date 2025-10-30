// FHE operations API route
import { NextRequest, NextResponse } from 'next/server';
import {
  initializeServerFHEVM,
  isServerFHEVMInitialized,
  getServerFHEVMInstance,
} from '@/lib/fhe/server';
import { checkRateLimit, sanitizeErrorMessage } from '@/lib/utils/security';

/**
 * GET handler - Check FHE initialization status
 */
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(clientIp, { maxRequests: 100, windowMs: 60000 });

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

    const isInitialized = isServerFHEVMInitialized();

    return NextResponse.json({
      isInitialized,
      message: isInitialized
        ? 'FHE instance is initialized'
        : 'FHE instance not initialized',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('FHE status check error:', error);
    return NextResponse.json(
      { error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Initialize FHE instance
 */
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(clientIp, { maxRequests: 10, windowMs: 60000 });

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

    // Parse request body
    const body = await request.json();
    const { network, contractAddress, providerUrl } = body;

    // Validate network
    const validNetworks = ['sepolia', 'mainnet', 'localhost'];
    if (!network || !validNetworks.includes(network)) {
      return NextResponse.json(
        { error: 'Invalid network. Must be one of: sepolia, mainnet, localhost' },
        { status: 400 }
      );
    }

    // Initialize FHE instance
    await initializeServerFHEVM({
      network,
      contractAddress,
      providerUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'FHE instance initialized successfully',
      config: {
        network,
        contractAddress: contractAddress || 'default',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('FHE initialization error:', error);
    return NextResponse.json(
      { error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - Reset FHE instance
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check rate limit
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(clientIp, { maxRequests: 10, windowMs: 60000 });

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

    const { resetServerFHEVM } = await import('@/lib/fhe/server');
    resetServerFHEVM();

    return NextResponse.json({
      success: true,
      message: 'FHE instance reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('FHE reset error:', error);
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
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
