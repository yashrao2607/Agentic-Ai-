// src/components/dashboard/DashboardComponents.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import { X, Check, UploadCloud, Loader, CheckCircle } from 'lucide-react';
import ImageValidationDisplay from './ImageValidationDisplay';
import { storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- Reusable Interfaces ---
export interface BaseIssue { id: string; category: string; title: string; description: string; imageUrl?: string; location?: any; severity?: number; created_at: Timestamp; }
export interface Submission extends BaseIssue {}
export interface PredictedIssue extends BaseIssue { source?: string; source_url?: string; source_type?: string; }
export interface Issue extends BaseIssue { status: 'in_progress' | 'completed' | 'rejected'; work_order_id?: string; }
export interface WorkOrder { id: string; issue_id: string; assigned_team: string; status: 'assigned' | 'dispatched' | 'resolved' | 'pending_admin_approval' | 'completed'; notes?: string; created_at: Timestamp; title?: string; description?: string; location?: any; completionImageUrl?: string; }
export type SelectableItem = Submission | PredictedIssue | Issue | WorkOrder;

// --- Reusable Components ---

export const TabButton: React.FC<{ icon: React.ReactNode; label: string; count: number; isActive: boolean; onClick: () => void; }> = ({ icon, label, count, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center shrink-0 space-x-2 px-1 py-3 border-b-2 text-sm font-medium transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'}`}>
        {icon}<span>{label}</span><span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>{count}</span>
    </button>
);

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
      pending_assignment: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      assigned: 'bg-purple-100 text-purple-800',
      dispatched: 'bg-indigo-100 text-indigo-800',
      pending_admin_approval: 'bg-orange-100 text-orange-800',
      resolved: 'bg-teal-100 text-teal-800',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status?.replace('_', ' ').toUpperCase()}</span>;
};

