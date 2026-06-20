import { GppModel } from '@iabgpp/cmpapi';

function getGpcActiveString(sectionId) {
    const model = new GppModel();
    model.setFieldValueBySectionId(sectionId, 'MspaCoveredTransaction', 1);
    
    if (sectionId === 7) {
        model.setFieldValueBySectionId(7, 'GpcSegmentIncluded', true);
        model.setFieldValueBySectionId(7, 'Gpc', true);
        model.setFieldValueBySectionId(7, 'SaleOptOut', 1);
        model.setFieldValueBySectionId(7, 'SharingOptOut', 1);
        model.setFieldValueBySectionId(7, 'TargetedAdvertisingOptOut', 1);
    } else if (sectionId === 8) {
        model.setFieldValueBySectionId(8, 'GpcSegmentIncluded', true);
        model.setFieldValueBySectionId(8, 'Gpc', true);
        model.setFieldValueBySectionId(8, 'SaleOptOut', 1);
        model.setFieldValueBySectionId(8, 'SharingOptOut', 1);
    } else if (sectionId === 9) {
        model.setFieldValueBySectionId(9, 'SaleOptOut', 1);
        model.setFieldValueBySectionId(9, 'TargetedAdvertisingOptOut', 1);
    }
    
    return model.encode();
}

function getStandardString(sectionId) {
    const model = new GppModel();
    model.setFieldValueBySectionId(sectionId, 'MspaCoveredTransaction', 1);
     if (sectionId === 7) {
        model.setFieldValueBySectionId(7, 'GpcSegmentIncluded', true);
        model.setFieldValueBySectionId(7, 'Gpc', false);
        model.setFieldValueBySectionId(7, 'SaleOptOut', 0);
        model.setFieldValueBySectionId(7, 'SharingOptOut', 0);
        model.setFieldValueBySectionId(7, 'TargetedAdvertisingOptOut', 0);
    } else if (sectionId === 8) {
        model.setFieldValueBySectionId(8, 'GpcSegmentIncluded', true);
        model.setFieldValueBySectionId(8, 'Gpc', false);
        model.setFieldValueBySectionId(8, 'SaleOptOut', 0);
        model.setFieldValueBySectionId(8, 'SharingOptOut', 0);
    } else if (sectionId === 9) {
        model.setFieldValueBySectionId(9, 'SaleOptOut', 0);
        model.setFieldValueBySectionId(9, 'TargetedAdvertisingOptOut', 0);
    }
    return model.encode();
}

console.log("US National Standard:", getStandardString(7));
console.log("US National GPC Active:", getGpcActiveString(7));
console.log("California Standard:", getStandardString(8));
console.log("California GPC Active:", getGpcActiveString(8));
console.log("Virginia Standard:", getStandardString(9));
console.log("Virginia GPC Active:", getGpcActiveString(9));
