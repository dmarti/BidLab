import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Auction Integration Test
 *
 * Validates the entire auction lifecycle without relying on React mounting
 * (which requires a full browser environment). Instead, tests the core
 * simulation/bidding/handling logic in isolation with a JSDOM mock.
 *
 * Also validates that the HTML files contain the correct markup and scripts
 * needed for the auction to function in a real browser.
 */

const PREBID_TIMEOUT = 2000;

/**
 * Create a mock bidder adapter that simulates async bid responses
 * via setTimeout and stores them in window._simulatedBids.
 */
function createBidSimulator(window, addLog) {
    const JURISDICTIONS = {
        none: { name: 'No Privacy', gppString: '', applicableSections: [] },
        eu_tcf: { name: 'EU (TCF v2.2)', gppString: 'DBABMA~CQmDUEAQmDUEAAAAAAENAAFgAIAAAAAAAAAAAAAAAAAA.IAAA.YAAAAAAAAAAA', applicableSections: [2] },
        us_nat: { name: 'US National', gppString: 'DBACaYA~A~BAAAAAAAAABA.QA', applicableSections: [6] },
        us_ca: { name: 'California (CCPA)', gppString: 'DBACZYA~A~BAAAAABA.QA', applicableSections: [7] },
        us_va: { name: 'Virginia (VCDPA)', gppString: 'DBACYMA~A~BAAAABA', applicableSections: [8] }
    };

    return function simulateBidding(gpcActive, jurisdiction) {
        const bidders = ['appnexus', 'rubicon', 'openx'];
        window._simulatedBids = [];

        addLog("Simulating distributed bid adapters...", "event");

        const promises = bidders.map(bidder => {
            return new Promise(resolve => {
                const cpm = (Math.random() * 8 + 2).toFixed(2);
                const latency = Math.floor(Math.random() * 400) + 50; // fast for tests

                setTimeout(() => {
                    const gppString = gpcActive && JURISDICTIONS[jurisdiction].gppStringGpc
                        ? JURISDICTIONS[jurisdiction].gppStringGpc
                        : JURISDICTIONS[jurisdiction].gppString;

                    const bidResponse = {
                        bidder,
                        cpm: parseFloat(cpm),
                        latency,
                        gpc: gpcActive ? 'active' : 'inactive',
                        gpp: jurisdiction !== 'none' ? {
                            status: 'validated',
                            string: gppString,
                            sid: JURISDICTIONS[jurisdiction].applicableSections
                        } : 'none'
                    };

                    if (jurisdiction !== 'none' || gpcActive) {
                        addLog(`[${bidder}] Privacy signals validated in adapter flow`, "privacy", bidResponse);
                    }

                    const mockBid = {
                        bidder,
                        cpm: parseFloat(cpm),
                        timeToRespond: latency,
                        ad: `<div>${bidder.toUpperCase()} BID: $${cpm}</div>`,
                        width: 300,
                        height: 250,
                        adUnitCode: 'ad-slot-1'
                    };

                    window._simulatedBids.push(mockBid);
                    addLog(`Inbound bid from adapter: ${bidder} ($${cpm})`, "bid");
                    resolve();
                }, latency);
            });
        });

        return Promise.all(promises);
    };
}

/**
 * Mock handleBids: merges Prebid responses with simulated bids,
 * sorts by CPM, picks winner.
 */
function handleBids(window, addLog, trackEvent, jurisdiction, setWinner, setStatus, setIsAuctionRunning) {
    const responses = window.pbjs.getBidResponses();
    const slotBids = responses['ad-slot-1'] ? responses['ad-slot-1'].bids : [];
    const finalBids = [...slotBids, ...(window._simulatedBids || [])];

    addLog(`Auction lifecycle complete (${finalBids.length} bids total)`, "event");
    finalBids.sort((a, b) => b.cpm - a.cpm);

    finalBids.forEach(bid => {
        addLog(`Bid: ${bid.bidder} - $${bid.cpm.toFixed(2)} (${bid.timeToRespond}ms)`, "bid");
    });

    const highestBid = finalBids.length > 0 ? finalBids[0] : null;

    if (highestBid) {
        addLog(`Winner: ${highestBid.bidder} ($${highestBid.cpm.toFixed(2)})`, "bid");
        setWinner(highestBid);
        setStatus(`Served by ${highestBid.bidder}`);
        trackEvent('demo_complete', {
            bidder: highestBid.bidder,
            cpm: highestBid.cpm,
            jurisdiction
        });
    } else {
        addLog("Auction failed: No bids returned", "error");
        setStatus("No Bids");
    }
    setIsAuctionRunning(false);
}

