// src/pages/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, ListChecks, Loader, AlertTriangle, Newspaper, UserCheck } from 'lucide-react';

import { db } from '../firebaseConfig';
import { collection, doc, onSnapshot, addDoc, deleteDoc, query, orderBy, Timestamp, where, writeBatch } from 'firebase/firestore';

// Import interfaces and components from the shared file
import {
    Submission, PredictedIssue, Issue, WorkOrder,
    TabButton, Card, DetailsModal, ApprovalModal
} from '../components/DashboardComponents';
import ImageValidationDisplay from '../components/ImageValidationDisplay';

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

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'predicted' | 'issues' | 'verification'>('submissions');
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [predictedIssues, setPredictedIssues] = useState<PredictedIssue[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pendingVerification, setPendingVerification] = useState<WorkOrder[]>([]);

  const [loading, setLoading] = useState({ submissions: true, predicted: true, issues: true, verification: true });
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [approvingItem, setApprovingItem] = useState<Submission | PredictedIssue | null>(null);
  
  useEffect(() => {
    const unsubscribers = [
      onSnapshot(query(collection(db, 'raw_submissions'), orderBy('created_at', 'desc')), (snap) => {
          setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission)));
          setLoading(p => ({...p, submissions: false}));
      }),
      onSnapshot(query(collection(db, 'predicted_issues'), orderBy('created_at', 'desc')), (snap) => {
          setPredictedIssues(snap.docs.map(d => ({ id: d.id, ...d.data() } as PredictedIssue)));
          setLoading(p => ({...p, predicted: false}));
      }),
      onSnapshot(query(collection(db, 'issues'), orderBy('created_at', 'desc')), (snap) => {
          setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() } as Issue)));
          setLoading(p => ({...p, issues: false}));
      }),
      onSnapshot(query(collection(db, 'work_orders'), where('status', '==', 'pending_admin_approval')), (snap) => {
          setPendingVerification(snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkOrder)));
          setLoading(p => ({...p, verification: false}));
      })
    ];
    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  const handleConfirmApproval = async (item: Submission | PredictedIssue, team: string, sourceCollection: 'raw_submissions' | 'predicted_issues') => {
    if (!team) { alert("Please assign a team."); return; }
    try {
      const { id, ...data } = item;
      const batch = writeBatch(db);
      const issueRef = doc(collection(db, 'issues'));
      
      // Create the issue with proper status and metadata
      batch.set(issueRef, { 
        ...data, 
        status: 'in_progress',
        original_submission_id: item.id, // Keep reference to original submission
        assigned_team: team,
        created_at: Timestamp.now()
      });
      
      const workOrderRef = doc(collection(db, 'work_orders'));
      // This ensures the new work order status is ALWAYS 'assigned'
      batch.set(workOrderRef, { 
          issue_id: issueRef.id, 
          assigned_team: team, 
          status: 'assigned', 
          created_at: Timestamp.now(), 
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location,
          imageUrl: data.imageUrl
      });
      
      batch.update(issueRef, { work_order_id: workOrderRef.id });
      batch.delete(doc(db, sourceCollection, item.id));

      await batch.commit();
      setApprovingItem(null);
      console.log(`✅ Approved submission ${item.id} and moved to issues collection`);
    } catch (err) { console.error("Error confirming approval:", err); alert("Failed to approve."); }
  };
  
  const handleReject = async (itemId: string, sourceCollection: 'raw_submissions' | 'predicted_issues') => {
    if (window.confirm("Are you sure?")) {
        try { await deleteDoc(doc(db, sourceCollection, itemId)); } 
        catch (err) { console.error("Error rejecting:", err); alert("Failed to reject."); }
    }
  };

  const handleFinalApproval = async (workOrder: WorkOrder) => {
    try {
        const batch = writeBatch(db);
        batch.update(doc(db, 'work_orders', workOrder.id), { status: 'completed' });
        batch.update(doc(db, 'issues', workOrder.issue_id), { status: 'completed' });
        await batch.commit();
    } catch (err) { console.error("Final approval error:", err); alert("Failed to give final approval.");}
  }

  const renderContent = (tab: string, items: any[], type: string, emptyText: string) => (
      loading[tab as keyof typeof loading] ? <div className="flex justify-center p-8"><Loader className="animate-spin" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length > 0 ? items.map(item => <Card key={item.id} item={item} type={type} onApprove={() => setApprovingItem(item)} onReject={() => handleReject(item.id, type === 'submission' ? 'raw_submissions' : 'predicted_issues')} onFinalApprove={() => handleFinalApproval(item)} onViewDetails={() => setSelectedItem(item)} />) : <p className="text-gray-500 col-span-full text-center p-8">{emptyText}</p>}
        </div>
    )
  );
  
  return (
    <>
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8"><h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1></header>
          <div className="mb-6 border-b border-gray-300">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              <TabButton icon={<Inbox />} label="Submissions" count={submissions.length} isActive={activeTab === 'submissions'} onClick={() => setActiveTab('submissions')} />
              <TabButton icon={<Newspaper />} label="Predicted" count={predictedIssues.length} isActive={activeTab === 'predicted'} onClick={() => setActiveTab('predicted')} />
              <TabButton icon={<ListChecks />} label="Active Issues" count={issues.length} isActive={activeTab === 'issues'} onClick={() => setActiveTab('issues')} />
              <TabButton icon={<UserCheck />} label="Verification" count={pendingVerification.length} isActive={activeTab === 'verification'} onClick={() => setActiveTab('verification')} />
            </nav>
          </div>
          <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                { activeTab === 'submissions' && renderContent('submissions', submissions, 'submission', 'No new submissions.') }
                { activeTab === 'predicted' && renderContent('predicted', predictedIssues, 'predicted', 'No new predicted issues.') }
                { activeTab === 'issues' && renderContent('issues', issues, 'issue', 'No active issues.') }
                { activeTab === 'verification' && renderContent('verification', pendingVerification, 'verification', 'No issues pending verification.') }
              </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <DetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <ApprovalModal item={approvingItem} teams={CATEGORY_TEAMS} onClose={() => setApprovingItem(null)} onConfirm={handleConfirmApproval} />
    </>
  );
};
  
export default AdminDashboard;