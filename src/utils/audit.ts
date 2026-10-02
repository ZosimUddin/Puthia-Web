import { logAuditActivity } from "../services/auditLogger";

export const logAuditEvent = async (
  action: string,
  targetCollection: string,
  targetId: string,
  details: Record<string, any>
) => {
  try {
    // Adapter to convert logAuditEvent calls to logAuditActivity
    await logAuditActivity({
      action: action,
      details: `Target collection: ${targetCollection}, Doc ID: ${targetId}. Details: ${JSON.stringify(details)}`,
      category: "content",
      severity: "info",
      changes: details
    });
  } catch (error) {
    console.error("Error logging audit event via wrapper:", error);
  }
};
