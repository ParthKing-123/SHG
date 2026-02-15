# Design Document: SHG-CONNECT

## Overview

SHG-CONNECT is a real-time, blockchain-backed financial management platform for Self-Help Groups. The system architecture follows a modern web application pattern with React/TypeScript frontend, Firebase backend services, blockchain integration for transaction immutability, and Google Workspace APIs for communication and documentation.

**Core Design Principles:**
- Real-time data synchronization using Firestore onSnapshot listeners
- Immutable transaction records via blockchain storage
- Role-based access control with Firebase Authentication
- Responsive, mobile-first UI design
- Modular component architecture for maintainability
- API-first integration with Google Workspace services

**Technology Stack:**
- **Frontend**: React 18+, TypeScript 4.9+, Material-UI or Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Cloud Functions)
- **Blockchain**: Ethereum (Web3.js) or Hyperledger Fabric
- **APIs**: Gmail API, Google Calendar API, Google Meet API, Google Docs API
- **State Management**: React Context API or Redux Toolkit
- **Real-time**: Firestore onSnapshot listeners
- **Authentication**: Firebase Authentication with email/password and OTP

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │ Member Dashboard │         │ Admin Dashboard  │         │
│  └──────────────────┘         └──────────────────┘         │
│           │                            │                     │
│           └────────────┬───────────────┘                     │
│                        │                                     │
│              ┌─────────▼─────────┐                          │
│              │  Service Layer    │                          │
│              │ (API Clients)     │                          │
│              └─────────┬─────────┘                          │
└────────────────────────┼─────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼────────┐ ┌────▼─────┐ ┌───────▼────────┐
│   Firebase     │ │Blockchain│ │ Google         │
│   Services     │ │  Layer   │ │ Workspace APIs │
│                │ │          │ │                │
│ - Firestore    │ │ - Web3   │ │ - Gmail        │
│ - Auth         │ │ - Smart  │ │ - Calendar     │
│ - Functions    │ │   Contract│ │ - Meet         │
└────────────────┘ └──────────┘ │ - Docs         │
                                 └────────────────┘
```

### Component Architecture


**Frontend Components:**

```
src/
├── components/
│   ├── dashboards/
│   │   ├── MemberDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── trust-score/
│   │   ├── TrustScoreDisplay.tsx
│   │   └── TrustScoreBreakdown.tsx
│   ├── ledger/
│   │   ├── SharedLedger.tsx
│   │   └── TransactionRow.tsx
│   ├── lending/
│   │   ├── LoanApplication.tsx
│   │   ├── LoanApproval.tsx
│   │   └── LoanRepayment.tsx
│   ├── meetings/
│   │   ├── MeetingScheduler.tsx
│   │   └── MeetingAttendance.tsx
│   └── common/
│       ├── OTPInput.tsx
│       └── NotificationBanner.tsx
├── services/
│   ├── firebase/
│   │   ├── firestore.service.ts
│   │   ├── auth.service.ts
│   │   └── functions.service.ts
│   ├── blockchain/
│   │   └── blockchain.service.ts
│   └── google/
│       ├── gmail.service.ts
│       ├── calendar.service.ts
│       ├── meet.service.ts
│       └── docs.service.ts
├── hooks/
│   ├── useRealtimeData.ts
│   ├── useTrustScore.ts
│   └── useAuth.ts
├── types/
│   ├── member.types.ts
│   ├── transaction.types.ts
│   └── loan.types.ts
└── utils/
    ├── trustScoreCalculator.ts
    └── validators.ts
```

### Data Flow Patterns

**Real-time Update Flow:**
1. User action triggers state change (e.g., loan repayment)
2. Service layer writes to Firestore
3. Cloud Function validates and writes to blockchain
4. Firestore onSnapshot listener detects change
5. React component re-renders with new data
6. Trust score recalculation triggered
7. UI updates within 500ms

**Transaction Recording Flow:**
1. Admin approves transaction
2. Firestore transaction begins
3. Write transaction record to Firestore
4. Trigger Cloud Function for blockchain write
5. Cloud Function writes to blockchain
6. Blockchain returns transaction hash
7. Update Firestore record with blockchain hash
8. Commit Firestore transaction
9. Send notifications via Gmail API

## Components and Interfaces

### Core Interfaces

**Member Interface:**
```typescript
interface Member {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'member' | 'admin';
  shgId: string;
  trustScore: TrustScore;
  joinDate: Timestamp;
  isActive: boolean;
}

