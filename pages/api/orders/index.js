import clientPromise from '../../../lib/mongodb';
import { verifyJWT } from '../../../lib/verifyJWT';

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db('manufacturing');
    const orderCollection = db.collection('orders');

    switch (req.method) {
        case 'GET':
            verifyJWT(req, res, async () => {
                const email = req.query.email;
                const decodedEmail = req.decoded.email;
                if (email === decodedEmail) {
                    const orders = await orderCollection.find({ email }).toArray();
                    res.json(orders);
                } else {
                    res.status(403).json({ message: 'forbidden access' });
                }
            });
            break;
        case 'POST':
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}