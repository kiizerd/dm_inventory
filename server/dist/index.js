"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const app = (0, express_1.default)();
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/inventory', inventory_1.default);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=index.js.map