"use client";

import { useActionState, useOptimistic } from "react";
import { cn } from "@/lib/utils";

// Simulation of a Server Action (in a real project, this would be in another file with "use server")
async function updateUsernameAction(prevState: any, formData: FormData) {
  const newName = formData.get("username") as string;
  
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 1000));

  if (newName.length < 3) {
    return { error: "Name must be at least 3 characters long", success: false };
  }

  return { error: null, success: true, name: newName };
}

interface ActionFormTemplateProps {
  initialName: string;
}

/**
 * Robust form example using React 19 APIs
 * useActionState + useOptimistic
 */
export default function ActionFormTemplate({ initialName }: ActionFormTemplateProps) {
  // 1. useActionState to manage the action result
  const [state, formAction, isPending] = useActionState(updateUsernameAction, {
    error: null,
    success: false,
    name: initialName,
  });

  // 2. useOptimistic for instant feedback
  const [optimisticName, setOptimisticName] = useOptimistic(
    state.name || initialName,
    (state, newName: string) => newName
  );

  const handleSubmit = async (formData: FormData) => {
    const newName = formData.get("username") as string;
    setOptimisticName(newName);
    formAction(formData);
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4 border rounded-xl bg-card">
      <h2 className="text-xl font-semibold">Profile: {optimisticName}</h2>
      
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            New Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            disabled={isPending}
            className={cn(
              "w-full px-3 py-2 border rounded-md focus:ring-2 ring-primary/20 outline-none transition-all",
              state.error ? "border-destructive" : "border-input"
            )}
            placeholder="Type your name..."
          />
        </div>

        {state.error && (
          <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full py-2 px-4 rounded-md font-medium transition-all",
            "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          )}
        >
          {isPending ? "Saving..." : "Update Name"}
        </button>
      </form>

      {state.success && (
        <p className="text-sm text-green-600 text-center">
          Name updated successfully!
        </p>
      )}
    </div>
  );
}
