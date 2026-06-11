const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  
  await prisma.user.updateMany({
    where: { 
      email: { in: ['admin@knot.com', 'jomekgroup@gmail.com'] } 
    },
    data: { passwordHash }
  });
  
  console.log('Passwords reset to password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
