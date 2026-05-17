import dns from "dns";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const rawUrl = process.env.DATABASE_URL;

if (!rawUrl) {
  throw new Error("DATABASE_URL is not set. Add your Neon connection string to the server environment.");
}

/**
 * Resolve a hostname using Google's public DNS (8.8.8.8 / 8.8.4.4).
 * This bypasses the OS/libuv resolver which is broken on some hotspot networks.
 */
async function resolveWithGoogleDns(hostname) {
  const resolver = new dns.Resolver();
  resolver.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  return new Promise((resolve, reject) => {
    resolver.resolve4(hostname, (err, addresses) => {
      if (!err && addresses?.length) return resolve({ ip: addresses[0], family: 4 });
      resolver.resolve6(hostname, (err2, addresses2) => {
        if (err2 || !addresses2?.length) return reject(err || err2);
        resolve({ ip: addresses2[0], family: 6 });
      });
    });
  });
}

async function buildPool() {
  // Parse the connection URL into explicit pg config to avoid
  // env-var leakage (PGHOST, etc.) overriding our settings.
  const url = new URL(rawUrl);
  const originalHostname = url.hostname;
  const port = url.port ? Number(url.port) : 5432;
  const database = url.pathname.replace(/^\//, "");
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);

  let host = originalHostname;

  try {
    const { ip } = await resolveWithGoogleDns(originalHostname);
    host = ip;
    console.log(`[db] Resolved ${originalHostname} → ${host} (via Google DNS)`);
  } catch (e) {
    console.warn(`[db] Google DNS resolution failed (${e.message}), using hostname directly.`);
  }

  const { Pool } = pg;
  return new Pool({
    host,
    port,
    database,
    user,
    password,
    // Keep ssl.servername as the original hostname so Neon SNI routing works
    ssl: {
      rejectUnauthorized: false,
      servername: originalHostname,
    },
    // Disable pg's own env-var reading so PGHOST doesn't override our host
    connectionString: undefined,
  });
}

// Initialise pool once at startup; all sql() calls wait for it.
const poolPromise = buildPool();

function buildQuery(strings, values) {
  let text = "";
  for (let i = 0; i < strings.length; i += 1) {
    text += strings[i];
    if (i < values.length) {
      text += `$${i + 1}`;
    }
  }
  return { text, values };
}

export async function sql(strings, ...values) {
  const pool = await poolPromise;
  const { text, values: params } = buildQuery(strings, values);
  const result = await pool.query(text, params);
  return result.rows;
}
