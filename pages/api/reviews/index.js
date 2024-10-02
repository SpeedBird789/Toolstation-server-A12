import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db('manufacturing');
    const reviewsCollection = db.collection('reviews');

    switch (req.method) {
        case 'GET':
            const reviews = await reviewsCollection.find({}).toArray();
            res.json(reviews);
            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}