interface TrustScore {
  total: number; // 0-100
  repaymentDiscipline: number; // 0-100
  contributionConsistency: number; // 0-100
  meetingAttendance: number; // 0-100
  lastUpdated: Timestamp;
}
```

**Transaction Interface:**
```typescript
interface Transaction {
  id: string;
  shgId: string;
  memberId: string;
  type: 'contribution' | 'loan_disbursement' | 'loan_repayment' | 'withdrawal';
  amount: number;
  timestamp: Timestamp;
  approvedBy?: string; // admin ID
  blockchainHash?: string;
  metadata: TransactionMetadata;
}

interface TransactionMetadata {
  description?: string;
  loanId?: string;
  otpVerified?: boolean;
  balanceAfter: number;
}
```

**Loan Interface:**
```typescript
interface Loan {
  id: string;
  shgId: string;
  borrowerId: string;
  amount: number;
  interestRate: number; // percentage
  status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted';
  applicationDate: Timestamp;
  approvalDate?: Timestamp;
  approvedBy?: string;
  repaymentSchedule: RepaymentSchedule[];
  purpose: string;
  trustScoreAtApplication: number;
}

interface RepaymentSchedule {
  dueDate: Timestamp;
  amount: number;
  isPaid: boolean;
  paidDate?: Timestamp;
  paidAmount?: number;
}
```

**Meeting Interface:**
```typescript
interface Meeting {
  id: string;
  shgId: string;
  title: string;
  scheduledDate: Timestamp;
  duration: number; // minutes
  type: 'physical' | 'virtual';
  location?: string;
  meetLink?: string;
  calendarEventId?: string;
  agenda: string;
  attendance: AttendanceRecord[];
  createdBy: string;
}

interface AttendanceRecord {
  memberId: string;
  status: 'attended' | 'absent' | 'pending';
  checkInTime?: Timestamp;
}
```

### Service Layer Interfaces

**Firestore Service:**
```typescript
interface FirestoreService {
  // Real-time subscriptions
  subscribeToMember(memberId: string, callback: (member: Member) => void): Unsubscribe;
  subscribeToTransactions(shgId: string, callback: (transactions: Transaction[]) => void): Unsubscribe;
  subscribeToTrustScore(memberId: string, callback: (score: TrustScore) => void): Unsubscribe;
  
  // CRUD operations
  createTransaction(transaction: Omit<Transaction, 'id'>): Promise<string>;
  updateMember(memberId: string, updates: Partial<Member>): Promise<void>;
  createLoan(loan: Omit<Loan, 'id'>): Promise<string>;
  updateLoan(loanId: string, updates: Partial<Loan>): Promise<void>;
  
  // Queries
  getMembersByShg(shgId: string): Promise<Member[]>;
  getLoansByMember(memberId: string): Promise<Loan[]>;
  getTransactionsByDateRange(shgId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
}
```

**Blockchain Service:**
```typescript
interface BlockchainService {
  writeTransaction(transaction: BlockchainTransaction): Promise<string>; // returns hash
  verifyTransaction(hash: string): Promise<boolean>;
  getTransactionByHash(hash: string): Promise<BlockchainTransaction | null>;
  getBlockchainStatus(): Promise<BlockchainStatus>;
}

interface BlockchainTransaction {
  shgId: string;
  memberId: string;
  transactionType: string;
  amount: number;
  timestamp: number;
  firestoreId: string;
}

interface BlockchainStatus {
  isConnected: boolean;
  latestBlock: number;
  pendingTransactions: number;
}
```

**Google Workspace Service:**
```typescript
interface GoogleWorkspaceService {
  // Gmail
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendOTP(email: string, otp: string): Promise<void>;
  
  // Calendar
  createCalendarEvent(event: CalendarEvent): Promise<string>; // returns event ID
  updateCalendarEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void>;
  deleteCalendarEvent(eventId: string): Promise<void>;
  
  // Meet
  generateMeetLink(title: string, startTime: Date): Promise<string>;
  
