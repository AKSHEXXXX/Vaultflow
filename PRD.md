Cloud Native Multi Tenant Document Workflow SaaS

1. Overview

A multi tenant SaaS platform where companies can:
	•	Register their organization
	•	Add employees
	•	Upload documents
	•	Submit documents for approval
	•	Approve or reject documents
	•	Track document history

System properties:
	•	Tenant isolated
	•	JWT secured
	•	OAuth2 enabled
	•	Redis cached
	•	Rate limited
	•	Dockerized
	•	CI/CD automated
	•	AWS deployable

⸻

2. User Roles

Tenant Admin
	•	Manages tenant profile
	•	Creates and manages users
	•	Can view all documents

Manager
	•	Approves or rejects submitted documents

Employee
	•	Uploads and submits documents

⸻

3. Core Features

Authentication
	•	Tenant registration with admin
	•	Email/password login
	•	Google OAuth2 login
	•	JWT access token
	•	Refresh token
	•	Logout with optional token blacklist

Tenant Management
	•	View tenant profile
	•	Update tenant information

User Management
	•	Create users inside tenant
	•	Assign roles
	•	Delete users

Document Management
	•	Upload file to AWS S3
	•	Store metadata in database
	•	List documents by tenant
	•	Download via pre-signed URL
	•	Delete document

Workflow
	•	Draft
	•	Submitted
	•	Approved
	•	Rejected
	•	Full workflow history tracking

Security
	•	Role based access control
	•	Tenant isolation via tenant_id
	•	Redis based rate limiting

System
	•	Health endpoint
	•	Rate limit status endpoint