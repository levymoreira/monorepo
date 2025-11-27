import { NextResponse } from 'next/server'
import { LeadService } from '@/lib/leads'

export async function GET() {
  try {
    const leadsOverTime = await LeadService.getLeadsCountOverTime()
    
    return NextResponse.json({ 
      data: leadsOverTime,
      total: leadsOverTime.length > 0 ? leadsOverTime[leadsOverTime.length - 1].cumulative : 0
    })
  } catch (error) {
    console.error('API Error fetching public leads data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