  // Docs
  generateReport(shgId: string, dateRange: DateRange): Promise<string>; // returns doc ID
  exportToPDF(docId: string): Promise<Blob>;
}

interface CalendarEvent {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees: string[]; // email addresses
  meetLink?: string;
}
```

### Trust Score Calculator

**Algorithm Design:**

The trust score is calculated as a weighted average of three components:
- Repayment Discipline: 40%
- Contribution Consistency: 35%
- Meeting Attendance: 25%

**Repayment Discipline Calculation:**
```typescript
function calculateRepaymentDiscipline(loans: Loan[]): number {
  if (loans.length === 0) return 100; // No loans = perfect score
  
  let totalScore = 0;
  let weightedPayments = 0;
  
  for (const loan of loans) {
    for (const payment of loan.repaymentSchedule) {
      if (payment.isPaid) {
        const daysLate = calculateDaysLate(payment.dueDate, payment.paidDate);
        const paymentScore = calculatePaymentScore(daysLate);
        totalScore += paymentScore * payment.amount;
        weightedPayments += payment.amount;
      } else if (isPastDue(payment.dueDate)) {
        const daysLate = calculateDaysLate(payment.dueDate, new Date());
        const paymentScore = calculatePaymentScore(daysLate);
        totalScore += paymentScore * payment.amount;
        weightedPayments += payment.amount;
      }
    }
  }
  
  return weightedPayments > 0 ? (totalScore / weightedPayments) : 100;
}

function calculatePaymentScore(daysLate: number): number {
  if (daysLate <= 0) return 100; // On time or early
  if (daysLate <= 7) return 90;  // Up to 1 week late
  if (daysLate <= 14) return 75; // Up to 2 weeks late
  if (daysLate <= 30) return 50; // Up to 1 month late
  return Math.max(0, 50 - (daysLate - 30)); // Decreases further
}
```

**Contribution Consistency Calculation:**
```typescript
function calculateContributionConsistency(
  contributions: Transaction[],
  expectedAmount: number,
  expectedFrequency: 'monthly' | 'weekly'
): number {
  const periods = generateExpectedPeriods(expectedFrequency);
  let consistencyScore = 0;
  
  for (const period of periods) {
    const periodContributions = contributions.filter(c => 
      isInPeriod(c.timestamp, period)
    );
    
    const totalAmount = periodContributions.reduce((sum, c) => sum + c.amount, 0);
    
    if (totalAmount >= expectedAmount) {
      consistencyScore += 100;
    } else if (totalAmount > 0) {
      consistencyScore += (totalAmount / expectedAmount) * 100;
    }
    // Missing contribution = 0 points
  }
  
  return periods.length > 0 ? (consistencyScore / periods.length) : 100;
}
```

**Meeting Attendance Calculation:**
```typescript
function calculateMeetingAttendance(attendance: AttendanceRecord[]): number {
  if (attendance.length === 0) return 100; // No meetings yet
  
  const attendedCount = attendance.filter(a => a.status === 'attended').length;
  return (attendedCount / attendance.length) * 100;
}
```

**Combined Trust Score:**
```typescript
function calculateTrustScore(member: Member, data: MemberData): TrustScore {
  const repayment = calculateRepaymentDiscipline(data.loans);
  const contribution = calculateContributionConsistency(
    data.contributions,
    data.expectedContribution,
    data.contributionFrequency
  );
  const attendance = calculateMeetingAttendance(data.attendanceRecords);
  
  const total = (
    repayment * 0.40 +
    contribution * 0.35 +
    attendance * 0.25
  );
  
  return {
    total: Math.round(total),
    repaymentDiscipline: Math.round(repayment),
    contributionConsistency: Math.round(contribution),
    meetingAttendance: Math.round(attendance),
    lastUpdated: Timestamp.now()
  };
}
```

## Data Models

### Firestore Collections Structure

**Collection: `shgs`**
```typescript
{
  id: string;
  name: string;
  createdDate: Timestamp;
  totalFunds: number;
  activeMemberCount: number;
  expectedContribution: number;
  contributionFrequency: 'monthly' | 'weekly';
  settings: {
    minTrustScoreForLoan: number; // default: 60
    maxLoanPercentage: number; // default: 0.3 (30% of funds)
    interestRateFormula: string; // default: "(100 - trustScore) * 0.1"
  };
}
```

**Collection: `members`**
```typescript
{
  id: string; // matches Firebase Auth UID
  email: string;
  name: string;
  phone: string;
  role: 'member' | 'admin';
  shgId: string;
  trustScore: {
    total: number;
    repaymentDiscipline: number;
    contributionConsistency: number;
    meetingAttendance: number;
    lastUpdated: Timestamp;
  };
  joinDate: Timestamp;
  isActive: boolean;
}
```

**Collection: `transactions`**
```typescript
{
  id: string;
  shgId: string;
  memberId: string;
  type: 'contribution' | 'loan_disbursement' | 'loan_repayment' | 'withdrawal';
  amount: number;
  timestamp: Timestamp;
  approvedBy: string | null;
  blockchainHash: string | null;
  metadata: {
    description: string;
    loanId: string | null;
    otpVerified: boolean;
    balanceAfter: number;
  };
}
```

**Collection: `loans`**
```typescript
{
  id: string;
  shgId: string;
  borrowerId: string;
  amount: number;
  interestRate: number;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted';
  applicationDate: Timestamp;
  approvalDate: Timestamp | null;
  approvedBy: string | null;
  repaymentSchedule: Array<{
    dueDate: Timestamp;
    amount: number;
    isPaid: boolean;
    paidDate: Timestamp | null;
    paidAmount: number | null;
  }>;
  purpose: string;
  trustScoreAtApplication: number;
  rejectionReason: string | null;
}
```

**Collection: `meetings`**
```typescript
{
  id: string;
  shgId: string;
  title: string;
  scheduledDate: Timestamp;
  duration: number;
  type: 'physical' | 'virtual';
  location: string | null;
  meetLink: string | null;
  calendarEventId: string | null;
  agenda: string;
  attendance: Array<{
    memberId: string;
    status: 'attended' | 'absent' | 'pending';
    checkInTime: Timestamp | null;
  }>;
  createdBy: string;
  createdAt: Timestamp;
}
```

**Collection: `otp_sessions`**
```typescript
{
  id: string;
  memberId: string;
  otp: string; // hashed
  purpose: 'loan_repayment' | 'withdrawal';
  relatedId: string; // loan ID or transaction ID
  createdAt: Timestamp;
  expiresAt: Timestamp;
  attempts: number;
  isUsed: boolean;
}
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isMember(memberId) {
      return isAuthenticated() && request.auth.uid == memberId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/members/$(request.auth.uid)).data.role == 'admin';
    }
    
    function belongsToSameShg(shgId) {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/members/$(request.auth.uid)).data.shgId == shgId;
    }
    
    // SHG rules
    match /shgs/{shgId} {
      allow read: if belongsToSameShg(shgId);
      allow write: if isAdmin() && belongsToSameShg(shgId);
    }
    
    // Member rules
    match /members/{memberId} {
      allow read: if isMember(memberId) || 
                     (isAdmin() && belongsToSameShg(resource.data.shgId));
      allow update: if isAdmin() && belongsToSameShg(resource.data.shgId);
      allow create: if isAdmin();
      allow delete: if isAdmin() && belongsToSameShg(resource.data.shgId);
    }
    
    // Transaction rules
    match /transactions/{transactionId} {
      allow read: if belongsToSameShg(resource.data.shgId);
      allow create: if isAuthenticated() && belongsToSameShg(request.resource.data.shgId);
      allow update, delete: if isAdmin() && belongsToSameShg(resource.data.shgId);
    }
    
    // Loan rules
    match /loans/{loanId} {
      allow read: if isMember(resource.data.borrowerId) || 
                     (isAdmin() && belongsToSameShg(resource.data.shgId));
      allow create: if isAuthenticated() && 
                       isMember(request.resource.data.borrowerId) &&
                       belongsToSameShg(request.resource.data.shgId);
      allow update: if isAdmin() && belongsToSameShg(resource.data.shgId);
      allow delete: if isAdmin() && belongsToSameShg(resource.data.shgId);
    }
    
    // Meeting rules
    match /meetings/{meetingId} {
      allow read: if belongsToSameShg(resource.data.shgId);
      allow write: if isAdmin() && belongsToSameShg(resource.data.shgId);
    }
    
    // OTP session rules
    match /otp_sessions/{sessionId} {
      allow read, create: if isMember(request.resource.data.memberId);
      allow update: if isMember(resource.data.memberId);
      allow delete: if false; // OTP sessions expire naturally
    }
  }
}
```

### Firestore Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shgId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "memberId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "loans",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shgId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "applicationDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "meetings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shgId", "order": "ASCENDING" },
        { "fieldPath": "scheduledDate", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Blockchain Data Model

**Smart Contract Structure (Ethereum/Solidity):**

```solidity
// Simplified structure - actual implementation would be more detailed
contract SHGLedger {
    struct Transaction {
        string shgId;
        string memberId;
        string transactionType;
        uint256 amount;
        uint256 timestamp;
        string firestoreId;
    }
    
    mapping(string => Transaction) public transactions;
    string[] public transactionHashes;
    
    event TransactionRecorded(
        string indexed shgId,
        string indexed memberId,
        string transactionHash,
        uint256 timestamp
    );
    
    function recordTransaction(
        string memory shgId,
        string memory memberId,
        string memory transactionType,
        uint256 amount,
        string memory firestoreId
    ) public returns (string memory) {
        string memory txHash = generateHash(shgId, memberId, transactionType, amount, block.timestamp);
        
        transactions[txHash] = Transaction({
            shgId: shgId,
            memberId: memberId,
            transactionType: transactionType,
            amount: amount,
            timestamp: block.timestamp,
            firestoreId: firestoreId
        });
        
        transactionHashes.push(txHash);
        
        emit TransactionRecorded(shgId, memberId, txHash, block.timestamp);
        
        return txHash;
    }
    
    function verifyTransaction(string memory txHash) public view returns (bool) {
        return bytes(transactions[txHash].shgId).length > 0;
    }
    
    function getTransaction(string memory txHash) public view returns (Transaction memory) {
        return transactions[txHash];
    }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

