const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide the email address to promote.");
    console.error("Usage: node make-admin.js <user-email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: 'ADMIN' }
    });
    console.log(`Successfully promoted ${user.firstName} (${user.email}) to ADMIN!`);
  } catch (error) {
    console.error("Failed to promote user. Are you sure that email is registered?");
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