// Card for the Admin View
export const Card: React.FC<{ item: any; type: string; onApprove?: () => void; onReject?: () => void; onFinalApprove?: () => void; onViewDetails: () => void; }> = ({ item, type, onApprove, onReject, onFinalApprove, onViewDetails }) => {
    let title = '', description = '', category = '';
    
    if (type === 'predicted') {
        title = item.source || 'Predicted Issue';
        description = item.title;
        category = item.source_type || 'Prediction';
    } else if (type === 'verification') {
        title = item.title || 'Verification Pending';
        description = item.description || `Submitted by ${item.assigned_team}`;
        category = 'Needs Final Approval';
    } else {
        title = item.title;
        description = item.description;
        category = item.category;
    }
    
    return (
        <div onClick={onViewDetails} className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <p className="text-xs font-semibold text-blue-600 uppercase">{category}</p>
                    {item.status && <StatusBadge status={item.status} />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-1 truncate" title={title}>{title}</h3>
                <p className="text-gray-600 mt-2 text-sm h-10 overflow-hidden">{description}</p>
            </div>
            {(type === 'submission' || type === 'predicted') && (
                <div className="px-5 py-3 bg-gray-50 grid grid-cols-2 gap-3">
                    <button onClick={(e) => { e.stopPropagation(); onReject?.(); }} className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"><X className="w-4 h-4"/><span>Reject</span></button>
                    <button onClick={(e) => { e.stopPropagation(); onApprove?.(); }} className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"><Check className="w-4 h-4"/><span>Approve</span></button>
                </div>
            )}
            {type === 'verification' && (
                 <div className="px-5 py-3 bg-gray-50">
                    <button onClick={(e) => { e.stopPropagation(); onFinalApprove?.(); }} className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"><CheckCircle className="w-5 h-5"/><span>Final Approve</span></button>
                </div>
            )}
        </div>
    );
};

// Card for the Worker View
export const WorkOrderCard: React.FC<{ workOrder: WorkOrder; onUploadProof: () => void; onViewDetails: () => void; }> = ({ workOrder, onUploadProof, onViewDetails }) => (
    <div onClick={onViewDetails} className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
        <div className="p-5">
            <div className="flex justify-between items-start">
                <p className="text-sm font-bold text-purple-700">{workOrder.assigned_team}</p>
                <StatusBadge status={workOrder.status} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mt-2 truncate" title={workOrder.title}>{workOrder.title || `Task for Issue #${workOrder.issue_id}`}</h3>
            <p className="text-gray-600 mt-1 text-sm h-10 overflow-hidden">{workOrder.description || "No description."}</p>
        </div>
        {/* --- THIS IS THE FINAL FIX --- */}
        {/* The button now shows for ANY status that is NOT a completed or pending state */}
        { !['completed', 'resolved', 'pending_admin_approval'].includes(workOrder.status) && (
            <div className="px-5 py-3 bg-gray-50">
                <button onClick={(e) => { e.stopPropagation(); onUploadProof(); }} className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                    <CheckCircle className="w-5 h-5"/><span>Upload Proof & Mark Done</span>
                </button>
            </div>
        )}
    </div>
);

// Generic Modal for Viewing Details
export const DetailsModal: React.FC<{ item: SelectableItem | null; onClose: () => void }> = ({ item, onClose }) => (
    <AnimatePresence>
        {item && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                             <div>
                                <h2 className="text-2xl font-bold text-gray-900">{(item as BaseIssue).title || `Work Order for Issue #${(item as WorkOrder).issue_id}`}</h2>
                                <p className="text-sm text-gray-500 mt-1">Category: {(item as BaseIssue).category || 'Work Order'}</p>
                             </div>
                            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><X /></button>
                        </div>
                        <div className="mt-6 border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(item as BaseIssue).imageUrl || (item as WorkOrder).completionImageUrl ? <img src={(item as BaseIssue).imageUrl || (item as WorkOrder).completionImageUrl} alt="Issue evidence" className="rounded-lg w-full object-cover shadow-md" /> : null}
                            <div className={space-y-4 ${!(item as BaseIssue).imageUrl && !(item as WorkOrder).completionImageUrl && 'md:col-span-2'}}>
                                <div><h4 className="font-semibold text-gray-700">Description</h4><p className="text-gray-600">{(item as BaseIssue).description || 'No description provided.'}</p></div>
                                {item.status && <div><h4 className="font-semibold text-gray-700">Status</h4><p className="text-gray-600 capitalize">{item.status.replace('_', ' ')}</p></div>}
                                {(item as BaseIssue).severity && <div><h4 className="font-semibold text-gray-700">Severity</h4><p className="text-gray-600">{(item as BaseIssue).severity} / 5</p></div>}
                                {(item as WorkOrder).assigned_team && <div><h4 className="font-semibold text-gray-700">Assigned Team</h4><p className="text-gray-600">{(item as WorkOrder).assigned_team}</p></div>}
                                {(item as PredictedIssue).source_url && <div><h4 className="font-semibold text-gray-700">Source</h4><a href={(item as PredictedIssue).source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Source Article</a></div>}
                                {(item as BaseIssue).location && <div><h4 className="font-semibold text-gray-700">Location</h4><p className="text-gray-600">{typeof (item as BaseIssue).location === 'string' ? (item as BaseIssue).location : Lat: ${(item as any).location.latitude}, Lng: ${(item as any).location.longitude}}</p></div>}
                                {item.created_at && <div><h4 className="font-semibold text-gray-700">Reported At</h4><p className="text-gray-600">{new Date(item.created_at.seconds * 1000).toLocaleString()}</p></div>}
                                
                                {/* Image Validation Display */}
                                {(item as any).image_validation && (
                                    <div className="md:col-span-2">
                                        <h4 className="font-semibold text-gray-700 mb-2">Image Validation</h4>
                                        <ImageValidationDisplay validation={(item as any).image_validation} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// Modal for Assigning a Team (Admin View)
export const ApprovalModal: React.FC<{ item: Submission | PredictedIssue | null; teams: string[]; onClose: () => void; onConfirm: (item: Submission | PredictedIssue, team: string, source: 'raw_submissions' | 'predicted_issues') => Promise<void>; }> = ({ item, teams, onClose, onConfirm }) => {
    const [selectedTeam, setSelectedTeam] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    
    useEffect(() => { if(item) { setSelectedTeam(''); setIsAssigning(false); } }, [item]);
    
    const handleConfirm = async () => {
        if (!item) return;
        setIsAssigning(true);
        const sourceCollection = 'source' in item ? 'predicted_issues' : 'raw_submissions';
        await onConfirm(item, selectedTeam, sourceCollection);
    };
    
    return (
        <AnimatePresence>
            {item && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900">Approve and Assign Issue</h3>
                            <p className="text-sm text-gray-500 mt-1">Select a team to assign this issue to.</p>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="font-semibold">{(item as BaseIssue).title}</p>
                                <p className="text-sm text-gray-600">{(item as BaseIssue).description}</p>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="team-select-modal" className="block text-sm font-medium text-gray-700">Assign Team</label>
                                <select id="team-select-modal" value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                    <option value="" disabled>Select a team...</option>
                                    {teams.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                            <button onClick={handleConfirm} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center" disabled={!selectedTeam || isAssigning}>
                                {isAssigning && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                                {isAssigning ? 'Assigning...' : 'Assign & Approve'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Modal for Uploading Completion Image (Worker View)
export const ResolveModal: React.FC<{ order: WorkOrder | null; onClose: () => void; onConfirm: (order: WorkOrder, image: File) => Promise<void>; }> = ({ order, onClose, onConfirm }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setImageFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!imageFile || !order) return;
        setUploading(true);
        await onConfirm(order, imageFile);
        setUploading(false);
    };

    useEffect(() => { if(order) setImageFile(null); }, [order]);

    return (
        <AnimatePresence>
            {order && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900">Upload Completion Proof</h3>
                            <p className="text-sm text-gray-500 mt-1">Upload an image to mark this task as resolved.</p>
                            <div className="mt-4">
                                <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400">
                                    {imageFile ? <p className="text-green-600">{imageFile.name}</p> : (
                                        <span className="flex items-center space-x-2"><UploadCloud className="w-6 h-6 text-gray-600" /><span className="font-medium text-gray-600">Click to select an image</span></span>
                                    )}
                                    <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center" disabled={!imageFile || uploading}>
                                {uploading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                                {uploading ? 'Uploading...' : 'Submit for Review'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};