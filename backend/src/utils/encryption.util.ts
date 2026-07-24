import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export const encrypt = (text: string): string => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 32) {
        throw new Error('Invalid or missing ENCRYPTION_KEY in environment variables. It must be 32 characters long.');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Return iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

export const decrypt = (hash: string): string => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 32) {
        throw new Error('Invalid or missing ENCRYPTION_KEY in environment variables. It must be 32 characters long.');
    }

    const parts = hash.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted hash format.');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
};
