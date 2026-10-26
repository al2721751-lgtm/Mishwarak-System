const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8000;
const DB_FILE = path.join(__dirname, 'mishwarak_db.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

function loadDB() {
    if (fs.existsSync(DB_FILE)) {
        try { 
            let data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            if(!data.driverRoutes) data.driverRoutes = {}; // لتسجيل خط سير كل سائق مستقل
            if(!data.companyCommitments) data.companyCommitments = []; // لتوثيق التزام الراكب مع الشركة
            return data;
        } catch(e) { return { clients: [], drivers: [], contracts: [], shifts: { morning: [], night: [] }, backups: [], incidents: [], driverRoutes: {}, companyCommitments: [] }; }
    }
    return { clients: [], drivers: [], contracts: [], shifts: { morning: [], night: [] }, backups: [], incidents: [], driverRoutes: {}, companyCommitments: [] };
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// محرك إدارة مسارات السائقين والتزام الركاب المؤسسي
function runCompanyOperationalEngine(db) {
    console.log('[🏢 الإدارة المركزية] جاري مطابقة التزام الركاب مع الشركة ومراجعة خطوط سير السائقين المختلفة...');
    
    // ضمان ارتباط كل تعاقد بكيان الشركة وحفظ مسار السائق الخاص
    db.contracts.forEach(ct => {
        let client = db.clients.find(c => c.id === ct.clientId);
        let driver = db.drivers.find(d => d.phone === ct.driverPhone);
        if (client && driver) {
            // تخصيص خط السير المستقل لهذا السائق بناءً على عملائه
            if (!db.driverRoutes[driver.id]) {
                db.driverRoutes[driver.id] = {
                    driverName: driver.name,
                    car: driver.car,
                    assignedRoute: `${client.home} ➔ ${client.work}`,
                    status: 'مسار نشط ومراقب بالجي بي إس'
                };
            }
        }
    });
    
    saveDB(db);
}

const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        const htmlPath = path.join(PUBLIC_DIR, 'index.html');
        if (fs.existsSync(htmlPath)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(fs.readFileSync(htmlPath));
        }
        res.writeHead(404);
        return res.end('Index not found');
    }

    if (req.url === '/api/data' && req.method === 'GET') {
        const db = loadDB();
        runCompanyOperationalEngine(db);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(db));
    }

    if (req.url === '/api/client/add' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const db = loadDB();
            const client = JSON.parse(body);
            client.id = 'c_' + Date.now();
            db.clients.push(client);
            saveDB(db);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true }));
        });
        return;
    }

    if (req.url === '/api/driver/add' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const db = loadDB();
            const driver = JSON.parse(body);
            driver.id = 'd_' + Date.now();
            db.drivers.push(driver);
            if(db.shifts.morning.length <= db.shifts.night.length) {
                db.shifts.morning.push(driver);
                driver.shift = 'صباحي (12 ساعة)';
            } else {
                db.shifts.night.push(driver);
                driver.shift = 'ليلي (12 ساعة)';
            }
            saveDB(db);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true }));
        });
        return;
    }

    if (req.url === '/api/contract/request' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { clientId, driverPhone } = JSON.parse(body);
            const db = loadDB();
            db.contracts.push({ id: 'ct_' + Date.now(), clientId, driverPhone, paid: false, boundToCompany: true });
            saveDB(db);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true }));
        });
        return;
    }

    if (req.url === '/api/contract/pay' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { contractId } = JSON.parse(body);
            const db = loadDB();
            const ct = db.contracts.find(c => c.id === contractId);
            if(ct) { ct.paid = true; saveDB(db); }
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true }));
        });
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`\x1b[32m[✓] محرك التزام الركاب ومسارات السائقين المستقلة يعمل على: http://127.0.0.1:${PORT}\x1b[0m`);
    exec(`start http://127.0.0.1:${PORT}`);
});
