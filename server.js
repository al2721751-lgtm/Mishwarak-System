const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ربط وحدات النظام السيادي
const realEstateRouter = require('./modules/realEstateBroker');
const ownerPortalRouter = require('./modules/ownerPortal');
const clientPortalRouter = require('./modules/clientPortal');

app.use(realEstateRouter);
app.use(ownerPortalRouter);
app.use(clientPortalRouter);

app.get('/', (req, res) => {
    res.json({ 
        system: "KNK Mishwarak-System & Sovereign RealEstate Active", 
        status: "PRODUCTION_READY",
        categories: ["قصور", "فلل", "شقق", "عماير تجارية", "مزارع", "أراضي فاضية"],
        brokerageRules: {
            contractIntervention: false,
            rentCommission: 50,
            saleCommission: 250
        }
    });
});

app.listen(PORT, () => {
    console.log(`[KNK S-System] Production Server running on port ${PORT}`);
});
