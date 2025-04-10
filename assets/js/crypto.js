const crypto = require('crypto');
const fs = require('fs');

const generatePassword = (length = 32) => {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
};

const PASSWORD = generatePassword();
const ENCRYPTION_KEY = crypto.createHash('sha256').update(PASSWORD).digest();

const supabaseConfig = {
  SUPABASE_URL: 'https://xupnsfldgnmeicumtqpp.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cG5zZmxkZ25tZWljdW10cXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mjc1OTUsImV4cCI6MjA1NzEwMzU5NX0.hOHdx2iFHqA6LX2T-8xP4fWuYxK3HxZtTV2zjBHD3ro'
};

const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

function encrypt(data) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

const encryptedConfig = encrypt(supabaseConfig);

fs.writeFileSync('supabase-config.json', JSON.stringify({
  encrypted: encryptedConfig,
  iv: iv.toString('hex'),
  password: PASSWORD
}, null, 2));

console.log('加密配置已保存到 supabase-config.json');
console.log('使用的密码为：', PASSWORD);

// L8&dT!7r#FvX29@Kw3$bNz%YpQeU1m
// @Br3akf@st#2025$Tiger!42
