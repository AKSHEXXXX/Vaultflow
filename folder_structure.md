saas-platform/
│
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── demoapplication/
│   │   │   │           └── saas/
│   │   │   │
│   │   │   │               ├── SaaSApplication.java
│   │   │   │
│   │   │   │               ├── config/
│   │   │   │               │   ├── SecurityConfig.java
│   │   │   │               │   ├── RedisConfig.java
│   │   │   │               │   ├── S3Config.java
│   │   │   │               │   ├── CorsConfig.java
│   │   │   │               │   └── SwaggerConfig.java
│   │   │   │
│   │   │   │               ├── security/
│   │   │   │               │   ├── JwtTokenProvider.java
│   │   │   │               │   ├── JwtAuthenticationFilter.java
│   │   │   │               │   ├── OAuth2SuccessHandler.java
│   │   │   │               │   ├── CustomUserDetailsService.java
│   │   │   │               │   └── CustomUserPrincipal.java
│   │   │   │
│   │   │   │               ├── auth/
│   │   │   │               │   ├── controller/
│   │   │   │               │   ├── service/
│   │   │   │               │   └── dto/
│   │   │   │
│   │   │   │               ├── tenant/
│   │   │   │               │   ├── controller/
│   │   │   │               │   ├── service/
│   │   │   │               │   ├── repository/
│   │   │   │               │   ├── entity/
│   │   │   │               │   └── dto/
│   │   │   │
│   │   │   │               ├── user/
│   │   │   │               │   ├── controller/
│   │   │   │               │   ├── service/
│   │   │   │               │   ├── repository/
│   │   │   │               │   ├── entity/
│   │   │   │               │   └── dto/
│   │   │   │
│   │   │   │               ├── document/
│   │   │   │               │   ├── controller/
│   │   │   │               │   ├── service/
│   │   │   │               │   ├── repository/
│   │   │   │               │   ├── entity/
│   │   │   │               │   └── dto/
│   │   │   │
│   │   │   │               ├── workflow/
│   │   │   │               │   ├── service/
│   │   │   │               │   ├── repository/
│   │   │   │               │   └── entity/
│   │   │   │
│   │   │   │               ├── audit/
│   │   │   │               │   ├── service/
│   │   │   │               │   ├── repository/
│   │   │   │               │   └── entity/
│   │   │   │
│   │   │   │               ├── ratelimit/
│   │   │   │               │   ├── filter/
│   │   │   │               │   └── service/
│   │   │   │
│   │   │   │               └── common/
│   │   │   │                   ├── BaseEntity.java
│   │   │   │                   ├── ApiResponse.java
│   │   │   │                   ├── GlobalExceptionHandler.java
│   │   │   │                   ├── ErrorResponse.java
│   │   │   │                   └── TenantContextHolder.java
│   │   │
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       ├── application-prod.yml
│   │   │       └── db/
│   │   │           └── migration/
│   │   │
│   │   └── test/
│   │       └── java/
│
├── nginx/
│   └── nginx.conf
│
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md