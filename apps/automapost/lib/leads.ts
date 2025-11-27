import { db } from './db'
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
      const lead = await db.lead.create({
        data: {
          name: input.name,
          email: input.email,
          referer: input.referer || null,
          collectionPlace: input.collectionPlace,
        },
      })
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
      const lead = await db.lead.findUnique({
        where: { email },
      })
      return lead
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
      const leads = await db.lead.findMany({
        orderBy: { createdAt: 'desc' },
      })
      return leads
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
      const leads = await db.lead.findMany({
        where: { collectionPlace },
        orderBy: { createdAt: 'desc' },
      })
      return leads
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
      const lead = await db.lead.update({
        where: { id },
        data: updates,
      })
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
      await db.lead.delete({
        where: { id },
      })
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
      const leads = await db.lead.findMany({
        select: {
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      })

      // Group leads by date and calculate counts
      const dateMap = new Map<string, number>()
      
      leads.forEach(lead => {
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
