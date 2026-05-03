#!/bin/sh
set -e

# If the internal Supabase URL is unreachable (container not on Supabase network),
# fall back to the public URL so the app works on any Docker network.
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
