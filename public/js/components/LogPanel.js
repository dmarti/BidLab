import { html, useEffect, useRef, useState } from '../preact-config.js';

const LogPanel = ({ logs }) => {
    const logEndRef = useRef(null);
    const [expandedLogs, setExpandedLogs] = useState({});

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const toggleExpand = (index) => {
        setExpandedLogs(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const getOpenRtbDocUrl = (line) => {
        const match = line.match(/^\s*"([^"]+)":/);
        if (!match) return null;
        
        const key = match[1];
        const baseUrl = "https://github.com/InteractiveAdvertisingBureau/openrtb2.x/blob/develop/2.6.md";
        
        const mapping = {
            // BidRequest
            "id": "#321---object-bidrequest-",
            "at": "#321---object-bidrequest-",
            "tmax": "#321---object-bidrequest-",
            "imp": "#324---object-imp-",
            "banner": "#326---object-banner-",
            "video": "#327---object-video-",
            "audio": "#328---object-audio-",
            "native": "#329---object-native-",
            "pmp": "#3210---object-pmp-",
            "deal": "#3212---object-deal-",
            "site": "#3213---object-site-",
            "app": "#3214---object-app-",
            "publisher": "#3215---object-publisher-",
            "content": "#3216---object-content-",
            "producer": "#3217---object-producer-",
            "device": "#3218---object-device-",
            "geo": "#3219---object-geo-",
            "user": "#3220---object-user-",
            "data": "#3221---object-data-",
            "segment": "#3222---object-segment-",
            
            // BidResponse & Bid
            "seatbid": "#421---object-bidresponse-",
            "cur": "#421---object-bidresponse-",
            "seat": "#422---object-seatbid-",
            "bid": "#422---object-seatbid-",
            "impid": "#423---object-bid-",
            "price": "#423---object-bid-",
            "nurl": "#423---object-bid-",
            "adm": "#423---object-bid-",
            "adid": "#423---object-bid-",
            "adomain": "#423---object-bid-",
            "bundle": "#423---object-bid-",
            "iurl": "#423---object-bid-",
            "cid": "#423---object-bid-",
            "crid": "#423---object-bid-",
            "w": "#423---object-bid-",
            "h": "#423---object-bid-",
            "dealid": "#423---object-bid-"
        };

        const anchor = mapping[key];
        return anchor ? `${baseUrl}${anchor}` : null;
    };

    const renderJsonWithLinks = (details) => {
        const jsonStr = JSON.stringify(details, null, 2);
        const lines = jsonStr.split('\n');
        
        return lines.map((line, i) => {
            const docUrl = getOpenRtbDocUrl(line);
            return html`
                <div key=${i} class="flex gap-2 group/line hover:bg-slate-800/50 rounded px-1 -mx-1">
                    <pre class="text-[11px] text-slate-400 leading-tight m-0">${line}</pre>
                    ${docUrl && html`
                        <a 
                            href=${docUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="text-[10px] text-bidlab-500 opacity-0 group-hover/line:opacity-100 transition-opacity font-bold hover:text-bidlab-400 no-underline"
                            title="View OpenRTB Spec"
                        >
                            ?
                        </a>
                    `}
                </div>
            `;
        });
    };

    return html`
        <div class="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px] lg:h-[650px]">
            <div class="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-xs font-mono font-bold text-slate-400 tracking-tight">AUCTION_LIFECYCLE_DEBUGGER</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-[10px] font-mono text-bidlab-500 bg-bidlab-500/10 px-2 py-0.5 rounded border border-bidlab-500/20">LIVE</span>
                </div>
            </div>

            <div class="flex-grow overflow-y-auto p-4 font-mono text-sm custom-scrollbar bg-[#0a0f1d]">
                <div class="space-y-1.5">
                    ${logs.length === 0 && html`
                        <div class="text-slate-600 italic animate-pulse">
                            &gt; Initializing debug stream...
                        </div>
                    `}
                    ${logs.map((log, index) => html`
                        <div key=${index} class="flex flex-col border-b border-slate-800/30 pb-1.5 last:border-0 group">
                            <div class="flex gap-4 leading-relaxed items-start">
                                <span class="flex-shrink-0 text-slate-500 select-none text-[11px] w-28 font-bold tabular-nums font-mono">
                                    [${log.ts}]
                                </span>
                                <div class="flex-grow flex flex-col min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class=${`
                                            text-[13px]
                                            ${log.type === 'event' ? 'text-blue-400' : ''}
                                            ${log.type === 'bid' ? 'text-emerald-400' : ''}
                                            ${log.type === 'error' ? 'text-rose-400 font-bold' : ''}
                                            break-all
                                        `}>
                                            <span class="opacity-50 mr-1.5 text-slate-500 select-none">$</span>
                                            ${log.msg}
                                        </span>
                                        ${log.details && html`
                                            <button 
                                                onClick=${() => toggleExpand(index)}
                                                class="text-[10px] text-bidlab-400 hover:text-bidlab-300 underline font-bold uppercase tracking-tighter"
                                            >
                                                ${expandedLogs[index] ? '[Hide Details]' : '[Show Details]'}
                                            </button>
                                        `}
                                    </div>
                                    ${log.details && expandedLogs[index] && html`
                                        <div class="mt-2 p-3 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto flex flex-col">
                                            ${renderJsonWithLinks(log.details)}
                                        </div>
                                    `}
                                </div>
                            </div>
                        </div>
                    `)}
                    <div ref=${logEndRef} />
                </div>
            </div>

            <div class="bg-slate-800/50 px-4 py-2 border-t border-slate-700/50 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <div class="flex gap-4">
                    <span>EVENTS: ${logs.filter(l => l.type === 'event').length}</span>
                    <span>BIDS: ${logs.filter(l => l.type === 'bid').length}</span>
                </div>
                <div class="flex items-center gap-1">
                    <div class="w-1.5 h-1.5 rounded-full bg-bidlab-500 animate-pulse"></div>
                    <span>READY</span>
                </div>
            </div>
        </div>
    `;
};

export default LogPanel;
