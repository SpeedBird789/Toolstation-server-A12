import clientPromise from '../../../lib/mongodb';
import { verifyJWT } from '../../../lib/verifyJWT';

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db('manufacturing');
    const usersCollection = db.collection('users');

    const { email } = req.query;

    switch (req.method) {
        case 'GET':
            const user = await usersCollection.findOne({ email });
            const isAdmin = user?.role === 'admin';
            res.json({ admin: isAdmin });
            break;
        case 'PUT':
            verifyJWT(req, res, async () => {
                const requester = req.decoded.email;
                const requesterAccount = await usersCollection.findOne({ email: requester });

                if (requesterAccount.role === 'admin') {
                    const filter = { email };
                    const updateDoc = {
                        $set: { role: 'admin' },
                    };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                } else {
                    res.status(403).json({ message: 'forbidden' });
                }
            });
            break;
        default:
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}