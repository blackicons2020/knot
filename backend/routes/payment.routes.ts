
import express from 'express';
import crypto from 'crypto';
import { verifyTransaction } from '../services/paystack.service';
import { UserModel } from '../models/user.model';

const router = express.Router();

// 1. Verify a specific transaction reference
router.post('/verify', async (req, res) => {
  const { reference, userId } = req.body;
  try {
    const data = await verifyTransaction(reference);
    if (data.status && data.data.status === 'success') {
      const paystackData = data.data;
      await UserModel.findByIdAndUpdate(userId, {
        isPremium: true,
        subscriptionDate: new Date().toISOString(),
        subscriptionAmount: paystackData.amount / 100,
        subscriptionPeriod: '1 month',
      });
      res.json({ status: 'success', message: 'Premium activated' });
    } else {
      res.status(400).json({ status: 'failed', message: 'Payment not successful' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// 2. Webhook listener for automated updates (Paystack sends events here)
router.post('/webhook', async (req: any, res: any) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY as string)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send('Unauthorized');
  }

  const event = req.body;
  if (event.event === 'charge.success') {
    const email = event.data.customer.email;
    const amount = event.data.amount;
    console.log(`Webhook: Payment confirmed for ${email}: NGN ${amount / 100}`);
    await UserModel.findOneAndUpdate(
      { email },
      {
        isPremium: true,
        subscriptionDate: new Date().toISOString(),
        subscriptionAmount: amount / 100,
        subscriptionPeriod: '1 month',
      }
    );
  }

  res.sendStatus(200);
});

export default router;
