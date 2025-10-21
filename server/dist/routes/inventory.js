"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ford_1 = require("../scrapers/ford");
const router = (0, express_1.Router)();
// TEMP MOCK - will replace with real scraper
const mockData = [
    {
        id: '123',
        title: '2021 Example Truck',
        price: 35000,
        inStock: true,
        source: 'Mock Dealer',
        imageUrl: null,
        url: null
    }
];
router.get('/', async (_req, res) => {
    // Later we'll call real scrapers and merge results
    const fordData = (0, ford_1.scrapeFord)();
    console.log('Getting Inventory');
    res.json(fordData);
});
exports.default = router;
//# sourceMappingURL=inventory.js.map