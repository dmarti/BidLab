import { html, useState, useEffect, useRef } from '../preact-config.js';

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
            "id": "#321---object-bidrequest-",
            "at": "#321---object-bidrequest-",
            "tmax": "#321---object-bidrequest-",
            "imp": "#324---object-imp-",
            "banner": "#326---object-banner-",
            "regs": "#323---object-regs-",
            "gpp": "#323---object-regs-",
            "gpp_sid": "#323---object-regs-",
            "gpc": "#323---object-regs-",
            "seatbid": "#421---object-bidresponse-",
            "bid": "#422---object-seatbid-",
            "price": "#423---object-bid-",
            "adm": "#423---object-bid-",
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
                    <pre class="text-[11px] text-slate-400 leading-tight m-0 font-mono">${line}</pre>
                    ${docUrl ? html`
                        <a 
                            href=${docUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="text-[10px] text-bidlab-500 opacity-0 group-hover/line:opacity-100 transition-opacity font-bold hover:text-bidlab-400 no-underline"
                            title="View OpenRTB Spec"
                        >
                            ?
                        </a>
                    ` : ''}
                </div>
            `;
        });
    };

    return html`
        <div class="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px] lg:h-[650px] relative group text-left">
            <div class="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.02] to-transparent h-12"></div>
            
            <div class="bg-slate-800 px-5 py-4 border-b border-slate-700 flex justify-between items-center relative z-10">
                <div class="flex gap-2">
                    <div class="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div>
                    <div class="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                    <div class="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2 opacity-80">
                        <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="text-[10px] font-black font-mono text-slate-400 tracking-[0.2em] uppercase">Auction_Debugger_v2.6</span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="flex items-center gap-1.5 text-[9px] font-black font-mono text-bidlab-400 bg-bidlab-500/10 px-2.5 py-1 rounded-md border border-bidlab-500/20 shadow-inner">
                        <span class="w-1 h-1 bg-bidlab-500 rounded-full animate-ping"></span>
                        LIVE STREAM
                    </span>
                </div>
            </div>

            <div class="flex-grow overflow-y-auto p-5 font-mono text-sm custom-scrollbar bg-[#050811] selection:bg-indigo-500/30">
                <div class="space-y-2">
                    ${logs.length === 0 ? html`
                        <div class="text-slate-700 italic flex items-center gap-3">
                            <span class="animate-pulse">_</span>
                            <span class="text-xs uppercase tracking-widest font-black">System Ready. Awaiting trigger...</span>
                        </div>
                    ` : ''}
                    ${logs.map((log, index) => html`
                        <div key=${index} class="flex flex-col border-b border-slate-800/20 pb-2 last:border-0 group/log">
                            <div class="flex gap-4 leading-relaxed items-start">
                                <span class="flex-shrink-0 text-slate-600 select-none text-[10px] w-24 font-bold tabular-nums pt-0.5">
                                    ${log.ts}
                                </span>
                                <div class="flex-grow flex flex-col min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        ${log.type === 'privacy' ? html`
                                            <span class="px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[9px] font-black uppercase tracking-tighter shadow-sm">Privacy</span>
                                        ` : ''}
                                        ${log.type === 'bid' ? html`
                                            <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-tighter shadow-sm">Bid</span>
                                        ` : ''}
                                        <span class=${`
                                            text-[13px] font-medium
                                            ${log.type === 'event' ? 'text-blue-300' : ''}
                                            ${log.type === 'privacy' ? 'text-indigo-300' : ''}
                                            ${log.type === 'bid' ? 'text-emerald-300' : ''}
                                            ${log.type === 'error' ? 'text-rose-400 font-bold' : ''}
                                            break-all
                                        `}>
                                            ${log.msg}
                                        </span>
                                        ${log.details ? html`
                                            <button 
                                                onClick=${() => toggleExpand(index)}
                                                class="ml-auto text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-0.5 rounded border border-slate-700 transition-all font-black uppercase tracking-widest"
                                            >
                                                ${expandedLogs[index] ? 'Hide Data' : 'Inspect Object'}
                                            </button>
                                        ` : ''}
                                    </div>
                                    ${log.details && expandedLogs[index] ? html`
                                        <div class="mt-2.5 p-4 bg-black/40 rounded-xl border border-slate-800/80 overflow-x-auto flex flex-col shadow-inner backdrop-blur-sm">
                                            ${renderJsonWithLinks(log.details)}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `)}
                    <div ref=${logEndRef} />
                </div>
            </div>

            <div class="bg-slate-800/50 px-5 py-2.5 border-t border-slate-700/50 flex justify-between items-center text-[9px] font-black font-mono text-slate-500 tracking-widest uppercase">
                <div class="flex gap-6">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span>Events: ${logs.filter(l => l.type === 'event').length}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Bids: ${logs.filter(l => l.type === 'bid').length}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <span>Privacy: ${logs.filter(l => l.type === 'privacy').length}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 text-bidlab-500/70">
                    <div class="w-1.5 h-1.5 rounded-full bg-bidlab-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                    <span>System Encrypted</span>
                </div>
            </div>
        </div>
    `;
};

export default LogPanel;
