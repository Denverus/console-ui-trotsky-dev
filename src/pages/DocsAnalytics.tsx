import { Link } from 'react-router-dom'
import { ChevronLeft, BarChart3, AlertTriangle } from 'lucide-react'
import { CodeBlock } from '@/components/CodeBlock'

const ANALYTICS_COLOR = '#6366f1'
const ANALYTICS_ENDPOINT = 'https://analytics.trotsky.dev'

const SNIPPET_HTML = `<script
  src="${ANALYTICS_ENDPOINT}/snippet.js"
  data-api-key="YOUR_API_KEY"
  data-project-id="playzoo-main"
  data-endpoint="${ANALYTICS_ENDPOINT}"
></script>`

const SNIPPET_TRACK_JS = `// After the snippet has loaded, fire custom events anywhere on your page:
window.pz.track('signup_clicked', { plan: 'pro', surface: 'header' })

// On a multi-step flow, mark progress with entity events so the dashboard
// can show start vs completion counts and average duration:
window.pz.track('entity_started', {
  entityId: 'level-3',
  entityType: 'game-level',
  entityName: 'Level 3 — Forest',
})
// ...later when the user finishes:
window.pz.track('entity_completed', {
  entityId: 'level-3',
  entityType: 'game-level',
  entityName: 'Level 3 — Forest',
  duration_ms: 47230,
})`

const RAW_BODY_JSON = `{
  "projectId": "playzoo-main",
  "eventName": "page_view",
  "timestamp": "2026-04-29T12:34:56.000Z",
  "sessionId": "anon-7f3c-9d2e",
  "payload": { "url": "/games/snake" }
}`

const CURL_EXAMPLE = `curl -X POST ${ANALYTICS_ENDPOINT}/api/events \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -d '{
    "projectId": "playzoo-main",
    "eventName": "page_view",
    "timestamp": "2026-04-29T12:34:56.000Z",
    "sessionId": "anon-abc",
    "payload": { "url": "/" }
  }'`

const FETCH_EXAMPLE = `function getOrCreateSessionId() {
  let sid = sessionStorage.getItem('_pz_sid')
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('_pz_sid', sid)
  }
  return sid
}

await fetch('${ANALYTICS_ENDPOINT}/api/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': 'YOUR_API_KEY',
  },
  body: JSON.stringify({
    projectId: 'playzoo-main',
    eventName: 'page_view',
    timestamp: new Date().toISOString(),
    sessionId: getOrCreateSessionId(),
    payload: { url: location.pathname },
  }),
  keepalive: true,
})`

const PYTHON_EXAMPLE = `import datetime, uuid, requests

requests.post(
    '${ANALYTICS_ENDPOINT}/api/events',
    headers={
        'X-Api-Key': 'YOUR_API_KEY',
    },
    json={
        'projectId': 'playzoo-main',
        'eventName': 'page_view',
        'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
        'sessionId': str(uuid.uuid4()),
        'payload': {'url': '/'},
    },
    timeout=5,
)`

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-[16px] font-semibold mb-3">{title}</h2>
      <div className="space-y-3 text-[13.5px] leading-relaxed text-foreground/90">{children}</div>
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[13.5px] leading-relaxed">{children}</p>
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-muted text-[12.5px] font-mono text-foreground">
      {children}
    </code>
  )
}

const TOC = [
  { id: 'overview', label: 'Overview' },
  { id: 'get-key', label: 'Get an API key' },
  { id: 'snippet', label: 'Drop-in JS snippet' },
  { id: 'raw-http', label: 'Raw HTTP' },
  { id: 'schema', label: 'Event schema rules' },
  { id: 'recommended', label: 'Recommended events' },
  { id: 'multi-instance', label: 'Multi-instance' },
  { id: 'querying', label: 'Querying stats' },
]

