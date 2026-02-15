# Requirements Document: SHG-CONNECT

## Introduction

SHG-CONNECT is a digital platform designed to modernize Self-Help Group (SHG) operations by providing real-time financial tracking, transparent ledger management, trust-based lending, and integrated communication tools. The system serves two primary user groups: SHG members who participate in group activities and administrators who manage group operations. Built using React, TypeScript, and Firebase, the platform leverages real-time database capabilities, blockchain technology for transaction immutability, and Google Workspace integration for enhanced collaboration and communication.

## Glossary

- **SHG**: Self-Help Group - A community-based financial intermediation model where members pool savings and provide loans to each other
- **Member**: An individual who participates in an SHG, makes contributions, attends meetings, and may borrow or lend funds
- **Administrator**: An SHG leader or manager responsible for overseeing group operations, approving transactions, and managing member activities
- **Trust_Score**: A numerical metric (0-100) that evaluates a member's reliability based on repayment discipline, contribution consistency, and meeting attendance
- **Shared_Ledger**: A transparent, real-time record of all financial transactions within the SHG
- **Internal_Lending**: The process by which SHG members borrow funds from the collective pool at low interest rates
- **Member_Dashboard**: The user interface providing members access to their personal data, transactions, and trust scores
- **Admin_Dashboard**: The user interface providing administrators access to group-level data, member management, and approval workflows
- **Firestore**: Google Cloud Firestore, the real-time NoSQL database used for data storage and synchronization
- **OTP**: One-Time Password - A temporary authentication code sent via SMS or email for secure transaction verification
- **Blockchain_Ledger**: An immutable, distributed ledger that stores transaction records to prevent tampering
- **Firebase_Authentication**: The authentication service used to verify user identities and secure access
- **Google_Workspace_API**: Collection of APIs including Gmail, Calendar, Meet, and Docs for integrated communication and documentation

## Requirements

### Requirement 1: Member Dashboard Access

**User Story:** As a member, I want to access a personalized dashboard, so that I can view my financial information, trust score, and transaction history.

#### Acceptance Criteria

1. WHEN a member logs in with valid credentials, THE Member_Dashboard SHALL display the member's current trust score, contribution history, and outstanding loans
2. WHEN a member accesses the dashboard, THE System SHALL retrieve data from Firestore within 2 seconds
3. THE Member_Dashboard SHALL update in real-time when any transaction affecting the member is recorded
4. WHEN a member's session expires after 30 minutes of inactivity, THE System SHALL require re-authentication
5. WHERE a member has multiple SHG memberships, THE Member_Dashboard SHALL allow switching between different group contexts

### Requirement 2: Administrator Dashboard Access

**User Story:** As an administrator, I want to access a comprehensive admin dashboard, so that I can manage members, approve transactions, and monitor group health.

#### Acceptance Criteria

1. WHEN an administrator logs in with valid credentials, THE Admin_Dashboard SHALL display group-level statistics including total funds, active loans, and member count
2. THE Admin_Dashboard SHALL provide access to member management functions including adding, removing, and updating member information
3. WHEN an administrator views the dashboard, THE System SHALL display pending approval requests within a dedicated notification panel
4. THE Admin_Dashboard SHALL update in real-time when any transaction or member activity occurs
5. WHEN an administrator's session expires after 30 minutes of inactivity, THE System SHALL require re-authentication

### Requirement 3: Real-time Trust Score Calculation

**User Story:** As a member, I want my trust score to be calculated and updated in real-time, so that I can see how my behavior affects my standing in the group.

#### Acceptance Criteria

1. WHEN a member makes a loan repayment, THE System SHALL recalculate the member's trust score within 1 second and update the score in Firestore
2. WHEN a member makes a monthly contribution, THE System SHALL increase the contribution consistency component of the trust score
3. WHEN a member attends a meeting, THE System SHALL increase the meeting attendance component of the trust score
4. THE System SHALL calculate trust score as a weighted average: 40% repayment discipline, 35% contribution consistency, 25% meeting attendance
5. THE Trust_Score SHALL be a value between 0 and 100, where 100 represents perfect compliance
6. WHEN a member misses a repayment deadline, THE System SHALL decrease the repayment discipline component proportionally to the delay duration
7. WHEN a member misses a scheduled meeting, THE System SHALL decrease the meeting attendance component by a fixed percentage

