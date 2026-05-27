import { html, useEffect, useRef } from '../preact-config.js';

const AdSlot = ({ winner, status }) => {
    const slotRef = useRef(null);

    useEffect(() => {
        if (winner && slotRef.current) {
            renderWinner(winner);
        } else if (!winner && slotRef.current) {
            slotRef.current.innerHTML = '';
        }
    }, [winner]);

    const renderWinner = (bid) => {
        const slot = slotRef.current;
        slot.innerHTML = '';
        
        const iframe = document.createElement('iframe');
        iframe.width = 300;
        iframe.height = 250;
        iframe.frameBorder = "0";
        iframe.scrolling = "no";
        iframe.className = "rounded-lg shadow-sm";
        slot.appendChild(iframe);

        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        
        if (bid.ad) {
            // Use the actual creative content from the bid
            iframeDoc.write(bid.ad);
        } else {
            // Fallback to mock ad if no 'ad' property is present
            const mockAds = [
                { title: 'CloudScale Pro', desc: 'Enterprise infrastructure that grows with your business needs.', img: 'https://picsum.photos/seed/tech/300/150' },
                { title: 'EcoBrew Coffee', desc: 'Sustainable, organic beans delivered fresh to your doorstep.', img: 'https://picsum.photos/seed/coffee/300/150' },
                { title: 'DevFlow 2.0', desc: 'The ultimate toolkit for modern web developers.', img: 'https://picsum.photos/seed/design/300/150' }
            ];
            const ad = mockAds[Math.floor(Math.random() * mockAds.length)];

            iframeDoc.write(`
                <style>
                    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; cursor: pointer; overflow: hidden; background: #fff; }
                    .ad { width: 300px; height: 250px; display: flex; flex-direction: column; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; position: relative; }
                    img { width: 300px; height: 135px; object-fit: cover; }
                    .content { padding: 12px; }
                    .title { font-weight: 800; font-size: 15px; margin-bottom: 2px; color: #0f172a; }
                    .desc { font-size: 12px; color: #64748b; line-height: 1.3; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                    .footer { display: flex; justify-content: space-between; align-items: center; }
                    .cta { background: #0284c7; color: white; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.025em; }
                    .provider { font-size: 9px; color: #94a3b8; font-weight: 600; }
                    .bidder-tag { position: absolute; top: 8px; right: 8px; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(4px); color: white; font-size: 9px; padding: 2px 8px; border-radius: 12px; font-weight: 700; border: 1px solid rgba(255,255,255,0.1); }
                </style>
                <div class="ad">
                    <div class="bidder-tag">${bid.bidder.toUpperCase()} WINNER</div>
                    <img src="${ad.img}" alt="Ad">
                    <div class="content">
                        <div class="title">${ad.title}</div>
                        <div class="desc">${ad.desc}</div>
                        <div class="footer">
                            <div class="cta">Learn More</div>
                            <div class="provider">Ads by BidLab</div>
                        </div>
                    </div>
                </div>
            `);
        }
        iframeDoc.close();
    };

    return html`
        <div class="bg-slate-800/80 border border-slate-700 p-1 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
            <div class="bg-slate-900/50 p-4 border-b border-slate-700/50 flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span class="text-xs font-bold text-slate-300 tracking-wider uppercase">Active Slot: top_sidebar</span>
                </div>
                <div class="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                    300x250
                </div>
            </div>
            
            <div class="p-6 flex flex-col items-center justify-center min-h-[300px] relative">
                <div 
                    id="ad-slot-1" 
                    ref=${slotRef} 
                    class=${`w-[300px] h-[250px] transition-all duration-500 flex items-center justify-center rounded-lg ${
                        winner 
                        ? 'scale-100 opacity-100 shadow-xl shadow-bidlab-500/10' 
                        : 'bg-slate-800/50 border-2 border-dashed border-slate-700 scale-95'
                    }`}
                >
                    ${!winner && html`
                        <div class="text-center space-y-3">
                            <div class="w-12 h-12 border-2 border-slate-700 rounded-xl mx-auto flex items-center justify-center text-slate-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span class="text-sm font-medium text-slate-500">Awaiting Auction</span>
                        </div>
                    `}
                </div>

                <div class="mt-6 w-full max-w-[300px]">
                    <div class="flex justify-between items-end">
                        <div class="space-y-1">
                            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Auction Status</span>
                            <div class=${`text-sm font-bold tracking-tight ${
                                status.includes('Served') ? 'text-bidlab-400' : 'text-slate-300'
                            }`}>
                                ${status}
                            </div>
                        </div>
                        ${winner && html`
                            <div class="text-right">
                                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Winning CPM</span>
                                <div class="text-sm font-mono font-bold text-green-400">
                                    $${winner.cpm.toFixed(2)}
                                </div>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default AdSlot;
