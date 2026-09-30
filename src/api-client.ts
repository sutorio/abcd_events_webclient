/**
 * HTTP transport for the AbCD Events API.
 * Dev: `baseUrl` defaults to `/api/` (Vite mock bridge).
 * Tests: `createApi(mock.origin + "/")` (json-server, no `/api` prefix).
 *
 * CRUD: use `api` + resources (`api.get(user.path(1)).json(user.schema)`).
 * Multi-step only: `ensureCustomer` below.
 */
import ky, { type KyInstance } from "ky";
import type { CreateCustomerInput, Customer } from "./api-schema.ts";
import { customer, customers } from "./api-resources.ts";

export type { KyInstance };

export function createApi(baseUrl = "/api/"): KyInstance {
  return ky.create({ baseUrl });
}

/** Browser default — same-origin `/api/`. */
export const api = createApi();

/**
 * Upsert Customer by email within an Organisation (list + patch/post).
 * Defaults to Organisation 1 (day-one mock).
 */
export async function ensureCustomer(
  client: KyInstance,
  input: Omit<CreateCustomerInput, "organisationId"> & {
    organisationId?: number;
  },
): Promise<Customer> {
  const organisationId = input.organisationId ?? 1;
  const email = input.email.trim().toLowerCase();
  const existing = (
    await client
      .get(customers.path, { searchParams: { organisationId } })
      .json(customers.schema)
  ).find(
    (c) =>
      c.organisationId === organisationId && c.email.toLowerCase() === email,
  );

  if (existing) {
    return client
      .patch(customer.path(existing.id), {
        json: {
          name: input.name,
          phone: input.phone,
          marketingOptIn: input.marketingOptIn,
          email,
        },
      })
      .json(customer.schema);
  }

  return client
    .post(customers.path, {
      json: {
        organisationId,
        email,
        name: input.name,
        phone: input.phone,
        marketingOptIn: input.marketingOptIn,
      },
    })
    .json(customer.schema);
}
