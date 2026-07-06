/**
 * Public surface of the shared admin data-query layer. Import from
 * `@/lib/query`.
 *
 *   import { useAdminQuery } from "@/lib/query";
 */
export {
  useAdminQuery,
  type AdminQueryParams,
  type UseAdminQueryOptions,
  type UseAdminQueryResult,
} from "./use-admin-query";
export {
  useAdminMutation,
  type UseAdminMutationResult,
} from "./use-admin-mutation";
