import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'

const Dashboard = () => {
    const [diagrams, setDiagrams] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const savedDiagrams = JSON.parse(localStorage.getItem('diagrams') || '[]')
        setDiagrams(savedDiagrams.sort((a, b) => b.updatedAt - a.updatedAt))
    }, [])

    const handleCreateNew = () => {
        navigate('/editor/new')
    }

    const handleLogout = () => {
        localStorage.removeItem('auth')
        navigate('/login')
    }

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this diagram?')) {
            const savedDiagrams = JSON.parse(localStorage.getItem('diagrams') || '[]')
            const filtered = savedDiagrams.filter(d => d.id !== id)
            localStorage.setItem('diagrams', JSON.stringify(filtered))
            setDiagrams(filtered)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">

                    <div>
                        <h1 className="text-4xl font-light text-white mb-2">
                            My Blueprints
                        </h1>
                        <p className="text-slate-400">
                            Architectural floor plan designs
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 px-6 py-3 rounded hover:bg-red-400 transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
                        >
                            Logout
                        </button>

                        <button
                            onClick={handleCreateNew}
                            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 font-medium flex items-center gap-2"
                        >
                            New Blueprint
                        </button>
                    </div>
                </div>

                {diagrams.length === 0 ? (
                    <div className="text-center py-32 bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800">
                        <div className="mb-4 text-slate-600 flex justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M9 15h6" /><path d="M12 12v6" /></svg>
                        </div>
                        <p className="text-slate-400 text-xl font-light mb-2">No blueprints found</p>
                        <p className="text-slate-500 text-sm mb-8">Start by creating your first architectural floor plan</p>
                        <button
                            onClick={handleCreateNew}
                            className="text-blue-400 hover:text-blue-300 transition-colors font-medium border border-blue-900/50 px-6 py-2 rounded-full"
                        >
                            Create Project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {diagrams.map((diagram) => (
                            <div
                                key={diagram.id}
                                onClick={() => navigate(`/post/${diagram.id}`)}
                                className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all cursor-pointer"
                            >
                                <div className="aspect-video bg-slate-950/50 flex items-center justify-center border-b border-slate-800 group-hover:bg-slate-950/30 transition-colors">
                                    <svg className="text-slate-800 group-hover:text-blue-900/50 transition-colors" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m2 2 20 20" /><path d="M16 22h5a1 1 0 0 0 1-1V5" /><path d="M8 2H3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h2" /><path d="M22 16V9a1 1 0 0 0-1-1h-5" /><path d="M2 8v7a1 1 0 0 0 1 1h5" /><path d="M16 2v5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V2" /></svg>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-xl font-medium text-white truncate">
                                            {diagram.name || 'Untitled Blueprint'}
                                        </h2>
                                        <button
                                            onClick={(e) => handleDelete(diagram.id, e)}
                                            className="text-slate-600 hover:text-red-400 transition-colors p-1"
                                            title="Delete Blueprint"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                                        <span>MODIFIED {new Date(diagram.updatedAt || Date.now()).toLocaleDateString()}</span>
                                        <span className="text-blue-500/50">V-01</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard
