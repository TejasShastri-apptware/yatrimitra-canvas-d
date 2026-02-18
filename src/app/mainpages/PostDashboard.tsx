import { useState } from "react";
import CamCard from "../components/CamCard";
import { Camera, Room, FloorPlanElement } from "../types/floorplan";

interface PostDashboardProps {
    diagram: {
        id: string;
        name: string;
        elements: FloorPlanElement[];
        updatedAt: number;
    };
    onEdit: () => void;
}

const PostDashboard = ({ diagram, onEdit }: PostDashboardProps) => {
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

    const elements = diagram.elements || [];
    const rooms = elements.filter((el): el is Room => el.type === "room");
    const cameras = elements.filter((el): el is Camera => el.type === "camera");

    // Build room lookup map
    const roomMap: Record<string, Room> = {};
    rooms.forEach(room => {
        roomMap[room.id] = room;
    });

    // Group cameras by roomId
    const camerasByRoom: Record<string, Camera[]> = {};
    const unassignedCameras: Camera[] = [];

    cameras.forEach(camera => {
        if (camera.roomId) {
            if (!camerasByRoom[camera.roomId]) {
                camerasByRoom[camera.roomId] = [];
            }
            camerasByRoom[camera.roomId].push(camera);
        } else {
            unassignedCameras.push(camera);
        }
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-12 pb-6">
                    <div>
                        <h1 className="text-4xl font-light text-white mb-2">
                            {diagram.name || "Untitled Blueprint"}
                        </h1>
                        <p className="text-slate-400">
                            Camera Distribution & Status
                        </p>
                    </div>

                    <button
                        onClick={onEdit}
                        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 font-medium flex items-center gap-2"
                    >
                        Edit Blueprint
                    </button>
                </div>

                {/* Rooms */}
                <div className="space-y-12">
                    {rooms.map(room => {
                        const roomCameras = camerasByRoom[room.id] || [];
                        if (roomCameras.length === 0) return null;

                        return (
                            <div key={room.id}>
                                <div className="flex items-center gap-3 mb-6">
                                    <h2 className="text-xl font-medium text-blue-400 text-[25px] uppercase tracking-widest px-2">
                                        {room.name ?? "Unnamed Room, Room ID : " + room.id}
                                    </h2>
                                    <div className="h-px flex-1 bg-slate-600"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {roomCameras.map(camera => (
                                        <CamCard
                                            key={camera.id}
                                            camera={camera}
                                            onClick={() => setSelectedCamera(camera)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Unassigned Cameras */}
                    {unassignedCameras.length > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-px flex-1 bg-slate-800"></div>
                                <h2 className="text-xl font-medium text-slate-400 uppercase tracking-widest px-4">
                                    Unassigned / External
                                </h2>
                                <div className="h-px flex-1 bg-slate-800"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {unassignedCameras.map(camera => (
                                    <CamCard
                                        key={camera.id}
                                        camera={camera}
                                        onClick={() => setSelectedCamera(camera)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Cameras */}
                    {cameras.length === 0 && (
                        <div className="text-center py-24 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                            <p className="text-slate-500 text-lg">
                                No cameras found in this blueprint.
                            </p>
                            <button
                                onClick={onEdit}
                                className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Go to Editor to add cameras
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedCamera && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedCamera(null)}
                >
                    <div
                        className="bg-slate-900 rounded-2xl p-6 md:p-10 w-full max-w-6xl relative shadow-2xl border border-slate-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedCamera(null)}
                            className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className="text-3xl font-light text-white mb-8">Camera Feed: {selectedCamera.id}</h2>

                        {/* Layout Grid: 1 column on mobile, 2 columns on desktop (1/3 details, 2/3 stream) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                            {/* Details Column (Spans 4/12) */}
                            <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
                                <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="mb-10 mt-4 text-slate-400 text-xs text-white uppercase tracking-widest mb-1">ID : {selectedCamera.id}</p>
                                            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Status</p>
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                                <p className="text-white font-medium">Online / Active</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Location</p>
                                            <p className="text-white text-lg">
                                                {selectedCamera.roomId && roomMap[selectedCamera.roomId]?.name || "Unassigned External"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Rotation Angle</p>
                                            <p className="text-white font-mono text-lg">{selectedCamera.rotation}°</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stream Column (Spans 8/12) */}
                            <div className="lg:col-span-8 order-1 lg:order-2">
                                <div className="w-full aspect-video bg-black rounded-xl border border-slate-800 relative overflow-hidden group shadow-inner">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent"></div>

                                    {/* Stream UI Overlay */}
                                    <div className="absolute top-4 left-4 flex items-center gap-3">
                                        <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-tighter">REC</div>
                                        <div className="text-white/50 font-mono text-xs uppercase tracking-tighter">
                                            {new Date().toISOString()}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="text-green-400 font-mono text-sm tracking-[0.2em] animate-pulse">
                                            MOCK LIVE FEED
                                        </div>
                                        <div className="mt-2 text-slate-600 text-xs font-mono uppercase">
                                            Source: {selectedCamera.id}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostDashboard;
