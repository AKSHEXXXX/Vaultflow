Database Schema

tenants
	•	id UUID PK
	•	name VARCHAR
	•	created_at TIMESTAMP
	•	updated_at TIMESTAMP

⸻

users
	•	id UUID PK
	•	tenant_id UUID FK
	•	email VARCHAR UNIQUE
	•	password_hash VARCHAR
	•	role VARCHAR
	•	created_at TIMESTAMP
	•	updated_at TIMESTAMP

⸻

documents
	•	id UUID PK
	•	tenant_id UUID FK
	•	uploaded_by UUID FK
	•	title VARCHAR
	•	s3_key VARCHAR
	•	status VARCHAR
	•	created_at TIMESTAMP
	•	updated_at TIMESTAMP

⸻

workflow_history
	•	id UUID PK
	•	document_id UUID FK
	•	tenant_id UUID FK
	•	action VARCHAR
	•	performed_by UUID FK
	•	timestamp TIMESTAMP

⸻

refresh_tokens
	•	id UUID PK
	•	user_id UUID FK
	•	token VARCHAR
	•	expiry TIMESTAMP

⸻

API Endpoints

Auth
	•	POST /api/auth/register
	•	POST /api/auth/login
	•	POST /api/auth/refresh
	•	POST /api/auth/logout
	•	GET /oauth2/authorization/google
	•	GET /api/auth/oauth-success

Tenant
	•	GET /api/tenants/me
	•	PUT /api/tenants/me

Users
	•	POST /api/users
	•	GET /api/users
	•	GET /api/users/{id}
	•	PUT /api/users/{id}
	•	DELETE /api/users/{id}

Documents
	•	POST /api/documents
	•	GET /api/documents
	•	GET /api/documents/{id}
	•	GET /api/documents/{id}/download
	•	PUT /api/documents/{id}
	•	DELETE /api/documents/{id}

Workflow
	•	POST /api/documents/{id}/submit
	•	POST /api/documents/{id}/approve
	•	POST /api/documents/{id}/reject

System
	•	GET /api/system/rate-limit-status
	•	GET /api/health