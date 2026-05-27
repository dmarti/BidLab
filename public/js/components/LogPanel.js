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
                                <span class="flex-shrink-0 text-slate-500 select-none text-[10px] pt-1 w-24 font-bold tabular-nums">
                                    [${log.ts}]
                                </span>
                                <div class="flex-grow flex flex-col">
                                    <div class="flex items-center gap-2">
                                        <span class=${`
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
                                        <div class="mt-2 p-3 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
                                            <pre class="text-[11px] text-slate-400 leading-tight">
                                                ${JSON.stringify(log.details, null, 2)}
                                            </pre>
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
