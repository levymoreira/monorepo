import { NextRequest, NextResponse } from 'next/server'
import { ClientErrorService } from '@/lib/client-errors'
import { CreateClientErrorInput, ErrorType, ErrorSeverity } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.error) {
      return NextResponse.json(
        { error: 'Missing required field: error' },
        { status: 400 }
      )
    }

    // Rate limiting: Check for duplicate errors in the last 5 minutes
    const isDuplicate = await ClientErrorService.isDuplicateError(body, 5)
    if (isDuplicate) {
      return NextResponse.json(
        { message: 'Duplicate error ignored' },
        { status: 200 } // Return success but don't create duplicate
      )
    }

    // Validate error type if provided
    if (body.errorType && !Object.values(ErrorType).includes(body.errorType)) {
      body.errorType = ErrorType.JAVASCRIPT // Default to javascript
    }

    // Validate severity if provided
    if (body.severity && !Object.values(ErrorSeverity).includes(body.severity)) {
      body.severity = ErrorSeverity.ERROR // Default to error
    }

    // Extract useful information from request headers
    const userAgent = request.headers.get('user-agent') || undefined
    const referer = request.headers.get('referer') || undefined

    // Create the client error
    const errorInput: CreateClientErrorInput = {
      error: body.error,
      errorType: body.errorType || ErrorType.JAVASCRIPT,
      severity: body.severity || ErrorSeverity.ERROR,
      url: body.url || referer || undefined,
      userAgent: body.userAgent || userAgent || undefined,
      userId: body.userId || undefined,
      sessionId: body.sessionId || undefined,
      metadata: body.metadata || undefined,
    }

    const clientError = await ClientErrorService.createError(errorInput)

    return NextResponse.json(
      { 
        message: 'Error logged successfully',
        id: clientError.id,
        createdAt: clientError.createdAt
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API Error logging client error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Only allow in development or for authorized users
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Not available in production' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const errorType = searchParams.get('errorType') || undefined
    const severity = searchParams.get('severity') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const errors = await ClientErrorService.getAllErrors({
      limit,
      offset,
      errorType,
      severity
    })

    const stats = await ClientErrorService.getErrorStats()

    return NextResponse.json({ 
      errors,
      stats,
      pagination: {
        limit,
        offset,
        total: stats.total
      }
    })
  } catch (error) {
    console.error('API Error fetching client errors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}