# Migrate Local Transactions to Firebase Firestore

Vercel employs a read-only serverless file system, which means the app can no longer read/write to [src/data/transactions.json](file:///c:/Users/psvar/OneDrive/Desktop/Varnika/src/data/transactions.json) when deployed. To fix this, we will migrate the storage layer to use Firebase Firestore, connecting to the Firebase project that is already configured in [src/firebase/config.ts](file:///c:/Users/psvar/OneDrive/Desktop/Varnika/src/firebase/config.ts).

## Proposed Changes

### [src/lib/db.ts](file:///c:/Users/psvar/OneDrive/Desktop/Varnika/src/lib/db.ts)
We will rewrite the database interaction layer to connect to Firestore instead of the local file system.
#### [MODIFY] [db.ts](file:///c:/Users/psvar/OneDrive/Desktop/Varnika/src/lib/db.ts)
- Import `initializeApp` and `getFirestore` from the Firebase Client SDK.
- Connect to the `transactions` collection.
- Rewrite [getTransactionsFromFile](file:///c:/Users/psvar/OneDrive/Desktop/Varnika/src/lib/db.ts#17-51) to `getTransactionsFromFirestore` (fetches all documents in the collection).
- Add new functions: `addTransactionToFirestore`, `updateTransactionInFirestore`, and `deleteTransactionFromFirestore`.
- Remove all `fs/promises` and local cache logic, relying on Firestore for real-time data status.

### [src/lib/actions.ts](file:///c:/Users/psvar/OneDrive/Desktop/Varnika/src/lib/actions.ts)
We will update the Next.js Server Actions to use the new Firestore-powered functions.
#### [MODIFY] [actions.ts](file:///c:/Users/psvar/OneDrive/Desktop/Varnika/src/lib/actions.ts)
- Update [addTransaction](file:///c:/Users/psvar/OneDrive/Desktop/Varnika/src/lib/actions.ts#58-74) to call the new Firestore add function instead of reading/writing the whole array.
- Update [updateTransaction](file:///c:/Users/psvar/OneDrive/Desktop/Varnika/src/lib/actions.ts#75-96) to call the new Firestore update function.
- Update [deleteTransaction](file:///c:/Users/psvar/OneDrive/Desktop/Varnika/src/lib/actions.ts#97-109) to call the new Firestore delete function.
- Ensure `revalidatePath` responds correctly after cloud mutations.

### [src/lib/api.ts](file:///c:/Users/psvar/OneDrive/Desktop/Varnika/src/lib/api.ts)
Update data-fetching functions.
#### [MODIFY] [api.ts](file:///c:/Users/psvar/OneDrive/Desktop/Varnika/src/lib/api.ts)
- Change [getTransactionsFromFile](file:///c:/Users/psvar/OneDrive/Desktop/Varnika/src/lib/db.ts#17-51) calls to use the new `getTransactionsFromFirestore` function.

## Verification Plan

### Automated Tests
- Run `npm run dev` and ensure there are no build or compilation errors regarding the missing JSON files or file system imports.

### Manual Verification
1. Open the application locally at `http://localhost:9002/dashboard`.
2. Delete an existing transaction and verify it disappears from the dashboard and doesn't throw a server error.
3. Add a new transaction (e.g., an Expense) and verify it appears immediately.
4. Edit the new transaction and verify the values update correctly.
*(This implies Firestore rules are set to allow read/write. If they are not, we will need to adjust them in your Firebase console).*
