import { GppModel, HeaderV1 } from '@iabgpp/cmpapi';
import { JURISDICTIONS } from '../src/constants/jurisdictions.js';

const validateGPPString = (gppString, expectedSections) => {
    const errors = [];
    if (!gppString || typeof gppString !== 'string') {
        return { valid: false, errors: ["GPP string must be a non-empty string"] };
    }

    try {
        const headerPart = gppString.split('~')[0];
        const header = new HeaderV1(headerPart);
        const sectionIds = header.getFieldValue('SectionIds');

        expectedSections.forEach(id => {
            if (!sectionIds.includes(id)) {
                errors.push(`GPP string missing expected section ID ${id}. Found: ${sectionIds.join(', ')}`);
            }
        });

    } catch (e) {
        errors.push(`IAB Library Error: ${e.message}`);
    }

    return { valid: errors.length === 0, errors };
};

console.log("Starting IAB-compliant GPP String Validation Tests...");
let overallPassed = true;

for (const [key, jurisdiction] of Object.entries(JURISDICTIONS)) {
    if (jurisdiction.gppString === null) continue;

    // Test standard string
    const result = validateGPPString(jurisdiction.gppString, jurisdiction.applicableSections);
    console.log(`Testing ${key} (Standard): ${jurisdiction.gppString}`);
    if (result.valid) {
        console.log(`✅ ${key} passed`);
    } else {
        console.error(`❌ ${key} failed:`, result.errors);
        overallPassed = false;
    }

    // Test GPC string if available
    if (jurisdiction.gppStringGpc) {
        const resultGpc = validateGPPString(jurisdiction.gppStringGpc, jurisdiction.applicableSections);
        console.log(`Testing ${key} (GPC): ${jurisdiction.gppStringGpc}`);
        if (resultGpc.valid) {
            console.log(`✅ ${key} GPC passed`);
        } else {
            console.error(`❌ ${key} GPC failed:`, resultGpc.errors);
            overallPassed = false;
        }
    }
}

// Test negative cases
const negativeTests = [
    { name: 'Invalid characters', str: 'DBABMA~BVaaaaaa.QA!', sections: [8] },
    { name: 'Malformed header', str: 'INVALID_HEADER~BVqqmSIA', sections: [8] },
    { name: 'Section mismatch', str: 'DBABLA~BAAEAAAAAABA.QA', sections: [8] }
];

console.log("\nRunning negative tests...");
for (const test of negativeTests) {
    console.log(`Testing negative case: ${test.name} (${test.str})`);
    const result = validateGPPString(test.str, test.sections);
    if (!result.valid) {
        console.log(`✅ Negative test passed (detected expected error)`);
    } else {
        console.error(`❌ Negative test failed: expected error but string was validated`);
        overallPassed = false;
    }
}

if (overallPassed) {
    console.log("\nAll GPP validation tests passed!");
    process.exit(0);
} else {
    console.error("\nSome GPP validation tests failed.");
    process.exit(1);
}
