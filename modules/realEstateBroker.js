// KNK RealEstate Broker Module - وحدة الوساطة العقارية السيادية
const express = require('express');
const router = express.Router();

// التصنيفات الستة المعتمدة حصرياً
const VALID_CATEGORIES = [
    'PALACE',       // قصور
    'VILLA',        // فلل
    'APARTMENT',    // شقق
    'COMMERCIAL',   // عماير تجارية
    'FARM',         // مزارع
    'LAND'          // أراضي فاضية
];

let securePropertyListings = [];

// تسجيل العقار مع حفظ رقم الهاتف بسرية مطلقة وحجبه عن العرض العام
router.post('/api/realestate/secure-listing', express.json(), (req, res) => {
    const { ownerPhone, category, location, price, transactionType, description } = req.body;

    if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: 'التصنيف العقاري غير مطابق للقوائم المعتمدة.' });
    }

    if (!ownerPhone) {
        return res.status(400).json({ error: 'رقم هاتف صاحب العقار إلزامي للوساطة ولكن سيبقى سرياً.' });
    }

    const listingId = 'KNK-SEC-RE-' + Date.now();
    const commissionFee = transactionType === 'RENT' ? 50 : 250;

    const listingRecord = {
        id: listingId,
        category,
        location,
        price,
        transactionType, // SALE أو RENT
        description,
        commission: commissionFee,
        confidentialOwnerPhone: ownerPhone, // سرية تامة ومحجوبة عن العامة
        status: 'ACTIVE_BROKERAGE',
        createdAt: new Date().toISOString()
    };

    securePropertyListings.push(listingRecord);

    res.status(201).json({
        success: true,
        message: 'تم تسجيل العقار بنجاح. معلومات المالك سرية ومؤمنة في النظام.',
        listingId: listingId,
        category: category,
        commissionDue: commissionFee
    });
});

// استعراض العقارات للعامة بدون كشف رقم هاتف المالك
router.get('/api/realestate/public-listings', (req, res) => {
    const publicData = securePropertyListings.map(item => ({
        id: item.id,
        category: item.category,
        location: item.location,
        price: item.price,
        transactionType: item.transactionType,
        description: item.description
    }));
    res.json({ success: true, listings: publicData });
});

module.exports = router;
