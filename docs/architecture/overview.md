# Architecture Overview

VestRoll is built with a modern, scalable stack focusing on transparency and security.

## System Components
- **Web App**: Next.js 15 providing a seamless UI and API routes.
- **Service Layer**: Decoupled business logic for payroll, invoicing, and tax.
- **Blockchain Layer**: Integration with Stellar for instant global settlement.
- **Database**: PostgreSQL with Drizzle ORM for type-safe data management.

## Data Flow
1. User interacts with the Next.js frontend.
2. API routes call the appropriate service in `src/server/services`.
3. Services interact with the DB and/or the Stellar network.
4. Real-time updates are pushed back to the UI.
