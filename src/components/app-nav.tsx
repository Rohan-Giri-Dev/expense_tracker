"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumn, ReceiptText, WalletCards } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/transactions",
    label: "Transactions",
    icon: ReceiptText,
  },
  {
    href: "/summary",
    label: "Summary",
    icon: ChartColumn,
  },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <Link className="flex w-fit items-center gap-2" href="/transactions">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <WalletCards className="size-5" />
        </span>
        <span>
          <span className="block text-base font-semibold leading-none">
            Expense tracker
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Personal budget
          </span>
        </span>
      </Link>

      <div className="flex w-full gap-2 rounded-lg border border-border bg-muted/30 p-1 sm:w-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              className={cn(
                "flex h-9 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground sm:flex-none",
                isActive &&
                  "bg-background text-foreground shadow-sm ring-1 ring-border",
              )}
              href={item.href}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
