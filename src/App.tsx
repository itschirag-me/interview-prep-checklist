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
  qbox?: { title: string; items: { q: string; a: string }[] };
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
        { q: "SQL vs NoSQL — when would you choose MongoDB over a relational DB?", a: "Choose MongoDB when your data is document-like (nested, variable fields) or when you need to scale horizontally fast. Choose SQL when data is highly relational, needs complex joins, or strict integrity matters. Example: a blog where each post has different custom fields → MongoDB. A banking app with strict account/transaction relationships → PostgreSQL." },
        { q: "Embedding vs referencing — trade-offs and how you decide?", a: "Embedding: store related data inside the same document. Fast reads, one query, no joins needed. Use when data is always read together and won't grow unboundedly. Referencing: store just the ID, fetch separately with $lookup. Use when the sub-document is large, shared across many docs, or updated independently. Example: embed comments in a post if there are few. Reference the author by userId instead of embedding full user details." },
        { q: "How does the aggregation pipeline work? Explain a multi-stage example.", a: "The aggregation pipeline is a series of stages, each transforming documents like an assembly line. Example — get top 3 categories by average product price: $match (filter active products) → $group (group by category, compute avgPrice) → $sort (by avgPrice descending) → $limit (3). Each stage's output is the next stage's input. Much more powerful than simple find() queries." },
        { q: "What is a shard key and how do you pick a good one?", a: "A shard key determines how MongoDB distributes data across servers. A good shard key has high cardinality (many unique values) and is commonly used in queries. Bad example: status field with only 3 values — all writes pile up on one shard (hotspot). Good example: userId — data spreads evenly across shards. Avoid monotonically increasing keys like timestamps as a sole shard key — they also cause hotspots." },
        { q: "How do indexes work and how do you diagnose a slow query?", a: "An index is like a book's index — lets MongoDB find documents without scanning the whole collection. Without one, MongoDB does a COLLSCAN (reads every document). Run .explain('executionStats') to see if a query uses IXSCAN or COLLSCAN. If slow, add an index on the fields used in your filter and sort. Example: if you always query { userId: x, createdAt: y }, create a compound index { userId: 1, createdAt: -1 }." },
        { q: "Does MongoDB support transactions? When are they needed?", a: "Yes, since v4.0 for replica sets. Transactions give ACID guarantees across multiple documents/collections. Most operations are atomic at the single-document level, so you often don't need them. Use when you must update multiple documents atomically — like deducting money from one account and adding to another. Without a transaction, a crash between the two writes leaves data inconsistent." },
        { q: "How do replica sets provide high availability?", a: "A replica set is a group of MongoDB nodes holding the same data. One is the primary (handles all writes); the rest are secondaries that replicate from it. If the primary goes down, the secondaries elect a new primary automatically — usually within 10–30 seconds. Example: a 3-node replica set (1 primary + 2 secondaries) — if primary crashes, one secondary is voted in as the new primary and writes resume." },
        { q: "What problems does the schema-less model create, and how do you handle them?", a: "Without enforced structure, different documents in the same collection can have different field names or types — this causes bugs at the application layer. Handle with: Mongoose schemas (enforce structure in Node.js), MongoDB Schema Validation (JSON Schema rules at the DB level), and migration scripts when fields change. Example: if half your documents have 'email' as a string and half as an array, queries and code break unpredictably." },
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
        { q: "What is cache-aside and how does it differ from write-through?", a: "Cache-aside (lazy loading): app checks cache first. On a miss, app reads from DB and writes to cache. Only requested data ends up cached. Write-through: every DB write also writes to cache immediately — cache is always in sync but may store data that's never read. Example: cache-aside for a product catalog (only popular items get cached). Write-through for a user profile (always up to date)." },
        { q: "How would you handle a cache stampede / thundering herd?", a: "A stampede happens when a popular key expires and hundreds of requests hit the DB at the same time. Solutions: (1) Locking — only the first request fetches from DB; others wait using Redis SET NX. (2) Probabilistic early expiry — randomly refresh slightly before expiry. (3) Background refresh — a worker pre-warms the cache before it expires. Example: homepage banner expires → 500 users hit DB simultaneously → site slows to a crawl. Fix with a distributed lock." },
        { q: "How do you keep cache and DB consistent?", a: "There's no perfect solution, just trade-offs. Most reliable pattern: write to DB first, then delete (invalidate) the cache key. On next read, cache miss → fetch fresh from DB → repopulate cache. Avoid writing to both simultaneously — race conditions cause inconsistency. Short TTLs also help: even if data is stale, it expires quickly. The hardest case is concurrent reads/writes; solutions like 'read-your-writes' consistency help there." },
        { q: "Explain Redis persistence options and their trade-offs.", a: "RDB (snapshots): saves the full dataset to disk at set intervals (e.g., every 5 min). Fast restarts, compact files, but you lose data between snapshots. AOF (Append Only File): logs every write command. Can reconstruct to the last second. Slower writes, larger files. You can use both. Example: for a leaderboard that can be rebuilt from the DB, RDB is fine. For session storage where losing data matters, use AOF or both." },
        { q: "How would you implement rate limiting with Redis?", a: "Fixed window: INCR key + EXPIRE. First request creates the key and sets a 60s expiry; each request increments it. If counter > 100, reject with 429. Code: const count = await redis.incr(key); if (count === 1) await redis.expire(key, 60); if (count > 100) return 'rate limited'. Sliding window is more accurate but uses a sorted set with timestamps — adds complexity but avoids bursts at window boundaries." },
        { q: "Why is Redis single-threaded yet so fast?", a: "Redis is fast because it runs entirely in memory (no disk I/O on reads), uses simple and efficient data structures (hash tables, skip lists), and avoids thread context-switching overhead. Network I/O uses epoll multiplexing to handle thousands of connections with one thread. Example: reading a string from Redis takes ~100 microseconds vs ~10ms from a disk-based DB — roughly 100× faster. Note: Redis 6+ added I/O threads but command execution is still single-threaded." },
        { q: "What's a good eviction policy for a cache and why?", a: "LRU (Least Recently Used) is most common — evict the key unused for the longest time. Works well because recently accessed data is likely to be accessed again. LFU (Least Frequently Used) is better when popularity matters more than recency (a key accessed 1000 times last week but not today should survive over a key accessed once yesterday). Use allkeys-lru to evict any key, volatile-lru to only evict keys that have a TTL set." },
      ],
    },
  },

  // ── KAFKA & MESSAGE BROKERS ───────────────────────────────────────────────
  {
    id: "kafka",
    title: "Kafka & Message Brokers",
    cards: [
      {
        id: "kafka-core",
        title: "Kafka Core Concepts",
        items: [
          { id: "kf-1", label: "Topics, Partitions & Offsets" },
          { id: "kf-2", label: "Producers & Consumers" },
          { id: "kf-3", label: "Consumer Groups & partition assignment" },
          { id: "kf-4", label: "Brokers, Clusters & Zookeeper / KRaft" },
          { id: "kf-5", label: "Log-based storage & sequential writes" },
          { id: "kf-6", label: "Retention policies (time-based & size-based)" },
          { id: "kf-7", label: "Log compaction" },
        ],
      },
      {
        id: "kafka-reliability",
        title: "Reliability & Delivery Guarantees",
        items: [
          { id: "kr-1", label: "Producer acks: 0, 1, all" },
          { id: "kr-2", label: "Replication factor & In-Sync Replicas (ISR)" },
          { id: "kr-3", label: "Leader / Follower election" },
          { id: "kr-4", label: "At-most-once, at-least-once, exactly-once" },
          { id: "kr-5", label: "Idempotent producer" },
          { id: "kr-6", label: "Transactional messaging" },
          { id: "kr-7", label: "Consumer offset commit (auto vs manual)" },
        ],
      },
      {
        id: "kafka-patterns",
        title: "Patterns & Advanced Use Cases",
        items: [
          { id: "kp-1", label: "Event streaming vs message queuing" },
          { id: "kp-2", label: "Event Sourcing with Kafka" },
          { id: "kp-3", label: "CQRS pattern" },
          { id: "kp-4", label: "Dead Letter Queue (DLQ)" },
          { id: "kp-5", label: "Schema Registry & Avro / Protobuf" },
          { id: "kp-6", label: "Kafka Streams & ksqlDB" },
          { id: "kp-7", label: "Change Data Capture (CDC)" },
        ],
      },
      {
        id: "kafka-vs",
        title: "Kafka vs Other Brokers",
        items: [
          { id: "kv-1", label: "Kafka vs RabbitMQ — throughput, ordering, model" },
          { id: "kv-2", label: "Kafka vs Redis Pub/Sub" },
          { id: "kv-3", label: "Kafka vs AWS SQS / SNS" },
          { id: "kv-4", label: "Push vs Pull consumer model" },
          { id: "kv-5", label: "Backpressure handling" },
          { id: "kv-6", label: "When to use a message broker vs direct HTTP call" },
        ],
      },
    ],
    qbox: {
      title: "Most-asked Kafka & Message Broker questions",
      items: [
        { q: "What is a Kafka topic and how do partitions work?", a: "A topic is a named stream of records — like a table in a database but append-only. Each topic is split into partitions (ordered, immutable logs). Each message in a partition gets a sequential offset. Producers write to a partition (key-based or round-robin). Consumers read from a partition sequentially. More partitions = more parallelism. Example: a 'orders' topic with 6 partitions lets 6 consumers in a group process orders in parallel. Trade-off: more partitions means more overhead for leader election and rebalancing." },
        { q: "How do consumer groups enable parallel processing?", a: "A consumer group is a set of consumers that jointly consume a topic. Each partition is assigned to exactly one consumer in the group — so work is automatically distributed. If you have 6 partitions and 3 consumers, each consumer handles 2 partitions. Add a 4th consumer → rebalance, one consumer gets 0 partitions (max parallelism = number of partitions). Multiple consumer groups can each read the full topic independently — useful for different services (analytics, notifications) consuming the same events." },
        { q: "What is the difference between at-most-once, at-least-once, and exactly-once?", a: "At-most-once: message is sent once and never retried. May be lost but never duplicated. Commit offset before processing — if the consumer crashes mid-process, the message is skipped. At-least-once: message is retried until acknowledged. May be processed more than once. Commit offset after processing — if crash after process but before commit, message re-delivered. Exactly-once: message is processed exactly once, no loss, no duplicates. Requires idempotent producer + transactional API in Kafka. Hardest to achieve. Most systems use at-least-once + idempotent consumers (deduplicate on the consumer side)." },
        { q: "Explain Kafka replication and what ISR means.", a: "Each partition has one leader and N-1 followers (replicas on other brokers). Producers write to the leader; followers pull and replicate. ISR (In-Sync Replicas): the set of replicas that are fully caught up with the leader. If the leader dies, Kafka elects a new leader from the ISR — so no data is lost. acks=all means the producer waits for ALL ISR replicas to acknowledge before considering a write successful. Replication factor of 3 is standard for production — tolerates 2 broker failures." },
        { q: "Kafka vs RabbitMQ — how do you choose?", a: "Kafka: pull-based, high throughput (millions/sec), messages persisted on disk for configurable time, consumers can re-read, ordered within partition. Best for event streaming, event sourcing, audit logs, high-volume pipelines. RabbitMQ: push-based, message broker with routing (exchanges, queues, bindings), messages deleted after ACK, supports complex routing rules (fanout, topic, direct). Best for task queues, RPC patterns, low-latency job distribution, complex routing logic. Rule: if you need replay, high throughput, or event-driven architecture → Kafka. If you need flexible routing and job queues → RabbitMQ." },
        { q: "What is log compaction and when would you use it?", a: "Log compaction keeps the latest value per key indefinitely, removing older versions of the same key. Regular retention deletes all records older than X days/GB. Compaction is key-aware: for the same key, only the most recent record survives. Use it for changelog topics or state stores where you only care about current state, not history. Example: a 'user-settings' topic — if userId=123 has 1000 updates over 2 years, after compaction you only keep the latest settings for that user. A consumer starting from scratch can rebuild current state without reading years of history." },
        { q: "How does Kafka guarantee message ordering?", a: "Kafka guarantees ordering only within a single partition. All messages with the same key are routed to the same partition (using key hash % numPartitions), so all events for a given entity arrive in order. Across partitions, there is no ordering guarantee. Example: all orders for customerId=42 go to partition 3 — they are processed in the exact order they were produced. If you need global ordering, use a single partition — but that limits throughput to one consumer. In practice, per-entity (per-key) ordering is sufficient for most systems." },
        { q: "What is the Dead Letter Queue pattern and why is it important?", a: "A DLQ is a separate topic/queue where messages that fail processing after N retries are sent instead of being dropped or blocking the consumer. Without a DLQ, one bad message (poison pill) can halt a consumer forever. With a DLQ: consumer tries to process, fails 3 times, publishes to 'orders-dlq', moves on to the next message. The DLQ is monitored separately — engineers investigate failed messages, fix the bug, and replay them. Essential for production reliability. Example: an order event with a malformed JSON field goes to the DLQ; the consumer keeps processing valid orders uninterrupted." },
      ],
    },
    proscons: {
      pros: {
        title: "Kafka — Benefits",
        body: "Extremely high throughput (millions of messages/sec), durable (disk-persisted), replayable (consumers can re-read from any offset), decouples producers from consumers, horizontally scalable via partitions, great for event sourcing and audit trails.",
      },
      cons: {
        title: "Kafka — Drawbacks",
        body: "Operationally complex (brokers, ZooKeeper/KRaft, schema registry), exactly-once semantics are hard to implement, no built-in message routing like RabbitMQ, overkill for simple job queues, per-partition ordering only, rebalancing pauses consumers.",
      },
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
        { q: "What is the Virtual DOM and how does reconciliation work?", a: "The Virtual DOM is a lightweight JS copy of the real DOM. When state changes, React builds a new virtual DOM tree and diffs it against the previous one. It then only updates the real DOM nodes that actually changed — this is reconciliation. Example: a list of 100 items where only item #3 changes → React updates just that one <li>, not all 100. The Fiber architecture makes this interruptible so large updates don't block the UI." },
        { q: "Difference between useMemo and useCallback — when to use each?", a: "Both prevent unnecessary work on re-renders. useMemo caches a computed value: const sorted = useMemo(() => expensiveSort(list), [list]) — only re-sorts when list changes. useCallback caches a function reference: const fn = useCallback(() => doThing(id), [id]) — returns the same function object so a child wrapped in React.memo won't re-render because the prop reference changed. Rule: useMemo for values, useCallback for functions passed as props." },
        { q: "Why do we need keys in lists?", a: "Keys help React identify which item changed, was added, or removed. Without keys, React re-renders the whole list on any change. With stable keys (like item IDs), it only touches the changed item. Example: <li key={user.id}>{user.name}</li> — if you delete user #2, React knows exactly which <li> to remove. Don't use array index as key if the list can reorder — React gets confused and shows stale state in the wrong position." },
        { q: "Explain the useEffect dependency array and common pitfalls (stale closures).", a: "The dep array tells React when to re-run the effect. [] = run once on mount. [count] = re-run when count changes. No array = run after every render. Stale closure: if you read state inside useEffect but don't list it in deps, you capture the old value. Example: useEffect(() => { console.log(count) }, []) always logs 0 even as count updates. Fix: add count to deps, or use a ref to always read the latest value without re-running the effect." },
        { q: "Controlled vs uncontrolled components?", a: "Controlled: React state drives the input. You always know the current value and can validate on every keystroke. Example: <input value={name} onChange={e => setName(e.target.value)} />. Uncontrolled: the DOM manages its own state; you read it via a ref when needed. Example: <input ref={inputRef} /> then inputRef.current.value on submit. Use controlled for validated forms. Use uncontrolled for simple file inputs or integrating non-React libraries." },
        { q: "How do you optimize a slow React app?", a: "First profile with React DevTools Profiler to find what's re-rendering and why. Then: wrap expensive components in React.memo to skip re-renders when props haven't changed. Use useMemo for expensive calculations. Use useCallback for functions passed to memoized children. Lazy-load routes with React.lazy + Suspense. Virtualize long lists with react-window. Avoid creating new objects/arrays inline in JSX props — they create new references every render." },
        { q: "What causes unnecessary re-renders and how do you prevent them?", a: "A component re-renders when its state changes, its parent re-renders, or its context changes — even if its own props didn't change. Common cause: inline function/object props create new references each render, so React.memo thinks props changed. Fix: useCallback for functions, useMemo for objects. Example: <Child onClick={() => doThing()} /> — the arrow function is new every render. Replace with: const handleClick = useCallback(() => doThing(), []). Then wrap Child in React.memo." },
        { q: "Class lifecycle methods mapped to hooks?", a: "componentDidMount → useEffect(() => { ... }, []). componentDidUpdate → useEffect(() => { ... }, [dep]). componentWillUnmount → return cleanup fn from useEffect: useEffect(() => { return () => cleanup(); }, []). shouldComponentUpdate → React.memo. getDerivedStateFromProps → derive the value during render with useMemo. getDerivedStateFromError / componentDidCatch → still needs a class-based Error Boundary (no hook equivalent yet)." },
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
        { q: "Walk through the Redux data flow from dispatch to re-render.", a: "User triggers an event → component calls dispatch(action) → Redux passes action + current state to the reducer → reducer returns new state → Redux updates the store → all components using useSelector that read that slice re-render. Example: click 'Add to Cart' → dispatch({ type: 'cart/add', payload: item }) → reducer adds item to state.cart.items → CartIcon re-renders with updated count." },
        { q: "Why must reducers be pure and immutable?", a: "Pure = same inputs always produce same output, no side effects (no API calls, no logging). Immutable = return a new state object, don't mutate the existing one. If you mutate directly, the object reference stays the same — React won't detect a change and won't re-render. Example: Wrong: state.items.push(item); return state. Correct: return { ...state, items: [...state.items, item] }. Redux Toolkit's createSlice uses Immer under the hood so you can write mutating syntax safely." },
        { q: "What problem does middleware solve? thunk vs saga?", a: "Reducers must be pure/synchronous — you can't do API calls inside them. Middleware sits between dispatch and the reducer and handles side effects. Thunk: simple — you dispatch a function instead of an action object; that function can call APIs and then dispatch real actions. Example: dispatch(fetchUser(id)) → async function hits API → dispatches { type: 'user/loaded', payload: data }. Saga: uses generator functions for complex async flows (retry logic, debouncing, race conditions). More powerful but steeper learning curve." },
        { q: "Redux vs Context API — when would you NOT use Redux?", a: "Don't use Redux when state is simple, local, or rarely shared globally. Context is fine for theme, language, or auth status that rarely changes. Redux shines when: many unrelated components need the same data, you need time-travel debugging, or async state management (loading/error/data) is complex. Rule of thumb: if you're passing props 3+ levels deep to unrelated components, consider Redux. If it's just a theme or logged-in user, Context is enough." },
        { q: "What does Redux Toolkit simplify over classic Redux?", a: "Classic Redux requires action type constants, action creator functions, and big switch statements in reducers — a lot of boilerplate. RTK's createSlice auto-generates action creators and action types from your reducer functions. createAsyncThunk handles async actions with auto-generated pending/fulfilled/rejected actions. createEntityAdapter normalizes collections. What used to be ~50 lines (constants + creator + reducer) becomes ~15 lines with a slice." },
        { q: "How do you handle async data and caching?", a: "With createAsyncThunk you dispatch an async thunk that auto-generates three actions: pending (set isLoading=true), fulfilled (store data), rejected (store error). For server-state caching, RTK Query is the modern choice — it auto-caches responses, deduplicates inflight requests, and refetches stale data. Example: const { data, isLoading, error } = useGetUsersQuery() — RTK Query handles the fetch, cache lifetime, and re-fetch on window focus automatically." },
        { q: "How do selectors improve performance?", a: "Selectors are functions that extract/compute data from the store. Basic: state => state.cart.items. Memoized selectors (via reselect's createSelector) only recompute when their inputs change — so components don't re-render when unrelated state updates. Example: a selector that filters a 10,000-item product list by active category. Without memoization, it re-filters on every store change. With createSelector, it only re-filters when products or the selected category changes." },
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
        { q: "Explain how closures work and give a practical example.", a: "A closure is when an inner function remembers variables from its outer scope even after the outer function has finished. Example: function counter() { let n = 0; return () => ++n; } — the returned function keeps access to n. Every call increments the same n. Used in: module patterns (private variables), memoization, event handlers that remember state, and setTimeout callbacks that need outer data." },
        { q: "What is the Temporal Dead Zone?", a: "The TDZ is the gap between when a let/const variable is hoisted to the top of its block scope and when it's actually initialized. Accessing it in this gap throws a ReferenceError. Example: console.log(x); let x = 5; — throws ReferenceError. With var this would log undefined because var is hoisted AND initialized to undefined. The TDZ forces you to declare before using, catching bugs early." },
        { q: "How does the browser event loop work — what is the order of execution?", a: "The call stack runs synchronous code first. When it empties: 1) ALL microtasks run (Promises .then, queueMicrotask) — including any new ones they add. 2) Browser renders if needed. 3) ONE macrotask runs (setTimeout, setInterval, click events). Then back to microtasks. Example: setTimeout(() => log('A'), 0); Promise.resolve().then(() => log('B')); log('C') → logs: C (sync) → B (microtask) → A (macrotask)." },
        { q: "What is the difference between call, apply, and bind?", a: "All three set the this value of a function. call(thisArg, arg1, arg2) — calls immediately, args listed individually. apply(thisArg, [arg1, arg2]) — calls immediately, args as array. bind(thisArg, arg1) — returns a NEW function with this fixed, doesn't call immediately (good for event handlers). Example: greet.call(user, 'Hello'). greet.apply(user, ['Hello']). const sayHi = greet.bind(user); sayHi('Hello') later." },
        { q: "Explain prototypal inheritance vs class-based inheritance.", a: "Every JS object has a hidden [[Prototype]] link. When you access a property, JS walks up this chain until it finds it or hits null. Classes in JS (ES6) are syntactic sugar — under the hood they still use prototypes. Example: Object.create(animal) makes an object whose prototype IS animal, so it inherits animal's methods. With classes: class Dog extends Animal {} does the same thing, cleaner syntax. Key difference from Java/C#: it's object-to-object, not class-to-class." },
        { q: "What are the differences between Promise.all, allSettled, race, and any?", a: "Promise.all([...]): waits for ALL to resolve. Rejects immediately if any one rejects. Use when you need all results. Promise.allSettled([...]): waits for ALL to finish (resolve or reject), returns each with a status — never rejects. Use when you want all outcomes regardless of failure. Promise.race([...]): settles as soon as the FIRST one settles (resolve or reject). Promise.any([...]): resolves when the FIRST one resolves; only rejects if ALL reject. Example: fetch 3 APIs in parallel → Promise.all. Show whichever loads first → Promise.race." },
        { q: "Shallow vs deep copy — when does each bite you?", a: "Shallow copy ({...obj} or Object.assign) copies top-level properties. Nested objects are still shared by reference — modifying a nested property in the copy also changes the original. Example: const copy = {...user}; copy.address.city = 'NYC' — this also changes user.address.city because address is a reference. Deep copy (structuredClone, or JSON.parse/JSON.stringify) recursively copies everything — no shared references. Note: JSON trick fails for Date, undefined, functions, and circular references." },
        { q: "How do ES Modules differ from CommonJS?", a: "CommonJS (require/module.exports): loads synchronously, evaluated at runtime, dynamic (require inside an if is fine), default in older Node.js. ES Modules (import/export): loads asynchronously, statically analyzed at parse time (bundlers can tree-shake unused exports), top-level await supported, strict mode by default. Example: CJS — const fs = require('fs'). ESM — import fs from 'fs'. In browsers, only ESM works natively. In Node.js, ESM needs .mjs or 'type': 'module' in package.json." },
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
        { q: "What is event delegation and why is it useful?", a: "Instead of attaching a listener to every child, you attach one listener to the parent and use event.target to check which child was clicked. Works because events bubble up. Example: a <ul> with 1000 <li> items — one listener on <ul> handles all clicks: ul.addEventListener('click', e => { if (e.target.tagName === 'LI') handle(e.target) }). Benefits: saves memory, works automatically for dynamically added children, and simplifies cleanup." },
        { q: "Explain the difference between event bubbling and capturing.", a: "When you click an element, the event travels in 3 phases. Capturing (down): window → body → parent → target. At target. Bubbling (up): target → parent → body → window. Listeners default to bubbling phase. To use capturing: el.addEventListener('click', fn, true). Example: click a <button> inside a <div> — the <div>'s listener fires too (bubbling). Use stopPropagation() to stop the event from bubbling further up." },
        { q: "Walk through the browser critical rendering path.", a: "1. Parse HTML → build DOM tree. 2. Parse CSS → build CSSOM tree. 3. Combine DOM + CSSOM → Render Tree (only visible elements). 4. Layout/Reflow: calculate exact position and size of each element. 5. Paint: fill pixels (colors, borders, text). 6. Composite: GPU combines layers and draws to screen. Render-blocking resources: CSS in <head> blocks rendering; JS blocks HTML parsing. Tip: put CSS in <head>, use defer/async on scripts." },
        { q: "What is the difference between reflow and repaint?", a: "Reflow (layout): recalculates positions and sizes. Triggered by: changing width, height, padding, font-size, adding/removing elements. Expensive — cascades to parent and child elements. Repaint: redraws pixels without changing layout. Triggered by: changing color, background, visibility. Less expensive. Composite: cheapest — GPU handles transform and opacity changes without reflow or repaint. Rule: animate with transform/opacity instead of left/width to avoid expensive reflows." },
        { q: "How does IntersectionObserver work and when would you use it?", a: "IntersectionObserver watches when an element enters or exits the viewport (or a container). You define a callback and thresholds; the callback fires when visibility crosses them. Example: new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadImage(entry.target) }).observe(imgEl) — loads an image only when it's about to scroll into view. Also used for: infinite scroll (load more when last item is visible), triggering CSS animations on scroll, ads viewability tracking." },
        { q: "What is the difference between localStorage, sessionStorage, Cookies, and IndexedDB?", a: "localStorage: persists until manually cleared, ~5-10 MB, accessible from any tab on same origin. sessionStorage: clears when the tab closes, ~5-10 MB, isolated to that tab only. Cookies: sent with every HTTP request (server can read them), tiny limit (4 KB), can be HttpOnly (not readable by JS — safer for auth tokens), can set expiry and SameSite. IndexedDB: full async database in browser, stores large structured data (files, blobs, objects), no size limit. Use cookies for auth, localStorage for preferences, IndexedDB for offline-first data." },
        { q: "How do Web Workers differ from Service Workers?", a: "Web Workers: run a script in a background thread so heavy computation doesn't freeze the UI. Tied to the page — they die when the page closes. No DOM access. Example: parse a 50 MB CSV in a Web Worker; the UI stays smooth. Service Workers: act as a programmable network proxy between the browser and server. They live independently of any page (survive page close), enable offline support by intercepting fetch requests and serving cached responses, and power push notifications and background sync." },
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
        { q: "What is the difference between debounce and throttle? Implement both.", a: "Debounce: waits until the user stops triggering for X ms, then fires once. Good for search inputs. function debounce(fn, delay) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); }; }. Throttle: fires at most once every X ms no matter how often triggered. Good for scroll/resize. function throttle(fn, limit) { let last = 0; return (...args) => { const now = Date.now(); if (now - last >= limit) { last = now; fn(...args); } }; }." },
        { q: "How would you diagnose and fix a slow-loading page?", a: "Open DevTools → Network tab: find large JS bundles, unoptimized images. Performance tab: find long tasks (>50ms) blocking the main thread. Lighthouse: get a score with specific recommendations. Fixes: code-split large bundles (lazy-load routes), compress/resize images (WebP, explicit width/height), remove unused JS/CSS (tree shaking), add cache headers (Cache-Control), preconnect to third-party origins, defer non-critical scripts." },
        { q: "What are LCP, CLS, and INP — and how do you improve each?", a: "LCP (Largest Contentful Paint): time for the biggest visible element to load. Target < 2.5s. Fix: preload the hero image, use a CDN, remove render-blocking resources. CLS (Cumulative Layout Shift): measures unexpected layout jumps. Target < 0.1. Fix: always set explicit width/height on images and iframes, never inject content above existing content. INP (Interaction to Next Paint): how fast the page responds to clicks/taps. Target < 200ms. Fix: break up long JS tasks with setTimeout chunks, defer non-critical work." },
        { q: "Explain virtual list / windowing and when you would use it.", a: "A virtual list only renders items currently visible in the viewport — as you scroll, off-screen items are removed from the DOM and new ones are added. This means rendering 100,000 items feels as fast as rendering 20. Use when displaying very long lists: comments, chat history, data tables, infinite feeds. Libraries: react-window or react-virtual. Example: a news feed with 5,000 articles — without windowing, all 5,000 DOM nodes exist at once, causing slow scroll and high memory usage." },
        { q: "What is tree shaking and how does it reduce bundle size?", a: "Tree shaking removes exported code you never import in your app from the final bundle. It works with ES Modules because imports are static — bundlers (Webpack, Rollup) can analyze exactly what's used at build time and 'shake off' the rest. Example: import { add } from 'math-utils' — if math-utils also exports subtract and multiply but you never use them, they're excluded from your bundle. CommonJS require() can't be tree-shaken because imports are dynamic (determined at runtime)." },
        { q: "How do you decide what to lazy-load vs eagerly load?", a: "Eagerly load: anything in the critical path — the content users see immediately on page load (main route, hero image, above-the-fold CSS). Lazy load: below-the-fold images (use loading='lazy'), route-specific code (load a page's JS bundle only when the user navigates to it), heavy libraries used in rare flows (rich text editor, chart library). Rule: if the user needs it in the first 3 seconds, load it eagerly. Everything else is a candidate for lazy loading." },
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
        { q: "Implement Array.prototype.map without using the native map.", a: "Array.prototype.myMap = function(cb) { const result = []; for (let i = 0; i < this.length; i++) { result.push(cb(this[i], i, this)); } return result; }. Key points: pass (element, index, originalArray) to callback — same signature as native map. Return a new array, never modify the original. Example: [1,2,3].myMap(x => x * 2) → [2,4,6]. Same pattern works for filter (push conditionally) and forEach (no return value)." },
        { q: "Write a Function.prototype.bind polyfill.", a: "Function.prototype.myBind = function(thisArg, ...presetArgs) { const fn = this; return function(...laterArgs) { return fn.apply(thisArg, [...presetArgs, ...laterArgs]); }; }. Key: capture this (the original function) in fn before returning the new function. Merge preset args with later args — this enables partial application. Example: const add5 = add.myBind(null, 5); add5(3) → 8. Arrow functions can't be used for fn because they'd lose this." },
        { q: "Implement Promise.all from scratch.", a: "function promiseAll(promises) { return new Promise((resolve, reject) => { const results = new Array(promises.length); let done = 0; if (!promises.length) return resolve([]); promises.forEach((p, i) => { Promise.resolve(p).then(val => { results[i] = val; if (++done === promises.length) resolve(results); }).catch(reject); }); }); }. Key: preserve order using index i (not push). Reject immediately on first failure. Resolve only when all done. Handle empty array edge case." },
        { q: "Write a debounce function. Now write throttle.", a: "Debounce (fire after user stops): function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }. Throttle (fire at most once per interval): function throttle(fn, limit) { let lastRun = 0; return (...args) => { const now = Date.now(); if (now - lastRun >= limit) { lastRun = now; fn(...args); } }; }. Debounce → search input. Throttle → scroll/resize handlers. Interviewers often ask you to add a 'leading edge' option (fire immediately on first call)." },
        { q: "Implement a deep clone function.", a: "function deepClone(val) { if (val === null || typeof val !== 'object') return val; if (val instanceof Date) return new Date(val); if (Array.isArray(val)) return val.map(deepClone); const clone = {}; for (const key of Object.keys(val)) { clone[key] = deepClone(val[key]); } return clone; }. Modern shortcut: structuredClone(obj) — built into browsers and Node 17+. Avoid JSON.parse/stringify — it drops Date objects, undefined, and functions, and throws on circular references." },
        { q: "Implement a basic EventEmitter with on, off, and emit.", a: "class EventEmitter { constructor() { this.events = {}; } on(name, fn) { (this.events[name] ??= []).push(fn); return this; } off(name, fn) { this.events[name] = (this.events[name] || []).filter(f => f !== fn); } emit(name, ...args) { (this.events[name] || []).forEach(f => f(...args)); } once(name, fn) { const wrapper = (...args) => { fn(...args); this.off(name, wrapper); }; this.on(name, wrapper); } }. Example: ee.on('data', console.log); ee.emit('data', 42) logs 42. once() is a bonus interviewers love." },
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
        { q: "What are Micro Frontends and when would you use them?", a: "Micro Frontends split a large frontend app into smaller, independently deployable pieces — each owned by a different team. Like microservices but for the UI. Use when: multiple teams work on the same large app and want to deploy independently, or different sections have different tech stacks. Example: an e-commerce site where the cart team, product team, and checkout team own their sections separately. Downside: added complexity, larger combined bundle size, harder to keep the UI consistent." },
        { q: "How does Module Federation work in Webpack 5?", a: "Module Federation lets separate Webpack builds share code at runtime. One app (host) can load components from another app's (remote) build without bundling them together. The host declares what remotes it needs; remotes declare what they expose. At runtime, the host downloads the remote's chunk on demand from its URL. Example: Shell app loads <ProductList /> from the products-team's live build URL. When the products team deploys a fix, Shell gets it automatically without rebuilding." },
        { q: "How do you share state between Micro Frontends?", a: "Options: (1) URL/query params — simplest, survives refresh, works across MFEs. (2) Custom DOM Events / Pub-Sub — MFEs emit and listen to window events without importing each other. (3) Shared module via Module Federation — expose a tiny state store (e.g. Zustand) as a shared singleton. (4) Backend as source of truth — each MFE fetches its own data; avoid client-side sharing where possible. Rule: prefer loose coupling. Don't let MFEs import each other's state directly." },
        { q: "Walk through how you would design a large-scale frontend system (e.g. news feed).", a: "Start with: what does it need to do? (read-heavy, real-time updates, infinite scroll). Then: components (Feed, FeedItem, Sidebar), state (React Query for server data, Zustand for UI), data fetching (cursor-based pagination), performance (virtual list for feed, lazy-load images, code-split routes), real-time (WebSocket or SSE for new posts), offline (Service Worker cache), deployment (CDN for static assets, SSR for first paint). Always talk through trade-offs — interviewers care about your thinking, not one right answer." },
        { q: "What is a Design System and what problem does it solve?", a: "A Design System is a shared library of reusable components, design tokens (colors, spacing, typography), and usage guidelines that all product teams use. It solves: inconsistent UI across teams, duplicated component code, slow development (every team rebuilding the same button). Example: a Button component in the Design System handles all states (hover, focus, disabled, loading) and is used everywhere — one accessibility fix or style change propagates across the whole product automatically. Tools: Storybook for documentation, CSS variables/tokens for theming." },
        { q: "How do CDNs improve performance and what are their limitations?", a: "A CDN serves your files from servers physically close to the user. A user in Tokyo gets your JS/CSS/images from a Tokyo PoP instead of your US origin — lower latency, faster load. CDNs also cache aggressively and absorb traffic spikes. Limitations: cache invalidation can be tricky (users get stale JS for hours after a deploy). Fix: use content-hashed filenames (app.abc123.js) so new deploys get new URLs and old ones expire naturally. Dynamic/personalized content can't be cached. CDN outages affect your app; have an origin fallback." },
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
  { id: "mk-30a", label: "Kafka topics, partitions & offsets" },
  { id: "mk-30b", label: "Consumer groups & parallel processing" },
  { id: "mk-30c", label: "At-least-once vs exactly-once delivery" },
  { id: "mk-30d", label: "Kafka vs RabbitMQ trade-offs" },
  { id: "mk-30e", label: "Dead Letter Queue (DLQ) pattern" },
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

function useWindowWidth() {
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
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

// ─── QBoxItem (expandable Q&A) ───────────────────────────────────────────────

function QBoxItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <li style={{ borderBottom: "1px solid #ede9fb", padding: "0" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          padding: "9px 0",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: 13, lineHeight: 1.55, color: "#3a3f55", flex: 1 }}>
          <span style={{ fontWeight: 700, color: css.purpleDeep, marginRight: 6 }}>{idx + 1}.</span>
          {q}
        </span>
        <span
          style={{
            flexShrink: 0,
            marginTop: 2,
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 20,
            background: open ? css.purple : "#f0effb",
            color: open ? "#fff" : css.purpleDeep,
            border: `1px solid ${open ? css.purple : "#d8d5f5"}`,
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {open ? "▲ Hide" : "▼ Answer"}
        </span>
      </div>
      {open && (
        <div
          style={{
            background: "#f8f7ff",
            border: `1px solid ${css.cardBorder}`,
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 10,
            fontSize: 12.8,
            lineHeight: 1.65,
            color: "#33384d",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
          }}
        >
          {a}
        </div>
      )}
    </li>
  );
}

interface CardBlockProps {
  card: Card;
  checked: Set<string>;
  onToggle: (id: string) => void;
  isMobile: boolean;
  isTablet: boolean;
}

function CardBlock({ card, checked, onToggle, isMobile, isTablet }: CardBlockProps) {
  const done = card.items.filter((i) => checked.has(i.id)).length;
  const pct = Math.round((done / card.items.length) * 100);
  // Responsive columns: mobile → 1, tablet → max 2, desktop → as defined
  const effectiveCols = isMobile
    ? 1
    : isTablet
    ? Math.min(card.cols ?? 1, 2)
    : card.cols === 3 ? 3 : card.cols === 2 ? 2 : 1;
  return (
    <div
      style={{
        background: css.card,
        border: `1px solid ${css.cardBorder}`,
        borderRadius: 14,
        padding: isMobile ? "14px 14px 12px" : "16px 18px 14px",
        gridColumn: card.span2 ? "1 / -1" : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px dashed #e3c9da" }}>
        <h3 style={{ color: css.pink, fontSize: isMobile ? 14 : 15, fontWeight: 800, margin: 0 }}>{card.title}</h3>
        <span style={{ fontSize: 12, color: pct === 100 ? "#2ecc71" : css.muted, fontWeight: 600 }}>
          {done}/{card.items.length}
        </span>
      </div>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          columns: effectiveCols,
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

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width < 900;

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
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "16px 12px 60px" : "34px 20px 80px" }}>

        {/* ── Cover ── */}
        <div
          style={{
            background: "linear-gradient(135deg,#6c5ce7 0%,#8b7ff0 40%,#c86fd0 75%,#e84393 100%)",
            color: "#fff",
            borderRadius: isMobile ? 16 : 22,
            padding: isMobile ? "28px 20px 32px" : "46px 40px 52px",
            position: "relative",
            overflow: "hidden",
            marginBottom: isMobile ? 22 : 38,
          }}
        >
          {/* decorative bubbles */}
          <div style={{ position: "absolute", width: isMobile ? 140 : 240, height: isMobile ? 140 : 240, borderRadius: "50%", background: "rgba(255,255,255,.12)", top: -40, right: -30 }} />
          <div style={{ position: "absolute", width: isMobile ? 100 : 160, height: isMobile ? 100 : 160, borderRadius: "50%", background: "rgba(255,255,255,.09)", bottom: -50, left: -30 }} />

          <div style={{ fontSize: isMobile ? 28 : 40, letterSpacing: isMobile ? 4 : 6, marginBottom: isMobile ? 16 : 26 }}>✅ 📋 ⚡</div>
          <h1 style={{ fontSize: isMobile ? 28 : 44, lineHeight: 1.1, margin: "0 0 8px", fontWeight: 800 }}>
            Fullstack Interview{isMobile ? " " : <br />}Prep Checklist
          </h1>
          <p style={{ fontSize: isMobile ? 13 : 18, opacity: 0.92, margin: isMobile ? "0 0 16px" : "0 0 24px", fontWeight: 500, lineHeight: 1.5 }}>
            {isMobile
              ? "Core JS · Browser · React · Node.js · DSA · System Design"
              : "Core JS · Browser · Performance · Polyfills · Patterns · React · Node.js · Databases · DSA · System Design. Tick it. Track it. Crack it."}
          </p>

          {/* pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 6 : 9, marginBottom: isMobile ? 18 : 24 }}>
            {["Core JS", "Browser & DOM", "Performance", "Polyfills", "Patterns", "Frontend Arch", "React", "Redux", "PWA", "Node.js", "HTTP/HTTPS", "JWT & Auth", "SQL", "MongoDB", "Redis", "Kafka", "DSA", "System Design", "Security"].map((t) => (
              <span key={t} style={{ background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", fontSize: isMobile ? 11 : 13, fontWeight: 600, padding: isMobile ? "4px 10px" : "7px 15px", borderRadius: 30 }}>{t}</span>
            ))}
          </div>

          {/* overall progress */}
          <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 12, padding: isMobile ? "12px 14px" : "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: isMobile ? 13 : 15 }}>Overall Progress</span>
              <span style={{ fontWeight: 800, fontSize: isMobile ? 14 : 18 }}>{totalDone} / {TOTAL} ({overallPct}%)</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,.25)", overflow: "hidden" }}>
              <div style={{ width: `${overallPct}%`, height: "100%", background: "#fff", transition: "width 0.3s", borderRadius: 4 }} />
            </div>
          </div>

          <div style={{ marginTop: isMobile ? 14 : 20, paddingTop: isMobile ? 12 : 16, borderTop: "1px solid rgba(255,255,255,.25)", fontSize: isMobile ? 12 : 13.5, opacity: 0.9, lineHeight: 1.6 }}>
            Tick a box only when you can <strong>explain it AND code it</strong>. Clear the Must-Know box and you're interview-ready.
          </div>
        </div>

        {/* ── Section nav ── */}
        <div
          style={{
            display: "flex",
            flexWrap: isMobile ? "nowrap" : "wrap",
            overflowX: isMobile ? "auto" : "visible",
            WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
            gap: isMobile ? 6 : 8,
            marginBottom: isMobile ? 20 : 32,
            paddingBottom: isMobile ? 4 : 0,
            // hide scrollbar visually on mobile while keeping scroll
            scrollbarWidth: "none" as React.CSSProperties["scrollbarWidth"],
          }}
        >
          <button
            onClick={() => setActiveSection(null)}
            style={{
              flexShrink: 0,
              padding: isMobile ? "6px 12px" : "6px 14px",
              borderRadius: 20,
              border: `1.5px solid ${activeSection === null ? css.purple : css.cardBorder}`,
              background: activeSection === null ? css.purple : "#fff",
              color: activeSection === null ? "#fff" : css.ink,
              fontWeight: 600, fontSize: isMobile ? 12 : 13, cursor: "pointer",
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
                  flexShrink: 0,
                  padding: isMobile ? "6px 12px" : "6px 14px",
                  borderRadius: 20,
                  border: `1.5px solid ${active ? css.purple : css.cardBorder}`,
                  background: active ? css.purple : "#fff",
                  color: active ? "#fff" : css.ink,
                  fontWeight: 600, fontSize: isMobile ? 12 : 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: isMobile ? 4 : 6,
                  whiteSpace: "nowrap",
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
            <div style={{ color: css.purpleDeep, fontSize: isMobile ? 19 : 24, fontWeight: 800, margin: isMobile ? "26px 0 4px" : "36px 0 4px", paddingBottom: 10, borderBottom: `3px solid #e3e1f7` }}>
              {section.title}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 18, marginTop: isMobile ? 12 : 16 }}>
              {section.cards.map((card) => (
                <CardBlock key={card.id} card={card} checked={checked} onToggle={toggle} isMobile={isMobile} isTablet={isTablet} />
              ))}
            </div>

            {/* pros/cons */}
            {section.proscons && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 10 : 14, marginTop: isMobile ? 10 : 14 }}>
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
                <h4 style={{ color: css.purpleDeep, margin: "0 0 4px", fontSize: 14.5 }}>{section.qbox.title}</h4>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: css.muted }}>Click any question to reveal the answer.</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {section.qbox.items.map((item, i) => (
                    <QBoxItem key={i} q={item.q} a={item.a} idx={i} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {/* ── Must-Know ── */}
        {(!activeSection) && (
          <>
            <div style={{ color: css.purpleDeep, fontSize: isMobile ? 19 : 24, fontWeight: 800, margin: isMobile ? "26px 0 4px" : "36px 0 4px", paddingBottom: 10, borderBottom: `3px solid #e3e1f7` }}>
              Absolute Must-Know (Clear These First!)
            </div>
            <div style={{ border: `2px solid ${css.purple}`, borderRadius: 16, padding: isMobile ? "16px 14px" : "22px 24px", marginTop: 18, background: "#faf9ff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2 style={{ color: css.purpleDeep, margin: 0, fontSize: isMobile ? 17 : 20 }}>Must-Know Checklist</h2>
                <span style={{ fontWeight: 700, fontSize: isMobile ? 13 : 15, color: mustDone === MUST_KNOW.length ? "#2ecc71" : css.purple }}>
                  {mustDone}/{MUST_KNOW.length}
                </span>
              </div>
              {/* progress */}
              <div style={{ height: 4, borderRadius: 2, background: "#e3e1f7", overflow: "hidden", marginBottom: 16 }}>
                <div style={{ width: `${Math.round((mustDone / MUST_KNOW.length) * 100)}%`, height: "100%", background: mustDone === MUST_KNOW.length ? "#2ecc71" : css.purple, transition: "width 0.3s" }} />
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, columns: isMobile ? 1 : isTablet ? 2 : 3, columnGap: 24 }}>
                {MUST_KNOW.map((item) => (
                  <CheckboxItem key={item.id} item={item} checked={checked.has(item.id)} onToggle={toggle} />
                ))}
              </ul>
            </div>

            <div style={{ borderLeft: "5px solid #2ecc71", background: "#effaf1", padding: isMobile ? "12px 14px" : "14px 18px", borderRadius: 8, marginTop: 18, fontSize: isMobile ? 13 : 13.5, lineHeight: 1.6 }}>
              <strong>Finish line:</strong> If you can confidently <strong>explain AND code</strong> every item in the Must-Know box, you're well-prepared for most fullstack / Node.js / SDE-2 interviews. For each topic, be ready to state at least one <strong>benefit and one drawback</strong>. Tick boxes only when a topic truly clicks.
            </div>
          </>
        )}

        {/* ── Reset button ── */}
        <div style={{ marginTop: isMobile ? 28 : 40, textAlign: "center" }}>
          <button
            onClick={() => {
              if (confirm("Reset all checkboxes?")) {
                setChecked(new Set());
              }
            }}
            style={{
              padding: isMobile ? "12px 32px" : "10px 24px",
              borderRadius: 20, border: `1.5px solid #f2c4cc`,
              background: "#fdeef0", color: "#c0392b",
              fontWeight: 600, fontSize: isMobile ? 14 : 13, cursor: "pointer",
              // Bigger tap target on mobile
              minHeight: isMobile ? 44 : "auto",
            }}
          >
            Reset all
          </button>
        </div>
      </div>
    </div>
  );
}