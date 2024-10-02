import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db('manufacturing');
    const usersCollection = db.collection('users');

    switch (req.method) {
        case 'GET':
            const users = await usersCollection.find({}).toArray();
            res.json(users);
            break;
        case 'PUT':
            const { email } = req.query;
            const user = req.body;

            const filter = { email };
            const updateDoc = {
                $set: user,
            };
            const options = { upsert: true };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.json({ result, token });
            break;
        default:
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}