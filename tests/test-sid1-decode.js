import { GppModel, HeaderV1 } from '@iabgpp/cmpapi';

const header = new HeaderV1();
header.setFieldValue('SectionIds', [1]);
const encodedHeader = header.encode();
console.log('Encoded Header with SID 1:', encodedHeader);

const model = new GppModel();
try {
    // SID 1 (GPC) is 1 bit. In bitstring, it might be 0 or 1.
    // Base64 for 1 bit '1' is 'Q' maybe? 
    // Actually, let's try 'BA' (which is 00000100...)
    model.decode(encodedHeader + '~BA'); 
    console.log('Decoded model with SID 1 successfully');
    console.log('Section IDs:', model.getSectionIds());
} catch (e) {
    console.log('Failed to decode SID 1:', e.message);
}
