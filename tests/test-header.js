import { HeaderV1 } from '@iabgpp/cmpapi';

const header = new HeaderV1();
header.setFieldValue('SectionIds', [2, 1]);
console.log('Header for [2, 1]:', header.encode());

header.setFieldValue('SectionIds', [1, 7]);
console.log('Header for [1, 7]:', header.encode());
