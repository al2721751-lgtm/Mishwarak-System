// KNK Client Portal Module - بوابة العملاء والربط العقاري
const express = require('express');
const router = express.Router();
const { centralClientRequests, centralPropertyListings } = require('./db');

const VALID_CATEGORIES = ['PALACE', 'VILLA', 'APARTMENT', 'COMMERCIAL', 'FARM', 'LAND'];

// تسجيل طلب عميل (مشتري أو مستأجر) لربطه بالعقار المناسب
router.post('/api/client/request-match', express.json(), (req, res) => {
    const { clientName, clientPhone, targetCategory, transactionType, maxBudget } = req.body;

    if (!clientName || !clientPhone || !targetCategory || !transactionType) {
        return res.status(400).json({ error: 'جميع بيانات الطلب (الاسم، الهاتف، التصنيف، ونوع المعاملة) إلزامية للوساطة.' });
    }

    if (!VALID_CATEGORIES.includes(targetCategory)) {
        return res.status(400).json({ error: 'التصنيف المستهدف غير مطابق للقوائم الستة المعتمدة.' });
    }

    const requestId = 'KNK-CLIENT-' + Date.now();
    const fixedCommission = transactionType === 'RENT' ? 50 : 250;

    const clientRequest = {
        requestId,
        clientName,
        confidentialClientPhone: clientPhone, // سرية تامة
        targetCategory, 
        transactionType, // RENT أو SALE
        maxBudget: maxBudget || 'غير محدد',
        commissionDue: fixedCommission,
        status: 'PENDING_MATCHING',
        requestedAt: new Date().toISOString()
    };

    centralClientRequests.push(clientRequest);

    // البحث الفوري عن مطابقات في العقارات المتاحة
    const matches = centralPropertyListings.filter(p => 
        p.category === targetCategory && p.transactionType === transactionType
    );

    res.status(201).json({
        success: true,
        message: 'تم استلام طلبك بنجاح. سيتم تنسيق الربط المباشر مع صاحب العقار فور توفر المطابقة.',
        requestId: requestId,
        fixedCommission: fixedCommission,
        availablePotentialMatches: matches.length,
        notice: 'نحن وسطاء فقط للربط وتقريب وجهات النظر، ولا نتدخل في صياغة العقود القانونية.'
    });
});

// استعراض الطلبات للوسيط حصرياً
router.get('/api/admin/client-requests', (req, res) => {
    res.json({ success: true, count: centralClientRequests.length, requests: centralClientRequests });
});

module.exports = router;
