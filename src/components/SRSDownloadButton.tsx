
import React from 'react';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';

export const SRSDownloadButton: React.FC = () => {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add Bengali support would require a custom font, 
    // for simplicity here we use English for the technical terms 
    // or very basic structure if Unicode is not fully supported by default.
    // Given the constraints, I will use English for the SRS content for reliable PDF generation.

    doc.setFontSize(20);
    doc.text('Software Requirements Specification (SRS)', 20, 20);
    doc.setFontSize(14);
    doc.text('Project: Puthia Upazila Portal', 20, 30);

    doc.setFontSize(12);
    const content = `
1. Modules:
   - Public Portal: View services, news, notices, directory information.
   - Admin Panel: Content management, user management, site configuration.
   - User Profiles: Registration, login, saved items.

2. Features:
   - Dynamic Home Page (Admin-controlled sections).
   - Instant Search (Meilisearch integration).
   - Google Maps (Nearby services).
   - QR-based Digital ID.
   - Analytics (Views, Calls).
   - Gamification (Daily rewards, User levels).

3. User Roles & Permissions:
   - Guest: View public content.
   - Verified User: Interaction (blood requests, reviews).
   - Admin: Full system control, data management.

4. Database Structure (Firestore):
   - Users: Profiles, roles, verification status.
   - Content: News, Notices, Services, Directories.
   - Analytics: View logs, interaction counts.
   - Settings: Homepage layout configuration.

5. API List (Proxy):
   - /api/auth, /api/content, /api/services, /api/analytics, /api/settings.

6. UI Flow:
   - Landing -> Category -> Item Detail.
   - Admin Login -> Admin Dashboard -> Module Management.
    `;
    doc.text(content, 20, 40);

    doc.save('Puthia_Portal_SRS.pdf');
  };

  return (
    <button 
      onClick={generatePDF}
      className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
    >
      <Download className="w-4 h-4" />
      Download SRS (PDF)
    </button>
  );
};
