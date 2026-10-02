# Security Specification: Adda Messenger & Global Search

## 1. Data Invariants

### Conversations (`/conversations/{conversationId}`)
* `participants` array must contain valid UIDs.
* Only participants (or moderators) can read the conversation.
* A user can only create a conversation if their UID is in the `participants` array.

### Messages (`/conversations/{conversationId}/messages/{messageId}`)
* `senderId` MUST match the `request.auth.uid` (prevent sender spoofing).
* User MUST be in the `participants` array of the parent conversation to read or create a message.
* (Rate Limiting Consideration) Messages should have a timestamp, though strict native rate-limiting is handled at application layer or using a Cloud Function. We will ensure the `senderId` is strictly verified.
* Users cannot read or write messages to a conversation they are not a part of.

### Block/Privacy Enforcement
* If a user is blocked by another user in the conversation, message creation should ideally be rejected (if checked in rules) or handled at the application tier. Since `firestore.rules` can't easily cross-reference a dynamic `blocks` collection for every participant without a query cost, we will enforce that the conversation's `status` or participants array is managed properly.
* For absolute backend enforcement of blocks, we will add a check: if a conversation has a `blockedBy` array (or field), blocked users cannot send messages. 

---

## 2. The "Dirty Dozen" Malicious Payloads (Messenger Additions)

### Payload 1: Unauthorized Chat Access (URL Spoofing)
* **Path:** `/conversations/private_chat_123`
* **Auth Context:** Signed in as `user_A`
* **Action:** `read`
* **Condition:** `user_A` is NOT in `participants` of `private_chat_123`
* **Expected Result:** `PERMISSION_DENIED`

### Payload 2: Unauthorized Message Read
* **Path:** `/conversations/private_chat_123/messages/msg_001`
* **Auth Context:** Signed in as `user_A`
* **Action:** `read`
* **Condition:** `user_A` is NOT in `participants` of `private_chat_123`
* **Expected Result:** `PERMISSION_DENIED`

### Payload 3: Sender ID Spoofing (Identity Theft)
* **Path:** `/conversations/chat_ABC/messages/msg_002`
* **Auth Context:** Signed in as `user_A`
* **Action:** `create`
* **Payload:** `{"senderId": "user_B", "text": "I owe you money"}`
* **Expected Result:** `PERMISSION_DENIED`

### Payload 4: Ghost Message Injection
* **Path:** `/conversations/chat_XYZ/messages/msg_003`
* **Auth Context:** Signed in as `user_A`
* **Action:** `create`
* **Payload:** `{"senderId": "user_A", "text": "Hello"}`
* **Condition:** `user_A` is NOT in `participants` of `chat_XYZ`
* **Expected Result:** `PERMISSION_DENIED`

### Payload 5: Editing Another User's Message
* **Path:** `/conversations/chat_ABC/messages/msg_004` (created by `user_B`)
* **Auth Context:** Signed in as `user_A`
* **Action:** `update`
* **Payload:** `{"text": "Edited by hacker"}`
* **Expected Result:** `PERMISSION_DENIED`

### Payload 6: Deleting Another User's Message
* **Path:** `/conversations/chat_ABC/messages/msg_004` (created by `user_B`)
* **Auth Context:** Signed in as `user_A`
* **Action:** `delete`
* **Expected Result:** `PERMISSION_DENIED`
