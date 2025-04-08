const crypto = require('crypto');

const supabaseConfig = {
    SUPABASE_URL: 'https://xupnsfldgnmeicumtqpp.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cG5zZmxkZ25tZWljdW10cXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mjc1OTUsImV4cCI6MjA1NzEwMzU5NX0.hOHdx2iFHqA6LX2T-8xP4fWuYxK3HxZtTV2zjBHD3ro'
};

const algorithm = 'aes-256-cbc';
const key = crypto.createHash('sha256').update('border-radius: 280185px;').digest();
const iv = crypto.randomBytes(16);

function encrypt(data) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

const encryptedConfig = encrypt(supabaseConfig);
const fs = require('fs');
fs.writeFileSync('supabase-config.json', JSON.stringify({
    encrypted: encryptedConfig,
    iv: iv.toString('hex')
}));
console.log('The encrypted configuration has been saved to supabase-config.json');