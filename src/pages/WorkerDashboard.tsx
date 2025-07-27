// src/pages/WorkerDashboard.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Loader, AlertTriangle } from 'lucide-react';

import { db } from '../firebaseConfig';
import { collection, doc, onSnapshot, query, orderBy, Timestamp, updateDoc } from 'firebase/firestore';

// Import interfaces and components from the shared file
import {
    WorkOrder,
    WorkOrderCard,
    DetailsModal,
    ResolveModal
} from '../components/dashboard/DashboardComponents';

// --- FIXED: Team names now match your provided categories ---
const CATEGORY_TEAMS = [
    "Waste Management",
    "Street Lighting",
    "Traffic Issues",
    "Water Supply",
    "Environment",
    "Infrastructure",
    "Public Safety",
    "Emergency"
];

const WorkerDashboard: React.FC = () => {
    const [allWorkOrders, setAllWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<string>(CATEGORY_TEAMS[0]);
    const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
    const [resolvingOrder, setResolvingOrder] = useState<WorkOrder | null>(null);
    
    useEffect(() => {
        const workOrdersQuery = query(collection(db, 'work_orders'), orderBy('created_at', 'desc'));
        const unsubscribe = onSnapshot(workOrdersQuery, (snapshot) => {
            setAllWorkOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as WorkOrder)));
            setLoading(false);
        }, (err) => {
            console.error("Work Orders listener error:", err);
            setError("Could not load work orders.");
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const filteredWorkOrders = allWorkOrders.filter(wo => wo.assigned_team === selectedTeam);

    const handleConfirmResolve = async (order: WorkOrder, image: File) => {
        try {
            const { storage } = await import('../firebaseConfig');
            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

            const filePath = completion-proof/${order.id}/${image.name};
            const storageRef = ref(storage, filePath);
            await uploadBytes(storageRef, image);
            const completionImageUrl = await getDownloadURL(storageRef);

            await updateDoc(doc(db, 'work_orders', order.id), {
                status: 'pending_admin_approval',
                completionImageUrl: completionImageUrl
            });
            setResolvingOrder(null);
        } catch (err) { console.error("Error resolving work order:", err); alert("Failed to submit for review."); }
    };
    
    return (
        <>
            <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Worker Dashboard</h1>
                            <p className="text-gray-500 mt-1">Your assigned tasks</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                             <div className="p-3 rounded-full bg-blue-100 mr-4">
                                <Wrench className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Active Assignments</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredWorkOrders.filter(wo => wo.status !== 'resolved' && wo.status !== 'completed').length}</p>
                            </div>
                        </div>
                    </header>
                    
                    <div className="mb-6">
                        <label htmlFor="team-select" className="block text-sm font-medium text-gray-700 mb-1">Select Your Team</label>
                        <select id="team-select" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            {CATEGORY_TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
                        </select>
                    </div>

                    {loading ? <div className="flex justify-center p-8"><Loader className="animate-spin" /></div> :
                     error ? <div className="text-center text-red-500 p-8"><AlertTriangle className="inline mr-2" />{error}</div> :
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWorkOrders.length > 0 ? filteredWorkOrders.map(wo => <WorkOrderCard key={wo.id} workOrder={wo} onUploadProof={() => setResolvingOrder(wo)} onViewDetails={() => setSelectedOrder(wo)} />) : <p className="text-gray-500 col-span-full text-center p-8">No work orders assigned to this team.</p>}
                     </div>
                    }
                </div>
            </div>
            <DetailsModal item={selectedOrder} onClose={() => setSelectedOrder(null)} />
            <ResolveModal order={resolvingOrder} onClose={() => setResolvingOrder(null)} onConfirm={handleConfirmResolve} />
        </>
    );
};

export default WorkerDashboard;