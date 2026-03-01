Backend Requirements For External Frontend Team

Your backend must expose clear, documented, stable APIs.

The frontend team will need:
	1.	Base API URL
	2.	Auth flow details
	3.	Exact request and response formats
	4.	Error response structure
	5.	Role and permission behavior
	6.	Rate limit behavior

No guessing allowed.

⸻

1. Base URL

Example

Production
https://api.yourdomain.com/api/v1

All endpoints versioned.

⸻

2. Authentication Contract

Login

POST /api/v1/auth/login

Request
{
“email”: “user@example.com”,
“password”: “string”
}

Response
{
“accessToken”: “jwt”,
“refreshToken”: “token”,
“role”: “ADMIN”,
“tenantId”: “uuid”
}

Frontend must:

• Store access token securely
• Attach Authorization header

Header format
Authorization: Bearer 

⸻

OAuth Login

Frontend redirects user to:

GET /oauth2/authorization/google

After success:

Backend returns JWT via redirect.

Frontend must extract token from redirect URL or cookie.

⸻

Refresh Token

POST /api/v1/auth/refresh

Request
{
“refreshToken”: “token”
}

Response
{
“accessToken”: “newJwt”
}

⸻

3. Global API Response Format

All success responses:

{
“success”: true,
“data”: {},
“timestamp”: “ISO_DATE”
}

All error responses:

{
“success”: false,
“error”: “ERROR_CODE”,
“message”: “Readable message”,
“timestamp”: “ISO_DATE”
}

Frontend must handle:

401 Unauthorized
403 Forbidden
429 Too Many Requests

⸻

4. Document APIs Contract

POST /api/v1/documents

Request
Multipart file
title string

Response
{
“id”: “uuid”,
“title”: “string”,
“status”: “DRAFT”
}

⸻

GET /api/v1/documents

Response
{
“documents”: [
{
“id”: “uuid”,
“title”: “string”,
“status”: “SUBMITTED”,
“createdAt”: “timestamp”
}
]
}

⸻

GET /api/v1/documents/{id}

Response
{
“id”: “uuid”,
“title”: “string”,
“status”: “APPROVED”,
“uploadedBy”: “uuid”,
“createdAt”: “timestamp”
}

⸻

GET /api/v1/documents/{id}/download

Response
{
“downloadUrl”: “preSignedS3Url”
}

Frontend must redirect browser to downloadUrl.

⸻

5. Workflow Endpoints

POST /api/v1/documents/{id}/submit
POST /api/v1/documents/{id}/approve
POST /api/v1/documents/{id}/reject

Response
{
“status”: “APPROVED”
}

Frontend must update UI based on status.

⸻

6. User Management

GET /api/v1/users

Response
[
{
“id”: “uuid”,
“email”: “string”,
“role”: “MANAGER”
}
]

Frontend must hide admin features for non admin roles.

⸻

7. Role Based Behavior

Backend enforces permissions.

Frontend should:

• Show approve button only if role is MANAGER
• Show user management only if ADMIN

But backend remains final authority.

⸻

8. Rate Limiting Behavior

If limit exceeded:

HTTP 429

Response
{
“success”: false,
“error”: “RATE_LIMIT_EXCEEDED”,
“message”: “Too many requests”,
“retryAfterSeconds”: 60
}

Frontend should:

• Show user friendly message
• Disable repeated retries

⸻

9. CORS Configuration

Backend must allow:

• Frontend domain
• Authorization header
• Credentials if using cookies

Example

Allowed origins:
https://app.yourdomain.com

⸻

10. OpenAPI Documentation

You must expose:

/swagger-ui.html
/api-docs

Frontend team must be able to test endpoints directly.

⸻

11. Environment Variables Frontend Needs

They must know:

API_BASE_URL
OAUTH_REDIRECT_URL

⸻

12. Versioning Policy

All APIs under:

/api/v1

Future changes must not break contract.
