import bcrypt from 'bcryptjs';

async function testBcrypt() {
  try {
    const salt = 12;
    const password = 'password123';
    console.log('Hashing password...');
    const hash = await bcrypt.hash(password, salt);
    console.log('Hash:', hash);
    const isValid = await bcrypt.compare(password, hash);
    console.log('Is valid:', isValid);
    process.exit(0);
  } catch (err) {
    console.error('Bcrypt failed:', err);
    process.exit(1);
  }
}

testBcrypt();
