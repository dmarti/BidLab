
const JURISDICTIONS = {
    'eu_tcf': {
        gppString: 'DBAAABA~CP1A6aAP1A6aAAMAAAENACCAAAAAAAAAAAAA',
        applicableSections: [2]
    },
    'us_nat': {
        gppString: 'DBABLA~BVqqmSIA',
        applicableSections: [7]
    },
    'us_ca': {
        gppString: 'DBABMA~BVqqmSIA',
        applicableSections: [8]
    },
    'us_va': {
        gppString: 'DBABNA~BVqqmSIA',
        applicableSections: [9]
    }
};

const validateGPPString = (gppString, expectedSections) => {
    const errors = [];
    
    if (!gppString || typeof gppString !== 'string') {
        return { valid: false, errors: ["GPP string must be a non-empty string"] };
    }

    if (!gppString.startsWith('DB')) {
        errors.push("GPP string must start with 'DB'");
    }

    const sections = gppString.split('~');
    
    // Validate Base64URL for each section
    const base64UrlRegex = /^[A-Za-z0-9\-_]+$/;
    sections.forEach((section, i) => {
        if (!base64UrlRegex.test(section)) {
            errors.push(`Section ${i} is not a valid Base64URL string: "${section}"`);
        }
    });

    // Check header section (simplified)
    // DBAAABA -> Section 2
    // DBABLA -> Section 7
    // DBABMA -> Section 8
    // DBABNA -> Section 9
    const header = sections[0];
    if (expectedSections.includes(2) && header !== 'DBAAABA') {
        errors.push(`Expected header 'DBAAABA' for section 2, got '${header}'`);
    }
    if (expectedSections.includes(7) && header !== 'DBABLA') {
        errors.push(`Expected header 'DBABLA' for section 7, got '${header}'`);
    }
    if (expectedSections.includes(8) && header !== 'DBABMA') {
        errors.push(`Expected header 'DBABMA' for section 8, got '${header}'`);
    }
    if (expectedSections.includes(9) && header !== 'DBABNA') {
        errors.push(`Expected header 'DBABNA' for section 9, got '${header}'`);
    }

    return { valid: errors.length === 0, errors };
};

console.log("Starting GPP String Validation Tests...");

let overallPassed = true;

for (const [key, jurisdiction] of Object.entries(JURISDICTIONS)) {
    const result = validateGPPString(jurisdiction.gppString, jurisdiction.applicableSections);
    console.log(`Testing ${key}: ${jurisdiction.gppString}`);
    if (result.valid) {
        console.log(`✅ ${key} passed`);
    } else {
        console.error(`❌ ${key} failed:`, result.errors);
        overallPassed = false;
    }
}

// Test negative case (invalid characters)
const invalidString = 'DBABMA~BVaaaaaa.QA';
console.log(`Testing invalid string: ${invalidString}`);
const invalidResult = validateGPPString(invalidString, [8]);
if (!invalidResult.valid && invalidResult.errors.some(e => e.includes("not a valid Base64URL"))) {
    console.log(`✅ Negative test passed (detected invalid characters)`);
} else {
    console.error(`❌ Negative test failed: expected error for invalid characters`);
    overallPassed = false;
}

if (overallPassed) {
    console.log("\nAll GPP validation tests passed!");
    process.exit(0);
} else {
    console.error("\nSome GPP validation tests failed.");
    process.exit(1);
}
