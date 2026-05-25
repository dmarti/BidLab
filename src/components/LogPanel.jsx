import React, { useEffect, useRef } from 'react';

const LogPanel = ({ logs }) => {
    const logEndRef = useRef(null);

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px] lg:h-[650px]">
            {/* Terminal Header */}
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-mono font-bold text-slate-400 tracking-tight">AUCTION_LIFECYCLE_DEBUGGER</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-bidlab-500 bg-bidlab-500/10 px-2 py-0.5 rounded border border-bidlab-500/20">LIVE</span>
                </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-grow overflow-y-auto p-4 font-mono text-sm custom-scrollbar bg-[#0a0f1d]">
                <div className="space-y-1.5">
                    {logs.length === 0 && (
                        <div className="text-slate-600 italic animate-pulse">
                            &gt; Initializing debug stream...
                        </div>
                    )}
                    {logs.map((log, index) => (
                        <div key={index} className="flex gap-3 leading-relaxed group">
                            <span className="flex-shrink-0 text-slate-600 select-none text-xs pt-0.5 w-16">
                                [{log.ts}]
                            </span>
                            <span className={`
                                ${log.type === 'event' ? 'text-blue-400' : ''}
                                ${log.type === 'bid' ? 'text-emerald-400' : ''}
                                ${log.type === 'error' ? 'text-rose-400 font-bold' : ''}
                                break-all
                            `}>
                                <span className="opacity-50 mr-1.5 text-slate-500 select-none">$</span>
                                {log.msg}
                            </span>
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>

            {/* Terminal Footer */}
            <div className="bg-slate-800/50 px-4 py-2 border-t border-slate-700/50 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <div className="flex gap-4">
                    <span>EVENTS: {logs.filter(l => l.type === 'event').length}</span>
                    <span>BIDS: {logs.filter(l => l.type === 'bid').length}</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-bidlab-500 animate-pulse"></div>
                    <span>READY</span>
                </div>
            </div>
        </div>
    );
};

export default LogPanel;
