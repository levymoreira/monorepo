const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')
const path = require('path')

// Load production environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.production') })

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function deleteLevyUser() {
  const email = 'levymoreira.ce@gmail.com'
  
  try {
    console.log(`🔍 Searching for user with email: ${email}`)
    
    // First, check if the user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('❌ User not found in the database')
      return
    }
    
    console.log(`✅ User found: ${user.name || 'No name'} (ID: ${user.id})`)
    console.log('🧹 Removing related sessions, auth providers, SISU activities, lead, and user (transaction)...')

    const result = await prisma.$transaction(async (tx) => {
      const sessionsDeleted = await tx.session.deleteMany({
        where: { userId: user.id }
      })

      const providersDeleted = await tx.authProvider.deleteMany({
        where: { userId: user.id }
      })

      const sisuDeleted = await tx.sisuActivity.deleteMany({
        where: {
          OR: [
            { userId: user.id },
            { email }
          ]
        }
      })

      // Lead may or may not exist; deleteMany is idempotent
      const leadsDeleted = await tx.lead.deleteMany({
        where: { email }
      })

      const deletedUser = await tx.user.delete({
        where: { email }
      })

      return { sessionsDeleted, providersDeleted, sisuDeleted, leadsDeleted, deletedUser }
    })

    console.log(`🗑️  Sessions deleted: ${result.sessionsDeleted.count}`)
    console.log(`🗑️  Auth providers deleted: ${result.providersDeleted.count}`)
    console.log(`🗑️  SISU activities deleted: ${result.sisuDeleted.count}`)
    console.log(`🗑️  Leads deleted: ${result.leadsDeleted.count}`)
    console.log('✅ User successfully deleted!')
    console.log('Deleted user details:', {
      id: result.deletedUser.id,
      email: result.deletedUser.email,
      name: result.deletedUser.name,
      linkedinId: result.deletedUser.linkedinId,
      onboardingCompleted: result.deletedUser.onboardingCompleted,
      createdAt: result.deletedUser.createdAt
    })
    
  } catch (error) {
    console.error('❌ Error deleting user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
deleteLevyUser()
  .then(() => {
    console.log('🎉 Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
