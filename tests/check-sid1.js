import { GppModel } from '@iabgpp/cmpapi';

try {
    const model = new GppModel();
    // Section 1 is GPC. Let's see if we can set it.
    // model.setFieldValueBySectionId(1, 'Gpc', true); 
    // If SID 1 is not in the map, this might fail.
    
    // Let's try to just get a header with SID 1.
    // The library might not support SID 1 if it's not in Sections.js.
    
    console.log("Sections in Sections.js:", model.getSectionIds());
    
} catch (e) {
    console.log("Error:", e.message);
}
