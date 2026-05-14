# DoseTrack Rwanda Security Specification

## 1. Data Invariants
- A dose record must belong to a valid authenticated user.
- A dose record cannot be created with a `userId` that doesn't match the authenticated user.
- Dose values (CTDI, DLP) must be positive numbers.
- Once created, the `userId` and `createdAt` fields are immutable.

## 2. The "Dirty Dozen" Payloads (Deny Cases)
1. **Identity Spoofing**: Creating a record where `userId` is "someone_else_id".
2. **Path Poisoning**: Creating a record with a 2MB string as `{recordId}`.
3. **Resource Exhaustion**: Sending a 1MB string in the `patientId` field.
4. **Invalid Type**: Sending a boolean for `dlp`.
5. **Unauthorized Read**: Trying to read records where `userId` is not the current user's UID.
6. **Integrity Breach**: Modifying `userId` of an existing record.
7. **Future Creation**: Setting `createdAt` to a future date manually.
8. **Invalid ID Format**: Record ID containing malicious scripts or non-standard characters.
9. **Blanket Query**: Requesting `list /doseRecords` without a `where` clause on `userId`.
10. **Shadow Field**: Adding `isAdmin: true` to a record.
11. **Negative Dose**: Setting `ctdiVol` to -15.
12. **Status Bypass**: Manually setting `drlExceeded: false` for a value that clearly exceeds it (though we'll rely on server-side logic or strict client validation for now, we'll enforce the field exists).

## 3. Test Runner (Mock Tests)
- `it('should deny if userId mismatch')`
- `it('should deny if dose < 0')`
- `it('should deny unauthenticated access')`
- `it('should allow owner read/write')`