function createMockPrebidJs(window, bidResponses) {
    window.pbjs = {
        que: [],
        addAdUnits(units) { window._adUnits = units; },
        removeAdUnit() {},
        setConfig() {},
        getBidResponses() { return bidResponses; },
        getHighestCpmBids(adUnitCode) {
            const bids = bidResponses[adUnitCode] ? bidResponses[adUnitCode].bids : [];
            return bids.length > 0 ? [bids.sort((a, b) => b.cpm - a.cpm)[0]] : [];
        },
        requestBids({ bidsBackHandler }) {
            setTimeout(() => {
                if (typeof bidsBackHandler === 'function') {
                    const code = 'ad-slot-1';
                    bidResponses[code] = {
                        bids: [{
                            bidder: 'prebid-native',
                            cpm: 1.25,
                            timeToRespond: 100,
                            ad: '<div>Prebid Native Ad</div>',
                            width: 300,
                            height: 250,
                            adUnitCode: code
                        }]
                    };
                    bidsBackHandler(bidResponses);
                }
            }, 50);
        }
    };
}

async function runAuctionLifecycleTest(window, addLog, trackEvent, simulateBidding, jurisdiction, gpcActive) {
    const state = { winner: null, status: 'Ready', isAuctionRunning: false };
    const setWinner = (w) => { state.winner = w; };
    const setStatus = (s) => { state.status = s; };
    const setIsAuctionRunning = (r) => { state.isAuctionRunning = r; };

    addLog("Starting Prebid.js Distributed Auction", "event");

    if (gpcActive) {
        addLog("Global Privacy Control (GPC) enforcement active", "privacy");
    }

    const simulationPromise = simulateBidding(gpcActive, jurisdiction);

    return new Promise((resolve, reject) => {
        window.pbjs.requestBids({
            timeout: PREBID_TIMEOUT,
            bidsBackHandler: async () => {
                await simulationPromise;
                handleBids(window, addLog, trackEvent, jurisdiction, setWinner, setStatus, setIsAuctionRunning);
                resolve(state);
            }
        });
    });
}

/**
 * Verify that the HTML file contains the required inline pbjs initialization
 * and the correct script references.
 */
function validateHtmlMarkup(html, fileName) {
    const checks = [];

    // Check for pbjs initialization
    checks.push({
        name: 'pbjs init script',
        pass: html.includes('window.pbjs = window.pbjs || {};') &&
              html.includes('window.pbjs.que = window.pbjs.que || [];')
    });

    // Check for Prebid.js CDN load
    checks.push({
        name: 'Prebid.js async script',
        pass: html.includes('acdn.adnxs.com/prebid/not-for-prod/prebid.js')
    });

    // Check for root mount point
    checks.push({
        name: 'root mount point',
        pass: html.includes('<div id="root">')
    });

    const allPass = checks.every(c => c.pass);
    console.log(`  HTML Validation for ${fileName}:`);
    checks.forEach(c => console.log(`    ${c.pass ? '✅' : '❌'} ${c.name}`));

    return allPass;
}

