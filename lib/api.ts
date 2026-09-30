/**
 * Typed client for the SautiPay backend.
 *
 * Every function here maps to exactly one Flask route, and the return types
 * mirror the JSON the backend actually emits. The browser calls this directly,
 * so it relies on the backend's CORS configuration allowing this origin.
 */

/** Modes the backend accepts on a chat turn. */
export type SautiMode = "internet" | "education" | "business";

/** Languages the backend's request validator accepts. */
export type SupportedLanguage =
  | "auto"
  | "en"
  | "sw"
  | "fr"
  | "luo"
  | "kikuyu"
  | "kamba"
  | "kisii"
  | "meru"
  | "samburu";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ------------------------------------------------------------------ */
/* Chat                                                                */
/* ------------------------------------------------------------------ */

export type Source = {
  title: string;
  url: string;
  domain: string;
  date?: string | null;
  accessed_at?: string | null;
  source_type: string;
  relevance: number;
};

export type SautiChatRequest = {
  message: string;
  language?: SupportedLanguage;
  conversation_id?: string | null;
  user_id?: string | null;
  use_tools?: boolean;
  mode?: SautiMode;
  user_location?: string | null;
};

export type SautiChatResponse = {
  message: string;
  response: string;
  language: string;
  reply_language: string;
  is_mixed: boolean;
  intent: string;
  routedIntent: string;
  confidence: number;
  used_tools: string[];
  tool_results: Array<Record<string, unknown>>;
  sources: Source[];
  activity: string[];
  memory_used: string[];
  conversation_id: string | null;
  request_id: string;
  engine: string;
  /** True only when the engine actually generated the reply. */
  engine_ok: boolean;
  engine_error: string;
  /** True when the reply is not a live engine answer. */
  degraded: boolean;
  offline_fallback: boolean;
  mode: SautiMode;
  duration_ms: number;
};

/* ------------------------------------------------------------------ */
/* Marketplace                                                         */
/* ------------------------------------------------------------------ */

export type Listing = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  currency: string | null;
  location: string | null;
  category: string;
  subcategory: string | null;
  images: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  isVendorVerified: boolean;
  vendorName: string | null;
  vendorId: string | null;
  createdAt: string | null;
  matchScore?: number;
};

export type MarketplaceSearchResponse = {
  query: string;
  message: string;
  language: string;
  resultCount: number;
  results: Listing[];
  filters: Array<{ key: string; label: string; count: number }>;
};

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string;
  source: string;
  sourceType: string;
  sourceUrl: string | null;
  image: string | null;
  isFeatured: boolean;
  publishedAt: string;
};

export type PopularSearch = {
  query: string;
  resultCount: number;
  searches: number;
};

export type MarketplaceCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  accent: string | null;
  sortOrder: number;
};

export type SavedProduct = Listing;

export type SavedVendor = {
  id: string;
  businessName: string;
  slug: string;
  description: string | null;
  location: string | null;
  rating: number | null;
  reviewCount: number | null;
  isVerified: boolean;
  logo: string | null;
  cover: string | null;
};

/** `POST /api/marketplace/saved` returns only the save confirmation. */
export type SaveResult = {
  id: string;
  saved: boolean;
  alreadySaved: boolean;
};

/** `GET /api/marketplace/saved` splits results by entity kind. */
export type SavedResponse = {
  products: SavedProduct[];
  vendors: SavedVendor[];
  total: number;
};

/* ------------------------------------------------------------------ */
/* Conversations                                                       */
/* ------------------------------------------------------------------ */

/** Field names here are snake_case, as the backend emits them. */
export type ConversationMessage = {
  id: string;
  role: string;
  content: string;
  language: string | null;
  created_at: string;
};

export type ConversationHistory = {
  conversation_id: string;
  title: string | null;
  language: string | null;
  messages: ConversationMessage[];
};

/* ------------------------------------------------------------------ */
/* Transport                                                           */
/* ------------------------------------------------------------------ */

