"use client";

import React, {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CalendarDays,
  IndianRupee,
  ListChecks,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TransactionType } from "../../../generated/prisma/enums";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
};

const getTodayDate = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - timezoneOffset).toISOString().split("T")[0];
};

const formatMoney = (amount: number) => {
  return amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
};

function TransactionPage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>();
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(getTodayDate);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totals = useMemo(() => {
    return transactions.reduce(
      (summary, transaction) => {
        if (transaction.type === TransactionType.INCOME) {
          summary.income += transaction.amount;
        } else {
          summary.expense += transaction.amount;
        }

        summary.balance = summary.income - summary.expense;
        return summary;
      },
      { income: 0, expense: 0, balance: 0 },
    );
  }, [transactions]);

  const getTransactions = async function () {
    try {
      setIsLoading(true);

      const res = await fetch("/api/transactions", {
        method: "GET",
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(
          data.message || data.error || "Failed to get transactions",
        );
      }

      setTransactions(Array.isArray(data) ? data : []);
      setError("");
    } catch (error) {
      console.error("Failed to get transactions", error);
      setError("Failed to get transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const createTransactions = async function (e: FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      setError("");

      if (!title.trim() || !category.trim() || !amount || !date || !type) {
        return setError("All fields are required");
      }

      if (typeof title !== "string" || typeof category !== "string") {
        return setError("Title and category should be of type string");
      }

      setIsSubmitting(true);

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          type,
          category,
          date,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(
          data.message || data.error || "Failed to create transaction",
        );
      }

      setTitle("");
      setAmount("");
      setType(undefined);
      setCategory("");
      setDate(getTodayDate());
      await getTransactions();
    } catch (error) {
      console.error("Failed to create transaction", error);
      setError("Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTransaction = async function (id: string) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this transaction?",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      setDeletingId(id);

      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(
          data.message || data.error || "Failed to delete transaction",
        );
      }

      setTransactions((currentTransactions) =>
        currentTransactions.filter((transaction) => transaction.id !== id),
      );
    } catch (error) {
      console.error("Failed to delete transaction", error);
      setError("Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadTransactions = async () => {
      try {
        const res = await fetch("/api/transactions", {
          method: "GET",
        });

        const data = await res.json();

        if (ignore) {
          return;
        }

        if (!res.ok) {
          return setError(
            data.message || data.error || "Failed to get transactions",
          );
        }

        setTransactions(Array.isArray(data) ? data : []);
        setError("");
      } catch (error) {
        if (!ignore) {
          console.error("Failed to get transactions", error);
          setError("Failed to get transactions");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadTransactions();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="dark min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <AppNav />

        <header className="flex flex-col gap-2">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Transactions
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Add income or expenses, then review your latest activity in one
                place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={getTransactions}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ListChecks />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Total income</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <IndianRupee className="size-5 text-emerald-600" />
                {formatMoney(totals.income)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total expense</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <IndianRupee className="size-5 text-red-600" />
                {formatMoney(totals.expense)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Balance</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <IndianRupee className="size-5 text-primary" />
                {formatMoney(totals.balance)}
              </CardTitle>
            </CardHeader>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Add transaction</CardTitle>
              <CardDescription>
                Today is selected automatically. You can change the date.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createTransactions}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                      id="title"
                      value={title}
                      placeholder="Groceries"
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="amount">Amount</FieldLabel>
                    <Input
                      id="amount"
                      min="0"
                      step="0.01"
                      type="number"
                      value={amount}
                      placeholder="500"
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="type">Type</FieldLabel>
                    <select
                      id="type"
                      value={type ?? ""}
                      onChange={(e) =>
                        setType(e.target.value as TransactionType)
                      }
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                    >
                      <option value="">Select type</option>
                      <option value={TransactionType.EXPENSE}>Expense</option>
                      <option value={TransactionType.INCOME}>Income</option>
                    </select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <Input
                      id="category"
                      value={category}
                      placeholder="Food, salary, travel"
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="date">Date</FieldLabel>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </Field>

                  <FieldError>{error}</FieldError>

                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Plus />
                    )}
                    Add transaction
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent transactions</CardTitle>
              <CardDescription>
                {transactions.length} transaction
                {transactions.length === 1 ? "" : "s"} recorded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Loading transactions
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
                  <CalendarDays className="size-8 text-muted-foreground" />
                  <p className="text-sm font-medium">No transactions yet</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Add your first income or expense from the form.
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
                                transaction.type === TransactionType.INCOME
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-red-50 text-red-700 ring-1 ring-red-600/20 dark:bg-red-950 dark:text-red-300"
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
                        <div className="flex items-center gap-3">
                          <p
                            className={`text-lg font-semibold ${
                              transaction.type === TransactionType.INCOME
                                ? "text-emerald-700 dark:text-emerald-300"
                                : "text-red-700 dark:text-red-300"
                            }`}
                          >
                            {transaction.type === TransactionType.INCOME
                              ? "+"
                              : "-"}
                            Rs. {formatMoney(transaction.amount)}
                          </p>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            aria-label={`Delete ${transaction.title}`}
                            title="Delete transaction"
                            disabled={deletingId === transaction.id}
                            onClick={() => void deleteTransaction(transaction.id)}
                          >
                            {deletingId === transaction.id ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <Trash2 />
                            )}
                          </Button>
                        </div>
                      </div>
                      {index < transactions.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default TransactionPage;
