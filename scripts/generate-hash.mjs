import crypto from 'crypto';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Пожалуйста, укажите пароль для хеширования.');
  console.log('Пример: node scripts/generate-hash.mjs "mypassword"');
  process.exit(1);
}

const password = args[0];
const hash = crypto.createHash('sha256').update(password).digest('hex');

console.log(`
Пароль: ${password}`);
console.log(`SHA-256 Хеш: ${hash}`);
console.log(`
Скопируйте этот хеш в ваш passwords.json вместо обычного пароля.`);
