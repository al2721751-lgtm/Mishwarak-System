// KNK RealEstate Broker Module - وحدة الوساطة العقارية السيادية
const express = require('express');
const router = express.Router();
const { centralPropertyListings } = require('./db');

router.get('/api/realestate/public-listings', (req, res) => {
    const publicData = centralPropertyListings.map(item => ({
        id: item.id,
        category: item.category,
        location: item.location,
        price: item.price,
        transactionType: item.transactionType,
        description: item.description,
        commission: item.commission
        // ملاحظة: رقم الهاتف (confidentialPhone) محذوف بالكامل ولا يتم تمريره للعامة
    }));
    res.json({ success: true, count: publicData.length, listings: publicData });
});

module.exports = router;
