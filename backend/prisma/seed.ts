import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Seed AppSettings - ensure only one row exists
  const existingSettings = await prisma.appSettings.findUnique({
    where: { id: 1 },
  })

  if (!existingSettings) {
    await prisma.appSettings.create({
      data: {
        id: 1,
        // All other fields will use their default values
      },
    })
    console.log('✓ Created default app settings')
  } else {
    console.log('✓ App settings already exist')
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
