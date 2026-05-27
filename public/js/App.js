import { html, useState, useEffect, useCallback } from './preact-config.js';
import AdSlot from './components/AdSlot.js';
import LogPanel from './components/LogPanel.js';

const PREBID_TIMEOUT = 2000;

function App() {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('Ready');
    const [winner, setWinner] = useState(null);
    const [isAuctionRunning, setIsAuctionRunning] = useState(false);

    const addLog = useCallback((msg, type = 'event', details = null) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const ms = now.getMilliseconds().toString().padStart(3, '0');
        const ts = `${timeStr}.${ms}`;
        setLogs(prevLogs => [...prevLogs, { ts, msg, type, details }]);
    }, []);

    const trackEvent = useCallback((eventName, data) => {
        console.log(`[KPI Tracker] Event: ${eventName}`, data);
        addLog(`KPI Logged: ${eventName}`, "event");
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
                { bidder: 'appnexus', params: { placementId: 13144370 } },
                { bidder: 'rubicon', params: { accountId: 14062, siteId: 70608, zoneId: 335918 } },
                { bidder: 'openx', params: { unit: '538073155', delDomain: 'se-demo-d.openx.net' } }
            ]
        }];

        pbjs.que.push(() => {
            pbjs.addAdUnits(adUnits);
            pbjs.setConfig({
                priceGranularity: 'medium',
                debug: true
            });
            addLog("BidLab Prebid Engine Initialized", "event");
        });
    }, [addLog]);

    const handleBids = useCallback((bidResponses) => {
        // In this demo, we use a hybrid approach:
        // 1. We look at real Prebid responses (if any)
        // 2. We supplement with our own simulated bidders for the demonstration
        
        const responses = window.pbjs.getBidResponses();
        const slotBids = responses['ad-slot-1'] ? responses['ad-slot-1'].bids : [];
        
        // Merge with simulated bids
        const finalBids = [...slotBids, ...(window._simulatedBids || [])];
        
        addLog(`Auction lifecycle complete (${finalBids.length} bids total)`, "event");

        finalBids.sort((a, b) => b.cpm - a.cpm);
        
        finalBids.forEach(bid => {
            addLog(`Bid: ${bid.bidder} - ${bid.cpm.toFixed(2)} (${bid.timeToRespond}ms)`, "bid", bid);
        });

        const highestBid = finalBids[0];
        
        if (highestBid) {
            addLog(`Winner: ${highestBid.bidder} (${highestBid.cpm.toFixed(2)})`, "bid");
            setWinner(highestBid);
            setStatus(`Served by ${highestBid.bidder}`);
            
            trackEvent('demo_complete', {
                bidder: highestBid.bidder,
                cpm: highestBid.cpm
            });
        } else {
            addLog("No bids returned - simulation failed", "error");
            setStatus("No Bids");
        }
        setIsAuctionRunning(false);
    }, [addLog, trackEvent]);

    const simulateBidding = () => {
        const bidders = ['appnexus', 'rubicon', 'openx'];
        window._simulatedBids = [];
        
        addLog("Simulating distributed bid adapters...", "event");
        
        const promises = bidders.map(bidder => {
            return new Promise(resolve => {
                const cpm = (Math.random() * 8 + 2).toFixed(2);
                const latency = Math.floor(Math.random() * 800) + 100;
                
                setTimeout(() => {
                    const mockBid = {
                        bidder: bidder,
                        cpm: parseFloat(cpm),
                        timeToRespond: latency,
                        ad: `<html><body style="margin:0;padding:0;background:#0f172a;display:flex;align-items:center;justify-content:center;height:250px;border:2px solid #3b82f6;border-radius:8px;box-sizing:border-box;"><div style="text-align:center;color:white;font-family:sans-serif;"><div style="font-weight:bold;font-size:24px;margin-bottom:8px;">${bidder.toUpperCase()}</div><div style="color:#60a5fa;font-size:18px;">WINNING BID: ${cpm}</div><div style="font-size:12px;margin-top:12px;opacity:0.7;">Rendered via BidLab Mock Adapter</div></div></body></html>`,
                        width: 300,
                        height: 250,
                        adUnitCode: 'ad-slot-1'
                    };
                    window._simulatedBids.push(mockBid);
                    addLog(`Inbound bid from adapter: ${bidder}`, "event", mockBid);
                    resolve();
                }, latency);
            });
        });

        return Promise.all(promises);
    };

    const runAuction = () => {
        if (!window.pbjs) {
            addLog("Error: Prebid.js library blocked or missing", "error");
            return;
        }
        
        setIsAuctionRunning(true);
        setWinner(null);
        setStatus("Auctioning...");
        addLog("Starting Prebid.js Auction...", "event");

        // Log OpenRTB BidRequest for debugging
        const openRtbRequest = {
            id: `req-${Math.random().toString(36).substring(2, 10)}`,
            at: 2,
            tmax: PREBID_TIMEOUT,
            imp: [{
                id: "1",
                banner: {
                    w: 300,
                    h: 250,
                    format: [{w: 300, h: 250}]
                },
                bidfloor: 0.10
            }],
            site: {
                id: "bidlab-demo",
                domain: "bidlab.ai",
                page: window.location.href
            },
            device: {
                ua: navigator.userAgent,
                language: navigator.language
            },
            user: {
                id: "user-mock-123"
            }
        };
        addLog("OpenRTB BidRequest generated", "event", openRtbRequest);
        
        // Start simulation
        const simulationPromise = simulateBidding();

        window.pbjs.que.push(() => {
            window.pbjs.requestBids({
                timeout: PREBID_TIMEOUT,
                bidsBackHandler: async (bids) => {
                    // Ensure simulation is finished before handling bids
                    await simulationPromise;
                    handleBids(bids);
                }
            });
        });
    };

    const resetDemo = () => {
        window.location.reload();
    };

    return html`
        <div class="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-bidlab-500/30">
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
                            Interactive Header Bidding Demonstration & Debugger.
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
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class=${`w-5 h-5 ${isAuctionRunning ? 'animate-spin' : ''}`}>
                                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path d="M12 7v5l3 3" />
                            </svg>
                            ${isAuctionRunning ? 'Auctioning...' : 'Run Auction'}
                        </button>
                        <button 
                            onClick=${resetDemo}
                            class="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all duration-200 border border-slate-700 shadow-lg"
                        >
                            Reset
                        </button>
                    </div>
                </header>

                <main class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- Left Column: Ad Canvas -->
                    <div class="lg:col-span-7 xl:col-span-8 space-y-8">
                        <div class="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50 backdrop-blur-sm shadow-xl">
                            <div class="flex items-center justify-between mb-8">
                                <h2 class="text-xl font-bold text-white flex items-center gap-2">
                                    <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Live Ad Canvas
                                </h2>
                                <div class="px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-400">
                                    Slot: 300x250_BTF
                                </div>
                            </div>
                            
                            <div class="flex justify-center">
                                <${AdSlot} 
                                    id="ad-slot-1" 
                                    winner=${winner} 
                                    status=${status}
                                />
                            </div>
                        </div>

                        <!-- Info Cards -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                                <h3 class="text-sm font-bold text-bidlab-400 uppercase tracking-wider mb-2">Price Granularity</h3>
                                <p class="text-slate-400 text-sm italic font-serif">"medium" ($0.10 steps)</p>
                            </div>
                            <div class="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                                <h3 class="text-sm font-bold text-bidlab-400 uppercase tracking-wider mb-2">Timeout</h3>
                                <p class="text-slate-400 text-sm italic font-serif">${PREBID_TIMEOUT}ms</p>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Monitoring -->
                    <div class="lg:col-span-5 xl:col-span-4 space-y-6">
                        <${LogPanel} logs=${logs} />
                        
                        <!-- CTA Card -->
                        <div class="bg-gradient-to-br from-bidlab-600 to-blue-700 rounded-3xl p-6 shadow-xl shadow-bidlab-900/20 text-white relative overflow-hidden group">
                            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                            <h3 class="text-xl font-black mb-2 relative z-10">Need a Custom Setup?</h3>
                            <p class="text-blue-100 text-sm mb-6 relative z-10 opacity-90">
                                We help publishers build complex Prebid integrations for Video, Native, and AMP.
                            </p>
                            <button 
                                onClick=${() => alert("Consultation request received! Our ad tech experts will contact you shortly.")}
                                class="w-full py-3 bg-white text-bidlab-700 font-black rounded-xl hover:bg-blue-50 transition-colors shadow-lg relative z-10"
                            >
                                Contact Experts
                            </button>
                        </div>
                    </div>
                </main>
                
                <footer class="mt-16 text-center text-slate-500 text-sm pb-8">
                    <p>© 2026 BidLab • Built with Preact & Prebid.js</p>
                </footer>
            </div>
        </div>
    `;
}

export default App;
