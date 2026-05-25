import { html, useState, useEffect, useCallback } from './preact-config.js';
import AdSlot from './components/AdSlot.js';
import LogPanel from './components/LogPanel.js';

const PREBID_TIMEOUT = 2000;

function App() {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('Ready');
    const [winner, setWinner] = useState(null);
    const [isAuctionRunning, setIsAuctionRunning] = useState(false);

    const addLog = useCallback((msg, type = 'event') => {
        const ts = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prevLogs => [...prevLogs, { ts, msg, type }]);
    }, []);

    const trackEvent = useCallback((eventName, data) => {
        // Mock tracking function to track KPIs like 'demo_complete'
        console.log(`[Mock Tracker] Event: ${eventName}`, data);
        addLog(`KPI Tracked: ${eventName}`, "event");
    }, [addLog]);

    useEffect(() => {
        const pbjs = window.pbjs || {};
        pbjs.que = pbjs.que || [];

        const adUnits = [{
            code: 'ad-slot-1',
            mediaTypes: {
                banner: {
                    sizes: [[300, 250]]
                }
            },
            bids: [
                {
                    bidder: 'appnexus',
                    params: { placementId: 13144370 }
                },
                {
                    bidder: 'rubicon',
                    params: { accountId: 14062, siteId: 70608, zoneId: 335918 }
                },
                {
                    bidder: 'openx',
                    params: { unit: '538073155', delDomain: 'se-demo-d.openx.net' }
                }
            ]
        }];

        pbjs.que.push(() => {
            pbjs.addAdUnits(adUnits);
            pbjs.setConfig({
                priceGranularity: 'medium',
                debug: true
            });
            addLog("BidLab Engine Initialized", "event");
            addLog("Adapters loaded: AppNexus, Rubicon, OpenX", "event");
        });
    }, [addLog]);

    const handleBids = useCallback(() => {
        const pbjs = window.pbjs;
        addLog("All bids received or timeout reached", "event");
        
        const responses = pbjs.getBidResponses();
        const slotBids = responses['ad-slot-1'] ? responses['ad-slot-1'].bids : [];
        
        slotBids.forEach(bid => {
            addLog(`Bid from ${bid.bidder}: $${bid.cpm} (${bid.timeToRespond}ms)`, "bid");
        });

        const highestBid = pbjs.getHighestCpmBids('ad-slot-1')[0];
        
        if (highestBid) {
            addLog(`Winner Selected: ${highestBid.bidder} at $${highestBid.cpm}`, "bid");
            setWinner(highestBid);
            setStatus(`Served by ${highestBid.bidder}`);
            addLog(`Creative rendered via ${highestBid.bidder} adapter`, "event");
            
            // Track successful auction completion for KPI tracking
            trackEvent('demo_complete', {
                bidder: highestBid.bidder,
                cpm: highestBid.cpm,
                latency: highestBid.timeToRespond
            });
        } else {
            addLog("Auction failed: No bids returned", "error");
            setStatus("No Bids");
        }
        setIsAuctionRunning(false);
    }, [addLog, trackEvent]);

    const runAuction = () => {
        const pbjs = window.pbjs;
        if (!pbjs) {
            addLog("Error: Prebid.js not loaded", "error");
            return;
        }
        setIsAuctionRunning(true);
        setWinner(null);
        setStatus("Auctioning...");
        addLog("Auction Started", "event");
        
        pbjs.que.push(() => {
            pbjs.requestBids({
                timeout: PREBID_TIMEOUT,
                bidsBackHandler: () => {
                    handleBids();
                }
            });
        });
    };

    const resetDemo = () => {
        window.location.reload();
    };

    return html`
        <div class="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-bidlab-500/30">
            {/* Background Decorative Elements */}
            <div class="fixed inset-0 overflow-hidden pointer-events-none">
                <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-bidlab-900/20 rounded-full blur-[120px]"></div>
                <div class="absolute top-[60%] -right-[5%] w-[30%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]"></div>
            </div>

            <div class="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
                <header class="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
                    <div>
                        <div class="flex items-center gap-3 justify-center md:justify-start mb-2">
                            <div class="w-10 h-10 bg-bidlab-600 rounded-lg flex items-center justify-center shadow-lg shadow-bidlab-600/20">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-6 h-6 text-white">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <h1 class="text-4xl font-black tracking-tight text-white">
                                Bid<span class="text-bidlab-500">Lab</span>
                            </h1>
                        </div>
                        <p class="text-slate-400 text-lg max-w-md">
                            Header Bidding Real-Time Demonstration & Interactive Lab.
                        </p>
                    </div>

                    <div class="flex flex-wrap justify-center gap-3">
                        <button 
                            onClick=${runAuction} 
                            disabled=${isAuctionRunning}
                            class=${`px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 shadow-lg ${
                                isAuctionRunning 
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                : 'bg-bidlab-600 hover:bg-bidlab-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-bidlab-600/20'
                            }`}
                        >
                            ${isAuctionRunning && html`
                                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            `}
                            ${isAuctionRunning ? 'Auction in Progress...' : 'Trigger Auction'}
                        </button>
                        <button 
                            onClick=${resetDemo}
                            class="px-6 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
                        >
                            Reset Lab
                        </button>
                    </div>
                </header>

                <main class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Log Panel */}
                    <div class="lg:col-span-7 order-2 lg:order-1">
                        <${LogPanel} logs=${logs} />
                    </div>

                    {/* Right Column: Ad Slot & Info */}
                    <div class="lg:col-span-5 order-1 lg:order-2 space-y-6">
                        <${AdSlot} winner=${winner} status=${status} />
                        
                        <div class="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm">
                            <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                                <svg class="w-5 h-5 text-bidlab-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Lab Mechanics
                            </h3>
                            <ul class="space-y-3 text-sm text-slate-400">
                                <li class="flex gap-3">
                                    <span class="flex-shrink-0 w-6 h-6 bg-slate-700 text-slate-300 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                    <p><strong class="text-slate-200">Prebid.js</strong> initializes and registers ad units in the window queue.</p>
                                </li>
                                <li class="flex gap-3">
                                    <span class="flex-shrink-0 w-6 h-6 bg-slate-700 text-slate-300 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                    <p><strong class="text-slate-200">Concurrent Requests</strong> are sent to multiple mock demand sources simultaneously.</p>
                                </li>
                                <li class="flex gap-3">
                                    <span class="flex-shrink-0 w-6 h-6 bg-slate-700 text-slate-300 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                    <p><strong class="text-slate-200">Unified Auction</strong> happens in-browser, selecting the highest valid bid.</p>
                                </li>
                                <li class="flex gap-3">
                                    <span class="flex-shrink-0 w-6 h-6 bg-slate-700 text-slate-300 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                    <p><strong class="text-slate-200">Instant Rendering</strong> occurs as the winning creative is injected into the secure iframe.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </main>

                <footer class="mt-16 text-center text-slate-500 text-sm border-t border-slate-800 pt-8">
                    <p>© 2026 BidLab • Interactive Prebid Documentation Environment</p>
                </footer>
            </div>
        </div>
    `;
}

export default App;
