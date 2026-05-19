async function test() {
  try {
    const res = await fetch('https://knot-backend-core.onrender.com/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_model_' + Date.now() + '@example.com',
        password: 'password123'
      })
    });
    const status = res.status;
    const data = await res.json();
    console.log('Status:', status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
