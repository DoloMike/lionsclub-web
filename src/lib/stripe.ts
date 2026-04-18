import "server-only";
import Stripe from "stripe";
import { env } from "./env";

let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!env.stripe.secretKey) {
    return null;
  }
  if (!client) {
    client = new Stripe(env.stripe.secretKey);
  }
  return client;
}
