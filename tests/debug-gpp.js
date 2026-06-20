import { GppModel } from '@iabgpp/cmpapi';

const s = process.argv[2];
if (!s) {
    console.log("Usage: node debug-gpp.js <gpp_string>");
    process.exit(1);
}

try {
    console.log(`\nString: ${s}`);
    const model = new GppModel(s);
    console.log(`  Header IDs: ${model.getSectionIds().join(', ')}`);
    console.log(`  Actual split parts: ${s.split('~').length - 1} (excluding header)`);
    console.log(`  Decoded Sections:`, Object.keys(model.toObject()));
    console.log(`  Full Data:`, JSON.stringify(model.toObject(), null, 2));
} catch (e) {
    console.log(`  Error: ${e.message}`);
}
