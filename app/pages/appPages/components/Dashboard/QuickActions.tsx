import React from "react";
import { Plus, ChevronDown } from "lucide-react";

export interface QuickActionItem {
  id: string;
  label: string;
  intent: "primary" | "secondary";
}

interface QuickActionsProps {
  actions: QuickActionItem[];
  onAction?: (action: QuickActionItem) => void;
}

export interface ResponsiveActionGroupProps {
  primaryAction: QuickActionItem;
  secondaryActions: QuickActionItem[];
  onAction?: (action: QuickActionItem) => void;
}

function ActionButton({
  action,
  onAction,
}: {
  action: QuickActionItem;
  onAction?: (action: QuickActionItem) => void;
}) {
  const isPrimary = action.intent === "primary";
  return (
    <button
      key={action.id}
      type="button"
      onClick={() => onAction?.(action)}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all active:scale-[0.98] ${
        isPrimary
          ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700 hover:shadow border border-blue-600"
          : "border border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
      }`}
    >
      {isPrimary ? <Plus size={14} strokeWidth={2.5} /> : null}
      <span>{action.label}</span>
    </button>
  );
}

export function ResponsiveActionGroup({
  primaryAction,
  secondaryActions,
  onAction,
}: ResponsiveActionGroupProps) {
  return (
    <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
      <ActionButton action={primaryAction} onAction={onAction} />
      {secondaryActions.length > 0 ? (
        <>
          <div className="hidden min-w-0 flex-wrap items-center gap-2 2xl:flex">
            {secondaryActions.map((action) => (
              <ActionButton key={action.id} action={action} onAction={onAction} />
            ))}
          </div>
          <details className="relative 2xl:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <span>More actions</span>
              <ChevronDown size={13} className="text-slate-400" />
            </summary>
            <div className="absolute right-0 top-full z-30 mt-1.5 flex w-48 max-w-[calc(100vw-2rem)] flex-col gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
              {secondaryActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={(e) => {
                    onAction?.(action);
                    const details = e.currentTarget.closest("details");
                    if (details) details.open = false;
                  }}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </details>
        </>
      ) : null}
    </div>
  );
}

export default function QuickActions({ actions, onAction }: QuickActionsProps) {
  const primaryAction = actions.find((action) => action.intent === "primary") ?? actions[0];
  const secondaryActions = actions.filter((action) => action.id !== primaryAction?.id);

  if (!primaryAction) return null;

  return (
    <ResponsiveActionGroup
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      onAction={onAction}
    />
  );
}
