import React from 'react'
import { Camera } from '../types/floorplan';

const CamCard = ({ camera, onClick }: { camera: Camera, onClick: () => void }) => {
    return (
        <div onClick={onClick} className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300">
            <div className="aspect-video bg-slate-950/50 flex items-center justify-center border-b border-slate-800 group-hover:bg-slate-950/30 transition-colors relative">
                <svg
                    className="text-slate-700 group-hover:text-blue-500/50 transition-colors duration-500"
                    xmlns="http://www.w3.org/2000/svg"
                    width="48" height="48"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                >
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                </svg>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-full border border-slate-700/50">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] text-slate-300 font-mono tracking-tight">ONLINE</span>
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-white truncate">
                        CAM-{camera.id.slice(0, 6).toUpperCase()}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded uppercase">
                        v1.2.0
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Location ID</span>
                        <span className="text-blue-400 font-mono">{camera.roomId || 'UNASSIGNED'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Rotation</span>
                        <span className="text-slate-300 font-mono">{camera.rotation}°</span>
                    </div>
                </div>

                <button className="mt-5 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2">
                    View Stream
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
            </div>
        </div>
    )
}

export default CamCard;
