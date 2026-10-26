const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ربط وحدة الوساطة العقارية
const realEstateRouter = require('./modules/realEstateBroker');
app.use(realEstateRouter);

// ربط واجهة أصحاب الملك
const ownerPortalRouter = require('./modules/ownerPortal');
app.use(ownerPortalRouter);

app.get('/', (req, res) => {
    res.json({ 
        system: "KNK Mishwarak-System & RealEstate Owner Portal Active", 
        status: "SECURE",
        categories: ["قصور", "فلل", "شقق", "عماير تجارية", "مزارع", "أراضي فاضية"],
        commissionPolicy: { rent: 50, sale: 250, role: "Pure Brokerage - No Contracts" }
    });
});

app.listen(PORT, () => {
    console.log(`[KNK S-System] Server running on port ${PORT}`);
});
