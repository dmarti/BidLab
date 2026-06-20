import { GppModel } from '@iabgpp/cmpapi';

function generateGpcString(sectionId, sectionName) {
    const model = new GppModel();
    // We can't easily set GPC on all sections if we don't know the field names
    // But for US National (7), California (8), Virginia (9), it should work.
    
    try {
        // For US National (7)
        if (sectionId === 7) {
            // Field names for UsNat:
            // Core Segment: UsNatField.SHARING_NOTICE etc.
            // GPC Segment: UsNatField.GPC_SEGMENT_INCLUDED, UsNatField.GPC
            
            // Actually the library might have constants.
            // Let's try to just set the GPC bit.
            model.setFieldValueBySectionId(7, 'GpcSegmentIncluded', true);
            model.setFieldValueBySectionId(7, 'Gpc', true);
        } else if (sectionId === 8) {
             model.setFieldValueBySectionId(8, 'GpcSegmentIncluded', true);
             model.setFieldValueBySectionId(8, 'Gpc', true);
        } else if (sectionId === 9) {
             // Virginia doesn't have a GPC segment in GPP v1? 
             // Let's check.
        }
        
        return model.encode();
    } catch (e) {
        return `Error: ${e.message}`;
    }
}

console.log("US National with GPC:", generateGpcString(7, 'usnat'));
console.log("California with GPC:", generateGpcString(8, 'usca'));
