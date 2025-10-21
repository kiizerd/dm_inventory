"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeFord = scrapeFord;
const cheerio_1 = require("cheerio");
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
async function scrapeFord({ writeHtml = true, } = {}) {
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    const url = "https://www.fourstarsford.com/searchused.aspx?pn=96";
    // Use Puppeteer to navigate so any client-side rendered markup is present.
    await page.goto(url, { waitUntil: "networkidle2" });
    // Grab the full HTML from the loaded page
    const html = await page.content();
    const $ = (0, cheerio_1.load)(html);
    const vehicles = [];
    // TODO: replace selectors below once we inspect the structure.
    const inventoryElement = $(".inventory-list");
    const vehicleCards = $(".vehicle-card");
    console.log("Card count:", vehicleCards.length);
    // Optionally write the inventory element outer HTML to disk for debugging/archival
    if (writeHtml) {
        try {
            const dataDir = path_1.default.resolve(__dirname, "..", "..", "data");
            await fs_1.promises.mkdir(dataDir, { recursive: true });
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filename = `ford-inventory-${timestamp}.html`;
            const filePath = path_1.default.join(dataDir, filename);
            // Prefer the inventory element if it exists, otherwise save the full page
            const toWrite = inventoryElement.length ? inventoryElement.first().toString() : $.root().toString();
            await fs_1.promises.writeFile(filePath, toWrite, "utf8");
            console.log(`Wrote inventory HTML to ${filePath}`);
        }
        catch (err) {
            console.error("Failed to write inventory HTML:", err);
        }
    }
    vehicleCards.each((_, elem) => {
        const title = $(elem).find(".vehicle-title").text().trim() || "No Title";
        const price = $(elem).find(".vehiclePricingHighlightAmount").text().trim() || "No Price";
        const mileage = $(elem).find(".vehicle-mileage").text().trim() || "No Mileage";
        const link = $(elem).find("a").attr("href") ??
            "https://www.fourstarsford.com"; // fallback
        const image = $(elem).find("img").attr("src");
        const vehicle = { title, price, mileage, link, image };
        vehicles.push(vehicle);
    });
    await browser.close();
    return vehicles;
}
//# sourceMappingURL=ford.js.map