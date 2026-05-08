import { verifyTransaction } from '../services/paystack.service';
import { UserModel } from '../models/user.model';

export const handleVerifyPayment = async (req: any, res: any) => {
  const { reference, userId } = req.body;
  try {
    const response = await verifyTransaction(reference);
    if (response.status && response.data.status === 'success') {
      const user = await UserModel.findByIdAndUpdate(userId, { isPremium: true }, { new: true });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true, message: 'Premium activated', user });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
