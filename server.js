const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ربط وحدة الوساطة العقارية السيادية
const realEstateRouter = require('./modules/realEstateBroker');
app.use(realEstateRouter);

app.get('/', (req, res) => {
    res.json({ system: "KNK Mishwarak-System & RealEstate Brokerage Active", status: "SECURE" });
});

app.listen(PORT, () => {
    console.log(`[KNK S-System] Server running on port ${PORT}`);
});
