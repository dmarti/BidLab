
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

async function testPrebidLoad() {
    console.log("Running Prebid.js Load Test...");
    
    const filesToTest = ['index.html', 'dist/index.html'];

    for (const fileName of filesToTest) {
        console.log(`Testing ${fileName}...`);
        const filePath = path.join(process.cwd(), fileName);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            process.exit(1);
        }
        const html = fs.readFileSync(filePath, 'utf8');
        
        // Mock the environment
        const dom = new JSDOM(html, {
            runScripts: "dangerously",
            resources: "usable"
        });
        
        const { window } = dom;
        
        // Check if pbjs and pbjs.que are initialized by the inline script
        if (window.pbjs && Array.isArray(window.pbjs.que)) {
            console.log(`✅ Prebid.js global object and queue initialized correctly in ${fileName}`);
        } else {
            console.error(`❌ Prebid.js global object or queue NOT initialized in ${fileName}`);
            process.exit(1);
        }
    }
    
    console.log("✅ All Prebid.js load tests passed!");
}

testPrebidLoad().catch(err => {
    console.error(err);
    process.exit(1);
});
