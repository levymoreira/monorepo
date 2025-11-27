import { NextRequest, NextResponse } from 'next/server'
import { LeadService } from '@/lib/leads'
import { CreateLeadInput, CollectionPlace } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.collectionPlace) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, collectionPlace' },
        { status: 400 }
      )
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if lead already exists
    const existingLead = await LeadService.getLeadByEmail(body.email)
    if (existingLead) {
      return NextResponse.json(
        { error: 'Lead with this email already exists' },
        { status: 409 }
      )
    }

    // Create the lead
    const leadInput: CreateLeadInput = {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      referer: body.referer || null,
      collectionPlace: body.collectionPlace,
    }

    const lead = await LeadService.createLead(leadInput)

    return NextResponse.json(
      { 
        message: 'Lead created successfully',
        lead: {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          collectionPlace: lead.collectionPlace,
          createdAt: lead.createdAt
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API Error creating lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collectionPlace = searchParams.get('collectionPlace')

    let leads
    if (collectionPlace) {
      leads = await LeadService.getLeadsByCollectionPlace(collectionPlace)
    } else {
      leads = await LeadService.getAllLeads()
    }

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('API Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