### Requirement 4: Real-time Trust Score Display

**User Story:** As a member, I want to see my trust score update instantly, so that I receive immediate feedback on my actions.

#### Acceptance Criteria

1. THE Member_Dashboard SHALL use Firestore onSnapshot listeners to receive trust score updates without page refresh
2. WHEN the trust score changes in Firestore, THE Member_Dashboard SHALL reflect the new score within 500 milliseconds
3. THE Member_Dashboard SHALL display a visual indicator (color coding or progress bar) representing the trust score level
4. THE Member_Dashboard SHALL show a breakdown of the three trust score components with individual scores
5. WHEN a trust score update occurs, THE System SHALL display a brief notification explaining what action caused the change

### Requirement 5: Transparent Shared Ledger Access

**User Story:** As a member, I want to view all transactions in the shared ledger, so that I can verify the group's financial transparency.

#### Acceptance Criteria

1. THE Shared_Ledger SHALL display all transactions including contributions, loans, repayments, and withdrawals
2. WHEN a member accesses the ledger, THE System SHALL show transactions in reverse chronological order with the most recent first
3. THE Shared_Ledger SHALL display for each transaction: timestamp, member name, transaction type, amount, and current balance
4. THE Shared_Ledger SHALL update in real-time using Firestore onSnapshot listeners when new transactions are recorded
5. THE Shared_Ledger SHALL allow filtering by transaction type, date range, and member name
6. THE Shared_Ledger SHALL allow members to export transaction history as CSV or PDF for personal records

### Requirement 6: Transparent Shared Ledger Recording

**User Story:** As an administrator, I want all transactions to be automatically recorded in the shared ledger, so that financial transparency is maintained without manual effort.

#### Acceptance Criteria

1. WHEN a transaction is approved, THE System SHALL write the transaction record to Firestore within 1 second
2. WHEN a transaction is recorded in Firestore, THE System SHALL simultaneously write the transaction to the Blockchain_Ledger
3. THE System SHALL ensure each transaction record includes: transaction ID, timestamp, member ID, transaction type, amount, and administrator approval signature
4. IF a Firestore write fails, THEN THE System SHALL retry up to 3 times before displaying an error message
5. THE System SHALL maintain transaction atomicity ensuring both Firestore and blockchain writes succeed or both fail

### Requirement 7: Internal SHG Loan Application

**User Story:** As a member, I want to apply for a loan from the SHG fund, so that I can access low-interest credit based on my trust score.

#### Acceptance Criteria

1. WHEN a member submits a loan application, THE System SHALL validate that the requested amount does not exceed the available SHG fund balance
2. WHEN a member submits a loan application, THE System SHALL validate that the member's trust score is above 60
3. THE System SHALL calculate the maximum loan amount as: (Trust_Score / 100) * (Available_Fund_Balance * 0.3)
4. WHEN a loan application is submitted, THE System SHALL create a pending approval request visible to administrators
5. THE System SHALL include in the loan application: requested amount, purpose, proposed repayment schedule, and current trust score
6. IF a member has an outstanding loan with overdue payments, THEN THE System SHALL prevent new loan applications

### Requirement 8: Internal SHG Loan Approval

**User Story:** As an administrator, I want to review and approve loan applications, so that I can ensure responsible lending within the group.

#### Acceptance Criteria

