// KNK Owner Portal Module - واجهة أصحاب الملك والوساطة السرية
const express = require('express');
const router = express.Router();
const { centralPropertyListings } = require('./db');

const VALID_CATEGORIES = ['PALACE', 'VILLA', 'APARTMENT', 'COMMERCIAL', 'FARM', 'LAND'];

router.post('/api/owner/register-property', express.json(), (req, res) => {
    const { ownerName, ownerPhone, category, location, price, transactionType, description } = req.body;

    if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: 'التصنيف العقاري غير مطابق للقوائم الستة المعتمدة.' });
    }

    if (!ownerPhone || !ownerName) {
        return res.status(400).json({ error: 'اسم ورقم هاتف صاحب الملك إلزاميان للوساطة وستبقى سرية تامة.' });
    }

    const listingId = 'KNK-OWNER-' + Date.now();
    const commissionFee = transactionType === 'RENT' ? 50 : 250;

    const propertyRecord = {
        id: listingId,
        ownerName,
        confidentialPhone: ownerPhone, // سرية مطلقة - محجوبة عن العامة
        category,
        location,
        price,
        transactionType,
        description,
        commission: commissionFee,
        status: 'ACTIVE_BROKERAGE',
        registeredAt: new Date().toISOString()
    };

    centralPropertyListings.push(propertyRecord);

    res.status(201).json({
        success: true,
        message: 'تم استقبال إعلانك بنجاح يا صاحب الملك. بياناتك ورقم هاتفك في سرية تامة ولن يتم إظهارهما للعامة.',
        referenceId: listingId,
        category: category,
        fixedCommission: commissionFee,
        notice: 'نحن وسطاء فقط للربط المباشر ولا نتدخل في كتابة العقود أو الالتزامات القانونية.'
    });
});

module.exports = router;
