import { 
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, onSnapshot, serverTimestamp, Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { logAuditActivity } from './auditLogger';

export interface UpazilaService {
  id: string;
  order: number;
  title: string;
  titleEn?: string;
  category: string;
  icon: string;
  subtitle: string;
  description: string;
  processingTime: string;
  fee: string;
  requiredDocuments: string[];
  helpline: string;
  department: string;
  isActive: boolean;
  connectionType?: 'internal' | 'external';
  connectedPageUrl?: string;
  connectedPageName?: string;
  updatedAt?: any;
  updatedBy?: string;
}

export interface UpazilaServiceSubmission {
  id?: string;
  serviceId: string;
  serviceTitle: string;
  itemTitle: string;
  category: string;
  contactNumber: string;
  address: string;
  description: string;
  documentsOrLink?: string;
  submittedByUid: string;
  submittedByName: string;
  submittedByPhone?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt?: any;
  updatedAt?: any;
  approvedAt?: any;
  approvedBy?: string;
}

export interface UpazilaServiceEditRequest {
  id?: string;
  serviceId: string;
  serviceTitle: string;
  currentTitle: string;
  proposedTitle: string;
  currentHelpline: string;
  proposedHelpline: string;
  currentDetails: string;
  proposedDetails: string;
  editReason: string;
  submittedByUid: string;
  submittedByName: string;
  submittedByPhone?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt?: any;
  updatedAt?: any;
  approvedBy?: string;
}

export interface UpazilaServiceReport {
  id?: string;
  serviceId: string;
  serviceTitle: string;
  reportReason: string;
  details: string;
  reporterUid: string;
  reporterName: string;
  reporterPhone?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  actionTaken?: string;
  adminNotes?: string;
  createdAt?: any;
  updatedAt?: any;
  resolvedBy?: string;
}

class UpazilaServicesService {
  // =========================================================================
  // 1. CITIZEN PUBLIC ACTIONS (Submissions, Edit Requests, Reports)
  // =========================================================================

  /**
   * Citizens submit new information or listing for any of the 63 services
   */
  async submitNewEntry(data: Omit<UpazilaServiceSubmission, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const colRef = collection(db, 'upazila_services_submissions');
      const docRef = await addDoc(colRef, {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting new service entry:', error);
      throw error;
    }
  }

  /**
   * Citizens request edits or updates for an existing service
   */
  async submitEditRequest(data: Omit<UpazilaServiceEditRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const colRef = collection(db, 'upazila_services_edits');
      const docRef = await addDoc(colRef, {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting service edit request:', error);
      throw error;
    }
  }

  /**
   * Citizens report wrong information, closed service, or issues for any of the 63 services
   */
  async submitReport(data: Omit<UpazilaServiceReport, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const colRef = collection(db, 'upazila_services_reports');
      const docRef = await addDoc(colRef, {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting service report:', error);
      throw error;
    }
  }

  // =========================================================================
  // 2. SUPER ADMIN MODERATION: USER ADDITIONS (Submissions)
  // =========================================================================

  subscribeSubmissions(onUpdate: (items: UpazilaServiceSubmission[]) => void) {
    const q = query(collection(db, 'upazila_services_submissions'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: UpazilaServiceSubmission[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as UpazilaServiceSubmission));
      onUpdate(items);
    }, (error) => {
      console.error('Error listening to service submissions:', error);
    });
  }

  async approveSubmission(submission: UpazilaServiceSubmission, adminUser: { uid: string; name: string }): Promise<void> {
    if (!submission.id) return;
    try {
      // 1. Update status to approved
      const subRef = doc(db, 'upazila_services_submissions', submission.id);
      await updateDoc(subRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: adminUser.name,
        updatedAt: serverTimestamp()
      });

      // 2. Add or merge into upazila_services
      const newServiceRef = doc(collection(db, 'upazila_services'));
      await setDoc(newServiceRef, {
        order: 99,
        title: submission.itemTitle,
        category: submission.category || 'general',
        icon: '📋',
        subtitle: submission.description?.slice(0, 80) || 'ইউজার সাবমিটকৃত সেবা',
        description: submission.description || '',
        processingTime: 'তাৎক্ষণিক',
        fee: 'বিনামূল্যে',
        requiredDocuments: [],
        helpline: submission.contactNumber || '',
        department: submission.serviceTitle,
        isActive: true,
        connectionType: 'internal',
        connectedPageUrl: `/services/${submission.serviceId}`,
        connectedPageName: submission.serviceTitle,
        updatedAt: serverTimestamp(),
        updatedBy: adminUser.name
      });

      // 3. Log audit action
      await logAuditActivity({
        action: 'অনুমোদন - ইউজার সাবমিশন',
        targetId: submission.id,
        targetType: 'UPAZILA_SERVICE_SUBMISSION',
        customEmail: adminUser.name,
        actorRole: 'super_admin',
        category: 'service',
        details: `Approved submission "${submission.itemTitle}" for service "${submission.serviceTitle}"`
      });
    } catch (error) {
      console.error('Error approving service submission:', error);
      throw error;
    }
  }

  async rejectSubmission(submissionId: string, adminNotes: string, adminUser: { uid: string; name: string }): Promise<void> {
    try {
      const subRef = doc(db, 'upazila_services_submissions', submissionId);
      await updateDoc(subRef, {
        status: 'rejected',
        adminNotes: adminNotes || 'তথ্য সঠিক নয় বা অসম্পূর্ণ।',
        updatedAt: serverTimestamp()
      });

      await logAuditActivity({
        action: 'বাতিল - ইউজার সাবমিশন',
        targetId: submissionId,
        targetType: 'UPAZILA_SERVICE_SUBMISSION',
        customEmail: adminUser.name,
        actorRole: 'super_admin',
        category: 'service',
        details: `Rejected submission ID ${submissionId}. Reason: ${adminNotes}`
      });
    } catch (error) {
      console.error('Error rejecting service submission:', error);
      throw error;
    }
  }

  // =========================================================================
  // 3. SUPER ADMIN MODERATION: USER EDIT REQUESTS
  // =========================================================================

  subscribeEditRequests(onUpdate: (items: UpazilaServiceEditRequest[]) => void) {
    const q = query(collection(db, 'upazila_services_edits'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: UpazilaServiceEditRequest[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as UpazilaServiceEditRequest));
      onUpdate(items);
    }, (error) => {
      console.error('Error listening to service edit requests:', error);
    });
  }

  async approveEditRequest(editReq: UpazilaServiceEditRequest, adminUser: { uid: string; name: string }): Promise<void> {
    if (!editReq.id) return;
    try {
      // 1. Update edit request doc
      const editRef = doc(db, 'upazila_services_edits', editReq.id);
      await updateDoc(editRef, {
        status: 'approved',
        approvedBy: adminUser.name,
        updatedAt: serverTimestamp()
      });

      // 2. Apply updates to original service doc if serviceId exists
      if (editReq.serviceId) {
        const serviceRef = doc(db, 'upazila_services', editReq.serviceId);
        const serviceSnap = await getDoc(serviceRef);
        if (serviceSnap.exists()) {
          const updatePayload: Record<string, any> = {
            updatedAt: serverTimestamp(),
            updatedBy: adminUser.name
          };
          if (editReq.proposedTitle) updatePayload.title = editReq.proposedTitle;
          if (editReq.proposedHelpline) updatePayload.helpline = editReq.proposedHelpline;
          if (editReq.proposedDetails) updatePayload.description = editReq.proposedDetails;

          await updateDoc(serviceRef, updatePayload);
        }
      }

      await logAuditActivity({
        action: 'অনুমোদন - ইউজার এডিট রিকোয়েস্ট',
        targetId: editReq.id,
        targetType: 'UPAZILA_SERVICE_EDIT_REQUEST',
        customEmail: adminUser.name,
        actorRole: 'super_admin',
        category: 'service',
        details: `Approved edit request for service "${editReq.serviceTitle}"`
      });
    } catch (error) {
      console.error('Error approving edit request:', error);
      throw error;
    }
  }

  async rejectEditRequest(editId: string, adminNotes: string, adminUser: { uid: string; name: string }): Promise<void> {
    try {
      const editRef = doc(db, 'upazila_services_edits', editId);
      await updateDoc(editRef, {
        status: 'rejected',
        adminNotes: adminNotes || 'প্রস্তাবিত পরিবর্তন গ্রহণযোগ্য নয়।',
        updatedAt: serverTimestamp()
      });

      await logAuditActivity({
        action: 'বাতিল - ইউজার এডিট রিকোয়েস্ট',
        targetId: editId,
        targetType: 'UPAZILA_SERVICE_EDIT_REQUEST',
        customEmail: adminUser.name,
        actorRole: 'super_admin',
        category: 'service',
        details: `Rejected edit request ID ${editId}. Note: ${adminNotes}`
      });
    } catch (error) {
      console.error('Error rejecting edit request:', error);
      throw error;
    }
  }

  // =========================================================================
  // 4. SUPER ADMIN MODERATION: USER REPORTS & COMPLAINTS
  // =========================================================================

  subscribeReports(onUpdate: (items: UpazilaServiceReport[]) => void) {
    const q = query(collection(db, 'upazila_services_reports'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: UpazilaServiceReport[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as UpazilaServiceReport));
      onUpdate(items);
    }, (error) => {
      console.error('Error listening to service reports:', error);
    });
  }

  async resolveReport(reportId: string, actionTaken: string, adminUser: { uid: string; name: string }): Promise<void> {
    try {
      const repRef = doc(db, 'upazila_services_reports', reportId);
      await updateDoc(repRef, {
        status: 'resolved',
        actionTaken: actionTaken || 'সংশোধন ও ব্যবস্থা গ্রহণ করা হয়েছে।',
        resolvedBy: adminUser.name,
        updatedAt: serverTimestamp()
      });

      await logAuditActivity({
        action: 'নিষ্পত্তি - ইউজার রিপোর্ট',
        targetId: reportId,
        targetType: 'UPAZILA_SERVICE_REPORT',
        customEmail: adminUser.name,
        actorRole: 'super_admin',
        category: 'service',
        details: `Resolved report ID ${reportId}. Action: ${actionTaken}`
      });
    } catch (error) {
      console.error('Error resolving report:', error);
      throw error;
    }
  }

  async dismissReport(reportId: string, reason: string, adminUser: { uid: string; name: string }): Promise<void> {
    try {
      const repRef = doc(db, 'upazila_services_reports', reportId);
      await updateDoc(repRef, {
        status: 'dismissed',
        adminNotes: reason || 'রিপোর্টটির কোনো ভিত্তি পাওয়া যায়নি।',
        resolvedBy: adminUser.name,
        updatedAt: serverTimestamp()
      });

      await logAuditActivity({
        action: 'ডিসমিস - ইউজার রিপোর্ট',
        targetId: reportId,
        targetType: 'UPAZILA_SERVICE_REPORT',
        customEmail: adminUser.name,
        actorRole: 'super_admin',
        category: 'service',
        details: `Dismissed report ID ${reportId}`
      });
    } catch (error) {
      console.error('Error dismissing report:', error);
      throw error;
    }
  }
}

export const upazilaServicesService = new UpazilaServicesService();