1. WHEN an administrator views a loan application, THE Admin_Dashboard SHALL display the applicant's trust score, contribution history, and previous loan repayment record
2. WHEN an administrator approves a loan, THE System SHALL disburse the funds by updating the member's account balance in Firestore
3. WHEN an administrator approves a loan, THE System SHALL create a loan record with repayment schedule, interest rate, and due dates
4. WHEN an administrator rejects a loan, THE System SHALL record the rejection reason and notify the member
5. THE System SHALL calculate interest rate based on trust score: (100 - Trust_Score) * 0.1% per month, with a minimum of 2% and maximum of 8%
6. WHEN a loan is approved, THE System SHALL send a notification to the member via email using Gmail API

### Requirement 9: OTP-Secured Loan Repayment

**User Story:** As a member, I want to make loan repayments secured by OTP, so that my transactions are protected from unauthorized access.

#### Acceptance Criteria

1. WHEN a member initiates a loan repayment, THE System SHALL generate a 6-digit OTP and send it to the member's registered email using Firebase_Authentication
2. THE System SHALL set the OTP expiration time to 5 minutes from generation
3. WHEN a member enters the OTP, THE System SHALL validate it against the generated code
4. IF the OTP is incorrect, THEN THE System SHALL allow up to 3 attempts before locking the transaction for 15 minutes
5. WHEN the OTP is validated successfully, THE System SHALL process the repayment and update the loan balance in Firestore
6. WHEN a repayment is processed, THE System SHALL update the member's trust score based on timeliness (on-time, early, or late)
7. WHEN a repayment is completed, THE System SHALL send a confirmation notification via email using Gmail API

### Requirement 10: Blockchain Transaction Storage

**User Story:** As an administrator, I want all transactions stored on a blockchain, so that the financial records are tamper-resistant and auditable.

#### Acceptance Criteria

1. WHEN a transaction is approved, THE System SHALL create a blockchain record containing transaction hash, timestamp, member ID, amount, and transaction type
2. THE Blockchain_Ledger SHALL use cryptographic hashing to link each transaction to the previous transaction
3. THE System SHALL store blockchain records in an immutable format that prevents modification or deletion
4. WHEN a transaction is written to the blockchain, THE System SHALL return a transaction hash that can be used for verification
5. THE Admin_Dashboard SHALL provide a blockchain verification tool that allows checking transaction integrity using the transaction hash
6. THE System SHALL maintain synchronization between Firestore records and blockchain records, flagging any discrepancies

### Requirement 11: Gmail Integration for Notifications

**User Story:** As a member, I want to receive email notifications for important events, so that I stay informed about my SHG activities.

#### Acceptance Criteria

1. WHEN a member's loan application is approved or rejected, THE System SHALL send an email notification using Gmail API
2. WHEN a member's loan repayment is due within 3 days, THE System SHALL send a reminder email using Gmail API
3. WHEN a member's trust score changes significantly (more than 10 points), THE System SHALL send an email notification explaining the change
4. WHEN a new meeting is scheduled, THE System SHALL send an email invitation to all members using Gmail API
5. THE System SHALL format email notifications with clear subject lines, member name, and relevant transaction or event details
6. IF Gmail API is unavailable, THEN THE System SHALL queue notifications and retry sending every 5 minutes for up to 1 hour

### Requirement 12: Google Calendar Integration for Meeting Scheduling

**User Story:** As an administrator, I want to schedule SHG meetings using Google Calendar, so that members receive automatic calendar invitations and reminders.

#### Acceptance Criteria

1. WHEN an administrator creates a meeting, THE System SHALL create a Google Calendar event using the Calendar API
2. THE System SHALL send calendar invitations to all active members' registered email addresses
3. THE Calendar event SHALL include meeting title, date, time, duration, location (physical or virtual), and agenda
4. WHEN a member accepts or declines a calendar invitation, THE System SHALL update the meeting attendance tracking in Firestore
5. THE System SHALL send automatic reminders 24 hours and 1 hour before the scheduled meeting time
6. WHEN a meeting is rescheduled or cancelled, THE System SHALL update the calendar event and notify all invited members

### Requirement 13: Google Meet Integration for Virtual Meetings

**User Story:** As a member, I want to join virtual SHG meetings via Google Meet, so that I can participate remotely when physical attendance is not possible.