export function DocsAnalytics() {
  return (
    <div className="flex h-full min-h-0">
      {/* Sticky TOC */}
      <aside
        className="flex-none border-r border-border bg-card overflow-y-auto"
        style={{ width: 200 }}
      >
        <div className="p-4 border-b border-border">
          <Link
            to="/app/docs"
            className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors no-underline"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            All docs
          </Link>
        </div>
        <nav className="p-2 flex flex-col gap-0.5">
          {TOC.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="px-2.5 py-1.5 rounded-md text-[12.5px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors no-underline"
            >
              {t.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-7 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: `${ANALYTICS_COLOR}15`,
                border: `1px solid ${ANALYTICS_COLOR}25`,
                color: ANALYTICS_COLOR,
              }}
            >
              <BarChart3 className="h-[18px] w-[18px]" />
            </div>
            <h1 className="text-[20px] font-semibold tracking-tight">Analytics</h1>
          </div>

          <div className="space-y-9">
            <Section id="overview" title="Overview">
              <P>
                Analytics is an event-ingest API. Your site or app fires named events; we store them
                in MongoDB and surface them on the Analytics dashboard. Events are scoped to a
                company and tagged server-side with the API key (instance) that sent them, so you
                can run multiple analytics instances per company — for example, one per site or per
                staging environment.
              </P>
              <P>
                Events expire automatically <strong>90 days</strong> after they were captured.
                This is enforced by a TTL index, so be sure to capture anything you need to
                analyze long-term elsewhere.
              </P>

              <div
                className="flex gap-3 p-4 rounded-md border"
                style={{
                  background: 'hsl(var(--danger-bg, var(--muted)))',
                  borderColor: 'hsl(var(--danger-border, var(--border)))',
                }}
              >
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'hsl(var(--danger))' }} />
                <div className="text-[13px] leading-relaxed">
                  <strong>No PII allowed.</strong> Don't send email addresses, IP addresses, real
                  user IDs, or anything else identifying. The same backend receives events from
                  Playzoo (a kids' site under COPPA), so this is a hard rule, not a guideline.
                </div>
              </div>
            </Section>

            <Section id="get-key" title="Get an API key">
              <P>
                A SuperAdmin can issue API keys from <Link to="/app/companies" className="underline">Companies</Link>
                {' '}→ <em>company</em> → <strong>Services</strong>. Pick <InlineCode>analytics</InlineCode>,
                give the instance a name (for example <em>Playzoo Main</em> or <em>Playzoo Staging</em>),
                and click <strong>Assign</strong>.
              </P>
              <P>
                The plaintext key is shown <strong>once</strong> at creation — copy it
                immediately. We only store a hash; if you lose the plaintext, regenerate the key
                from the same screen. A single company can have any number of named analytics
                instances; each gets its own key.
              </P>
            </Section>

            <Section id="snippet" title="Drop-in JS snippet (recommended)">
              <P>
                Paste this into your site. The snippet auto-tracks <InlineCode>page_view</InlineCode> on
                load, persists an anonymous <InlineCode>sessionId</InlineCode> in <InlineCode>sessionStorage</InlineCode>,
                and exposes <InlineCode>window.pz.track(name, payload?)</InlineCode> for custom events.
              </P>
              <CodeBlock code={SNIPPET_HTML} language="html" />
              <P>
                <InlineCode>data-project-id</InlineCode> is a free-form string you control — use it
                to distinguish source surfaces inside one analytics instance (e.g. <em>marketing-site</em>
                {' '}vs <em>app</em>). If you omit it, the snippet falls back to{' '}
                <InlineCode>window.location.hostname</InlineCode>.
              </P>
              <CodeBlock code={SNIPPET_TRACK_JS} language="js" />
            </Section>

            <Section id="raw-http" title="Raw HTTP">
              <P>
                Anything that can <InlineCode>POST</InlineCode> JSON can talk to the API directly.
                Use this for backend-to-backend, mobile clients, or anywhere the JS snippet doesn't
                fit.
              </P>
              <P>
                Endpoint: <InlineCode>POST {ANALYTICS_ENDPOINT}/api/events</InlineCode><br />
                Required headers: <InlineCode>Content-Type: application/json</InlineCode>,{' '}
                <InlineCode>X-Api-Key: YOUR_API_KEY</InlineCode>
              </P>
              <P>Body schema:</P>
              <CodeBlock code={RAW_BODY_JSON} language="json" />
              <P>Response: <InlineCode>202 Accepted</InlineCode> with <InlineCode>{'{ "ok": true }'}</InlineCode>.</P>

              <div className="pt-2">
                <h3 className="text-[14px] font-semibold mb-2">curl</h3>
                <CodeBlock code={CURL_EXAMPLE} language="bash" />
              </div>

              <div className="pt-2">
                <h3 className="text-[14px] font-semibold mb-2">JavaScript (fetch)</h3>
                <CodeBlock code={FETCH_EXAMPLE} language="js" />
              </div>

              <div className="pt-2">
                <h3 className="text-[14px] font-semibold mb-2">Python (requests)</h3>
                <CodeBlock code={PYTHON_EXAMPLE} language="python" />
              </div>
            </Section>

            <Section id="schema" title="Event schema rules">
              <ul className="list-disc pl-5 space-y-1.5 text-[13.5px] leading-relaxed">
                <li>
                  All four required fields must be present: <InlineCode>projectId</InlineCode>,{' '}
                  <InlineCode>eventName</InlineCode>, <InlineCode>timestamp</InlineCode>,{' '}
                  <InlineCode>sessionId</InlineCode>.
                </li>
                <li>
                  <InlineCode>timestamp</InlineCode> must be ISO-8601 (e.g.{' '}
                  <InlineCode>new Date().toISOString()</InlineCode>).
                </li>
                <li>
                  <InlineCode>sessionId</InlineCode> must be <strong>anonymous and ephemeral</strong>:
                  generate it client-side, persist in <InlineCode>sessionStorage</InlineCode>, and
                  never tie it to a user account, email, or any persistent identifier.
                </li>
                <li>
                  <InlineCode>payload</InlineCode> is freeform JSON but should stay reasonably flat
                  — keys you query against (entity IDs, plan tiers, surface labels) work best at
                  the top level.
                </li>
                <li>
                  <strong>No PII anywhere.</strong> No emails, IPs, names, real account IDs.
                </li>
              </ul>
            </Section>

            <Section id="recommended" title="Recommended event names">
              <P>
                Anything you send shows up in <strong>Top events</strong> on the Analytics
                dashboard. A few names are recognized as patterns and unlock additional charts:
              </P>
              <ul className="list-disc pl-5 space-y-2 text-[13.5px] leading-relaxed">
                <li>
                  <InlineCode>page_view</InlineCode> — the snippet sends this automatically with{' '}
                  <InlineCode>{'{ url, referrer? }'}</InlineCode>. Drives the Sessions chart.
                </li>
                <li>
                  <InlineCode>entity_started</InlineCode> /{' '}
                  <InlineCode>entity_completed</InlineCode> — pair these to power the{' '}
                  <strong>Entities</strong> tab (start counts, completion rate, average duration).
                  Required <InlineCode>payload</InlineCode>:{' '}
                  <InlineCode>entityId</InlineCode>, <InlineCode>entityType</InlineCode>,{' '}
                  <InlineCode>entityName</InlineCode>. On completion, include{' '}
                  <InlineCode>duration_ms</InlineCode> so we can compute averages.
                </li>
                <li>
                  Anything else — fully custom. Use names like{' '}
                  <InlineCode>signup_clicked</InlineCode>, <InlineCode>checkout_started</InlineCode>,{' '}
                  <InlineCode>level_failed</InlineCode>. Keep names stable; renaming an event splits
                  its history into two buckets.
                </li>
              </ul>
            </Section>

            <Section id="multi-instance" title="Multi-instance">
              <P>
                Each analytics service you assign to a company has its own API key. Events are
                tagged with the originating <InlineCode>apiKeyId</InlineCode> server-side — you
                don't need to do anything client-side beyond using the right key.
              </P>
              <P>
                The Analytics dashboard exposes an <strong>instance</strong> dropdown. Picking one
                filters every chart to events from that key only; "All instances" combines them.
                The selection is persisted in the URL as <InlineCode>?instance=&lt;keyId&gt;</InlineCode>{' '}
                so you can bookmark or share a per-instance view.
              </P>
              <P>
                On the Overview page the same dropdown is available; the default is "All
                instances", and the Service health card renders one row per active instance with
                its own session count.
              </P>
            </Section>

            <Section id="querying" title="Querying stats">
              <P>
                The aggregation endpoints under <InlineCode>/api/stats/*</InlineCode>{' '}
                (<InlineCode>sessions</InlineCode>, <InlineCode>events</InlineCode>,{' '}
                <InlineCode>session-duration</InlineCode>, <InlineCode>entities</InlineCode>) are
                what the in-app dashboard uses. They require an admin JWT and are not part of the
                public integration contract — there's no read API for third-party consumption
                today. If you need raw access, run an export via{' '}
                <InlineCode>mongoexport</InlineCode> against the analytics MongoDB.
              </P>
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}
