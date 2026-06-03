import { html } from '../preact-config.js';
import { JURISDICTIONS } from '../constants/jurisdictions.js';

const PrivacyDashboard = ({ activeJurisdiction, onJurisdictionChange, gpcActive, onGpcToggle }) => {
    const current = JURISDICTIONS[activeJurisdiction];

    return html`
        <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl relative overflow-hidden group text-left">
            <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
            
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 shadow-inner">
                        <svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-2xl font-black text-white tracking-tight leading-none mb-1">Privacy Playground</h2>
                        <div class="flex items-center gap-2">
                            <span class="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">Global Privacy Platform (GPP)</span>
                            <span class="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <span class="text-indigo-400/80 text-[10px] uppercase tracking-[0.2em] font-bold italic underline decoration-indigo-500/30 underline-offset-4">Interactive Audit</span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-3 self-end md:self-auto">
                    <div class="flex items-center gap-3 px-4 py-2 bg-slate-900/60 rounded-xl border border-slate-700/50 shadow-inner">
                        <span class=${`text-[10px] font-black uppercase tracking-widest ${gpcActive ? 'text-emerald-400' : 'text-slate-500'}`}>GPC Signal</span>
                        <button 
                            onClick=${onGpcToggle}
                            class=${`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${gpcActive ? 'bg-emerald-600' : 'bg-slate-700'}`}
                        >
                            <span class=${`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${gpcActive ? 'translate-x-5' : 'translate-x-0'}`}></span>
                        </button>
                    </div>

                    <div class="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <span class="text-[10px] font-black text-green-400 uppercase tracking-wider">Signals Active</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                ${Object.entries(JURISDICTIONS).map(([id, data]) => html`
                    <button
                        key=${id}
                        onClick=${() => onJurisdictionChange(id)}
                        class=${`group relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-500 overflow-hidden ${
                            activeJurisdiction === id
                                ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/50'
                                : 'bg-slate-900/40 border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/60'
                        }`}
                    >
                        ${activeJurisdiction === id ? html`
                            <div class="absolute top-0 right-0 p-1.5">
                                <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                            </div>
                        ` : ''}

                        <span class="text-3xl mb-3 transition-transform duration-500 group-hover:scale-125 block drop-shadow-lg">${data.flag}</span>
                        <span class=${`text-[11px] font-black uppercase tracking-tight text-center leading-tight transition-colors duration-300 ${
                            activeJurisdiction === id ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'
                        }`}>
                            ${data.name}
                        </span>
                        
                        <div class=${`absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-500 ${
                            activeJurisdiction === id ? 'w-full opacity-100 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'w-0 opacity-0'
                        }`}></div>
                    </button>
                `)}
            </div>

            <div class="bg-slate-900/80 border border-slate-700/50 rounded-2xl overflow-hidden relative group/card shadow-2xl">
                <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                <div class="relative z-10 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
                    <div class="flex-1 p-6 space-y-4 text-left">
                        <div class="flex items-center gap-2">
                            <div class="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                            <h3 class="text-slate-200 font-black text-[10px] uppercase tracking-[0.2em]">Signal Context</h3>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed font-medium italic">
                            "${current.description}"
                        </p>
                        <div class="pt-2 flex flex-wrap gap-2">
                            <span class=${`px-2.5 py-1 rounded-md text-[9px] font-black uppercase border tracking-widest transition-colors ${
                                gpcActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}>
                                GPC: ${gpcActive ? 'Enforced' : 'Off'}
                            </span>
                            <span class="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest">
                                CMP: BidLab Static v1.1
                            </span>
                        </div>
                    </div>

                    <div class="flex-[1.5] p-6 space-y-4 text-left">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                                <h3 class="text-slate-200 font-black text-[10px] uppercase tracking-[0.2em]">GPP Transparency String</h3>
                            </div>
                        </div>
                        <div class="font-mono text-[10px] bg-black/60 p-5 rounded-xl border border-slate-700/50 text-indigo-400 break-all leading-relaxed shadow-inner group-hover/card:border-indigo-500/30 transition-colors duration-500 min-h-[60px] flex items-center justify-center text-center">
                            ${current.gppString ? html`
                                <span class="selection:bg-indigo-500/40">${current.gppString}</span>
                            ` : html`
                                <span class="italic text-slate-700 tracking-normal text-xs uppercase">No GPP signals provided for this jurisdiction mode.</span>
                            `}
                        </div>
                    </div>

                    <div class="w-full lg:w-48 p-6 space-y-4 text-left">
                        <div class="flex items-center gap-2">
                            <div class="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                            <h3 class="text-slate-200 font-black text-[10px] uppercase tracking-[0.2em]">SID Scopes</h3>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            ${current.applicableSections.length > 0 ? (
                                current.applicableSections.map(s => html`
                                    <div key=${s} class="group/sid relative">
                                        <span class="px-3 py-2 bg-indigo-500/10 text-indigo-300 rounded-xl text-[10px] font-black border border-indigo-500/20 shadow-sm block hover:bg-indigo-500/20 transition-colors cursor-help">
                                            ID: ${s}
                                        </span>
                                    </div>
                                `)
                            ) : html`
                                <span class="px-4 py-2 bg-slate-800/50 text-slate-600 rounded-xl text-[10px] font-black border border-slate-700/50 italic tracking-widest uppercase">
                                    Universal
                                </span>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default PrivacyDashboard;