#### Acceptance Criteria

1. WHEN an administrator schedules a virtual meeting, THE System SHALL generate a Google Meet link using the Meet API
2. THE System SHALL include the Google Meet link in the calendar invitation and email notifications
3. WHEN a member clicks the Meet link, THE System SHALL open the Google Meet interface in a new browser tab or window
4. THE System SHALL track meeting attendance by recording which members joined the Google Meet session
5. WHEN a meeting ends, THE System SHALL update each participant's meeting attendance record in Firestore
6. THE System SHALL update trust scores for members who attended the virtual meeting

### Requirement 14: Google Docs and PDF Report Generation

**User Story:** As an administrator, I want to generate financial reports in Google Docs and PDF format, so that I can share official documentation with members and external stakeholders.

#### Acceptance Criteria

1. WHEN an administrator requests a financial report, THE System SHALL generate a Google Doc containing transaction summary, member contributions, outstanding loans, and trust score distribution
2. THE System SHALL format the Google Doc with proper headings, tables, and charts for readability
3. THE System SHALL provide options to generate reports for custom date ranges (monthly, quarterly, yearly, or custom)
4. WHEN a Google Doc is generated, THE System SHALL provide an option to export it as PDF using Google Docs API
5. THE System SHALL include in the report: SHG name, report period, generation date, and administrator signature
6. THE System SHALL allow administrators to share generated reports directly via email using Gmail API

### Requirement 15: User Authentication and Authorization

**User Story:** As a system user, I want secure authentication and role-based access control, so that my data is protected and I can only access features appropriate to my role.

#### Acceptance Criteria

1. THE System SHALL use Firebase_Authentication for user login with email and password
2. WHEN a user registers, THE System SHALL validate email format and require passwords with minimum 8 characters including uppercase, lowercase, and numbers
3. THE System SHALL assign each user a role (member or administrator) stored in Firestore
4. WHEN a user attempts to access a feature, THE System SHALL verify the user's role and grant or deny access accordingly
5. THE System SHALL prevent members from accessing administrator-only features such as loan approval and member management
6. WHEN a user fails authentication 5 times within 15 minutes, THE System SHALL temporarily lock the account for 30 minutes
7. THE System SHALL support password reset functionality using email verification via Firebase_Authentication

### Requirement 16: Contribution Recording and Tracking

**User Story:** As a member, I want to record my monthly contributions, so that my participation is tracked and my trust score is maintained.

#### Acceptance Criteria

1. WHEN a member makes a contribution, THE System SHALL record the contribution amount, date, and member ID in Firestore
2. THE System SHALL validate that the contribution amount is greater than zero and does not exceed a reasonable maximum (10 times the expected contribution)
3. WHEN a contribution is recorded, THE System SHALL update the SHG's total fund balance
4. WHEN a contribution is recorded, THE System SHALL update the member's contribution consistency score
5. THE System SHALL track the expected contribution amount and frequency for each member
6. WHEN a member misses a scheduled contribution, THE System SHALL decrease the contribution consistency component of the trust score
7. WHEN a contribution is recorded, THE System SHALL write the transaction to both Firestore and the Blockchain_Ledger

### Requirement 17: Meeting Attendance Tracking

**User Story:** As an administrator, I want to track meeting attendance automatically, so that trust scores reflect actual participation without manual data entry.

#### Acceptance Criteria

1. WHEN a meeting is scheduled, THE System SHALL create an attendance record in Firestore with all member IDs and initial status as "not attended"
2. WHEN a member checks in at a physical meeting, THE System SHALL update the attendance status to "attended" with timestamp
3. WHEN a member joins a Google Meet virtual meeting, THE System SHALL automatically update the attendance status to "attended"
4. WHEN a meeting ends, THE System SHALL calculate attendance rate as (attended members / total members) * 100
5. WHEN attendance is recorded, THE System SHALL update each member's meeting attendance component of the trust score
6. THE System SHALL allow administrators to manually mark attendance for members who attended but were not automatically tracked

