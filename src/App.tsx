import { useState, useEffect, useCallback } from "react";

// ─── Data ───────────────────────────────────────────────────────────────────

interface CheckItem {
  id: string;
  label: string;
  code?: boolean; // render in <code> style
}

interface Card {
  id: string;
  title: string;
  items: CheckItem[];
  cols?: 2 | 3; // column count for list
  span2?: boolean;
}

interface Section {
  id: string;
  title: string;
  cards: Card[];
  proscons?: { pros: { title: string; body: string }; cons: { title: string; body: string } };
  qbox?: { title: string; items: string[] };
}

const SECTIONS: Section[] = [
  // ── NODE.JS ──────────────────────────────────────────────────────────────
  {
    id: "nodejs",
    title: "Node.js & Backend Core",
    cards: [
      {
        id: "runtime",
        title: "Runtime & Event Loop",
        items: [
          { id: "runtime-1", label: "V8 engine & how Node runs JS" },
          { id: "runtime-2", label: "libuv & the thread pool" },
          { id: "runtime-3", label: "Node Event Loop phases (timers, pending, poll, check, close)" },
          { id: "runtime-4", label: "process.nextTick() vs setImmediate()", code: true },
          { id: "runtime-5", label: "Microtasks vs macrotasks in Node" },
          { id: "runtime-6", label: "Blocking vs non-blocking I/O" },
          { id: "runtime-7", label: "Single-threaded model + when CPU work blocks it" },
        ],
      },
      {
        id: "modules",
        title: "Modules & Core APIs",
        items: [
          { id: "mod-1", label: "CommonJS vs ES Modules in Node" },
          { id: "mod-2", label: "require caching & module resolution", code: true },
          { id: "mod-3", label: "Buffer & binary data", code: true },
          { id: "mod-4", label: "Streams (Readable, Writable, Duplex, Transform)" },
          { id: "mod-5", label: "Backpressure in streams" },
          { id: "mod-6", label: "fs, path, os, events (EventEmitter)", code: true },
          { id: "mod-7", label: "Global objects (process, __dirname)", code: true },
        ],
      },
      {
        id: "scaling",
        title: "Scaling & Processes",
        items: [
          { id: "scale-1", label: "Cluster module & load balancing" },
          { id: "scale-2", label: "Worker Threads (CPU-bound tasks)" },
          { id: "scale-3", label: "Child processes (spawn, fork, exec)", code: true },
          { id: "scale-4", label: "PM2 / process managers" },
          { id: "scale-5", label: "Graceful shutdown & SIGTERM handling" },
          { id: "scale-6", label: "Horizontal scaling & statelessness" },
        ],
      },
      {
        id: "express",
        title: "Express & API Design",
        items: [
          { id: "exp-1", label: "Middleware & request lifecycle" },
          { id: "exp-2", label: "Error-handling middleware" },
          { id: "exp-3", label: "Routing & route params / query" },
          { id: "exp-4", label: "Body parsing & validation" },
          { id: "exp-5", label: "Rate limiting & throttling" },
          { id: "exp-6", label: "REST vs GraphQL trade-offs" },
          { id: "exp-7", label: "Pagination patterns (offset vs cursor)" },
          { id: "exp-8", label: "Idempotency of requests" },
        ],
      },
    ],
  },

  // ── HTTP / HTTPS ──────────────────────────────────────────────────────────
  {
    id: "http",
    title: "HTTP & HTTPS in Node.js",
    cards: [
      {
        id: "http-mod",
        title: "HTTP Module",
        items: [
          { id: "http-1", label: "Creating a server with http.createServer()", code: true },
          { id: "http-2", label: "req/res objects & lifecycle", code: true },
          { id: "http-3", label: "Reading request body via streams" },
          { id: "http-4", label: "Setting headers & status codes" },
          { id: "http-5", label: "http.request() as a client", code: true },
          { id: "http-6", label: "Keep-Alive & connection pooling (Agent)" },
          { id: "http-7", label: "HTTP/1.1 vs HTTP/2 in Node" },
        ],
      },
      {
        id: "https-mod",
        title: "HTTPS Module",
        items: [
          { id: "https-1", label: "https.createServer() with key + cert", code: true },
          { id: "https-2", label: "TLS/SSL handshake basics" },
          { id: "https-3", label: "Self-signed vs CA-signed certs" },
          { id: "https-4", label: "SSL termination at load balancer/proxy" },
          { id: "https-5", label: "rejectUnauthorized & cert validation", code: true },
          { id: "https-6", label: "Redirecting HTTP → HTTPS" },
          { id: "https-7", label: "HSTS header" },
        ],
      },
    ],
    proscons: {
      pros: {
        title: "HTTPS — Benefits",
        body: "Encrypts data in transit (confidentiality), verifies server identity (authentication), protects integrity against tampering, required for HTTP/2, PWAs, service workers, and geolocation; improves SEO & user trust.",
      },
      cons: {
        title: "HTTPS — Drawbacks",
        body: "Slight handshake/CPU overhead (mostly mitigated by TLS 1.3 + session resumption), cert management & renewal effort, cost for some certs (free via Let's Encrypt), misconfiguration risk, harder local debugging.",
      },
    },
  },

  // ── JWT & AUTH ────────────────────────────────────────────────────────────
  {
    id: "auth",
    title: "Authentication, JWT & Security",
    cards: [
      {
        id: "jwt",
        title: "JWT Deep Dive",
        items: [
          { id: "jwt-1", label: "Structure: header.payload.signature" },
          { id: "jwt-2", label: "Signing algorithms (HS256 vs RS256)" },
          { id: "jwt-3", label: "Claims (iss, exp, sub, aud)", code: true },
          { id: "jwt-4", label: "Access token vs refresh token" },
          { id: "jwt-5", label: "Token expiry & rotation" },
          { id: "jwt-6", label: "Stateless auth — how the server verifies without DB" },
          { id: "jwt-7", label: "Where to store: cookie (HttpOnly) vs localStorage" },
          { id: "jwt-8", label: "Token revocation problem (blacklist via Redis)" },
        ],
      },
      {
        id: "auth-patterns",
        title: "Auth Patterns",
        items: [
          { id: "ap-1", label: "Session-based vs token-based auth" },
          { id: "ap-2", label: "OAuth 2.0 flow & OpenID Connect" },
          { id: "ap-3", label: "Authentication vs Authorization" },
          { id: "ap-4", label: "Role-based access control (RBAC)" },
          { id: "ap-5", label: "Password hashing (bcrypt / argon2, salting)" },
          { id: "ap-6", label: "API keys vs JWT" },
          { id: "ap-7", label: "Refresh token rotation & reuse detection" },
        ],
      },
      {
        id: "security",
        title: "Backend Security",
        cols: 3,
        span2: true,
        items: [
          { id: "sec-1", label: "SQL Injection & parameterized queries" },
          { id: "sec-2", label: "NoSQL injection" },
          { id: "sec-3", label: "XSS & output encoding" },
          { id: "sec-4", label: "CSRF & SameSite cookies" },
          { id: "sec-5", label: "CORS configuration (server side)" },
          { id: "sec-6", label: "Helmet & secure headers" },
          { id: "sec-7", label: "Rate limiting & brute-force protection" },
          { id: "sec-8", label: "Secrets management (env vars / vaults)" },
          { id: "sec-9", label: "Input validation & sanitization" },
        ],
      },
    ],
    proscons: {
      pros: {
        title: "JWT — Benefits",
        body: "Stateless & scalable (no server session store), works across services/domains, self-contained claims, good for microservices & mobile, easy horizontal scaling.",
      },
      cons: {
        title: "JWT — Drawbacks",
        body: "Can't easily revoke before expiry, larger than session IDs, sensitive data exposed if not encrypted (it's only signed), clock-skew issues, XSS risk if stored in localStorage.",
      },
    },
  },

  // ── SQL ───────────────────────────────────────────────────────────────────
  {
    id: "sql",
    title: "SQL & Relational Databases",
    cards: [
      {
        id: "sql-query",
        title: "Querying & Processing",
        items: [
          { id: "sq-1", label: "SELECT, WHERE, GROUP BY, HAVING, ORDER BY" },
          { id: "sq-2", label: "Logical query processing order (FROM→SELECT→ORDER)" },
          { id: "sq-3", label: "JOINs (INNER, LEFT, RIGHT, FULL, SELF, CROSS)" },
          { id: "sq-4", label: "Subqueries & correlated subqueries" },
          { id: "sq-5", label: "CTEs (WITH) & recursive CTEs", code: true },
          { id: "sq-6", label: "Window functions (ROW_NUMBER, RANK, LAG/LEAD)" },
          { id: "sq-7", label: "Aggregate functions & DISTINCT" },
          { id: "sq-8", label: "UNION vs UNION ALL" },
        ],
      },
      {
        id: "sql-design",
        title: "Design & Integrity",
        items: [
          { id: "sd-1", label: "Normalization (1NF→3NF) & denormalization" },
          { id: "sd-2", label: "Primary / foreign / composite keys" },
          { id: "sd-3", label: "Constraints (UNIQUE, CHECK, NOT NULL)" },
          { id: "sd-4", label: "One-to-many / many-to-many modeling" },
          { id: "sd-5", label: "ACID properties" },
          { id: "sd-6", label: "Transactions & isolation levels" },
          { id: "sd-7", label: "Deadlocks & locking" },
        ],
      },
      {
        id: "sql-perf",
        title: "Performance",
        items: [
          { id: "sp-1", label: "Indexes (B-tree, composite, covering)" },
          { id: "sp-2", label: "When indexes hurt (writes, low cardinality)" },
          { id: "sp-3", label: "EXPLAIN / query plans", code: true },
          { id: "sp-4", label: "N+1 query problem" },
          { id: "sp-5", label: "Connection pooling" },
          { id: "sp-6", label: "Sharding & partitioning" },
          { id: "sp-7", label: "Read replicas" },
        ],
      },
      {
        id: "sql-interview",
        title: "Common Interview Queries",
        items: [
          { id: "si-1", label: "2nd / Nth highest salary" },
          { id: "si-2", label: "Find & delete duplicate rows" },
          { id: "si-3", label: "Group-wise max (top per category)" },
          { id: "si-4", label: "Running totals / cumulative sums" },
          { id: "si-5", label: "Self-join (employee–manager)" },
          { id: "si-6", label: "Pivot rows to columns" },
          { id: "si-7", label: "Count without COUNT, etc." },
        ],
      },
    ],
  },

  // ── MONGODB ───────────────────────────────────────────────────────────────
  {
    id: "mongo",
    title: "MongoDB & NoSQL",
    cards: [
      {
        id: "mongo-fund",
        title: "Fundamentals",
        items: [
          { id: "mf-1", label: "Document model & BSON" },
          { id: "mf-2", label: "Collections vs tables, documents vs rows" },
          { id: "mf-3", label: "CRUD operations & query operators" },
          { id: "mf-4", label: "Embedding vs referencing (data modeling)" },
          { id: "mf-5", label: "Schema design for read vs write heavy" },
          { id: "mf-6", label: "Indexes (single, compound, text, TTL)" },
          { id: "mf-7", label: "_id & ObjectId structure", code: true },
        ],
      },
      {
        id: "mongo-adv",
        title: "Advanced",
        items: [
          { id: "ma-1", label: "Aggregation pipeline ($match, $group, $lookup, $project)", code: true },
          { id: "ma-2", label: "$lookup as a 'join'", code: true },
          { id: "ma-3", label: "Replica sets & failover" },
          { id: "ma-4", label: "Sharding & shard keys" },
          { id: "ma-5", label: "Transactions in MongoDB" },
          { id: "ma-6", label: "Read/write concerns" },
          { id: "ma-7", label: "Mongoose: schemas, models, populate, middleware" },
        ],
      },
    ],
    qbox: {
      title: "Frequently asked MongoDB questions",
      items: [
        "SQL vs NoSQL — when would you choose MongoDB over a relational DB?",
        "Embedding vs referencing — trade-offs and how you decide?",
        "How does the aggregation pipeline work? Explain a multi-stage example.",
        "What is a shard key and how do you pick a good one?",
        "How do indexes work and how do you diagnose a slow query?",
        "Does MongoDB support transactions? When are they needed?",
        "How do replica sets provide high availability?",
        "What problems does the schema-less model create, and how do you handle them?",
      ],
    },
    proscons: {
      pros: {
        title: "MongoDB — Benefits",
        body: "Flexible schema, fast for hierarchical/JSON-like data, horizontal scaling via sharding, high write throughput, developer-friendly with JS stack.",
      },
      cons: {
        title: "MongoDB — Drawbacks",
        body: "Weaker multi-document transaction guarantees historically, joins are limited/expensive, data duplication, easy to design a bad schema, higher memory usage.",
      },
    },
  },

  // ── REDIS ─────────────────────────────────────────────────────────────────
  {
    id: "redis",
    title: "Redis & Caching",
    cards: [
      {
        id: "redis-core",
        title: "Core Concepts",
        items: [
          { id: "rc-1", label: "In-memory key-value store" },
          { id: "rc-2", label: "Data types: String, List, Hash, Set, Sorted Set" },
          { id: "rc-3", label: "TTL & key expiration" },
          { id: "rc-4", label: "Single-threaded model & why it's fast" },
          { id: "rc-5", label: "Persistence: RDB snapshots vs AOF" },
          { id: "rc-6", label: "Pub/Sub messaging" },
          { id: "rc-7", label: "Atomic operations & INCR", code: true },
        ],
      },
      {
        id: "redis-use",
        title: "Use Cases & Patterns",
        items: [
          { id: "ru-1", label: "Caching (cache-aside, write-through, write-back)" },
          { id: "ru-2", label: "Cache invalidation strategies" },
          { id: "ru-3", label: "Session storage" },
          { id: "ru-4", label: "Rate limiting (token bucket / fixed window)" },
          { id: "ru-5", label: "JWT blacklist / token revocation" },
          { id: "ru-6", label: "Leaderboards (Sorted Sets)" },
          { id: "ru-7", label: "Distributed locks (Redlock)" },
          { id: "ru-8", label: "Eviction policies (LRU, LFU)" },
        ],
      },
    ],
    qbox: {
      title: "Frequently asked Redis questions",
      items: [
        "What is cache-aside and how does it differ from write-through?",
        "How would you handle a cache stampede / thundering herd?",
        "How do you keep cache and DB consistent?",
        "Explain Redis persistence options and their trade-offs.",
        "How would you implement rate limiting with Redis?",
        "Why is Redis single-threaded yet so fast?",
        "What's a good eviction policy for a cache and why?",
      ],
    },
  },

  // ── DSA ───────────────────────────────────────────────────────────────────
  {
    id: "dsa",
    title: "DSA — Linear Data Structures (Easy → Medium, Most Asked)",
    cards: [
      {
        id: "dsa-arrays",
        title: "Arrays & Strings",
        items: [
          { id: "da-1", label: "Two Sum / Three Sum" },
          { id: "da-2", label: "Maximum subarray (Kadane's)" },
          { id: "da-3", label: "Move zeroes / Remove duplicates" },
          { id: "da-4", label: "Best time to buy & sell stock" },
          { id: "da-5", label: "Sliding window: longest substring w/o repeats" },
          { id: "da-6", label: "Two pointers: container with most water" },
          { id: "da-7", label: "Valid anagram / palindrome" },
          { id: "da-8", label: "Group anagrams" },
          { id: "da-9", label: "Product of array except self" },
          { id: "da-10", label: "Merge intervals" },
          { id: "da-11", label: "Rotate array" },
          { id: "da-12", label: "Prefix sum / subarray sum equals K" },
        ],
      },
      {
        id: "dsa-linked",
        title: "Linked Lists",
        items: [
          { id: "dl-1", label: "Reverse a linked list (iter + recursive)" },
          { id: "dl-2", label: "Detect cycle (Floyd's)" },
          { id: "dl-3", label: "Find middle node" },
          { id: "dl-4", label: "Merge two sorted lists" },
          { id: "dl-5", label: "Remove Nth node from end" },
          { id: "dl-6", label: "Palindrome linked list" },
          { id: "dl-7", label: "Intersection of two lists" },
          { id: "dl-8", label: "Add two numbers" },
        ],
      },
      {
        id: "dsa-stacks",
        title: "Stacks & Queues",
        items: [
          { id: "ds-1", label: "Valid parentheses" },
          { id: "ds-2", label: "Min stack" },
          { id: "ds-3", label: "Implement queue using stacks" },
          { id: "ds-4", label: "Implement stack using queues" },
          { id: "ds-5", label: "Next greater element (monotonic stack)" },
          { id: "ds-6", label: "Daily temperatures" },
          { id: "ds-7", label: "Evaluate reverse Polish notation" },
          { id: "ds-8", label: "Sliding window maximum (deque)" },
        ],
      },
      {
        id: "dsa-hash",
        title: "Hashing & Core Techniques",
        items: [
          { id: "dh-1", label: "HashMap / HashSet patterns" },
          { id: "dh-2", label: "Frequency counting" },
          { id: "dh-3", label: "First non-repeating character" },
          { id: "dh-4", label: "Subarray problems with hashing" },
          { id: "dh-5", label: "Time/space complexity (Big-O) for each" },
          { id: "dh-6", label: "Two-pointer technique" },
          { id: "dh-7", label: "Sliding window template" },
          { id: "dh-8", label: "Fast & slow pointers" },
        ],
      },
    ],
  },

  // ── REACT ─────────────────────────────────────────────────────────────────
  {
    id: "react",
    title: "React.js (Recall Sheet)",
    cards: [
      {
        id: "react-fund",
        title: "Fundamentals",
        items: [
          { id: "rf-1", label: "JSX & how it compiles" },
          { id: "rf-2", label: "Components: function vs class" },
          { id: "rf-3", label: "Props vs state" },
          { id: "rf-4", label: "Controlled vs uncontrolled components" },
          { id: "rf-5", label: "Keys & lists (why keys matter)" },
          { id: "rf-6", label: "Conditional rendering" },
          { id: "rf-7", label: "Lifting state up" },
          { id: "rf-8", label: "Prop drilling & how to avoid it" },
        ],
      },
      {
        id: "react-hooks",
        title: "Hooks",
        items: [
          { id: "rh-1", label: "useState & batching", code: true },
          { id: "rh-2", label: "useEffect & dependency array", code: true },
          { id: "rh-3", label: "Cleanup functions & effect timing" },
          { id: "rh-4", label: "useRef & useImperativeHandle", code: true },
          { id: "rh-5", label: "useMemo vs useCallback", code: true },
          { id: "rh-6", label: "useReducer", code: true },
          { id: "rh-7", label: "useContext", code: true },
          { id: "rh-8", label: "Custom hooks & rules of hooks" },
        ],
      },
      {
        id: "react-perf",
        title: "Internals & Performance",
        items: [
          { id: "rp-1", label: "Virtual DOM & reconciliation" },
          { id: "rp-2", label: "Fiber architecture" },
          { id: "rp-3", label: "Why & when components re-render" },
          { id: "rp-4", label: "React.memo & memoization", code: true },
          { id: "rp-5", label: "Lazy loading & Suspense", code: true },
          { id: "rp-6", label: "Error boundaries" },
          { id: "rp-7", label: "Refs vs state for re-render avoidance" },
          { id: "rp-8", label: "Strict mode behavior" },
        ],
      },
      {
        id: "react-render",
        title: "Rendering & Routing",
        items: [
          { id: "rr-1", label: "CSR vs SSR vs SSG" },
          { id: "rr-2", label: "Hydration" },
          { id: "rr-3", label: "React Router (routes, params, nav)" },
          { id: "rr-4", label: "Code splitting" },
          { id: "rr-5", label: "Portals" },
          { id: "rr-6", label: "Forms & validation" },
          { id: "rr-7", label: "Data fetching patterns (effects vs libs)" },
        ],
      },
    ],
    qbox: {
      title: "Most-asked React questions",
      items: [
        "What is the Virtual DOM and how does reconciliation work?",
        "Difference between useMemo and useCallback — when to use each?",
        "Why do we need keys in lists?",
        "Explain the useEffect dependency array and common pitfalls (stale closures).",
        "Controlled vs uncontrolled components?",
        "How do you optimize a slow React app?",
        "What causes unnecessary re-renders and how do you prevent them?",
        "Class lifecycle methods mapped to hooks?",
      ],
    },
  },

  // ── REDUX ─────────────────────────────────────────────────────────────────
  {
    id: "redux",
    title: "Redux & State Management",
    cards: [
      {
        id: "redux-core",
        title: "Core Concepts",
        items: [
          { id: "rxc-1", label: "Store, actions, reducers, dispatch" },
          { id: "rxc-2", label: "Single source of truth" },
          { id: "rxc-3", label: "Pure reducers & immutability" },
          { id: "rxc-4", label: "Unidirectional data flow" },
          { id: "rxc-5", label: "Selectors & useSelector / useDispatch", code: true },
          { id: "rxc-6", label: "Middleware (thunk, saga) for async" },
          { id: "rxc-7", label: "Redux Toolkit (slices, createAsyncThunk)", code: true },
          { id: "rxc-8", label: "Normalizing state shape" },
        ],
      },
      {
        id: "redux-cmp",
        title: "Comparisons & Patterns",
        items: [
          { id: "rcp-1", label: "Redux vs Context API — when each fits" },
          { id: "rcp-2", label: "Redux vs Zustand / Recoil / Jotai" },
          { id: "rcp-3", label: "RTK Query vs React Query" },
          { id: "rcp-4", label: "When you do NOT need Redux" },
          { id: "rcp-5", label: "Handling side effects" },
          { id: "rcp-6", label: "Memoized selectors (reselect)" },
          { id: "rcp-7", label: "DevTools & time-travel debugging" },
        ],
      },
    ],
    qbox: {
      title: "Most-asked Redux questions",
      items: [
        "Walk through the Redux data flow from dispatch to re-render.",
        "Why must reducers be pure and immutable?",
        "What problem does middleware solve? thunk vs saga?",
        "Redux vs Context API — when would you NOT use Redux?",
        "What does Redux Toolkit simplify over classic Redux?",
        "How do you handle async data and caching?",
        "How do selectors improve performance?",
      ],
    },
  },

  // ── PWA ───────────────────────────────────────────────────────────────────
  {
    id: "pwa",
    title: "Progressive Web Apps (PWA)",
    cards: [
      {
        id: "pwa-build",
        title: "Building Blocks",
        items: [
          { id: "pb-1", label: "What makes an app 'progressive'" },
          { id: "pb-2", label: "Web App Manifest (icons, name, display)" },
          { id: "pb-3", label: "Service Workers lifecycle (install, activate, fetch)" },
          { id: "pb-4", label: "Caching strategies (cache-first, network-first, SWR)" },
          { id: "pb-5", label: "Offline support" },
          { id: "pb-6", label: "HTTPS requirement" },
          { id: "pb-7", label: "Add to Home Screen / installability" },
          { id: "pb-8", label: "Push notifications & background sync" },
        ],
      },
      {
        id: "pwa-q",
        title: "Key Questions",
        items: [
          { id: "pq-1", label: "How does a service worker intercept requests?" },
          { id: "pq-2", label: "Difference between SW cache strategies?" },
          { id: "pq-3", label: "How do you update a service worker safely?" },
          { id: "pq-4", label: "How does a PWA work offline?" },
          { id: "pq-5", label: "PWA vs native app trade-offs?" },
          { id: "pq-6", label: "What's needed to make an app installable?" },
        ],
      },
    ],
    proscons: {
      pros: {
        title: "PWA — Benefits",
        body: "Works offline, installable without app stores, single codebase, smaller than native, fast repeat loads via caching, push notifications, auto-updates, discoverable via URL/SEO.",
      },
      cons: {
        title: "PWA — Drawbacks",
        body: "Limited device/hardware API access vs native, weaker iOS support for some features, service-worker complexity, no app-store discovery by default, push limitations on iOS.",
      },
    },
  },

  // ── SYSTEM DESIGN ─────────────────────────────────────────────────────────
  {
    id: "sysdesign",
    title: "Backend / System Design Essentials",
    cards: [
      {
        id: "sd-concepts",
        title: "Concepts",
        cols: 3,
        span2: true,
        items: [
          { id: "sdc-1", label: "Load balancing" },
          { id: "sdc-2", label: "Horizontal vs vertical scaling" },
          { id: "sdc-3", label: "Caching layers & CDN" },
          { id: "sdc-4", label: "Database indexing & replication" },
          { id: "sdc-5", label: "SQL vs NoSQL selection" },
          { id: "sdc-6", label: "Message queues (Kafka, RabbitMQ)" },
          { id: "sdc-7", label: "Microservices vs monolith" },
          { id: "sdc-8", label: "API gateway" },
          { id: "sdc-9", label: "Rate limiting & throttling" },
          { id: "sdc-10", label: "CAP theorem" },
          { id: "sdc-11", label: "Eventual consistency" },
          { id: "sdc-12", label: "Idempotency & retries" },
        ],
      },
    ],
  },

  // ── CORE JAVASCRIPT ───────────────────────────────────────────────────────
  {
    id: "corejs",
    title: "Core JavaScript",
    cards: [
      {
        id: "js-scope",
        title: "Execution & Scope",
        items: [
          { id: "js-s1", label: "Execution Context & Call Stack" },
          { id: "js-s2", label: "Hoisting (var, function declarations)" },
          { id: "js-s3", label: "Temporal Dead Zone (TDZ)" },
          { id: "js-s4", label: "Scope: Global / Function / Block" },
          { id: "js-s5", label: "Lexical Environment" },
          { id: "js-s6", label: "Closures & practical uses" },
        ],
      },
      {
        id: "js-fn",
        title: "Functions & this",
        items: [
          { id: "js-f1", label: "this keyword & binding rules", code: true },
          { id: "js-f2", label: "call(), apply(), bind()", code: true },
          { id: "js-f3", label: "Arrow functions & lexical this" },
          { id: "js-f4", label: "Declaration vs Expression vs IIFE" },
          { id: "js-f5", label: "Higher Order Functions & callbacks" },
          { id: "js-f6", label: "Currying & partial application" },
          { id: "js-f7", label: "Pure functions & functional programming basics" },
        ],
      },
      {
        id: "js-async",
        title: "Async & Event Loop",
        items: [
          { id: "js-a1", label: "Event Loop (browser): call stack, microtask queue, macrotask queue" },
          { id: "js-a2", label: "Promise states & chaining" },
          { id: "js-a3", label: "Promise.all / allSettled / any / race", code: true },
          { id: "js-a4", label: "Async / Await & error handling" },
          { id: "js-a5", label: "Fetch API & AbortController", code: true },
          { id: "js-a6", label: "setTimeout / setInterval / requestAnimationFrame", code: true },
        ],
      },
      {
        id: "js-proto",
        title: "Objects, Prototypes & OOP",
        items: [
          { id: "js-p1", label: "Object creation patterns" },
          { id: "js-p2", label: "Object.freeze() / seal() / assign()", code: true },
          { id: "js-p3", label: "Prototype chain & prototypal inheritance" },
          { id: "js-p4", label: "Constructor functions & classes" },
          { id: "js-p5", label: "Inheritance using classes, static methods" },
          { id: "js-p6", label: "Encapsulation & polymorphism (JS perspective)" },
        ],
      },
      {
        id: "js-arrays",
        title: "Arrays & Collections",
        items: [
          { id: "js-ar1", label: "map / filter / reduce / find / findIndex", code: true },
          { id: "js-ar2", label: "some / every / flat / flatMap / sort / forEach", code: true },
          { id: "js-ar3", label: "Array destructuring" },
          { id: "js-ar4", label: "Set, WeakSet, Map, WeakMap", code: true },
          { id: "js-ar5", label: "Stack vs Heap, Primitive vs Reference types" },
          { id: "js-ar6", label: "Shallow copy vs deep copy, structuredClone()", code: true },
          { id: "js-ar7", label: "Garbage collection & memory leaks" },
        ],
      },
      {
        id: "js-es6",
        title: "ES6+ & Modules",
        items: [
          { id: "js-e1", label: "let / const, template literals, destructuring" },
          { id: "js-e2", label: "Rest / spread operators, default parameters" },
          { id: "js-e3", label: "Optional chaining (?.) & nullish coalescing (??)", code: true },
          { id: "js-e4", label: "Symbols, Generators & Iterators" },
          { id: "js-e5", label: "CommonJS vs ES Modules, import / export" },
          { id: "js-e6", label: "Dynamic imports & code splitting" },
          { id: "js-e7", label: "Tree shaking & bundling concepts" },
        ],
      },
    ],
    qbox: {
      title: "Most-asked Core JS questions",
      items: [
        "Explain how closures work and give a practical example.",
        "What is the Temporal Dead Zone?",
        "How does the browser event loop work — what is the order of execution?",
        "What is the difference between call, apply, and bind?",
        "Explain prototypal inheritance vs class-based inheritance.",
        "What are the differences between Promise.all, allSettled, race, and any?",
        "Shallow vs deep copy — when does each bite you?",
        "How do ES Modules differ from CommonJS?",
      ],
    },
  },

  // ── BROWSER & DOM ─────────────────────────────────────────────────────────
  {
    id: "browser",
    title: "Browser & DOM",
    cards: [
      {
        id: "dom-basics",
        title: "DOM Basics & Events",
        items: [
          { id: "dom-1", label: "DOM tree structure & traversal" },
          { id: "dom-2", label: "DOM manipulation (createElement, append, remove)" },
          { id: "dom-3", label: "Event propagation: bubbling & capturing" },
          { id: "dom-4", label: "Event delegation pattern" },
          { id: "dom-5", label: "Custom events (CustomEvent)", code: true },
          { id: "dom-6", label: "stopPropagation vs preventDefault", code: true },
        ],
      },
      {
        id: "dom-observers",
        title: "Observers & Storage",
        items: [
          { id: "obs-1", label: "MutationObserver", code: true },
          { id: "obs-2", label: "IntersectionObserver (lazy load, infinite scroll)", code: true },
          { id: "obs-3", label: "ResizeObserver", code: true },
          { id: "obs-4", label: "Web Workers (off-main-thread CPU work)" },
          { id: "obs-5", label: "Service Workers (offline, caching)" },
          { id: "obs-6", label: "localStorage / sessionStorage / Cookies / IndexedDB" },
        ],
      },
      {
        id: "rendering",
        title: "Browser Rendering Pipeline",
        span2: true,
        cols: 2,
        items: [
          { id: "ren-1", label: "Critical Rendering Path" },
          { id: "ren-2", label: "DOM → CSSOM → Render Tree → Layout → Paint → Composite" },
          { id: "ren-3", label: "Reflow vs repaint — what triggers each" },
          { id: "ren-4", label: "Compositor thread & GPU layers" },
          { id: "ren-5", label: "requestAnimationFrame for smooth animations", code: true },
          { id: "ren-6", label: "Forced synchronous layouts (layout thrashing)" },
        ],
      },
    ],
    qbox: {
      title: "Most-asked Browser & DOM questions",
      items: [
        "What is event delegation and why is it useful?",
        "Explain the difference between event bubbling and capturing.",
        "Walk through the browser critical rendering path.",
        "What is the difference between reflow and repaint?",
        "How does IntersectionObserver work and when would you use it?",
        "What is the difference between localStorage, sessionStorage, Cookies, and IndexedDB?",
        "How do Web Workers differ from Service Workers?",
      ],
    },
  },

  // ── FRONTEND PERFORMANCE ──────────────────────────────────────────────────
  {
    id: "perf",
    title: "Frontend Performance",
    cards: [
      {
        id: "perf-tech",
        title: "Techniques",
        items: [
          { id: "pt-1", label: "Debouncing & throttling (and the difference)" },
          { id: "pt-2", label: "Lazy loading images & components" },
          { id: "pt-3", label: "Virtual list / windowing (virtualization)" },
          { id: "pt-4", label: "Code splitting & dynamic imports" },
          { id: "pt-5", label: "Memoization (in JS and React)" },
          { id: "pt-6", label: "Avoiding layout thrashing / batching DOM reads+writes" },
        ],
      },
      {
        id: "perf-opt",
        title: "Optimization & Metrics",
        items: [
          { id: "po-1", label: "Bundle optimization & tree shaking" },
          { id: "po-2", label: "Caching strategies (HTTP cache, service worker cache)" },
          { id: "po-3", label: "Web Vitals: LCP, CLS, INP (formerly FID)" },
          { id: "po-4", label: "Critical CSS & render-blocking resources" },
          { id: "po-5", label: "Image optimization (WebP, srcset, lazy)" },
          { id: "po-6", label: "Preload / prefetch / preconnect hints" },
        ],
      },
    ],
    qbox: {
      title: "Most-asked Performance questions",
      items: [
        "What is the difference between debounce and throttle? Implement both.",
        "How would you diagnose and fix a slow-loading page?",
        "What are LCP, CLS, and INP — and how do you improve each?",
        "Explain virtual list / windowing and when you would use it.",
        "What is tree shaking and how does it reduce bundle size?",
        "How do you decide what to lazy-load vs eagerly load?",
      ],
    },
  },

  // ── POLYFILLS ─────────────────────────────────────────────────────────────
  {
    id: "polyfills",
    title: "Polyfills (Must Implement)",
    cards: [
      {
        id: "poly-arr",
        title: "Array & Function Polyfills",
        items: [
          { id: "pa-1", label: "Array.prototype.map polyfill", code: true },
          { id: "pa-2", label: "Array.prototype.filter polyfill", code: true },
          { id: "pa-3", label: "Array.prototype.reduce polyfill", code: true },
          { id: "pa-4", label: "Function.prototype.call polyfill", code: true },
          { id: "pa-5", label: "Function.prototype.apply polyfill", code: true },
          { id: "pa-6", label: "Function.prototype.bind polyfill", code: true },
        ],
      },
      {
        id: "poly-async",
        title: "Async & Utility Implementations",
        items: [
          { id: "pu-1", label: "Promise.all polyfill", code: true },
          { id: "pu-2", label: "Debounce implementation" },
          { id: "pu-3", label: "Throttle implementation" },
          { id: "pu-4", label: "Deep clone / structuredClone fallback", code: true },
          { id: "pu-5", label: "Memoize function implementation" },
          { id: "pu-6", label: "EventEmitter / Pub-Sub implementation" },
        ],
      },
    ],
    qbox: {
      title: "Most-asked Polyfill / Implementation questions",
      items: [
        "Implement Array.prototype.map without using the native map.",
        "Write a Function.prototype.bind polyfill.",
        "Implement Promise.all from scratch.",
        "Write a debounce function. Now write throttle.",
        "Implement a deep clone function.",
        "Implement a basic EventEmitter with on, off, and emit.",
      ],
    },
  },

  // ── DESIGN PATTERNS ───────────────────────────────────────────────────────
  {
    id: "patterns",
    title: "Design Patterns (Frequently Asked)",
    cards: [
      {
        id: "pat-create",
        title: "Creational & Structural",
        items: [
          { id: "pc-1", label: "Singleton pattern & pitfalls" },
          { id: "pc-2", label: "Factory pattern" },
          { id: "pc-3", label: "Module pattern (IIFE-based encapsulation)" },
          { id: "pc-4", label: "Adapter pattern" },
          { id: "pc-5", label: "Proxy pattern (ES6 Proxy)", code: true },
          { id: "pc-6", label: "Decorator pattern" },
        ],
      },
      {
        id: "pat-behave",
        title: "Behavioral",
        items: [
          { id: "pbe-1", label: "Observer pattern" },
          { id: "pbe-2", label: "Pub / Sub pattern (decoupled from Observer)" },
          { id: "pbe-3", label: "Strategy pattern" },
          { id: "pbe-4", label: "Command pattern" },
          { id: "pbe-5", label: "Mediator pattern" },
          { id: "pbe-6", label: "When and why to use each pattern" },
        ],
      },
    ],
  },

  // ── FRONTEND ARCHITECTURE ─────────────────────────────────────────────────
  {
    id: "frontend-arch",
    title: "Frontend Architecture",
    cards: [
      {
        id: "mfe",
        title: "Micro Frontends",
        items: [
          { id: "mfe-1", label: "What are Micro Frontends & why use them" },
          { id: "mfe-2", label: "Module Federation (Webpack 5)", code: true },
          { id: "mfe-3", label: "Monolith vs Micro Frontend trade-offs" },
          { id: "mfe-4", label: "State sharing across MFEs" },
          { id: "mfe-5", label: "Routing strategies in MFEs" },
          { id: "mfe-6", label: "Shared dependency / version conflicts" },
        ],
      },
      {
        id: "fe-systems",
        title: "Systems & Architecture",
        items: [
          { id: "fs-1", label: "Design Systems (tokens, component libraries)" },
          { id: "fs-2", label: "Frontend System Design framework" },
          { id: "fs-3", label: "CDN concepts & edge caching" },
          { id: "fs-4", label: "Feature flags & progressive rollouts" },
          { id: "fs-5", label: "Accessibility (WCAG, ARIA roles)" },
          { id: "fs-6", label: "Internationalization (i18n) & localization (l10n)" },
        ],
      },
    ],
    qbox: {
      title: "Most-asked Architecture questions",
      items: [
        "What are Micro Frontends and when would you use them?",
        "How does Module Federation work in Webpack 5?",
        "How do you share state between Micro Frontends?",
        "Walk through how you would design a large-scale frontend system (e.g. news feed).",
        "What is a Design System and what problem does it solve?",
        "How do CDNs improve performance and what are their limitations?",
      ],
    },
  },
];

