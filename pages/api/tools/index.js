import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db('manufacturing');
    const toolCollection = db.collection('tools');

    switch (req.method) {
        case 'GET':
            const tools = await toolCollection.find({}).toArray();
            res.json(tools);
            break;
        case 'POST':
            const newTool = req.body;
            const result = await toolCollection.insertOne(newTool);
            res.json(result);
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}