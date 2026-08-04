import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.wrkmwfratpbdbrhhalhq:kikhy2-pyzdaZ-byqqas@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
    }
  }
})

async function main() {
  const rooms = await prisma.room.findMany({
    select: {
      id: true,
      contentName: true,
      basePrice: true
    }
  })
  console.log(JSON.stringify(rooms, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
