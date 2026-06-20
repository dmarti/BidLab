import { GppModel } from '@iabgpp/cmpapi';

// Since I can't import HeaderV1 directly easily, I'll use GppModel to get a header.
const model = new GppModel();
model.setFieldValueBySectionId(2, 'Consent', [1]);
const baseString = model.encode();
console.log('Base String (TCF EU):', baseString);

// Header [2] is DBABMA.
// Header [2, 1] is DBAB-A (from previous test).

// Actually, I'll use a hack to get the header for [2, 1] using the library's internal logic if possible.
// Wait! I'll just use the strings I found.

const header2_1 = 'DBAB-A'; 
const tcfeu_section = baseString.split('~')[1];
const gpc_section = 'G'; // Version 1, GPC 1, padding 1 -> 00000110 -> 6 -> G

const finalString = `${header2_1}~${tcfeu_section}~${gpc_section}`;
console.log('Final String:', finalString);
