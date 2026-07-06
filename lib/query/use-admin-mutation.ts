"use client";

/**
 * `useAdminMutation` — the companion to `useAdminQuery` for admin *actions*
 * (approve/reject KYC docs, resolve disputes, refund claims, create/patch/…).
 *
 * It runs a mutating `@/lib/api` call through the `lib/auth` session, so every
 * action inherits the same bearer + single-flight 401 → refresh → replay as the
 * read path — pages never wire tokens by hand. Errors surface as the mapped
 * `ApiError` (with `message` + `correlationId`) for consistent UI handling.
 *
 * Usage:
 *
 *   const approve = useAdminMutation((id: string, opts) =>
 *     post(`/admin/kyc/documents/${id}/approve`, undefined, opts),
 *   );
 *   // in a handler:
 *   await approve.mutate(doc.id);
 *   // approve.isPending / approve.error drive the button + inline error.
 */

import * as React from "react";
import { ApiError, type ApiSuccess, type RequestOptions } from "@/lib/api";
import { authRequest } from "@/lib/auth";

export interface UseAdminMutationResult<TArgs, TData> {
  /** Fire the mutation. Resolves with the decoded `data`, or throws `ApiError`. */
  mutate: (args: TArgs) => Promise<TData>;
  /** True while the mutation is in flight. */
  isPending: boolean;
  /** The mapped `ApiError` from the last failed run, else null. */
  error: ApiError | null;
  /** Clear `error` and `isPending` (e.g. when closing a drawer). */
  reset: () => void;
}

/**
 * @param run  Performs the mutation. Receives the caller's `args` and the
 *   auth `RequestOptions` (carrying the bearer) — spread `opts` into your
 *   `post/patch/put/del` call so the token and 401-replay apply.
 */
export function useAdminMutation<TData = unknown, TArgs = void>(
  run: (args: TArgs, options: RequestOptions) => Promise<ApiSuccess<TData>>,
): UseAdminMutationResult<TArgs, TData> {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<ApiError | null>(null);

  // Keep the latest `run` without re-creating `mutate` every render.
  const runRef = React.useRef(run);
  runRef.current = run;

  const mutate = React.useCallback(async (args: TArgs): Promise<TData> => {
    setIsPending(true);
    setError(null);
    try {
      const res = await authRequest<TData>((opts) => runRef.current(args, opts));
      return res.data;
    } catch (err: unknown) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError({
              statusCode: 0,
              code: "UNKNOWN",
              message:
                err instanceof Error ? err.message : "Unknown request error",
              details: err,
            });
      setError(apiError);
      throw apiError;
    } finally {
      setIsPending(false);
    }
  }, []);

  const reset = React.useCallback(() => {
    setError(null);
    setIsPending(false);
  }, []);

  return { mutate, isPending, error, reset };
}
