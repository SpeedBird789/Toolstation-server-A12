import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db('manufacturing');
    const toolCollection = db.collection('tools');

    const { id } = req.query;

    switch (req.method) {
        case 'GET':
            const tool = await toolCollection.findOne({ _id: ObjectId(id) });
            res.json(tool);
            break;
        case 'DELETE':
            const result = await toolCollection.deleteOne({ _id: ObjectId(id) });
            res.json(result);
            break;
        default:
            res.setHeader('Allow', ['GET', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}