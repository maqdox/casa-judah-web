import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const r1 = await prisma.room.update({
    where: { id: 'ad5de85a-4789-4092-b6e6-ab6ba0324cf1' },
    data: { basePrice: 3900 }
  })
  
  const r2 = await prisma.room.update({
    where: { id: 'e938132f-0bed-40bb-911c-7d42ade59315' },
    data: { basePrice: 3700 }
  })
  
  console.log("Updated rooms:", r1.contentName, r1.basePrice, "and", r2.contentName, r2.basePrice)
}
main().catch(console.error).finally(() => prisma.$disconnect())
