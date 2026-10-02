# Super Admin Module Development Guidelines (Gemini Instructions)

Every Super Admin module must implement these 7 fundamental phases of development:

1. **Database**: Firestore collections structure, fields, constraints, relationships, indices mapped in `firebase-blueprint.json`.
2. **Backend/Firebase**: Model helpers, security rules in `firestore.rules` (including action-based affectedKeys), validation helpers, error logging.
3. **API**: Clean TypeScript fetch/query routines in `/src/api.ts` or in the services folder.
4. **Super Admin Controls**: Live interactive controls for creation, editing, deletion, and approvals on the admin panel (no mock button stubs).
5. **Permissions**: Restricting sensitive routes and write triggers using standard RBAC policies.
6. **Frontend Connections**: Fully wiring buttons, cards, forms, and tables to live Firestore instances.
7. **Testing/QA**: Handing faulty data, securing data pipelines, mobile-responsive layout adjustments, performance auditing, and logging admin actions using `createAuditTrail`.
