import { HeaderV1 } from '@iabgpp/cmpapi';

const header = new HeaderV1('DBAB-A');
console.log('SectionIds for DBAB-A:', header.getFieldValue('SectionIds'));

const header2 = new HeaderV1('DBABLA');
console.log('SectionIds for DBABLA:', header2.getFieldValue('SectionIds'));
