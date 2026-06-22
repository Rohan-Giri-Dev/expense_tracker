# Expense Tracker

A simple full-stack expense tracker built with Next.js, Prisma, PostgreSQL, and Tailwind CSS.

This project is focused on learning the core flow of a CRUD-style app: collecting transaction data, saving it in a database, reading it through API routes, and deriving useful monthly summaries from that data.

## Features

- Add income and expense transactions
- Store transactions in PostgreSQL using Prisma
- View total income, total expenses, and current balance
- Delete transactions from the transactions page
- View a monthly summary by selected month
- See category-wise expense totals with a simple bar chart
- Review detailed monthly stats such as average expense, highest spending category, and savings rate
- Navigate between Transactions and Summary pages with a shared navbar

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma 7
- PostgreSQL
- Tailwind CSS
- shadcn/ui style components
- Lucide React icons

## Project Structure

```text
src/
  app/
    api/
      transactions/
        route.ts          # GET and POST transactions
        [id]/route.ts     # DELETE one transaction
      summary/
        route.ts          # GET monthly summary transactions
    transactions/
      page.tsx            # Add, list, refresh, and delete transactions
    summary/
      page.tsx            # Monthly summary and category overview
  components/
    app-nav.tsx           # Shared navbar
    ui/                   # Reusable UI components
  lib/
    prisma.ts             # Prisma client setup

prisma/
  schema.prisma           # Database model and enum
  migrations/             # Prisma migrations
```

## Data Model

The app currently uses one main Prisma model:

```prisma
model Transaction {
  id        String          @id @default(cuid())
  title     String
  amount    Float
  type      TransactionType
  category  String
  date      DateTime
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
}

enum TransactionType {
  INCOME
  EXPENSE
}
```

## API Routes

### Transactions

```http
GET /api/transactions
```

Returns all transactions, ordered by date.

```http
POST /api/transactions
```

Creates a new transaction.

Expected body:

```json
{
  "title": "Groceries",
  "amount": 500,
  "type": "EXPENSE",
  "category": "Food",
  "date": "2026-06-22"
}
```

```http
DELETE /api/transactions/:id
```

Deletes one transaction by id.

### Summary

```http
GET /api/summary?month=YYYY-MM
```

Returns transactions for the selected month.

Example:

```http
GET /api/summary?month=2026-06
```

The summary page uses this response to calculate:

- Total income
- Total expense
- Balance
- Income count
- Expense count
- Average expense
- Highest spending category
- Category-wise spending data

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="your_postgresql_connection_string"
```

Do not commit your real database URL to GitHub.

### 3. Run Prisma migration

```bash
npx prisma migrate dev
```

### 4. Start the development server

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:3000
```

The home route redirects to:

```text
/transactions
```

## Useful Scripts

```bash
npm run dev
```

Start the development server.

```bash
npm run build
```

Create a production build.

```bash
npm run start
```

Run the production build.

```bash
npm run lint
```

Run ESLint.

## Learning Notes

This project intentionally does not include authentication yet. For a simple expense tracker, the first goal is to understand the core full-stack flow clearly:

1. Add transaction data from the frontend.
2. Validate and save it through an API route.
3. Store it in PostgreSQL with Prisma.
4. Fetch it back into the UI.
5. Calculate totals and summaries from the transaction list.

Authentication can be added later if the app needs multiple users with separate data.



## Status

This is a learning project and a practical full-stack exercise. The goal is to keep improving it step by step while keeping the code easy to understand.