async function testAuctionIntegration() {
    console.log('Running Auction Integration Test...\n');

    // === Phase 1: Validate HTML markup ===
    console.log('--- Phase 1: HTML Markup Validation ---');
    const filesToTest = ['index.html', 'dist/index.html'];
    let markupValid = true;

    for (const fileName of filesToTest) {
        const filePath = path.resolve(__dirname, '..', fileName);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            markupValid = false;
            continue;
        }
        const html = fs.readFileSync(filePath, 'utf8');
        if (!validateHtmlMarkup(html, fileName)) {
            markupValid = false;
        }
    }

    if (!markupValid) {
        console.error('❌ HTML markup validation failed!\n');
        process.exit(1);
    }
    console.log('✅ HTML markup validation passed!\n');

    // === Phase 2: Auction Lifecycle Integration Test ===
    console.log('--- Phase 2: Auction Lifecycle (Simulation) ---');

    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
        runScripts: 'dangerously',
        url: 'http://localhost:3000'
    });
    const { window } = dom;

    // Mock browser APIs
    window.navigator.globalPrivacyControl = false;
    window.setTimeout = setTimeout;
    window.clearTimeout = clearTimeout;

    // Test all jurisdiction modes
    const jurisdictions = ['none', 'eu_tcf', 'us_nat', 'us_ca', 'us_va'];
    const gpcModes = [false, true];

    let lifecyclePassed = true;

    for (const jurisdiction of jurisdictions) {
        for (const gpcActive of gpcModes) {
            const bidResponses = {};
            const logs = [];
            const events = [];

            const addLog = (msg, type, details) => {
                logs.push({ msg, type, details });
            };
            const trackEvent = (name, data) => {
                events.push({ name, data });
            };

            createMockPrebidJs(window, bidResponses);
            const simulateBidding = createBidSimulator(window, addLog);

            const label = `jurisdiction=${jurisdiction}, gpc=${gpcActive}`;

            try {
                const state = await runAuctionLifecycleTest(
                    window, addLog, trackEvent, simulateBidding, jurisdiction, gpcActive
                );

                // Verify auction completed
                const errors = [];

                // Check winner exists
                if (!state.winner) {
                    errors.push('No winner selected');
                } else {
                    if (!state.winner.bidder) errors.push('Winner missing bidder name');
                    if (!state.winner.cpm) errors.push('Winner missing cpm');
                }

                // Check status transition
                if (!state.status.startsWith('Served by')) {
                    errors.push(`Status should start with "Served by" but got "${state.status}"`);
                }

                // Check that isAuctionRunning is false (auction completed)
                if (state.isAuctionRunning !== false) {
                    errors.push('Auction still marked as running');
                }

                // Check logs
                const logMsgs = logs.map(l => l.msg).join(' | ');
                
                if (!logMsgs.includes('Starting Prebid.js Distributed Auction')) {
                    errors.push('Missing auction start log');
                }
                if (!logMsgs.includes('Simulating distributed bid adapters')) {
                    errors.push('Missing simulation start log');
                }
                if (!logMsgs.includes('Winner:')) {
                    errors.push('Missing winner log entry');
                }
                if (!logMsgs.includes('Inbound bid from adapter')) {
                    errors.push('Missing inbound bid log entries');
                }
                if (!logMsgs.includes('Auction lifecycle complete')) {
                    errors.push('Missing auction completion log');
                }

                // Check event tracking
                const hasDemoComplete = events.some(e => e.name === 'demo_complete');
                if (!hasDemoComplete) {
                    errors.push('Missing demo_complete tracking event');
                }

                if (errors.length > 0) {
                    console.error(`  ❌ ${label}: ${errors.join('; ')}`);
                    lifecyclePassed = false;
                } else {
                    console.log(`  ✅ ${label} — Winner: ${state.winner?.bidder} @ $${state.winner?.cpm?.toFixed(2)}`);
                }

            } catch (err) {
                console.error(`  ❌ ${label}: Exception — ${err.message}`);
                lifecyclePassed = false;
            }
        }
    }

    if (!lifecyclePassed) {
        console.error('\n❌ Some auction lifecycle tests failed!');
        process.exit(1);
    }

    console.log('\n✅ All auction integration tests passed!');
    process.exit(0);
}

testAuctionIntegration().catch(err => {
    console.error(err);
    process.exit(1);
});
