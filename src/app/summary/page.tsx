"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  IndianRupee,
  Loader2,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type SummaryTransaction = {
  id: string;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
};

const getCurrentMonth = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 7);
};

const formatMoney = (amount: number) => {
  return amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
};

const formatMonthName = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);

  if (!year || !monthNumber) {
    return "Selected month";
  }

  return new Date(year, monthNumber - 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

function Summary() {
  const [transactions, setTransactions] = useState<SummaryTransaction[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [month, setMonth] = useState(getCurrentMonth);

  useEffect(() => {
    let ignore = false;

    const fetchTransactions = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`/api/summary?month=${month}`);
        const data = await res.json();

        if (ignore) {
          return;
        }

        if (!res.ok) {
          setTransactions([]);
          return setError(data.error || "Failed to fetch the transactions");
        }

        setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
        setError("");
      } catch (error) {
        if (!ignore) {
          console.error("Failed to fetch summary", error);
          setTransactions([]);
          setError("Failed to fetch the transactions");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void fetchTransactions();

    return () => {
      ignore = true;
    };
  }, [month]);

  //useMemo is a React Hook used to remember the result of a calculation between re-renders.
  const summary = useMemo(() => {
    // These two variables will store the total money coming in and going out.
    let income = 0;
    let expense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    // This object will store expense total category by category.
    // Example final shape:
    // {
    //   Food: 800,
    //   Travel: 1200,
    //   Shopping: 500
    // }
    const categoryTotals: Record<string, number> = {};

    // Go through every transaction one by one.
    for (const tx of transactions) {
      // If transaction is income, add its amount to total income.
      if (tx.type === "INCOME") {
        income += tx.amount;
        incomeCount += 1;
      }

      // If transaction is expense, add its amount to total expense.
      if (tx.type === "EXPENSE") {
        expense += tx.amount;
        expenseCount += 1;

        // Check if this category already has some total.
        // If yes, use old total.
        // If not, start from 0.
        const oldCategoryTotal = categoryTotals[tx.category] || 0;

        // Add current transaction amount to that category total.
        categoryTotals[tx.category] = oldCategoryTotal + tx.amount;
      }
    }

    // Convert categoryTotals object into an array.
    // Why? Because arrays are easier to map in JSX and use in charts.
    //
    // From:
    // { Food: 800, Travel: 1200 }
    //
    // To:
    // [
    //   { category: "Food", amount: 800 },
    //   { category: "Travel", amount: 1200 }
    // ]
    const categoryData = Object.entries(categoryTotals)
      .map(([category, amount]) => {
        return {
          category,
          amount,
        };
      })
      .sort((first, second) => second.amount - first.amount);

    // Find the category where the user spent the most money.
    const highestExpense = categoryData.reduce(
      (highest, currentCategory) => {
        // If current category amount is bigger than previous highest,
        // then current category becomes the new highest.
        if (currentCategory.amount > highest.amount) {
          return currentCategory;
        }

        // Otherwise keep the old highest category.
        return highest;
      },
      // This is the starting value.
      // If there are no expenses, highestExpense will be "None".
      { category: "None", amount: 0 },
    );

    // Return one summary object so the UI can use it easily.
    return {
      income,
      expense,
      balance: income - expense,
      count: transactions.length,
      incomeCount,
      expenseCount,
      averageExpense: expenseCount > 0 ? expense / expenseCount : 0,
      categoryData,
      highestExpense,
    };
  }, [transactions]);

  const maxCategoryAmount = Math.max(
    ...summary.categoryData.map((item) => item.amount),
    1,
  );

  return (
    <main className="dark min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Expense tracker
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                Monthly summary
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Review income, spending, balance, and category-wise expenses
                for {formatMonthName(month)}.
              </p>
            </div>

            <div className="w-full sm:w-52">
              <label
                className="mb-2 block text-sm font-medium text-muted-foreground"
                htmlFor="summary-month"
              >
                Select month
              </label>
              <Input
                id="summary-month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Total income</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp className="size-5 text-emerald-500" />
                Rs. {formatMoney(summary.income)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total expense</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingDown className="size-5 text-red-500" />
                Rs. {formatMoney(summary.expense)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Balance</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <WalletCards className="size-5 text-primary" />
                Rs. {formatMoney(summary.balance)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Transactions</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ReceiptText className="size-5 text-sky-500" />
                {summary.count}
              </CardTitle>
            </CardHeader>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardTitle>Spending by category</CardTitle>
              <CardDescription>
                A simple bar chart showing where your expense money went.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Loading summary
                </div>
              ) : summary.categoryData.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
                  <CalendarDays className="size-8 text-muted-foreground" />
                  <p className="text-sm font-medium">No expenses this month</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Add an expense transaction to see category-wise spending.
                  </p>
                </div>
              ) : (
                <div className="flex min-h-72 flex-col justify-center gap-4">
                  {summary.categoryData.map((item) => {
                    const width = (item.amount / maxCategoryAmount) * 100;

                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <p className="font-medium">{item.category}</p>
                          <p className="shrink-0 text-muted-foreground">
                            Rs. {formatMoney(item.amount)}
                          </p>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed overview</CardTitle>
              <CardDescription>
                Quick numbers for {formatMonthName(month)}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">
                    Income entries
                  </span>
                  <span className="font-medium">{summary.incomeCount}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">
                    Expense entries
                  </span>
                  <span className="font-medium">{summary.expenseCount}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">
                    Average expense
                  </span>
                  <span className="font-medium">
                    Rs. {formatMoney(summary.averageExpense)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Highest spending
                  </span>
                  <span className="text-right font-medium">
                    {summary.highestExpense.category} - Rs.{" "}
                    {formatMoney(summary.highestExpense.amount)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">
                    Savings rate
                  </span>
                  <span className="font-medium">
                    {summary.income > 0
                      ? `${Math.round((summary.balance / summary.income) * 100)}%`
                      : "0%"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Transactions in this month</CardTitle>
            <CardDescription>
              {summary.count} transaction{summary.count === 1 ? "" : "s"} found
              for {formatMonthName(month)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading transactions
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
                <ReceiptText className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium">No transactions found</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Try another month or add a transaction first.
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {transactions.map((transaction, index) => (
                  <div key={transaction.id}>
                    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{transaction.title}</p>
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                              transaction.type === "INCOME"
                                ? "bg-emerald-950 text-emerald-300 ring-1 ring-emerald-500/30"
                                : "bg-red-950 text-red-300 ring-1 ring-red-500/30"
                            }`}
                          >
                            {transaction.type.toLowerCase()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {transaction.category} -{" "}
                          {new Date(transaction.date).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <p
                        className={`flex items-center text-lg font-semibold ${
                          transaction.type === "INCOME"
                            ? "text-emerald-300"
                            : "text-red-300"
                        }`}
                      >
                        <IndianRupee className="size-4" />
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {formatMoney(transaction.amount)}
                      </p>
                    </div>
                    {index < transactions.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default Summary;