### Requirement 18: Data Synchronization and Consistency

**User Story:** As a system user, I want data to remain consistent across all views and devices, so that I always see accurate and up-to-date information.

#### Acceptance Criteria

1. THE System SHALL use Firestore transactions to ensure atomic updates when multiple fields must change together
2. WHEN a trust score is recalculated, THE System SHALL update all three components (repayment, contribution, attendance) and the total score in a single atomic operation
3. THE System SHALL use Firestore onSnapshot listeners to push updates to all connected clients within 1 second
4. IF a network connection is lost, THEN THE System SHALL queue local changes and synchronize them when connection is restored
5. THE System SHALL detect and resolve conflicts when the same data is modified offline by multiple users, prioritizing administrator changes
6. THE System SHALL maintain referential integrity ensuring loan records always reference valid member IDs

### Requirement 19: System Performance and Scalability

**User Story:** As a system user, I want the platform to respond quickly and handle multiple concurrent users, so that my experience is smooth and efficient.

#### Acceptance Criteria

1. THE System SHALL load the dashboard within 3 seconds on a standard broadband connection (5 Mbps)
2. THE System SHALL support at least 100 concurrent users without performance degradation
3. WHEN multiple users access the shared ledger simultaneously, THE System SHALL serve data without conflicts or delays exceeding 2 seconds
4. THE System SHALL use Firestore indexing to optimize query performance for transaction history and member searches
5. THE System SHALL implement pagination for transaction lists, displaying 50 transactions per page
6. THE System SHALL cache frequently accessed data (trust scores, member profiles) in browser local storage with 5-minute expiration

### Requirement 20: Data Security and Privacy

**User Story:** As a member, I want my personal and financial data to be secure and private, so that I can trust the platform with sensitive information.

#### Acceptance Criteria

1. THE System SHALL encrypt all data in transit using HTTPS/TLS 1.3 or higher
2. THE System SHALL store sensitive data (passwords, OTPs) using Firebase_Authentication's built-in encryption
3. THE System SHALL implement Firestore security rules that prevent members from accessing other members' private data
4. THE System SHALL implement Firestore security rules that allow only administrators to modify member roles and approve transactions
5. THE System SHALL log all administrative actions (loan approvals, member modifications) with timestamp and administrator ID for audit purposes
6. THE System SHALL automatically expire user sessions after 30 minutes of inactivity
7. THE System SHALL mask sensitive information (partial account numbers, partial email addresses) in shared views while showing full details in private views

### Requirement 21: Error Handling and System Reliability

**User Story:** As a system user, I want the platform to handle errors gracefully and recover from failures, so that I can complete my tasks even when issues occur.

#### Acceptance Criteria

1. WHEN a Firestore operation fails, THE System SHALL display a user-friendly error message and suggest corrective actions
2. WHEN a blockchain write fails, THE System SHALL roll back the corresponding Firestore transaction to maintain consistency
3. WHEN a Google API (Gmail, Calendar, Meet, Docs) is unavailable, THE System SHALL queue the operation and retry automatically
4. THE System SHALL implement exponential backoff for retrying failed operations, with maximum retry attempts of 5
5. WHEN a critical error occurs, THE System SHALL log the error details to Firestore for administrator review
6. THE System SHALL provide a system health dashboard showing the status of Firebase, blockchain, and Google API integrations
7. IF the system detects data inconsistency between Firestore and blockchain, THEN THE System SHALL flag the discrepancy and notify administrators

### Requirement 22: Mobile Responsiveness

**User Story:** As a member, I want to access the platform on my mobile device, so that I can manage my SHG activities on the go.

#### Acceptance Criteria

1. THE System SHALL render correctly on mobile devices with screen widths from 320px to 768px
2. THE System SHALL use responsive design patterns ensuring all features are accessible on mobile without horizontal scrolling
3. THE System SHALL optimize touch interactions for mobile devices with appropriately sized buttons (minimum 44x44 pixels)
4. THE System SHALL load mobile views within 5 seconds on 3G network connections
5. THE System SHALL support both portrait and landscape orientations on mobile devices
6. THE System SHALL use progressive web app (PWA) features to enable offline access to recently viewed data

