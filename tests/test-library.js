import { GppModel } from '@iabgpp/cmpapi';

const s = 'DBABMA';
try {
    const model = new GppModel(s);
    console.log(`Decoding ${s}:`);
    console.log(`  Section IDs: ${model.getSectionIds()}`);
} catch (e) {
    console.error(`Error: ${e.message}`);
}