// Must-know items
const MUST_KNOW: CheckItem[] = [
  { id: "mk-1", label: "Closures & Scope" },
  { id: "mk-2", label: "Hoisting & TDZ" },
  { id: "mk-3", label: "Event Loop (browser + Node)" },
  { id: "mk-4", label: "Promises / Async-Await" },
  { id: "mk-5", label: "this / call / apply / bind", code: true },
  { id: "mk-6", label: "Prototype chain" },
  { id: "mk-7", label: "Debounce / Throttle" },
  { id: "mk-8", label: "Shallow vs deep copy" },
  { id: "mk-9", label: "Memory leaks (common causes)" },
  { id: "mk-10", label: "ES Modules vs CommonJS" },
  { id: "mk-11", label: "Tree shaking & code splitting" },
  { id: "mk-12", label: "Event delegation" },
  { id: "mk-13", label: "Browser rendering pipeline" },
  { id: "mk-14", label: "Web Vitals (LCP, CLS, INP)" },
  { id: "mk-15", label: "Polyfills (map, bind, Promise.all)", code: true },
  { id: "mk-16", label: "Observer / Pub-Sub pattern" },
  { id: "mk-17", label: "Micro Frontends & Module Federation" },
  { id: "mk-18", label: "Frontend System Design" },
  { id: "mk-19", label: "HTTP vs HTTPS in Node" },
  { id: "mk-20", label: "JWT & refresh tokens" },
  { id: "mk-21", label: "Session vs token auth" },
  { id: "mk-22", label: "SQL JOINs & indexing" },
  { id: "mk-23", label: "ACID & transactions" },
  { id: "mk-24", label: "2nd highest salary query" },
  { id: "mk-25", label: "SQL vs NoSQL trade-offs" },
  { id: "mk-26", label: "MongoDB aggregation" },
  { id: "mk-27", label: "Embedding vs referencing" },
  { id: "mk-28", label: "Redis caching strategies" },
  { id: "mk-29", label: "Cache invalidation" },
  { id: "mk-30", label: "Rate limiting" },
  { id: "mk-31", label: "Reverse linked list" },
  { id: "mk-32", label: "Detect cycle (Floyd's)" },
  { id: "mk-33", label: "Two Sum / sliding window" },
  { id: "mk-34", label: "Valid parentheses (stack)" },
  { id: "mk-35", label: "Big-O analysis" },
  { id: "mk-36", label: "Virtual DOM & reconciliation" },
  { id: "mk-37", label: "useMemo vs useCallback", code: true },
  { id: "mk-38", label: "Redux data flow" },
  { id: "mk-39", label: "Redux vs Context" },
  { id: "mk-40", label: "Service workers & PWA offline" },
  { id: "mk-41", label: "XSS / CSRF / CORS" },
  { id: "mk-42", label: "SQL injection prevention" },
  { id: "mk-43", label: "Streams & backpressure (Node)" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "fullstack-checklist-v1";

function loadChecked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch (error) {
    console.log('err', error)
  }
  return new Set();
}

function saveChecked(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (error) {
    console.log('err', error)
  }
}

function countAll(): number {
  let total = MUST_KNOW.length;
  for (const s of SECTIONS) for (const c of s.cards) total += c.items.length;
  return total;
}

const TOTAL = countAll();

// ─── Sub-components ───────────────────────────────────────────────────────────

const css = {
  // colours
  ink: "#1f2335",
  muted: "#6b7280",
  pink: "#e84393",
  purple: "#6c5ce7",
  purpleDeep: "#5a4fd1",
  cardBorder: "#e7e6f5",
  chip: "#f4f3fd",
  bg: "#f3f2fb",
  card: "#ffffff",
} as const;

interface CheckboxItemProps {
  item: CheckItem;
  checked: boolean;
  onToggle: (id: string) => void;
}

function CheckboxItem({ item, checked, onToggle }: CheckboxItemProps) {
  return (
    <li
      onClick={() => onToggle(item.id)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "4px 0",
        cursor: "pointer",
        userSelect: "none",
        fontSize: 13.5,
        lineHeight: 1.45,
        color: checked ? "#888" : "#33384d",
        textDecoration: checked ? "line-through" : "none",
        transition: "color 0.15s",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          marginTop: 2,
          width: 16,
          height: 16,
          borderRadius: 4,
          border: checked ? "none" : `1.8px solid ${css.purple}`,
          background: checked ? css.purple : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span>
        {item.code ? (
          <code
            style={{
              fontFamily: '"SF Mono",Menlo,Consolas,monospace',
              fontSize: 12.5,
              background: "#f0effb",
              padding: "1px 4px",
              borderRadius: 4,
              color: css.purpleDeep,
            }}
          >
            {item.label}
          </code>
        ) : (
          item.label
        )}
      </span>
    </li>
  );
}

interface CardBlockProps {
  card: Card;
  checked: Set<string>;
  onToggle: (id: string) => void;
}

function CardBlock({ card, checked, onToggle }: CardBlockProps) {
  const done = card.items.filter((i) => checked.has(i.id)).length;
  const pct = Math.round((done / card.items.length) * 100);
  return (
    <div
      style={{
        background: css.card,
        border: `1px solid ${css.cardBorder}`,
        borderRadius: 14,
        padding: "16px 18px 14px",
        gridColumn: card.span2 ? "1 / -1" : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px dashed #e3c9da" }}>
        <h3 style={{ color: css.pink, fontSize: 15, fontWeight: 800, margin: 0 }}>{card.title}</h3>
        <span style={{ fontSize: 12, color: pct === 100 ? "#2ecc71" : css.muted, fontWeight: 600 }}>
          {done}/{card.items.length}
        </span>
      </div>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          columns: card.cols === 3 ? 3 : card.cols === 2 ? 2 : 1,
          columnGap: 24,
        }}
      >
        {card.items.map((item) => (
          <CheckboxItem key={item.id} item={item} checked={checked.has(item.id)} onToggle={onToggle} />
        ))}
      </ul>
      {/* mini progress bar */}
      <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: "#eee", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#2ecc71" : css.purple, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [checked, setChecked] = useState<Set<string>>(() => loadChecked());
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    saveChecked(checked);
  }, [checked]);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const totalDone = checked.size;
  const overallPct = Math.round((totalDone / TOTAL) * 100);

  const mustDone = MUST_KNOW.filter((i) => checked.has(i.id)).length;

  return (
    <div style={{ minHeight: "100vh", background: css.bg, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif', color: css.ink }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "34px 20px 80px" }}>

        {/* ── Cover ── */}
        <div
          style={{
            background: "linear-gradient(135deg,#6c5ce7 0%,#8b7ff0 40%,#c86fd0 75%,#e84393 100%)",
            color: "#fff",
            borderRadius: 22,
            padding: "46px 40px 52px",
            position: "relative",
            overflow: "hidden",
            marginBottom: 38,
          }}
        >
          {/* decorative bubbles */}
          <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.12)", top: -70, right: -50 }} />
          <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.09)", bottom: -70, left: -40 }} />

          <div style={{ fontSize: 40, letterSpacing: 6, marginBottom: 26 }}>✅ 📋 ⚡</div>
          <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: "0 0 10px", fontWeight: 800 }}>Fullstack Interview<br />Prep Checklist</h1>
          <p style={{ fontSize: 18, opacity: 0.92, margin: "0 0 24px", fontWeight: 500 }}>
            Core JS · Browser · Performance · Polyfills · Patterns · React · Node.js · Databases · DSA · System Design. Tick it. Track it. Crack it.
          </p>

          {/* pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 24 }}>
            {["Core JS", "Browser & DOM", "Performance", "Polyfills", "Patterns", "Frontend Arch", "React", "Redux", "PWA", "Node.js", "HTTP/HTTPS", "JWT & Auth", "SQL", "MongoDB", "Redis", "DSA", "System Design", "Security"].map((t) => (
              <span key={t} style={{ background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", fontSize: 13, fontWeight: 600, padding: "7px 15px", borderRadius: 30 }}>{t}</span>
            ))}
          </div>

          {/* overall progress */}
          <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Overall Progress</span>
              <span style={{ fontWeight: 800, fontSize: 18 }}>{totalDone} / {TOTAL} ({overallPct}%)</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,.25)", overflow: "hidden" }}>
              <div style={{ width: `${overallPct}%`, height: "100%", background: "#fff", transition: "width 0.3s", borderRadius: 4 }} />
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.25)", fontSize: 13.5, opacity: 0.9, lineHeight: 1.6, maxWidth: 680 }}>
            Tick a box only when you can <strong>explain it AND code it</strong>. Clear the Must-Know box and you're interview-ready.
          </div>
        </div>

        {/* ── Section nav ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
          <button
            onClick={() => setActiveSection(null)}
            style={{
              padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${activeSection === null ? css.purple : css.cardBorder}`,
              background: activeSection === null ? css.purple : "#fff",
              color: activeSection === null ? "#fff" : css.ink,
              fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            All
          </button>
          {SECTIONS.map((s) => {
            const allIds = s.cards.flatMap((c) => c.items.map((i) => i.id));
            const done = allIds.filter((id) => checked.has(id)).length;
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(active ? null : s.id)}
                style={{
                  padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${active ? css.purple : css.cardBorder}`,
                  background: active ? css.purple : "#fff",
                  color: active ? "#fff" : css.ink,
                  fontWeight: 600, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {s.title.split(" ")[0]}
                <span style={{ background: active ? "rgba(255,255,255,.25)" : "#f0effb", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700, color: active ? "#fff" : css.purpleDeep }}>
                  {done}/{allIds.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Sections ── */}
        {SECTIONS.filter((s) => !activeSection || s.id === activeSection).map((section) => (
          <div key={section.id}>
            <div style={{ color: css.purpleDeep, fontSize: 24, fontWeight: 800, margin: "36px 0 4px", paddingBottom: 10, borderBottom: `3px solid #e3e1f7` }}>
              {section.title}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 16 }}>
              {section.cards.map((card) => (
                <CardBlock key={card.id} card={card} checked={checked} onToggle={toggle} />
              ))}
            </div>

            {/* pros/cons */}
            {section.proscons && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                <div style={{ background: "#eafaf0", border: "1px solid #bce8cc", borderRadius: 10, padding: "12px 14px", fontSize: 12.8, lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700, color: "#1e8a4c", marginBottom: 6, fontSize: 13 }}>{section.proscons.pros.title}</div>
                  {section.proscons.pros.body}
                </div>
                <div style={{ background: "#fdeef0", border: "1px solid #f2c4cc", borderRadius: 10, padding: "12px 14px", fontSize: 12.8, lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700, color: "#c0392b", marginBottom: 6, fontSize: 13 }}>{section.proscons.cons.title}</div>
                  {section.proscons.cons.body}
                </div>
              </div>
            )}

            {/* qbox */}
            {section.qbox && (
              <div style={{ background: "#fbfaff", border: `1px solid ${css.cardBorder}`, borderRadius: 12, padding: "14px 18px", marginTop: 14 }}>
                <h4 style={{ color: css.purpleDeep, margin: "0 0 8px", fontSize: 14.5 }}>{section.qbox.title}</h4>
                <ol style={{ margin: 0, paddingLeft: 20 }}>
                  {section.qbox.items.map((q, i) => (
                    <li key={i} style={{ fontSize: 13, lineHeight: 1.55, padding: "2px 0", color: "#3a3f55" }}>{q}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}

        {/* ── Must-Know ── */}
        {(!activeSection) && (
          <>
            <div style={{ color: css.purpleDeep, fontSize: 24, fontWeight: 800, margin: "36px 0 4px", paddingBottom: 10, borderBottom: `3px solid #e3e1f7` }}>
              Absolute Must-Know (Clear These First!)
            </div>
            <div style={{ border: `2px solid ${css.purple}`, borderRadius: 16, padding: "22px 24px", marginTop: 18, background: "#faf9ff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2 style={{ color: css.purpleDeep, margin: 0, fontSize: 20 }}>Must-Know Checklist</h2>
                <span style={{ fontWeight: 700, fontSize: 15, color: mustDone === MUST_KNOW.length ? "#2ecc71" : css.purple }}>
                  {mustDone}/{MUST_KNOW.length}
                </span>
              </div>
              {/* progress */}
              <div style={{ height: 4, borderRadius: 2, background: "#e3e1f7", overflow: "hidden", marginBottom: 16 }}>
                <div style={{ width: `${Math.round((mustDone / MUST_KNOW.length) * 100)}%`, height: "100%", background: mustDone === MUST_KNOW.length ? "#2ecc71" : css.purple, transition: "width 0.3s" }} />
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, columns: 3, columnGap: 24 }}>
                {MUST_KNOW.map((item) => (
                  <CheckboxItem key={item.id} item={item} checked={checked.has(item.id)} onToggle={toggle} />
                ))}
              </ul>
            </div>

            <div style={{ borderLeft: "5px solid #2ecc71", background: "#effaf1", padding: "14px 18px", borderRadius: 8, marginTop: 18, fontSize: 13.5, lineHeight: 1.6 }}>
              <strong>Finish line:</strong> If you can confidently <strong>explain AND code</strong> every item in the Must-Know box, you're well-prepared for most fullstack / Node.js / SDE-2 interviews. For each topic, be ready to state at least one <strong>benefit and one drawback</strong>. Tick boxes only when a topic truly clicks.
            </div>
          </>
        )}

        {/* ── Reset button ── */}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <button
            onClick={() => {
              if (confirm("Reset all checkboxes?")) {
                setChecked(new Set());
              }
            }}
            style={{
              padding: "10px 24px", borderRadius: 20, border: `1.5px solid #f2c4cc`,
              background: "#fdeef0", color: "#c0392b",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            Reset all
          </button>
        </div>
      </div>
    </div>
  );
}