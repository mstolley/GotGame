import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // Note: Get the initial data from the JSON /data/data.json file
    const jsonDirectory = path.join(process.cwd(), 'data');
    const fileContents = await fs.readFile(path.join(jsonDirectory, 'data.json'), 'utf8');

    try {
        const data = JSON.parse(fileContents);

        res.status(200).json(data);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
};

export default handler;
