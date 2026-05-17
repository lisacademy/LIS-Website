import dns from "dns";
import fs from "fs";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) throw new Error("DATABASE_URL is not set.");

async function resolveWithGoogleDns(hostname) {
  const resolver = new dns.Resolver();
  resolver.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  return new Promise((resolve, reject) => {
    resolver.resolve4(hostname, (err, addresses) => {
      if (!err && addresses?.length) return resolve(addresses[0]);
      resolver.resolve6(hostname, (err2, addresses2) => {
        if (err2 || !addresses2?.length) return reject(err || err2);
        resolve(addresses2[0]);
      });
    });
  });
}

const url = new URL(rawUrl);
const originalHostname = url.hostname;
let host = originalHostname;

try {
  host = await resolveWithGoogleDns(originalHostname);
  console.log(`[schema] Resolved ${originalHostname} → ${host}`);
} catch (e) {
  console.warn(`[schema] DNS resolution failed: ${e.message}, using hostname.`);
}

const { Client } = pg;
const schema = fs.readFileSync("neon_schema.sql", "utf8");
const client = new Client({
  host,
  port: url.port ? Number(url.port) : 5432,
  database: url.pathname.replace(/^\//, ""),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  ssl: { rejectUnauthorized: false, servername: originalHostname },
});

await client.connect();
await client.query(schema);
const tableCheck = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'members'");
const eventsCheck = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events'");
const contentCheck = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_content'");
const templatesCheck = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'document_templates'");
const countCheck = await client.query("SELECT COUNT(*)::int AS count FROM members");
console.log(JSON.stringify({
  ok: true,
  membersTable: tableCheck.rowCount === 1,
  eventsTable: eventsCheck.rowCount === 1,
  contentTable: contentCheck.rowCount === 1,
  templatesTable: templatesCheck.rowCount === 1,
  memberCount: countCheck.rows[0].count,
}, null, 2));
await client.end();
