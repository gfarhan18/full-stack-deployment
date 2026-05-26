/**
 * CORS allowlist from environment variables.
 * FRONTEND_URL supports comma-separated values.
 */

function normalizeOrigin(value) {
  if (!value || typeof value !== 'string') return null;
  let trimmed = value.trim();
  // Railway/Vercel UI sometimes saves values with quotes
  trimmed = trimmed.replace(/^['"]+|['"]+$/g, '');
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, '');
}

function parseOriginsFromEnv() {
  const fromList = (process.env.FRONTEND_URLS || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  const fromSingle = (process.env.FRONTEND_URL || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  const defaults = ['http://localhost:5173', 'http://127.0.0.1:5173'];

  return [...new Set([...fromSingle, ...fromList, ...defaults])];
}

const allowedOrigins = parseOriginsFromEnv();

const allowVercelPreviews =
  process.env.ALLOW_VERCEL_PREVIEWS === 'true' ||
  process.env.ALLOW_VERCEL_PREVIEWS === '1';

const allowAnyVercelIfConfigured =
  process.env.ALLOW_ANY_VERCEL === 'false' || process.env.ALLOW_ANY_VERCEL === '0'
    ? false
    : allowedOrigins.some((o) => {
        try {
          return new URL(o).hostname.endsWith('.vercel.app');
        } catch {
          return false;
        }
      });

function isVercelHost(hostname) {
  return hostname === 'vercel.app' || hostname.endsWith('.vercel.app');
}

function isVercelPreview(origin) {
  try {
    const { protocol, hostname } = new URL(origin);
    return protocol === 'https:' && isVercelHost(hostname);
  } catch {
    return false;
  }
}

function hostnameMatchesAllowlist(origin) {
  try {
    const requestHost = new URL(origin).hostname;
    return allowedOrigins.some((allowed) => {
      try {
        return new URL(allowed).hostname === requestHost;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

export function isOriginAllowed(origin) {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);

  // Production: any https *.vercel.app (covers -iota, preview, and production URLs)
  if (process.env.NODE_ENV === 'production' && isVercelPreview(normalized)) {
    return true;
  }

  if (allowedOrigins.includes(normalized)) return true;
  if (hostnameMatchesAllowlist(normalized)) return true;
  if (allowVercelPreviews && isVercelPreview(normalized)) return true;
  if (allowAnyVercelIfConfigured && isVercelPreview(normalized)) return true;
  return false;
}

/** Always set CORS headers when origin is allowed (fixes missing header on 200 responses). */
export function corsHeadersMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}

export function getAllowedOrigins() {
  return allowedOrigins;
}

export function getCorsOptions() {
  return {
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        // Reflect the request origin (required when credentials are used)
        callback(null, origin || true);
      } else {
        console.warn(
          `[CORS] Blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ') || '(none)'}` +
            (allowVercelPreviews || allowAnyVercelIfConfigured
              ? ' (+ vercel.app)'
              : '')
        );
        callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  };
}