/** Error carrying the HTTP status and any backend-supplied message. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (cause) {
    // Network-level failure: backend down, DNS, CORS preflight refused.
    throw new ApiError(
      "Could not reach the Sauti service. Check that the backend is running.",
      0,
    );
  }

  if (!response.ok) {
    // The backend returns {"error": "..."} on failure; fall back to status text
    // if the body is not JSON so we never surface a raw parse error.
    const detail = await response
      .json()
      .then((body: unknown) =>
        typeof body === "object" && body !== null && "error" in body
          ? String((body as { error: unknown }).error)
          : null,
      )
      .catch(() => null);

    throw new ApiError(
      detail ?? `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

/** Ask Sauti. This is the endpoint that reaches the language model. */
export function sautiChat(
  body: SautiChatRequest,
  signal?: AbortSignal,
): Promise<SautiChatResponse> {
  return request<SautiChatResponse>("/api/sauti/chat", {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}

/** Search marketplace products. Pure database search, no model call. */
export function marketplaceSearch(
  query: string,
  signal?: AbortSignal,
): Promise<MarketplaceSearchResponse> {
  return request<MarketplaceSearchResponse>("/api/marketplace/search", {
    method: "POST",
    body: JSON.stringify({ query }),
    signal,
  });
}

/** Latest articles, newest first. `category` filters server-side. */
export function newsArticles(
  limit = 20,
  category?: string | null,
  signal?: AbortSignal,
): Promise<{ articles: NewsArticle[] }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (category) params.set("category", category);

  return request<{ articles: NewsArticle[] }>(
    `/api/marketplace/news?${params.toString()}`,
    { signal },
  );
}

/** Marketplace categories, used for the news topic filter. */
export function marketplaceCategories(
  signal?: AbortSignal,
): Promise<{ categories: MarketplaceCategory[] }> {
  return request<{ categories: MarketplaceCategory[] }>(
    "/api/marketplace/categories",
    { signal },
  );
}

/** Most-searched terms, used for the popular-search pills. */
export function popularSearches(
  limit = 6,
  signal?: AbortSignal,
): Promise<{ searches: PopularSearch[] }> {
  return request<{ searches: PopularSearch[] }>(
    `/api/marketplace/popular?limit=${limit}`,
    { signal },
  );
}

/** Full message history for one conversation. */
export function conversationHistory(
  conversationId: string,
  signal?: AbortSignal,
): Promise<ConversationHistory> {
  return request<ConversationHistory>(
    `/api/chat/history/${encodeURIComponent(conversationId)}`,
    { signal },
  );
}

/** Items the user saved, split into products and vendors. */
export function savedItems(
  userId: string,
  signal?: AbortSignal,
): Promise<SavedResponse> {
  return request<SavedResponse>(
    `/api/marketplace/saved?user_id=${encodeURIComponent(userId)}`,
    { signal },
  );
}

/** Save an item (a product, article or vendor) for later. */
export function saveItem(body: {
  item_type: string;
  item_id: string;
  user_id?: string | null;
}): Promise<SaveResult> {
  return request<SaveResult>("/api/marketplace/saved", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Backend liveness, including whether the model provider is reachable. */
export function health(signal?: AbortSignal): Promise<{
  status: string;
  version: string;
}> {
  return request("/api/health", { signal });
}

/** Detailed engine status: which provider is configured and whether it answers. */
export function sautiHealth(signal?: AbortSignal): Promise<{
  engine: string;
  model: string;
  groqConfigured: boolean;
  groqReachable: boolean;
  geminiConfigured: boolean;
  searchConfigured: boolean;
  memoryEnabled: boolean;
  sttModel: string;
}> {
  return request("/api/sauti/health", { signal });
}

/** Languages the backend has content for, with native names. */
export function languages(signal?: AbortSignal): Promise<{
  languages: Array<{
    code: string;
    name: string;
    native_name: string;
    is_active: boolean;
  }>;
}> {
  return request("/api/languages", { signal });
}

/**
 * Transcribe a recorded clip with the backend's speech model.
 *
 * Sent as multipart because the endpoint takes the raw clip, not JSON. Doing
 * this server-side is what makes voice work in browsers without
 * `SpeechRecognition`, such as Firefox.
 */
export async function transcribeAudio(
  clip: Blob,
  language: SupportedLanguage = "auto",
  signal?: AbortSignal,
): Promise<{ text: string; language: string }> {
  const form = new FormData();
  form.append("audio", clip, "clip.webm");
  form.append("language", language);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/sauti/transcribe`, {
      method: "POST",
      body: form,
      signal,
    });
  } catch {
    throw new ApiError("Could not reach the speech service.", 0);
  }

  if (!response.ok) {
    const detail = await response
      .json()
      .then((body: unknown) =>
        typeof body === "object" && body !== null && "error" in body
          ? String((body as { error: unknown }).error)
          : null,
      )
      .catch(() => null);
    throw new ApiError(detail ?? "Transcription failed.", response.status);
  }

  return (await response.json()) as { text: string; language: string };
}