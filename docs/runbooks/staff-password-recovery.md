# Staff Password Recovery Runbook

Self-service email reset is disabled for all non-CLIENT roles by design.
If a staff member (ADMIN, TAX_PERSONAL, TAX_BUSINESS, BOOKKEEPING) loses
their password, a Super Admin performs recovery manually. Both local and
production share the same database, so this affects production directly.

## Procedure (manual, requires DB access)

1. A Super Admin generates a strong one-time temporary password and shares
   it with the staff member through a verified out-of-band channel.
2. Set the bcrypt hash directly (never echo the password into shell history):
   `read -s PW && export PW`, then run a Node script using
   `bcrypt.hash(process.env.PW, 10)` and
   `prisma.customer.update({ where: { email }, data: { password: hash } })`,
   then `unset PW`.
3. Verify: `POST /api/auth/login` must return the account with its staff role.
4. Instruct the staff member to change the password via /     settings after
   first login.

## Roadmap (not yet implemented)

- Admin panel UI to issue temporary staff passwords (audit-logged).
- Mandatory 2FA for staff before re-enabling any self-service flow.
