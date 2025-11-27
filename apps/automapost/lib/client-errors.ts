import { db } from './db'
import { CreateClientErrorInput, ClientError, ErrorType, ErrorSeverity } from './types'

/**
 * Client Error service - handles all database operations for client-side error tracking
 */
export class ClientErrorService {
  /**
   * Create a new client error record
   */
  static async createError(input: CreateClientErrorInput): Promise<ClientError> {
    try {
      const error = await db.clientError.create({
        data: {
          error: input.error,
          errorType: input.errorType || 'javascript',
          severity: input.severity || 'error',
          url: input.url,
          userAgent: input.userAgent,
          userId: input.userId,
          sessionId: input.sessionId,
          metadata: input.metadata || null,
        },
      })
      return error
    } catch (error) {
      console.error('Error creating client error:', error)
      throw new Error('Failed to create client error')
    }
  }

  /**
   * Get all client errors with pagination
   */
  static async getAllErrors(options?: {
    limit?: number
    offset?: number
    errorType?: string
    severity?: string
  }): Promise<ClientError[]> {
    try {
      const { limit = 50, offset = 0, errorType, severity } = options || {}
      
      const errors = await db.clientError.findMany({
        where: {
          ...(errorType && { errorType }),
          ...(severity && { severity }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            }
          }
        }
      })
      return errors
    } catch (error) {
      console.error('Error fetching client errors:', error)
      throw new Error('Failed to fetch client errors')
    }
  }

  /**
   * Get errors by user ID
   */
  static async getErrorsByUserId(userId: string): Promise<ClientError[]> {
    try {
      const errors = await db.clientError.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20, // Limit to recent errors
      })
      return errors
    } catch (error) {
      console.error('Error fetching user client errors:', error)
      throw new Error('Failed to fetch user client errors')
    }
  }

  /**
   * Get error statistics
   */
  static async getErrorStats(): Promise<{
    total: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
    last24Hours: number
  }> {
    try {
      const [
        total,
        byType,
        bySeverity,
        last24Hours
      ] = await Promise.all([
        // Total count
        db.clientError.count(),
        
        // Group by error type
        db.clientError.groupBy({
          by: ['errorType'],
          _count: {
            id: true
          }
        }),
        
        // Group by severity
        db.clientError.groupBy({
          by: ['severity'],
          _count: {
            id: true
          }
        }),
        
        // Last 24 hours count
        db.clientError.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        })
      ])

      return {
        total,
        byType: byType.reduce((acc, item) => {
          acc[item.errorType] = item._count.id
          return acc
        }, {} as Record<string, number>),
        bySeverity: bySeverity.reduce((acc, item) => {
          acc[item.severity] = item._count.id
          return acc
        }, {} as Record<string, number>),
        last24Hours
      }
    } catch (error) {
      console.error('Error fetching client error stats:', error)
      throw new Error('Failed to fetch client error stats')
    }
  }

  /**
   * Delete old errors (cleanup)
   */
  static async cleanupOldErrors(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
      
      const result = await db.clientError.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      })
      
      return result.count
    } catch (error) {
      console.error('Error cleaning up old client errors:', error)
      throw new Error('Failed to cleanup old client errors')
    }
  }

  /**
   * Check for duplicate errors (same error + url within time window)
   */
  static async isDuplicateError(input: CreateClientErrorInput, windowMinutes: number = 5): Promise<boolean> {
    try {
      const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)
      
      const existingError = await db.clientError.findFirst({
        where: {
          error: input.error,
          url: input.url,
          errorType: input.errorType,
          createdAt: {
            gte: windowStart
          }
        }
      })
      
      return !!existingError
    } catch (error) {
      console.error('Error checking duplicate client error:', error)
      return false // If check fails, allow the error to be saved
    }
  }
}