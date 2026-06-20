import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import AdSlot from './components/AdSlot';
import LogPanel from './components/LogPanel';
import PrivacyDashboard from './components/PrivacyDashboard';

import { JURISDICTIONS } from "./constants/jurisdictions";

const PREBID_TIMEOUT = 2000;


function App() {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('Ready');
    const [winner, setWinner] = useState(null);
    const [isAuctionRunning, setIsAuctionRunning] = useState(false);
    const [jurisdiction, setJurisdiction] = useState('none');
    const [gpcActive, setGpcActive] = useState(false);

    useEffect(() => {
        // Detect Global Privacy Control (GPC)
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
        // Mock tracking function to track KPIs like 'demo_complete'
        console.log(`[Mock Tracker] Event: ${eventName}`, data);
        addLog(`KPI Measurement Logged: ${eventName}`, "event", data);
    }, [addLog]);

    const requestConsulting = () => {
        trackEvent('consulting_request', { timestamp: Date.now() });
        alert("Consultation request received! Our ad tech experts will contact you shortly.");
    };

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
            // Remove existing ad units to avoid duplicates on re-run
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

            addLog(`BidLab Engine Initialized (Mode: ${JURISDICTIONS[jurisdiction].name})`, "event");
            if (jurisdiction !== 'none') {
                addLog(`GPP System Configured: ${gppString}`, "privacy");
            }
            addLog("Adapters loaded: AppNexus, Rubicon, OpenX", "event");
        });
    }, [addLog, jurisdiction, gpcActive]);

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
                latency: highestBid.timeToRespond,
                jurisdiction: jurisdiction
            });
        } else {
            addLog("Auction failed: No bids returned", "error");
            setStatus("No Bids");
        }
        setIsAuctionRunning(false);
    }, [addLog, trackEvent, jurisdiction]);

    const injectMockBids = useCallback(() => {
        const pbjs = window.pbjs;
        const mockBidders = ['appnexus', 'rubicon', 'openx'];
        
        mockBidders.forEach(bidder => {
            const cpm = (Math.random() * 10 + 1).toFixed(2);
            const latency = Math.floor(Math.random() * 600) + 200;
            
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

                const bid = {
                    bidderCode: bidder,
                    width: 300,
                    height: 250,
                    statusMessage: 'Bid available',
                    adId: Math.random().toString(36).substring(2, 15),
                    cpm: parseFloat(cpm),
                    ad: `<html><body style="margin:0;padding:0;background:#0f172a;display:flex;align-items:center;justify-content:center;height:250px;border:2px solid #3b82f6;border-radius:8px;box-sizing:border-box;"><div style="text-align:center;color:white;font-family:sans-serif;"><div style="font-weight:bold;font-size:24px;margin-bottom:8px;">${bidder.toUpperCase()}</div><div style="color:#60a5fa;font-size:18px;">WINNING BID: ${cpm}</div><div style="font-size:12px;margin-top:12px;opacity:0.7;">Rendered via BidLab Mock Adapter</div><div style="font-size:10px;margin-top:4px;color:#94a3b8;">Jurisdiction: ${JURISDICTIONS[jurisdiction].name}</div></div></body></html>`,
                    currency: 'USD',
                    netRevenue: true,
                    ttl: 300,
                    creativeId: 'mock-creative-' + bidder,
                    requestId: 'mock-req-' + bidder,
                    auctionId: 'mock-auc-' + bidder,
                    transactionId: 'mock-tx-' + bidder,
                    responseTimestamp: Date.now(),
                    requestTimestamp: Date.now() - latency,
                    bidder: bidder,
                    timeToRespond: latency,
                    size: '300x250',
                    adUnitCode: 'ad-slot-1'
                };
                pbjs.addBidResponse('ad-slot-1', bid);
                addLog(`Mock bid received: ${bidder} ($${cpm})`, "bid");
            }, latency);
        });
    }, [addLog, jurisdiction, gpcActive]);

    const runAuction = () => {
        const pbjs = window.pbjs;
        if (!pbjs) {
            addLog("Error: Prebid.js not loaded", "error");
            return;
        }
        setIsAuctionRunning(true);
        setWinner(null);
        setStatus("Auctioning...");
        addLog("Starting Prebid.js Distributed Auction", "event");
        
        pbjs.que.push(() => {
            if (gpcActive) {
                addLog("Global Privacy Control (GPC) enforcement active", "privacy");
            }
            const gppString = gpcActive && JURISDICTIONS[jurisdiction].gppStringGpc 
                ? JURISDICTIONS[jurisdiction].gppStringGpc 
                : JURISDICTIONS[jurisdiction].gppString;

            // Log simulated OpenRTB privacy fields for the demonstration
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

            pbjs.requestBids({
                timeout: PREBID_TIMEOUT,
                bidsBackHandler: () => {
                    handleBids();
                }
            });
            // Inject mock bids to ensure the demo always has winners
            injectMockBids();
        });
    };

    const resetDemo = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-bidlab-500/30">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-bidlab-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute top-[60%] -right-[5%] w-[30%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
                <header className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/80 pb-8 relative">
                    <div className="absolute -bottom-px left-0 w-32 h-px bg-gradient-to-r from-bidlab-500 to-transparent"></div>
                    
                    <div>
                        <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                            <div className="w-10 h-10 bg-bidlab-600 rounded-lg flex items-center justify-center shadow-lg shadow-bidlab-600/30 ring-1 ring-white/10">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-white">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter text-white">
                                Bid<span className="text-bidlab-500">Lab</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 text-lg max-w-md font-medium">
                            Real-time Header Bidding & Privacy Signal Playground.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        <button 
                            onClick={runAuction} 
                            disabled={isAuctionRunning}
                            className={`px-6 py-3 rounded-xl font-black transition-all duration-200 flex items-center gap-2 shadow-lg tracking-tight ${
                                isAuctionRunning 
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                                : 'bg-bidlab-600 hover:bg-bidlab-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-bidlab-600/20 ring-1 ring-white/20'
                            }`}
                        >
                            {isAuctionRunning && (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isAuctionRunning ? 'Auctioning...' : 'Trigger Auction'}
                        </button>
                        <button 
                            onClick={resetDemo}
                            className="px-6 py-3 rounded-xl font-black bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700/80 shadow-md tracking-tight"
                        >
                            Reset Lab
                        </button>
                        <button 
                            onClick={requestConsulting}
                            className="px-6 py-3 rounded-xl font-black bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 transition-all border border-indigo-500/30 shadow-md tracking-tight"
                        >
                            Request Consulting
                        </button>
                    </div>
                </header>

                <div className="mb-12">
                    <PrivacyDashboard 
                        activeJurisdiction={jurisdiction} 
                        onJurisdictionChange={setJurisdiction}
                        gpcActive={gpcActive}
                        onGpcToggle={() => {
                            setGpcActive(!gpcActive);
                            addLog(`GPC simulation state changed to ${!gpcActive ? 'ACTIVE' : 'INACTIVE'}`, "privacy");
                        }}
                    />
                </div>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Log Panel */}
                    <div className="lg:col-span-7 order-2 lg:order-1">
                        <LogPanel logs={logs} />
                    </div>

                    {/* Right Column: Ad Slot & Info */}
                    <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
                        <AdSlot winner={winner} status={status} />
                        
                        <div className="bg-slate-800/50 border border-slate-700/50 p-7 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-12 h-12 text-bidlab-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.428 1.428a2 2 0 002.828 0l1.428-1.428a2 2 0 00.547-1.022l.477-2.387a2 2 0 00-1.414-1.96l-2.387-.477a2 2 0 00-1.022.547l-1.428 1.428a2 2 0 000 2.828l1.428 1.428z" />
                                </svg>
                            </div>
                            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
                                <span className="w-2 h-2 bg-bidlab-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.6)]"></span>
                                Lab Mechanics
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    { t: "Prebid.js", d: "Initializes and registers multi-jurisdictional ad units in the window queue." },
                                    { t: "GPP & GPC", d: "Privacy signals are aggregated and injected into the OpenRTB regs object." },
                                    { t: "Distributed Auction", d: "Bids are collected and validated against privacy constraints in parallel." },
                                    { t: "Winning Creative", d: "The highest valid bid is rendered within a secure, sandboxed iframe." }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex gap-4 group/item">
                                        <span className="flex-shrink-0 w-7 h-7 bg-slate-900/80 border border-slate-700 text-bidlab-400 rounded-lg flex items-center justify-center text-[10px] font-black shadow-inner group-hover/item:border-bidlab-500/50 transition-colors">
                                            0{idx+1}
                                        </span>
                                        <p className="text-slate-400 text-xs leading-relaxed font-medium">
                                            <strong className="text-slate-200 block mb-0.5 uppercase tracking-wide font-black text-[10px]">{item.t}</strong>
                                            {item.d}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </main>

                <footer className="mt-20 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-800/80 pt-10">
                    <p>© 2026 BidLab • Interactive Documentation • v2.6.4</p>
                </footer>
            </div>
        </div>
    );
}

export default App;
