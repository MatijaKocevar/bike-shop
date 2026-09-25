# Production deployment

Production runs on **server-asus** (`server@192.168.0.10`), which is only reachable
from the local network or the WireGuard VPN. Do not edit files there directly —
every change goes through git and a deploy.

## What runs where

```
browser ──https──▶ Cloudflare edge ──tunnel──▶ cloudflared (user service on server-asus)
                                                   │
                              ┌────────────────────┼─────────────────────┐
                              ▼                    ▼                     ▼
                    127.0.0.1:10001      127.0.0.1:9002          (one-shot jobs)
                    bike-shop-app-1      bike-shop-minio-1       migrate, createbuckets
                              │                    ▲
                              └──▶ bike-shop-db-1 ─┘
```

| Piece      | Detail                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------- |
| App URL    | https://bicikl-kocevar.com (Cloudflare Tunnel `bikeshop`)                                          |
| Pictures   | https://files.bicikl-kocevar.com — MinIO, private bucket, presigned PUT/GET                        |
| Repo       | `/home/server/Projects/bike-shop` on server-asus                                                   |
| Git remote | `git@github.com:MatijaKocevar/bike-shop.git` via read-only key `~/.ssh/bike-shop-deploy`           |
| Compose    | `docker-compose.prod.yml` (project `bike-shop`)                                                    |
| Containers | `bike-shop-app-1`, `bike-shop-db-1`, `bike-shop-minio-1` (+ one-shots)                             |
| Volumes    | `bike-shop-db-data`, `bike-shop-minio-data`                                                        |
| Boot       | containers `restart: unless-stopped`; cloudflared is a `systemctl --user` unit with linger enabled |

Ports `10001` (app) and `9002` (MinIO) are bound to `127.0.0.1` only. The public
internet never reaches the server directly — only through the tunnel.

## Deploy

From a dev machine with SSH access:

```bash
./scripts/deploy-remote.sh              # defaults to server@192.168.0.10
BIKE_SHOP_HOST=server@192.168.0.10 ./scripts/deploy-remote.sh
```

Or on the server:

```bash
cd ~/Projects/bike-shop
./scripts/deploy.sh
```

The script:

1. `git pull --ff-only` (uses the deploy key automatically)
2. `docker compose -f docker-compose.prod.yml build`
3. `docker compose -f docker-compose.prod.yml up -d` — the `migrate` service applies
   any new Prisma migrations before the app restarts
4. polls `https://bicikl-kocevar.com/signin` until it returns 200

There is no CI/CD: the server is not publicly reachable, so deploys are pull-based.
Merging to `main` is not enough — run the deploy script.

Manual equivalent when debugging:

```bash
cd ~/Projects/bike-shop
GIT_SSH_COMMAND="ssh -i ~/.ssh/bike-shop-deploy -o IdentitiesOnly=yes" git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Downtime is a few seconds. Take a manual DB backup first if a migration worries you:
`~/.local/bin/bike-shop-backup db`.

## Secrets

| What                 | Where                                                    |
| -------------------- | -------------------------------------------------------- |
| App + compose env    | `/home/server/Projects/bike-shop/.env` (600, gitignored) |
| Cloudflare API token | `~/.secrets/cloudflare.token` (DNS edit)                 |
| Tunnel run token     | `~/.secrets/cloudflared.token`                           |
| Tunnel ID            | `~/.secrets/tunnel-id`                                   |
| Deploy key           | `~/.ssh/bike-shop-deploy`                                |

`.env` is generated from `.env.production.example`. Use `openssl rand -hex 24` for
passwords and `openssl rand -base64 32` for `AUTH_SECRET`. `NEXT_PUBLIC_*` values are
inlined at build time — change them in `.env`, then redeploy (rebuild required).

Cloudflare IDs: account `c918c4c934eaca37e0caa38f372f71ca`, zone
`590e2e4de7c41e9d49b3883412e0db54` (`bicikl-kocevar.com`), tunnel
`9d52d86e-1392-4efc-a882-d48cdc339f10` (`bikeshop`). Tunnel ingress is
**remotely managed** — edit routes in the Zero Trust dashboard
(Networks → Tunnels → bikeshop → Routes), not in a local config file.

## Backups

`~/.local/bin/bike-shop-backup` (on the server) writes to the external drive,
mount-checked so it aborts instead of dumping to the wrong disk:

- `db` — daily 03:30 via cron, `pg_dump | gzip`, 14 days retention
- `minio` — Sundays 04:00, volume tarball, 28 days retention
- Destination: `/home/server/NAS/mkocevar/files_backup/bike-shop/{postgres,minio}/`
- Log: `~/bike-shop-backup.log`

Restore the database:

```bash
gunzip -c <backup>.sql.gz | docker exec -i bike-shop-db-1 psql -U bike_shop -d bike_shop
```

Restore pictures (overwrites the volume):

```bash
docker run --rm -v bike-shop-minio-data:/data \
  -v /home/server/NAS/mkocevar/files_backup/bike-shop/minio:/backup \
  alpine sh -c 'tar xzf /backup/<backup>.tar.gz -C /data'
```

## First-time setup / disaster recovery

1. Install Docker + Compose; Node/pnpm are not needed on the server.
2. Clone the repo, `git remote` uses the read-only deploy key.
3. `cp .env.production.example .env` and fill in real secrets/URLs.
4. Images: `postgres:16-alpine` comes from Docker Hub. **The MinIO images are no
   longer published on Docker Hub** — copy them from a machine that still has them:

    ```bash
    docker save minio/minio:latest minio/mc:latest | gzip -1 | \
      ssh server@192.168.0.10 'gunzip | docker load'
    ```

5. `docker compose -f docker-compose.prod.yml up -d` (runs migrations + bucket setup).
6. Seed only if needed: `docker compose -f docker-compose.prod.yml run --rm migrate pnpm db:seed`
   creates `admin@test.com` (password in `AUTH_ADMIN_PASSWORD`) plus demo data.
7. Install `cloudflared` (`~/.local/bin/cloudflared`), write the tunnel token to
   `~/.secrets/cloudflared.token`, install `~/.config/systemd/user/cloudflared.service`,
   `systemctl --user enable --now cloudflared`.
8. Recreate the tunnel via the Cloudflare API (needs a token with DNS edit) and add
   the public hostnames `bicikl-kocevar.com` and `files.bicikl-kocevar.com` in the
   Zero Trust dashboard, pointing at `http://localhost:10001` and `http://localhost:9002`.

## Ops

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
systemctl --user status cloudflared
curl -s -o /dev/null -w "%{http_code}\n" https://bicikl-kocevar.com/signin
```

## Gotchas

- **DNS negative cache** — after adding/changing DNS records, Pi-hole/unbound on the
  LAN keeps the old answer for up to 30 min. Flush with
  `sudo systemctl restart unbound && pihole reloaddns`.
- **MinIO images** — not on Docker Hub anymore (see step 4 above).
- **Root disk** hovers around 85% — `docker system prune -f` now and then.
- **Never** commit `.env` or tokens; rotate anything that leaks.
- Changing `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_S3_PUBLIC_URL` requires a rebuild,
  not just a restart.
