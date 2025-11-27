import { db, clientErrors, users } from './db'
import { eq, desc, gte, lt, count, sql } from 'drizzle-orm'
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
      const [error] = await db.insert(clientErrors).values({
        error: input.error,
        errorType: input.errorType || 'javascript',
        severity: input.severity || 'error',
        url: input.url,
        userAgent: input.userAgent,
        userId: input.userId,
        sessionId: input.sessionId,
        metadata: input.metadata || null,
      }).returning()
      return error as ClientError
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
      
      const conditions: any[] = []
      if (errorType) conditions.push(eq(clientErrors.errorType, errorType))
      if (severity) conditions.push(eq(clientErrors.severity, severity))
      
      const query = db.select({
        id: clientErrors.id,
        error: clientErrors.error,
        errorType: clientErrors.errorType,
        severity: clientErrors.severity,
        url: clientErrors.url,
        userAgent: clientErrors.userAgent,
        userId: clientErrors.userId,
        sessionId: clientErrors.sessionId,
        metadata: clientErrors.metadata,
        createdAt: clientErrors.createdAt,
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
        }
      })
      .from(clientErrors)
      .leftJoin(users, eq(clientErrors.userId, users.id))
      .orderBy(desc(clientErrors.createdAt))
      .limit(limit)
      .offset(offset)
      
      if (conditions.length > 0) {
        const errors = await query.where(sql`${conditions.map(c => c).join(' AND ')}`)
        return errors as ClientError[]
      }
      
      const errors = await query
      return errors as ClientError[]
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
      const errors = await db.select()
        .from(clientErrors)
        .where(eq(clientErrors.userId, userId))
        .orderBy(desc(clientErrors.createdAt))
        .limit(20)
      return errors as ClientError[]
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
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      const [
        totalResult,
        byTypeResult,
        bySeverityResult,
        last24HoursResult
      ] = await Promise.all([
        // Total count
        db.select({ count: count() }).from(clientErrors),
        
        // Group by error type
        db.select({
          errorType: clientErrors.errorType,
          count: count()
        })
        .from(clientErrors)
        .groupBy(clientErrors.errorType),
        
        // Group by severity
        db.select({
          severity: clientErrors.severity,
          count: count()
        })
        .from(clientErrors)
        .groupBy(clientErrors.severity),
        
        // Last 24 hours count
        db.select({ count: count() })
        .from(clientErrors)
        .where(gte(clientErrors.createdAt, yesterday))
      ])

      return {
        total: totalResult[0]?.count || 0,
        byType: byTypeResult.reduce((acc, item) => {
          acc[item.errorType] = item.count
          return acc
        }, {} as Record<string, number>),
        bySeverity: bySeverityResult.reduce((acc, item) => {
          acc[item.severity] = item.count
          return acc
        }, {} as Record<string, number>),
        last24Hours: last24HoursResult[0]?.count || 0
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
      
      const result = await db.delete(clientErrors)
        .where(lt(clientErrors.createdAt, cutoffDate))
        .returning({ id: clientErrors.id })
      
      return result.length
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
      
      const conditions = [
        eq(clientErrors.error, input.error),
        gte(clientErrors.createdAt, windowStart)
      ]
      
      if (input.url) {
        conditions.push(eq(clientErrors.url, input.url))
      }
      if (input.errorType) {
        conditions.push(eq(clientErrors.errorType, input.errorType))
      }
      
      const [existingError] = await db.select({ id: clientErrors.id })
        .from(clientErrors)
        .where(sql`${conditions[0]} AND ${conditions[1]}${input.url ? sql` AND ${conditions[2]}` : sql``}${input.errorType ? sql` AND ${conditions[3] || conditions[2]}` : sql``}`)
        .limit(1)
      
      return !!existingError
    } catch (error) {
      console.error('Error checking duplicate client error:', error)
      return false // If check fails, allow the error to be saved
    }
  }
}