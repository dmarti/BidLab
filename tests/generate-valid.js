import { GppModel } from '@iabgpp/cmpapi';

const sections = [
    { id: 2, name: 'eu_tcf', field: 'PurposeConsents', val: [true] },
    { id: 7, name: 'us_nat', field: 'SharingOptOut', val: 1 },
    { id: 8, name: 'us_ca', field: 'SaleOptOut', val: 1 },
    { id: 9, name: 'us_va', field: 'SaleOptOut', val: 1 }
];

for (const s of sections) {
    try {
        const model = new GppModel();
        model.setFieldValueBySectionId(s.id, s.field, s.val);
        console.log(`${s.name} (ID ${s.id}) encoded: ${model.encode()}`);
    } catch (e) {
        console.log(`${s.name} (ID ${s.id}) error: ${e.message}`);
    }
}
