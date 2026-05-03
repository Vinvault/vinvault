#!/bin/sh
set -e

# Connect to the internal Supabase network before anything else so the
# TCP reachability check below sees the internal URL as available.
if [ -S /var/run/docker.sock ] && [ -n "$SUPABASE_NETWORK" ]; then
    docker network connect "$SUPABASE_NETWORK" "$HOSTNAME" 2>/dev/null || true
fi

# If the internal Supabase URL is still unreachable, fall back to the public URL.
if [ -n "$SUPABASE_URL" ] && [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ "$SUPABASE_URL" != "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    REACHABLE=$(node -e "
const net = require('net');
const url = new URL(process.env.SUPABASE_URL);
const port = parseInt(url.port) || 80;
const s = net.createConnection(port, url.hostname, () => { process.stdout.write('1'); s.destroy(); });
s.setTimeout(2000, () => { process.stdout.write('0'); s.destroy(); });
s.on('error', () => process.stdout.write('0'));
" 2>/dev/null || echo "0")
    if [ "$REACHABLE" != "1" ]; then
        echo "INFO: $SUPABASE_URL unreachable, using $NEXT_PUBLIC_SUPABASE_URL"
        export SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
    fi
fi

exec "$@"
