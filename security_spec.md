# Security Specification for Mizaniti App

## 1. Data Invariants
- **Ownership**: Every document (Transaction, Project, Budget) must belong to a specific `userId` that matches the authenticated user's UID.
- **Integrity**: Timestamps (`createdAt`, `updatedAt`) must be server-generated and immutable (`createdAt` cannot change after creation).
- **Relational Integrity**: Projects and Transactions must contain valid IDs and data types.
- **Budgeting**: Users can only see and modify their own budget limits.

## 2. The Dirty Dozen Payloads (Attack Vectors to Block)

| ID | Attack Name | Payload / Action | Expected Result |
|----|-------------|------------------|-----------------|
| D1 | Identity Spoofing | Creating a transaction with `userId: "attacker_uid"` while logged in as `user_A`. | PERMISSION_DENIED |
| D2 | Global Read | Attempting to `list` all transactions without a `where("userId", "==", uid)` filter. | PERMISSION_DENIED |
| D3 | Shadow Field Injection | Adding `isVerified: true` to a project document update. | PERMISSION_DENIED |
| D4 | Resource Poisoning | Setting a document ID to a 1.5MB junk string. | PERMISSION_DENIED |
| D5 | Negative Wealth | Creating an income/expense with `amount: -5000`. | PERMISSION_DENIED |
| D6 | Timestamp Forgery | Providing a client-side `createdAt` time from 2010. | PERMISSION_DENIED |
| D7 | Immutable Theft | Attempting to change the `userId` or `createdAt` of an existing transaction. | PERMISSION_DENIED |
| D8 | Orphaned Write | Creating a budget for a category that doesn't exist in the allowed list. | PERMISSION_DENIED |
| D9 | State Jumping | Marking a project as `paid` directly without going through the required owner action. | PERMISSION_DENIED (Must be owner) |
| D10 | PII Leakage | Attempting to `get` another user's project details using their ID. | PERMISSION_DENIED |
| D11 | Over-Sized Notes | Sending a `notes` field containing 5MB of text. | PERMISSION_DENIED |
| D12 | Type Poisoning | Sending `amount: "one thousand"` (string instead of number). | PERMISSION_DENIED |

## 3. Test Runner (Conceptual)
All writes must pass the `isValid[Entity]()` helper which checks:
1. `auth != null`
2. `userId == request.auth.uid`
3. Proper data types and string lengths.
4. Correct fields using `hasOnly()`/`hasAll()`.
