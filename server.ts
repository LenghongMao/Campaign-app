import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.static('public'));

const CAMPAIGNS_FILE = path.join(__dirname, 'campaigns.txt');
const PRODUCTS_FILE = path.join(__dirname, 'products.txt');

// Define exactly what our data looks like
interface Campaign {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    channel: string;
}

interface Product {
    campaignId: string;
    itemNumber: string;
    itemName: string;
    category: string;
    description: string;
    quantity: number;
}

// Helper functions with Generics () so they know what type of data they are reading/writing
const readData = <T>(file: string): T[] => {
    if (!fs.existsSync(file)) return [];
    const data = fs.readFileSync(file, 'utf8');
    return data ? JSON.parse(data) : [];
};

const writeData = <T>(file: string, data: T[]): void => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// --- CAMPAIGN ROUTES ---
app.get('/api/campaigns', (req: Request, res: Response) => {
    res.json(readData(CAMPAIGNS_FILE));
});

app.post('/api/campaigns', (req: Request, res: Response) => {
    const campaigns = readData(CAMPAIGNS_FILE);
    const newCampaign: Campaign = { 
        id: Date.now().toString(), 
        ...req.body 
    };
    campaigns.push(newCampaign);
    writeData(CAMPAIGNS_FILE, campaigns);
    res.json(newCampaign);
});

app.delete('/api/campaigns/:id', (req: Request, res: Response) => {
    let campaigns = readData(CAMPAIGNS_FILE);
    campaigns = campaigns.filter(c => c.id !== req.params.id);
    writeData(CAMPAIGNS_FILE, campaigns);
    res.json({ success: true });
});

// --- PRODUCT ROUTES ---
app.get('/api/products/:campaignId', (req: Request, res: Response) => {
    const products = readData(PRODUCTS_FILE);
    const campaignProducts = products.filter(p => p.campaignId === req.params.campaignId);
    res.json(campaignProducts);
});

app.post('/api/products', (req: Request, res: Response) => {
    const products = readData(PRODUCTS_FILE);
    const newProduct: Product = { ...req.body };
    products.push(newProduct);
    writeData(PRODUCTS_FILE, products);
    res.json(newProduct);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`TypeScript Server running on http://localhost:${PORT}`);
});