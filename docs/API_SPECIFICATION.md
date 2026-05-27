# Gaskuy Roadtrip API Documentation

**Version:** 1.0.0  
**Base URL:** `/api`  
**Contact:** support@gaskuy.id

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Endpoints](#endpoints)
   - [Auth](#auth-endpoints)
   - [Spots](#spots-endpoints)
   - [Products](#products-endpoints)
   - [POI](#poi-endpoints)
   - [Routes](#routes-endpoints)
   - [Waitlist](#waitlist-endpoints)
   - [Analytics](#analytics-endpoints)
   - [Upload](#upload-endpoints)
6. [Data Models](#data-models)
7. [Appendix](#appendix)

---

## Overview

Gaskuy Roadtrip API menyediakan backend untuk platform roadtrip Indonesia. API ini mengikuti prinsip **Backend-for-Frontend (BFF)** pattern di mana semua akses database dilakukan melalui server-side API routes.

**Architecture:**
```
Frontend → API Routes (/api/*) → Supabase (Private)
```

**Key Features:**
- Server-side authentication & authorization
- Rate limiting (Upstash Redis)
- Input validation (Zod)
- Audit logging
- RLS policies (defense in depth)

---

## Authentication

### Authentication Scheme

All admin endpoints require authentication via **Supabase Auth session**.

**Headers:**
```
Cookie: sb-{project-ref}-auth-token={session_token}
```

### Role-Based Access Control

| Role | Access |
|------|--------|
| **Public** | GET endpoints (spots, products, routes, POI) |
| **authenticated** | POST waitlist, GET own profile |
| **super_admin** | All admin CRUD operations |

### Session Validation

Middleware automatically validates session for `/admin/*` routes:
1. Extract session from cookie
2. Verify session validity
3. Check user role in `profiles` table
4. Redirect to `/admin/login` if unauthorized

---

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Spot not found",
    "details": {}
  }
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET /api/spots |
| 201 | Created | POST /api/spots |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid session |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Database error |

### Error Codes

```
type ErrorCode =
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "BAD_REQUEST"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "VALIDATION_ERROR"
```

---

## Rate Limiting

### Limits by Role

| Role | Limit | Window |
|------|-------|--------|
| **Anonymous** | 10 requests | 1 minute |
| **Authenticated** | 100 requests | 1 minute |
| **Admin** | 1000 requests | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1625140800
```

### Rate Limit Exceeded Response

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again in 45 seconds.",
    "retryAfter": 45
  }
}
```

---

## Endpoints

### Auth Endpoints

#### POST `/api/auth/signin`

Sign in with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "super_admin"
  },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "abc...",
    "expires_at": 1625140800
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```

---

#### POST `/api/auth/signin/google`

Sign in with Google OAuth.

**Request:**
```json
{
  "provider": "google",
  "redirectTo": "/admin"
}
```

**Response (200 OK):**
```json
{
  "url": "https://qpzormleecheuzmilhjo.supabase.co/auth/v1/authorize?provider=google..."
}
```

---

#### POST `/api/auth/signout`

Sign out current session. **Auth:** Required

**Response (200 OK):**
```json
{
  "success": true
}
```

---

#### GET `/api/auth/session`

Get current session and user info. **Auth:** Required

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "super_admin"
  },
  "session": {
    "access_token": "eyJ...",
    "expires_at": 1625140800
  }
}
```

---

### Spots Endpoints

#### GET `/api/spots`

List all spots with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `region` | string | Filter by region |
| `province` | string | Filter by province |
| `search` | string | Search by name/description |
| `featured` | boolean | Filter featured only |
| `limit` | number | Max results (default: 20) |
| `offset` | number | Pagination offset |

**Example:**
```
GET /api/spots?category=alam&region=Jawa&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "kawah-putih-ciwidey",
      "name": "Kawah Putih Ciwidey",
      "category": "alam",
      "province": "Jawa Barat",
      "region": "Jawa",
      "location": { "lat": -7.1234, "lng": 107.5678 },
      "description": "...",
      "rating": 4.5,
      "imageUrl": "https://...",
      "tags": ["gunung", "wisata alam"],
      "isFeatured": true,
      "viewCount": 1234,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

#### GET `/api/spots/:slug`

Get single spot by slug.

**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "slug": "kawah-putih-ciwidey",
    "name": "Kawah Putih Ciwidey",
    "category": "alam",
    "province": "Jawa Barat",
    "region": "Jawa",
    "location": { "lat": -7.1234, "lng": 107.5678 },
    "description": "...",
    "whySpecial": "...",
    "rating": 4.5,
    "imageUrl": "https://...",
    "imageCredit": "Unsplash",
    "tags": ["gunung", "wisata alam"],
    "tips": "...",
    "bestTime": "Pagi hari",
    "openingHours": "06:00 - 17:00",
    "estimatedTime": "2-3 jam",
    "ticketPrice": "Rp 15.000",
    "roadAccess": "Aspal mulus",
    "facilities": ["Parkir", "Toilet", "Warung"],
    "distanceFromCity": "45 km dari Bandung",
    "popularRoutes": [{ "from": "Jakarta", "duration": "3 jam" }],
    "relatedProductIds": ["uuid1", "uuid2"],
    "isFeatured": true,
    "viewCount": 1234,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

---

#### POST `/api/spots`

Create new spot. **Auth:** Admin only

**Request:**
```json
{
  "name": "Kawah Putih Ciwidey",
  "category": "alam",
  "province": "Jawa Barat",
  "region": "Jawa",
  "location": { "lat": -7.1234, "lng": 107.5678 },
  "description": "...",
  "whySpecial": "...",
  "rating": 4.5,
  "imageUrl": "https://...",
  "tags": ["gunung", "wisata alam"],
  "tips": "...",
  "bestTime": "Pagi hari",
  "openingHours": "06:00 - 17:00",
  "estimatedTime": "2-3 jam",
  "ticketPrice": "Rp 15.000",
  "roadAccess": "Aspal mulus",
  "facilities": ["Parkir", "Toilet", "Warung"],
  "distanceFromCity": "45 km dari Bandung",
  "isFeatured": true
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "uuid",
    "slug": "kawah-putih-ciwidey",
    "name": "Kawah Putih Ciwidey",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT `/api/spots/:slug`

Update existing spot. **Auth:** Admin only

**Request:** Partial spot fields (slug cannot be updated)

**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "slug": "kawah-putih-ciwidey",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

---

#### DELETE `/api/spots/:slug`

Delete spot. **Auth:** Admin only

**Response (200 OK):**
```json
{
  "success": true
}
```

---

#### POST `/api/spots/:slug/view`

Increment spot view count.

**Response (200 OK):**
```json
{
  "success": true,
  "viewCount": 1235
}
```

---

### Products Endpoints

#### GET `/api/products`

List all products with optional filters.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "kotak-p3k-darurat",
      "name": "Kotak P3K Darurat",
      "category": "Safety & Darurat",
      "price": 150000,
      "imageUrl": "https://...",
      "description": "...",
      "rating": 4.8,
      "stockQuantity": 50
    }
  ],
  "pagination": {
    "total": 30,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### POST `/api/products` — Create (Admin)
#### PUT `/api/products/:id` — Update (Admin)
#### DELETE `/api/products/:id` — Delete (Admin)

---

### POI Endpoints

#### GET `/api/poi`

List all Points of Interest.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "SPBU Pertamina",
      "category": "spbu",
      "latitude": -6.1234,
      "longitude": 107.5678,
      "address": "Jl. Raya Bandung",
      "rating": 4.2
    }
  ]
}
```

#### POST `/api/poi` — Create (Admin)
#### PUT `/api/poi/:id` — Update (Admin)
#### DELETE `/api/poi/:id` — Delete (Admin)

---

### Routes Endpoints

#### GET `/api/routes`

List all routes.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "jakarta-bandung",
      "name": "Jakarta - Bandung",
      "origin": "Jakarta",
      "destination": "Bandung",
      "distanceKm": 150,
      "durationHours": 3.5,
      "polyline": [[-6.1234, 107.5678]],
      "poiIds": ["uuid1", "uuid2"]
    }
  ]
}
```

#### POST `/api/routes` — Create (Admin)
#### PUT `/api/routes/:id` — Update (Admin)
#### DELETE `/api/routes/:id` — Delete (Admin)

---

### Waitlist Endpoints

#### POST `/api/waitlist`

Add email to waitlist. **Auth:** Public

**Request:**
```json
{
  "email": "user@example.com",
  "source": "website"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET `/api/waitlist` — List entries (Admin)
#### GET `/api/waitlist/export` — Export CSV (Admin)

---

### Analytics Endpoints

#### GET `/api/analytics/views` — Page view stats (Admin)
#### GET `/api/analytics/spots` — Spot view stats (Admin)
#### GET `/api/analytics/categories` — Category distribution (Admin)
#### GET `/api/analytics/daily` — Daily page views (Admin)
#### POST `/api/analytics/track` — Track event (Public)

---

### Upload Endpoints

#### POST `/api/upload/presign` — Get presigned URL (Admin)
#### POST `/api/upload/spot` — Upload spot image (Admin)
#### POST `/api/upload/product` — Upload product image (Admin)
#### POST `/api/upload/poi` — Upload POI image (Admin)

---

## Data Models

### Spot
```typescript
interface Spot {
  id: string;
  slug: string;
  name: string;
  category: "alam" | "kuliner" | "budaya" | "foto" | "petualangan" | "sejarah";
  province: string;
  region: "Jawa" | "Sumatera" | "Bali & Nusa Tenggara" | "Sulawesi" | "Kalimantan";
  location: { lat: number; lng: number };
  description: string;
  whySpecial?: string;
  rating?: number;
  imageUrl?: string;
  imageCredit?: string;
  tags?: string[];
  tips?: string;
  bestTime?: string;
  openingHours?: string;
  estimatedTime?: string;
  ticketPrice?: string;
  roadAccess?: string;
  facilities?: string[];
  distanceFromCity?: string;
  popularRoutes?: { from: string; duration: string }[];
  relatedProductIds?: string[];
  isFeatured?: boolean;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

### Product
```typescript
interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description?: string;
  imageUrl?: string;
  images?: string[];
  rating?: number;
  stockQuantity?: number;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### POI
```typescript
interface POI {
  id: string;
  name: string;
  category: "spbu" | "kuliner" | "bengkel" | "spot_foto" | "info_jalan";
  location: { lat: number; lng: number };
  address?: string;
  rating?: number;
  verified?: boolean;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Route
```typescript
interface Route {
  id: string;
  slug: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm?: number;
  durationHours?: number;
  polyline?: { lat: number; lng: number }[];
  poiIds?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Waitlist
```typescript
interface Waitlist {
  id: string;
  email: string;
  source?: string;
  createdAt: string;
}
```

### Analytics
```typescript
interface Analytics {
  id: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  metadata?: object;
  createdAt: string;
}
```

### UserProfile
```typescript
interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: "user" | "super_admin";
  createdAt: string;
  updatedAt: string;
}
```

---

## Appendix

### Constants

```typescript
const SPOT_CATEGORIES = {
  alam: { label: "Alam" },
  kuliner: { label: "Kuliner" },
  budaya: { label: "Budaya" },
  foto: { label: "Spot Foto" },
  petualangan: { label: "Petualangan" },
  sejarah: { label: "Sejarah" },
};

const POI_CATEGORIES = [
  { value: "spbu", label: "SPBU" },
  { value: "kuliner", label: "Kuliner" },
  { value: "bengkel", label: "Bengkel" },
  { value: "spot_foto", label: "Spot Foto" },
  { value: "info_jalan", label: "Info Jalan" },
];

const PRODUCT_CATEGORIES = [
  "Safety & Darurat", "Comfort", "Gadget & Mount",
  "Organizer", "Lifestyle & Merch", "Maintenance", "Bundle Hemat",
];

const REGIONS = ["Jawa", "Sumatera", "Bali & Nusa Tenggara", "Sulawesi", "Kalimantan"];

const VEHICLES = [
  { id: "mobil", label: "Mobil", consumption: 11 },
  { id: "motor", label: "Motor", consumption: 30 },
  { id: "suv", label: "SUV", consumption: 9 },
  { id: "mpv", label: "MPV", consumption: 12 },
];

const FUEL_PRICE = 10000;
```

### Security Best Practices

1. Never expose service_role key to browser
2. Always validate input on server-side
3. Use parameterized queries
4. Enable RLS as defense in depth
5. Log all write operations to audit_logs table
6. Implement rate limiting for all endpoints
7. Use HTTPS in production
8. Rotate API keys periodically
9. Monitor suspicious activity via audit logs
10. Regular security audits

---

**Documentation Version:** 1.0.0
**Last Updated:** 2026-05-27
**Maintained By:** Gaskuy Development Team
