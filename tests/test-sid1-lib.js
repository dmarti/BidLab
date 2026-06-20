import { GppModel } from '@iabgpp/cmpapi';

const model = new GppModel('DBABYA~G');
console.log('Header IDs from DBABYA~G:', model.getSectionIds());
console.log('Decoded Sections:', Object.keys(model.toObject()));
