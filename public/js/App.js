import { html, useState, useEffect, useCallback } from './preact-config.js';
import AdSlot from './components/AdSlot.js';
import LogPanel from './components/LogPanel.js';
import PrivacyDashboard from './components/PrivacyDashboard.js';
import { JURISDICTIONS } from './constants/jurisdictions.js';

const PREBID_TIMEOUT = 2000;

function App() {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('Ready');
    const [winner, setWinner] = useState(null);
    const [isAuctionRunning, setIsAuctionRunning] = useState(false);
    const [jurisdiction, setJurisdiction] = useState('none');
    const [gpcActive, setGpcActive] = useState(false);

    useEffect(() => {
        const gpc = navigator.globalPrivacyControl === true || 
                    navigator.globalPrivacyControl === '1' ||
                    window.globalPrivacyControl === true;
        setGpcActive(gpc);
    }, []);

    const addLog = useCallback((msg, type = 'event', details = null) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const ms = now.getMilliseconds().toString().padStart(3, '0');
        const ts = `${timeStr}.${ms}`;
        setLogs(prevLogs => [...prevLogs, { ts, msg, type, details }]);
    }, []);

    const trackEvent = useCallback((eventName, data) => {
        console.log(`[KPI Tracker] Event: ${eventName}`, data);
        addLog(`KPI Measurement Logged: ${eventName}`, "event", data);
    }, [addLog]);

    useEffect(() => {
        const pbjs = window.pbjs || {};
        pbjs.que = pbjs.que || [];

        const adUnits = [{
            code: 'ad-slot-1',
            mediaTypes: { banner: { sizes: [[300, 250]] } },
            bids: [
                { bidder: 'appnexus', params: { placementId: 13144370 } },
                { bidder: 'rubicon', params: { accountId: 14062, siteId: 70608, zoneId: 335918 } },
                { bidder: 'openx', params: { unit: '538073155', delDomain: 'se-demo-d.openx.net' } }
            ]
        }];

        pbjs.que.push(() => {
            if (pbjs.removeAdUnit) {
                pbjs.removeAdUnit('ad-slot-1');
            }
            pbjs.addAdUnits(adUnits);

            const gppString = gpcActive && JURISDICTIONS[jurisdiction].gppStringGpc 
                ? JURISDICTIONS[jurisdiction].gppStringGpc 
                : JURISDICTIONS[jurisdiction].gppString;

            const gppConfig = jurisdiction !== 'none' ? {
                gpp: {
                    cmpApi: 'static',
                    consentData: {
                        gppString: gppString,
                        applicableSections: JURISDICTIONS[jurisdiction].applicableSections
                    }
                }
            } : {};

            pbjs.setConfig({
                priceGranularity: 'medium',
                debug: true,
                consentManagement: gppConfig
            });

            addLog(`BidLab Prebid Engine Initialized (Mode: ${JURISDICTIONS[jurisdiction].name})`, "event");
            if (jurisdiction !== 'none') {
                addLog(`GPP System Configured: ${gppString}`, "privacy");
            }
        });
    }, [addLog, jurisdiction, gpcActive]);

    const handleBids = useCallback((bidResponses) => {
        const responses = window.pbjs.getBidResponses();
        const slotBids = responses['ad-slot-1'] ? responses['ad-slot-1'].bids : [];
        const finalBids = [...slotBids, ...(window._simulatedBids || [])];
        
        addLog(`Auction lifecycle complete (${finalBids.length} bids total)`, "event");
        finalBids.sort((a, b) => b.cpm - a.cpm);
        
        finalBids.forEach(bid => {
            addLog(`Bid: ${bid.bidder} - $${bid.cpm.toFixed(2)} (${bid.timeToRespond}ms)`, "bid", bid.ortbBid || bid);
        });

        const highestBid = finalBids[0];
        
        if (highestBid) {
            addLog(`Winner: ${highestBid.bidder} ($${highestBid.cpm.toFixed(2)})`, "bid");
            setWinner(highestBid);
            setStatus(`Served by ${highestBid.bidder}`);
            
            trackEvent('demo_complete', {
                bidder: highestBid.bidder,
                cpm: highestBid.cpm,
                jurisdiction: jurisdiction
            });
        } else {
            addLog("No bids returned - simulation failed", "error");
            setStatus("No Bids");
        }
        setIsAuctionRunning(false);
    }, [addLog, trackEvent, jurisdiction]);

    const simulateBidding = () => {
        const bidders = ['appnexus', 'rubicon', 'openx'];
        window._simulatedBids = [];
        
        addLog("Simulating distributed bid adapters...", "event");
        
        const promises = bidders.map(bidder => {
            return new Promise(resolve => {
                const cpm = (Math.random() * 8 + 2).toFixed(2);
                const latency = Math.floor(Math.random() * 800) + 100;
                
                setTimeout(() => {
                    const gppString = gpcActive && JURISDICTIONS[jurisdiction].gppStringGpc 
                        ? JURISDICTIONS[jurisdiction].gppStringGpc 
                        : JURISDICTIONS[jurisdiction].gppString;

                    const bidResponse = {
                        bidder: bidder,
                        cpm: parseFloat(cpm),
                        latency: latency,
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

                    const openRtbBidResponse = {
                        id: `resp-${Math.random().toString(36).substring(2, 10)}`,
                        seatbid: [{
                            seat: bidder,
                            bid: [{
                                id: `bid-${Math.random().toString(36).substring(2, 10)}`,
                                impid: "1",
                                price: parseFloat(cpm),
                                adm: `<html><body style="margin:0;padding:0;background:#0f172a;display:flex;align-items:center;justify-content:center;height:250px;border:2px solid #3b82f6;border-radius:8px;box-sizing:border-box;"><div style="text-align:center;color:white;font-family:sans-serif;"><div style="font-weight:bold;font-size:24px;margin-bottom:8px;">${bidder.toUpperCase()}</div><div style="color:#60a5fa;font-size:18px;">WINNING BID: ${cpm}</div><div style="font-size:12px;margin-top:12px;opacity:0.7;">Rendered via BidLab Mock Adapter</div><div style="font-size:10px;margin-top:4px;color:#94a3b8;">Jurisdiction: ${JURISDICTIONS[jurisdiction].name}</div></div></body></html>`,
                                crid: `crid-${bidder}-001`,
                                w: 300,
                                h: 250,
                                adomain: [`${bidder}.com`]
                            }]
                        }],
                        cur: "USD"
                    };

                    const mockBid = {
                        bidder: bidder,
                        cpm: parseFloat(cpm),
                        timeToRespond: latency,
                        ad: openRtbBidResponse.seatbid[0].bid[0].adm,
                        width: 300,
                        height: 250,
                        adUnitCode: 'ad-slot-1',
                        ortbBid: openRtbBidResponse.seatbid[0].bid[0]
                    };
                    
                    window._simulatedBids.push(mockBid);
                    addLog(`Inbound bid from adapter: ${bidder}`, "event", openRtbBidResponse);
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
        addLog("Starting Prebid.js Distributed Auction", "event");

        if (gpcActive) {
            addLog("Global Privacy Control (GPC) enforcement active", "privacy");
        }

        const gppString = gpcActive && JURISDICTIONS[jurisdiction].gppStringGpc 
            ? JURISDICTIONS[jurisdiction].gppStringGpc 
            : JURISDICTIONS[jurisdiction].gppString;

        const openRtbRequest = {
            regs: {
                gpc: gpcActive ? '1' : '0',
                ...(jurisdiction !== 'none' ? {
                    gpp: gppString,
                    gpp_sid: JURISDICTIONS[jurisdiction].applicableSections
                } : {})
            }
        };
        addLog(`OpenRTB BidRequest serialized with privacy regs`, "privacy", openRtbRequest);
        
        const simulationPromise = simulateBidding();

        window.pbjs.que.push(() => {
            window.pbjs.requestBids({
                timeout: PREBID_TIMEOUT,
                bidsBackHandler: async (bids) => {
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
                <header class="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/80 pb-8 relative">
                    <div class="absolute -bottom-px left-0 w-32 h-px bg-gradient-to-r from-bidlab-500 to-transparent"></div>
                    <div>
                        <div class="flex items-center gap-3 justify-center md:justify-start mb-2 text-left">
                            <div class="w-10 h-10 bg-bidlab-600 rounded-lg flex items-center justify-center shadow-lg shadow-bidlab-600/30 ring-1 ring-white/10">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" class="w-6 h-6 text-white">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h1 class="text-4xl font-black tracking-tighter text-white">
                                Bid<span class="text-bidlab-500">Lab</span>
                            </h1>
                        </div>
                        <p class="text-slate-400 text-lg max-w-md text-left font-medium">
                            Real-time Header Bidding & Privacy Signal Playground.
                        </p>
                    </div>

                    <div class="flex flex-wrap justify-center gap-3">
                        <button 
                            onClick=${runAuction} 
                            disabled=${isAuctionRunning}
                            class=${`px-6 py-3 rounded-xl font-black transition-all duration-200 flex items-center gap-2 shadow-lg tracking-tight ${
                                isAuctionRunning 
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                                : 'bg-bidlab-600 hover:bg-bidlab-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-bidlab-600/20 ring-1 ring-white/20'
                            }`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" class=${`w-5 h-5 ${isAuctionRunning ? 'animate-spin' : ''}`}>
                                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path d="M12 7v5l3 3" />
                            </svg>
                            ${isAuctionRunning ? 'Auctioning...' : 'Trigger Auction'}
                        </button>
                        <button 
                            onClick=${resetDemo}
                            class="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black transition-all duration-200 border border-slate-700/80 shadow-md tracking-tight"
                        >
                            Reset Lab
                        </button>
                    </div>
                </header>

                <div class="mb-12">
                    <${PrivacyDashboard} 
                        activeJurisdiction=${jurisdiction} 
                        onJurisdictionChange=${setJurisdiction} 
                        gpcActive=${gpcActive}
                        onGpcToggle=${() => {
                            setGpcActive(!gpcActive);
                            addLog(`GPC simulation state changed to ${!gpcActive ? 'ACTIVE' : 'INACTIVE'}`, "privacy");
                        }}
                    />
                </div>

                <main class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- Left Column: Ad Canvas -->
                    <div class="lg:col-span-7 xl:col-span-8 space-y-8 text-left">
                        <div class="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50 backdrop-blur-sm shadow-xl relative overflow-hidden">
                             <div class="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <svg class="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L3 7v9c0 5 9 8 9 8s9-3 9-8V7l-9-5z" />
                                </svg>
                            </div>
                            <div class="flex items-center justify-between mb-8 relative z-10">
                                <h2 class="text-xl font-black text-white flex items-center gap-3 uppercase tracking-widest">
                                    <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                    Live Ad Canvas
                                </h2>
                                <div class="px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">
                                    Slot: 300x250_BTF
                                </div>
                            </div>
                            
                            <div class="flex justify-center relative z-10">
                                <${AdSlot} 
                                    id="ad-slot-1" 
                                    winner=${winner} 
                                    status=${status}
                                />
                            </div>
                        </div>

                        <!-- Info Card -->
                        <div class="p-7 bg-slate-800/30 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
                             <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg class="w-12 h-12 text-bidlab-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.428 1.428a2 2 0 002.828 0l1.428-1.428a2 2 0 00.547-1.022l.477-2.387a2 2 0 00-1.414-1.96l-2.387-.477a2 2 0 00-1.022.547l-1.428 1.428a2 2 0 000 2.828l1.428 1.428z" />
                                </svg>
                            </div>
                            <h3 class="text-xs font-black text-bidlab-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
                                <span class="w-2 h-2 bg-bidlab-500 rounded-full"></span>
                                Technical Context
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div>
                                    <p class="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Prebid Timeout</p>
                                    <p class="text-slate-300 text-sm font-mono font-bold italic">${PREBID_TIMEOUT}ms</p>
                                </div>
                                <div>
                                    <p class="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">CMP Engine</p>
                                    <p class="text-slate-300 text-sm font-bold">GPP Static CMP v1.1</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Monitoring -->
                    <div class="lg:col-span-5 xl:col-span-4 space-y-6 text-left">
                        <${LogPanel} logs=${logs} />
                        
                        <!-- CTA Card -->
                        <div class="bg-gradient-to-br from-bidlab-600 to-blue-700 rounded-3xl p-7 shadow-xl shadow-bidlab-900/20 text-white relative overflow-hidden group border border-white/10">
                            <div class="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <h3 class="text-2xl font-black mb-3 relative z-10 tracking-tight">Need a Custom Setup?</h3>
                            <p class="text-blue-100 text-sm mb-8 relative z-10 opacity-90 leading-relaxed font-medium">
                                We help publishers build complex Prebid integrations for Video, Native, and AMP.
                            </p>
                            <button 
                                onClick=${() => alert("Consultation request received! Our ad tech experts will contact you shortly.")}
                                class="w-full py-4 bg-white text-bidlab-700 font-black rounded-xl hover:bg-blue-50 transition-colors shadow-lg relative z-10 uppercase tracking-widest text-[11px]"
                            >
                                Contact Experts
                            </button>
                        </div>
                    </div>
                </main>
                
                <footer class="mt-20 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] pb-12">
                    <p>© 2026 BidLab • Built with Preact & Prebid.js • v2.6.4</p>
                </footer>
            </div>
        </div>
    `;
}

export default App;
