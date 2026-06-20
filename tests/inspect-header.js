import { GppModel } from '@iabgpp/cmpapi';

const s = 'DBAAABA';
try {
    const model = new GppModel(s);
    // We can't use getSectionIds() because it triggers full decoding which fails if sections are missing.
    // But we might be able to see what it *expects*.
    // Actually, GppModel decodes the header first.
    
    // Let's try to just decode the header section if possible.
    // Or just look at the error message from a slightly invalid string.
} catch (e) {
    console.error(e.message);
}

// Alternative: use TraditionalBase64UrlEncoder to see the bits of the header
import { BitStringEncoder } from '@iabgpp/cmpapi/lib/mjs/encoder/bitstring/BitStringEncoder.js';
import { TraditionalBase64UrlEncoder } from '@iabgpp/cmpapi/lib/mjs/encoder/base64/TraditionalBase64UrlEncoder.js';

const headerBase64 = 'DBAAABA';
const encoder = new TraditionalBase64UrlEncoder();
const decoded = encoder.decode(headerBase64);
console.log('Decoded header bits (hex):', Buffer.from(decoded).toString('hex'));

// GPP Header V1:
// Type: 6 bits
// Version: 6 bits
// SectionIds: Range(FixedIntegerList)
