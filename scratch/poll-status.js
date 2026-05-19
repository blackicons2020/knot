async function poll() {
  console.log('Monitoring Render backend deployment... (Ctrl+C to stop)');
  while (true) {
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
      console.log(`[${new Date().toLocaleTimeString()}] Status: ${status}`, data);
      
      // If it returns a 201 (Created) or 400 (if validation or email already exists), it means the DB is active!
      if (status !== 500) {
        console.log('SUCCESS: The backend is successfully deployed and the database is active!');
        break;
      }
    } catch (err) {
      console.log(`[${new Date().toLocaleTimeString()}] Connection error:`, err.message);
    }
    await new Promise((r) => setTimeout(r, 10000));
  }
}
poll();
