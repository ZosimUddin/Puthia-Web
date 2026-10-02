# Super Admin Module Development Guidelines

As specified by the system administrator, every Super Admin module must adhere to the following 7-step standard:

## ১. Database
- **ট্যাবিল, Column, Relationship, Index তৈরি:**
  - Define all Firestore collections, paths, nested properties, sub-collections, types, and schema validations in `firebase-blueprint.json`.
  - Ensure correct relationship bindings (e.g., matching parent and child IDs).
  - Explicitly define and build any required compound indices in Firestore.

## ২. Backend / Firebase Business Logic
- **Model, Service, Business Logic, Validation, Security rules:**
  - Build strong business services in `/src/services` using native Firestore and auth primitives.
  - Implement zero-trust security rules in `firestore.rules` using the Fortress Pattern (including global default deny, verification checks via `email_verified == true`, validation helpers, and action-based update gates with `affectedKeys().hasOnly()`).
  - Gracefully handle system errors using `handleFirestoreError()`.

## ৩. API
- **Frontend ও অন্যান্য অংশের সঙ্গে Data আদান-প্রদান করার API:**
  - Design typed, asynchronous methods in `/src/api.ts` or in specific services to safely query, create, update, delete, and list documents.
  - Use server-side proxies or backend controllers when managing sensitive API keys or credentials.

## ৪. Filament Admin Panel / Super Admin Command Center
- **ড্যাশবোর্ড থেকে বাস্তবে Create / Edit / Delete / Approve / Verify করার সুবিধা:**
  - Provide complete, robust management controls in the Super Admin Dashboard (`SuperAdminDashboard.tsx` or module-specific admin components).
  - Include real action handlers for Approvals, NID/Merchant verifications, Status changes (active, suspended, banned), and Data editing. No mock stubs.

## ৫. Permission
- **Super Admin-এর Full Permission এবং অন্য Role-এর সীমিত Permission:**
  - Enforce role check barriers using `PermissionPolicyEngine.ts` and React route protectors (`SuperAdminRoute.tsx`, `AdminRoute.tsx`, etc.).
  - Ensure Super Admins possess full master privileges while lower roles (editor, moderator, regular user) are strictly restricted.

## ৬. Frontend Connection
- **Final UI-এর Button/Card/Form সরাসরি Backend-এর সঙ্গে Connect করা:**
  - Wire up all visual controls directly to the api and service layers.
  - Ensure real-time state synchronization, loading transitions, and success/error notifications.

## ৭. Testing & QA
- **কাজ করছে কি না, ভুল Data দিলে কী হয়, পারমিশন ঠিক আছে কি না, সিকিউরিটি, মোবাইলের রেসপনসিভনেস, পারফর্মেন্স ও এরর হ্যান্ডেলিং:**
  - Validate input fields with strict client-side validation constraints.
  - Handle erroneous inputs gracefully without crashing the app.
  - Test UI on multiple screen sizes to maintain a pristine, highly responsive visual layout (with touch targets >= 44px on mobile).
  - Enforce continuous auditing by logging actions to both `admin_audit_logs` and `audit_logs` via `auditLogger.ts`.
