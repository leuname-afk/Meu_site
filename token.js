const crypto = require('crypto');

function base64url(str) {
    return Buffer.from(str).toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

export default function handler(req, res) {
    // Trata o CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { nome, email } = req.body;
    const nome_final = nome || 'Visitante';
    const email_final = email || 'visitante@ageilhavo.pt';
    
    const company_name = 'sb-ageilhavo';
    const company_secret = '4a935b05a1be4999934c77e59ba95644a431d05fb09a0627c5ae06681cdbe1ec';

    const now = Math.floor(Date.now() / 1000);

    const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    
    const md5Email = crypto.createHash('md5').update(email_final).digest('hex');
    const payload = base64url(JSON.stringify({
        iss: company_name,
        iat: now,
        exp: now + 3600,
        identifier: 'user-' + md5Email,
        name: nome_final,
        email: email_final
    }));

    const signature = base64url(
        crypto.createHmac('sha256', company_secret)
            .update(`${header}.${payload}`)
            .digest()
    );

    return res.status(200).json({ token: `${header}.${payload}.${signature}` });
}