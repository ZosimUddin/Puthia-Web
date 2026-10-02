// Report Business Service (Content Moderation Case Creation, Automated Threshold & Moderation Flow)

import { db } from '../../../firebase';
import { collection, addDoc, doc, updateDoc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { SubmitReportRequest, ServiceResult } from '../types';
import { ReportValidator } from '../validators';
import { EventDispatcher } from '../eventDispatcher';

export class ReportBusinessService {
  /**
   * Submit Content Report
   */
  static async submitReport(req: SubmitReportRequest): Promise<ServiceResult<{ reportId: string }>> {
    const validation = ReportValidator.validate(req);
    if (!validation.isValid) {
      return { success: false, error: 'রিপোর্টের তথ্যে সমস্যা রয়েছে', validationErrors: validation.errors };
    }

    try {
      const reportPayload = {
        reporterId: req.reporterId,
        reporterName: req.reporterName,
        targetType: req.targetType,
        targetId: req.targetId,
        reason: req.reason,
        description: req.description || '',
        evidenceUrl: req.evidenceUrl || null,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'moderation_reports'), reportPayload);
      const reportId = docRef.id;

      // Check Automated Report Threshold (if > 3 pending reports for this target -> auto hide for review)
      try {
        const q = query(
          collection(db, 'moderation_reports'),
          where('targetId', '==', req.targetId),
          where('status', '==', 'pending')
        );
        const snap = await getDocs(q);

        if (snap.size >= 3) {
          if (req.targetType === 'post') {
            await updateDoc(doc(db, 'discussions', req.targetId), {
              isHidden: true,
              moderationReason: 'অতিরিক্ত ব্যবহারকারী রিপোর্টের কারণে পর্যালোচনায় রয়েছে'
            });
          }
        }
      } catch {}

      await EventDispatcher.emit('ReportSubmitted', {
        reportId,
        targetId: req.targetId,
        targetType: req.targetType,
        reporterId: req.reporterId
      });

      return { success: true, data: { reportId }, message: 'আপনার রিপোর্টটি জমা দেওয়া হয়েছে। মডারেশন টিম এটি পর্যালোচনা করবে।' };
    } catch (err: any) {
      console.error('Error submitting report:', err);
      return { success: false, error: 'রিপোর্ট পাঠাতে ব্যর্থ হয়েছে।' };
    }
  }
}
