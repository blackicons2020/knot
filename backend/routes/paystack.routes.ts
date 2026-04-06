import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { adminDb } from '../firebase-admin';

const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

// Verify Paystack transaction
router.post('/verify', async (req, res) => {
  try {
    const { reference, userId, months } = req.body;

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ success: false, error: 'Paystack secret key missing' });
    }

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    if (response.data.status && response.data.data.status === 'success') {
      const paymentData = response.data.data;
      const amount = paymentData.amount / 100; // Convert from kobo/cents
      const currency = paymentData.currency;

      // Update user in Firestore
      const userRef = adminDb.collection('users').doc(userId);
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + parseInt(months, 10));

      await userRef.update({
        isPremium: true,
        premiumExpiry: expiryDate.toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Log payment record
      await adminDb.collection('payments').add({
        userId,
        paystackReference: reference,
        amount,
        currency,
        status: 'success',
        createdAt: new Date().toISOString(),
      });

      console.log(`User ${userId} upgraded via Paystack verification. Amount: ${amount} ${currency}. Expiry: ${expiryDate.toISOString()}`);
      return res.json({ success: true });
    } else {
      return res.status(400).json({ success: false, error: 'Payment verification failed' });
    }
  } catch (error: any) {
    console.error('Paystack verification error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Internal server error during verification' });
  }
});

// Paystack Webhook handler
router.post('/webhook', async (req, res) => {
  try {
    // NOTE: Paystack uses your Secret Key to sign webhooks. 
    // You do not need a separate "Webhook Secret" like Stripe.
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET || PAYSTACK_SECRET_KEY;
    
    if (!secret) {
      console.error('Paystack webhook: Secret key missing for verification');
      return res.status(500).send('Configuration error');
    }

    // req.body is a Buffer because of the express.raw middleware in app.ts
    const body = req.body.toString();
    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      console.error('Paystack webhook: Invalid signature');
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
      const { metadata, customer, amount: rawAmount, currency, reference } = event.data;
      const userId = metadata?.user_id;
      const months = parseInt(metadata?.months || '1', 10);
      const amount = rawAmount / 100;

      if (userId) {
        console.log(`Webhook: Payment successful for user: ${userId}, amount: ${amount} ${currency}`);
        
        const userRef = adminDb.collection('users').doc(userId);
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + months);
        
        await userRef.update({
          isPremium: true,
          premiumExpiry: expiryDate.toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Log payment record
        await adminDb.collection('payments').add({
          userId,
          paystackReference: reference,
          amount,
          currency,
          status: 'success',
          createdAt: new Date().toISOString(),
        });
        
        console.log(`User ${userId} updated via webhook until ${expiryDate.toISOString()}`);
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Paystack webhook error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
