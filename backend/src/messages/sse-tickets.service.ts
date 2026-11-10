import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

/**
 * Single-use, short-lived tickets for the SSE inbox stream.
 *
 * EventSource cannot set Authorization headers, and the session JWT
 * must never travel in a URL (server logs, Referer, browser history).
 * Instead the client POSTs /messages/stream-ticket with its normal
 * Bearer header; the returned opaque ticket may be redeemed exactly
 * once, within seconds, as ?ticket= on the stream endpoint.
 *
 * Storage is a plain in-memory Map: on this single-instance deployment
 * a restart only drops still-unredeemed tickets, and clients simply
 * reconnect with a fresh ticket via the normal error path.
 */

/** Ticket lifetime: covers clock skew plus connect latency, no more. */
const TICKET_TTL_MS = 30_000;

/** Claims copied from the authenticated request, replayed on the stream. */
export type TicketClaims = Record<string, unknown>;

interface PendingTicket {
  claims: TicketClaims;
  expiresAt: number;
}

@Injectable()
export class SseTicketsService {
  private readonly pending = new Map<string, PendingTicket>();

  /** Issues one ticket bound to the caller's claims. */
  issue(claims: TicketClaims) {
    // Opportunistic sweep so abandoned tickets never accumulate.
    const now = Date.now();
    for (const [key, entry] of this.pending) {
      if (entry.expiresAt <= now) this.pending.delete(key);
    }
    const ticket = randomBytes(32).toString('base64url');
    this.pending.set(ticket, { claims: { ...claims }, expiresAt: now + TICKET_TTL_MS });
    return { ticket, expiresIn: TICKET_TTL_MS };
  }

  /**
   * Redeems a ticket for its claims. Exactly one redemption succeeds
   * per issued ticket: the entry is deleted before claims are trusted.
   */
  consume(ticket: string): TicketClaims | null {
    const entry = this.pending.get(ticket);
    if (!entry) return null;
    this.pending.delete(ticket);
    if (Date.now() >= entry.expiresAt) return null;
    return entry.claims;
  }
}
