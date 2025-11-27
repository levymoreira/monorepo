import { db, leads } from './db'
import { eq, desc, asc } from 'drizzle-orm'
import { CreateLeadInput, Lead } from './types'

/**
 * Lead service - handles all database operations for leads
 */
export class LeadService {
  /**
   * Create a new lead
   */
  static async createLead(input: CreateLeadInput): Promise<Lead> {
    try {
      const [lead] = await db.insert(leads).values({
        name: input.name,
        email: input.email,
        referer: input.referer || null,
        collectionPlace: input.collectionPlace,
      }).returning()
      return lead
    } catch (error) {
      console.error('Error creating lead:', error)
      throw new Error('Failed to create lead')
    }
  }

  /**
   * Get a lead by email
   */
  static async getLeadByEmail(email: string): Promise<Lead | null> {
    try {
      const [lead] = await db.select().from(leads).where(eq(leads.email, email))
      return lead || null
    } catch (error) {
      console.error('Error finding lead by email:', error)
      throw new Error('Failed to find lead')
    }
  }

  /**
   * Get all leads
   */
  static async getAllLeads(): Promise<Lead[]> {
    try {
      const result = await db.select().from(leads).orderBy(desc(leads.createdAt))
      return result
    } catch (error) {
      console.error('Error fetching leads:', error)
      throw new Error('Failed to fetch leads')
    }
  }

  /**
   * Get leads by collection place
   */
  static async getLeadsByCollectionPlace(collectionPlace: string): Promise<Lead[]> {
    try {
      const result = await db.select()
        .from(leads)
        .where(eq(leads.collectionPlace, collectionPlace))
        .orderBy(desc(leads.createdAt))
      return result
    } catch (error) {
      console.error('Error fetching leads by collection place:', error)
      throw new Error('Failed to fetch leads')
    }
  }

  /**
   * Update a lead
   */
  static async updateLead(id: string, updates: Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Lead> {
    try {
      const [lead] = await db.update(leads)
        .set(updates)
        .where(eq(leads.id, id))
        .returning()
      return lead
    } catch (error) {
      console.error('Error updating lead:', error)
      throw new Error('Failed to update lead')
    }
  }

  /**
   * Delete a lead
   */
  static async deleteLead(id: string): Promise<void> {
    try {
      await db.delete(leads).where(eq(leads.id, id))
    } catch (error) {
      console.error('Error deleting lead:', error)
      throw new Error('Failed to delete lead')
    }
  }

  /**
   * Get leads count aggregated by date for charts
   */
  static async getLeadsCountOverTime(): Promise<Array<{ date: string; count: number; cumulative: number }>> {
    try {
      // Get all leads ordered by creation date
      const allLeads = await db.select({
        createdAt: leads.createdAt,
      }).from(leads).orderBy(asc(leads.createdAt))

      // Group leads by date and calculate counts
      const dateMap = new Map<string, number>()
      
      allLeads.forEach(lead => {
        const date = lead.createdAt.toISOString().split('T')[0] // Get YYYY-MM-DD format
        dateMap.set(date, (dateMap.get(date) || 0) + 1)
      })

      // Convert to array and add cumulative count
      let cumulative = 0
      const result = Array.from(dateMap.entries())
        .map(([date, count]) => {
          cumulative += count
          return {
            date,
            count,
            cumulative
          }
        })

      return result
    } catch (error) {
      console.error('Error fetching leads count over time:', error)
      throw new Error('Failed to fetch leads analytics')
    }
  }
}