### Requirement 23: Accessibility Compliance

**User Story:** As a user with disabilities, I want the platform to be accessible, so that I can use all features regardless of my abilities.

#### Acceptance Criteria

1. THE System SHALL implement ARIA labels for all interactive elements to support screen readers
2. THE System SHALL maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text
3. THE System SHALL support keyboard navigation for all features without requiring a mouse
4. THE System SHALL provide text alternatives for all non-text content (images, icons, charts)
5. THE System SHALL allow users to adjust text size up to 200% without loss of functionality
6. THE System SHALL use semantic HTML elements (header, nav, main, footer) for proper document structure

## Technical Constraints

1. **Frontend Framework**: The system MUST be built using React 18+ with TypeScript 4.9+
2. **Backend Services**: The system MUST use Firebase (Firestore, Authentication, Cloud Functions) for backend operations
3. **Real-time Updates**: The system MUST use Firestore onSnapshot listeners for real-time data synchronization
4. **Blockchain**: The system MUST implement blockchain storage for transaction immutability (technology choice: Ethereum, Hyperledger, or custom implementation)
5. **Google Workspace**: The system MUST integrate with Gmail API, Google Calendar API, Google Meet API, and Google Docs API
6. **Authentication**: The system MUST use Firebase Authentication for user management and OTP generation
7. **Browser Support**: The system MUST support the latest two versions of Chrome, Firefox, Safari, and Edge
8. **Mobile Support**: The system MUST be responsive and functional on iOS 14+ and Android 10+ devices

## Security and Compliance Considerations

1. **Data Protection**: All personal and financial data must be encrypted in transit and at rest
2. **Access Control**: Role-based access control must be enforced at both application and database levels
3. **Audit Trail**: All financial transactions and administrative actions must be logged with timestamps and user identifiers
4. **OTP Security**: One-time passwords must expire within 5 minutes and be invalidated after use
5. **Session Management**: User sessions must expire after 30 minutes of inactivity
6. **Blockchain Integrity**: Transaction records on the blockchain must be verifiable and tamper-resistant
7. **API Security**: All Google Workspace API calls must use OAuth 2.0 authentication with appropriate scopes
8. **Privacy**: Member data must be visible only to the member and administrators, not to other members
9. **Backup and Recovery**: Firestore data must be backed up daily with point-in-time recovery capability
10. **Compliance**: The system should be designed with consideration for financial data protection regulations applicable to the deployment region

## Dependencies

1. **Firebase Project**: A configured Firebase project with Firestore, Authentication, and Cloud Functions enabled
2. **Google Cloud Project**: A Google Cloud project with Gmail API, Calendar API, Meet API, and Docs API enabled
3. **Blockchain Infrastructure**: Access to a blockchain network or implementation of a custom blockchain solution
4. **Email Service**: Firebase Authentication email service configured for OTP delivery
5. **SSL Certificate**: Valid SSL certificate for HTTPS encryption
6. **Domain Name**: Registered domain name for the production deployment
7. **Development Tools**: Node.js 18+, npm/yarn, Git, and appropriate IDE/editor

## Success Criteria

The SHG-CONNECT system will be considered successful when:

1. Members can view their trust scores updating in real-time within 1 second of relevant actions
2. All transactions are visible in the shared ledger with real-time updates
3. Members can apply for and receive loans with OTP-secured repayments
4. Administrators can manage the SHG with full visibility and control
5. All transactions are stored immutably on the blockchain
6. Google Workspace integration provides seamless communication and documentation
7. The system maintains 99.5% uptime during business hours
8. User satisfaction score exceeds 4.0 out of 5.0 in post-deployment surveys
9. Trust score calculations accurately reflect member behavior with less than 5% variance from manual calculations
10. The system handles peak loads of 100 concurrent users without performance degradation
