# Keycloak + NestJS Backend — Complete Setup Guide

---

## PART 1: KEYCLOAK ADMIN CONSOLE CONFIGURATION

### 1.1 Access Admin Console

1. Start Keycloak (default: `http://localhost:8080`)
2. Go to `http://localhost:8080/admin`
3. Log in with the admin credentials you set during installation

---

### 1.2 Create a New Realm

> A Realm is a space where you manage users, roles, and clients. Never use the `master` realm for your app.

1. Click the dropdown at the top-left (it says **"master"**)
2. Click **"Create realm"**
3. Fill in:
   - **Realm name**: `my-app` (or your project name, lowercase, no spaces)
4. **Enabled**: ON
5. Click **"Create"**

You are now inside the `my-app` realm.

---

### 1.3 Configure Realm Settings

Go to **Realm Settings** in the left sidebar:

#### General Tab

- **Display name**: `My App` (user-facing name)
- **HTML Display name**: (optional, leave blank)
- **Frontend URL**: Leave blank for local dev
- **Require SSL**: Set to `None` for local development (change to `external requests` in production)

#### Login Tab

- **User registration**: ON (if you want users to self-register)
- **Forgot password**: ON
- **Remember me**: ON
- **Email as username**: OFF (or ON depending on preference)
- **Login with email**: ON
- **Verify email**: OFF for dev (ON for production)
- **Edit username**: OFF

#### Email Tab (Optional for dev, required for production)

- Configure SMTP for email verification, password reset, etc.
- Skip for now during development.

#### Tokens Tab

- **Default Signature Algorithm**: `RS256` (default, leave as is)
- **Access Token Lifespan**: `5 minutes` (default, fine for dev)
- **SSO Session Idle**: `30 minutes`
- **SSO Session Max**: `10 hours`
- **Refresh Token**: Enabled by default

Click **Save** after any changes.

---

### 1.4 Create Realm Roles

Go to **Realm roles** in the left sidebar:

1. Click **"Create role"**
2. Create these roles one by one:

| Role Name     | Description          |
| ------------- | -------------------- |
| `app-admin`   | Full admin access    |
| `app-user`    | Standard user access |
| `app-manager` | Manager-level access |

For each:

- Enter **Role name** and **Description**
- Click **Save**

---

### 1.5 Create a Client for NestJS Backend

Go to **Clients** in the left sidebar → Click **"Create client"**

#### Step 1: General Settings

- **Client type**: `OpenID Connect`
- **Client ID**: `nestjs-backend`
- **Name**: `NestJS Backend`
- **Description**: `Backend API client`
- Click **Next**

#### Step 2: Capability Config

- **Client authentication**: **ON** (this makes it a confidential client)
- **Authorization**: **ON** (enables fine-grained authorization)
- **Authentication flow**: Check ONLY:
  - ✅ **Standard flow** (Authorization Code)
  - ✅ **Service accounts roles** (for backend-to-keycloak communication)
  - ✅ **Direct access grants** (for testing with Postman — disable in production)
- Click **Next**

#### Step 3: Login Settings

- **Root URL**: `http://localhost:4000` (your NestJS port)
- **Home URL**: `http://localhost:4000`
- **Valid redirect URIs**: `http://localhost:4000/*`
- **Valid post logout redirect URIs**: `http://localhost:4000/*`
- **Web origins**: `http://localhost:3000` (your NextJS frontend, for CORS)
  - Also add `http://localhost:4000`
  - You can add `+` to allow all origins from redirect URIs
- Click **Save**

#### After Creation — Get the Client Secret

1. Go to the **Credentials** tab of the `nestjs-backend` client
2. Copy the **Client secret** — you'll need this for NestJS
   - Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

### 1.6 Create a Client for NextJS Frontend

Go to **Clients** → **"Create client"**

#### Step 1: General Settings

- **Client type**: `OpenID Connect`
- **Client ID**: `nextjs-frontend`
- **Name**: `NextJS Frontend`
- Click **Next**

#### Step 2: Capability Config

- **Client authentication**: **OFF** (public client — frontend can't keep secrets)
- **Authorization**: OFF
- **Authentication flow**:
  - ✅ **Standard flow**
  - ✅ **Direct access grants** (for testing)
- Click **Next**

#### Step 3: Login Settings

- **Root URL**: `http://localhost:3000`
- **Home URL**: `http://localhost:3000`
- **Valid redirect URIs**: `http://localhost:3000/*`
- **Valid post logout redirect URIs**: `http://localhost:3000/*`
- **Web origins**: `http://localhost:3000`
- Click **Save**

---

### 1.7 Create Client Scopes (Optional but Recommended)

Client Scopes let you control what data is included in tokens.

Go to **Client scopes** → **"Create client scope"**

- **Name**: `app-roles`
- **Description**: `Include app roles in token`
- **Type**: `Default`
- **Protocol**: `OpenID Connect`
- Click **Save**

#### Add a Mapper to Include Roles in JWT:

1. Inside the `app-roles` scope → go to **Mappers** tab
2. Click **"Configure a new mapper"**
3. Select **"User Realm Role"**
4. Configure:
   - **Name**: `realm-roles`
   - **Mapper Type**: `User Realm Role`
   - **Token Claim Name**: `realm_access.roles` (default, usually pre-configured)
   - **Claim JSON Type**: `String`
   - **Add to ID token**: ON
   - **Add to access token**: ON
   - **Add to userinfo**: ON
5. Click **Save**

> **Note**: By default Keycloak already includes `realm_access.roles` in tokens.
> You may also want to add mappers for `email`, `name`, `preferred_username` etc.

#### Assign Client Scope to Your Clients:

1. Go to **Clients** → `nestjs-backend` → **Client scopes** tab
2. Click **"Add client scope"**
3. Select `app-roles` → Add as **Default**
4. Repeat for `nextjs-frontend`

---

### 1.8 Create Users

Go to **Users** in the left sidebar → Click **"Add user"**

#### User 1: Admin User

- **Username**: `admin1`
- **Email**: `admin@example.com`
- **Email verified**: ON
- **First name**: `Admin`
- **Last name**: `User`
- **Enabled**: ON
- Click **Create**

**Set Password:**

1. Go to the **Credentials** tab
2. Click **"Set password"**
3. Enter password: `admin123` (or your choice)
4. **Temporary**: OFF (so you don't have to change it on first login)
5. Click **Save**

**Assign Roles:**

1. Go to the **Role mapping** tab
2. Click **"Assign role"**
3. Select: `app-admin`, `app-user`
4. Click **Assign**

#### User 2: Regular User

- **Username**: `user1`
- **Email**: `user1@example.com`
- **Email verified**: ON
- **First name**: `Regular`
- **Last name**: `User`
- **Enabled**: ON
- **Password**: `user123` (Temporary: OFF)
- **Role**: `app-user` only

---

### 1.9 Verify Keycloak Endpoints

These are the key URLs you'll use. Verify them by opening in browser:

| Endpoint                      | URL                                                                    |
| ----------------------------- | ---------------------------------------------------------------------- |
| **OpenID Config (discovery)** | `http://localhost:8080/realms/my-app/.well-known/openid-configuration` |
| **JWKS (public keys)**        | `http://localhost:8080/realms/my-app/protocol/openid-connect/certs`    |
| **Token endpoint**            | `http://localhost:8080/realms/my-app/protocol/openid-connect/token`    |
| **Authorization endpoint**    | `http://localhost:8080/realms/my-app/protocol/openid-connect/auth`     |
| **Userinfo endpoint**         | `http://localhost:8080/realms/my-app/protocol/openid-connect/userinfo` |
| **Logout endpoint**           | `http://localhost:8080/realms/my-app/protocol/openid-connect/logout`   |

---

### 1.10 Test Token Generation (Postman or cURL)

Test that everything works by getting a token:

```bash
curl -X POST http://localhost:8080/realms/my-app/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=nestjs-backend" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "username=admin1" \
  -d "password=admin123"
```

You should get back a JSON with `access_token`, `refresh_token`, `id_token`.

**Decode the access_token** at [jwt.io](https://jwt.io) and verify:

- `iss` = `http://localhost:8080/realms/my-app`
- `realm_access.roles` contains `app-admin`, `app-user`
- `preferred_username` = `admin1`

---

## PART 2: NESTJS BACKEND SETUP

### 2.1 Install Dependencies

```bash
npm install @nestjs/passport passport passport-jwt jwks-rsa
npm install @nestjs/config
npm install -D @types/passport-jwt
```

---

### 2.2 Environment Variables

Create `.env` in your NestJS project root:

```env
# Keycloak Configuration
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=my-app
KEYCLOAK_CLIENT_ID=nestjs-backend
KEYCLOAK_CLIENT_SECRET=your-client-secret-here

# Derived URLs (used in code)
KEYCLOAK_ISSUER_URL=http://localhost:8080/realms/my-app
KEYCLOAK_JWKS_URI=http://localhost:8080/realms/my-app/protocol/openid-connect/certs
KEYCLOAK_TOKEN_URL=http://localhost:8080/realms/my-app/protocol/openid-connect/token

# App
PORT=4000
```

---

### 2.3 Configure App Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

### 2.4 Create Auth Module

```bash
nest g module auth
nest g service auth
```

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [JwtStrategy, AuthService, RolesGuard],
  exports: [PassportModule, RolesGuard],
})
export class AuthModule {}
```

---

### 2.5 Create JWT Strategy

```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: configService.get<string>('KEYCLOAK_ISSUER_URL'),
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: configService.get<string>('KEYCLOAK_JWKS_URI'),
      }),
    });
  }

  validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.preferred_username,
      name: payload.name,
      roles: payload.realm_access?.roles || [],
      clientRoles:
        payload.resource_access?.[this.configService.get('KEYCLOAK_CLIENT_ID')]
          ?.roles || [],
    };
  }
}
```

---

### 2.6 Create Decorators

#### Roles Decorator

```typescript
// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

#### Public Decorator (skip auth)

```typescript
// src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

#### CurrentUser Decorator

```typescript
// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

---

### 2.7 Create Guards

#### JWT Auth Guard (Global)

```typescript
// src/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(ctx);
  }
}
```

#### Roles Guard

```typescript
// src/auth/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = ctx.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException('No roles found in token');
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Requires one of: [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
```

---

### 2.8 Register Guards Globally

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for NextJS frontend
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Global prefix
  app.setGlobalPrefix('api');

  await app.listen(4000);
  console.log('NestJS running on http://localhost:4000');
}
bootstrap();
```

Register global guards in `AppModule`:

```typescript
// src/app.module.ts (updated)
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ALL routes require JWT by default
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Role checking after JWT validation
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
```

---

### 2.9 Create Test Controllers

```typescript
// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';
import { Roles } from './auth/decorators/roles.decorator';
import { CurrentUser } from './auth/decorators/current-user.decorator';

@Controller()
export class AppController {
  // PUBLIC — no auth needed
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  // PROTECTED — any authenticated user
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return {
      message: 'You are authenticated!',
      user,
    };
  }

  // ROLE-BASED — only app-admin
  @Roles('app-admin')
  @Get('admin/dashboard')
  adminDashboard(@CurrentUser() user: any) {
    return {
      message: 'Welcome Admin!',
      user: user.username,
      roles: user.roles,
    };
  }

  // ROLE-BASED — only app-user
  @Roles('app-user')
  @Get('user/data')
  userData(@CurrentUser('username') username: string) {
    return {
      message: `Hello ${username}, here is your data`,
      data: [],
    };
  }

  // MULTIPLE ROLES — app-admin OR app-manager
  @Roles('app-admin', 'app-manager')
  @Get('manage/users')
  manageUsers() {
    return { message: 'User management panel' };
  }
}
```

---

### 2.10 Auth Service (Optional — for Keycloak Admin API)

```typescript
// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private baseUrl: string;
  private realm: string;
  private clientId: string;
  private clientSecret: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get('KEYCLOAK_BASE_URL');
    this.realm = this.configService.get('KEYCLOAK_REALM');
    this.clientId = this.configService.get('KEYCLOAK_CLIENT_ID');
    this.clientSecret = this.configService.get('KEYCLOAK_CLIENT_SECRET');
  }

  // Get admin token for Keycloak Admin API calls
  async getAdminToken(): Promise<string> {
    const url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });
    const data = await res.json();
    return data.access_token;
  }

  // Validate a token is still active
  async introspectToken(token: string): Promise<any> {
    const url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });
    return res.json();
  }

  // Get user info from Keycloak
  async getUserInfo(accessToken: string): Promise<any> {
    const url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.json();
  }
}
```

---

## PART 3: TESTING THE SETUP

### 3.1 Start Everything

```bash
# Terminal 1 — Keycloak (if not running)
# Start via your Keycloak installation method

# Terminal 2 — NestJS
npm run start:dev
```

### 3.2 Test with cURL or Postman

#### Test 1: Public endpoint (should work without token)

```bash
curl http://localhost:4000/api/health
# ✅ { "status": "ok", "timestamp": "..." }
```

#### Test 2: Protected endpoint without token (should fail)

```bash
curl http://localhost:4000/api/profile
# ❌ 401 Unauthorized
```

#### Test 3: Get a token and access protected endpoint

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:8080/realms/my-app/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=nestjs-backend" \
  -d "client_secret=YOUR_SECRET" \
  -d "username=admin1" \
  -d "password=admin123" | jq -r '.access_token')

# Access protected endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/profile
# ✅ { "message": "You are authenticated!", "user": { ... } }

# Access admin endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/dashboard
# ✅ { "message": "Welcome Admin!" }
```

#### Test 4: Role-based access (regular user → admin endpoint)

```bash
# Get token for regular user
USER_TOKEN=$(curl -s -X POST http://localhost:8080/realms/my-app/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=nestjs-backend" \
  -d "client_secret=YOUR_SECRET" \
  -d "username=user1" \
  -d "password=user123" | jq -r '.access_token')

# Try admin endpoint
curl -H "Authorization: Bearer $USER_TOKEN" http://localhost:4000/api/admin/dashboard
# ❌ 403 Forbidden — "Requires one of: [app-admin]"

# Try user endpoint
curl -H "Authorization: Bearer $USER_TOKEN" http://localhost:4000/api/user/data
# ✅ { "message": "Hello user1, here is your data" }
```

---

## PART 4: PROJECT FILE STRUCTURE

```
src/
├── auth/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
.env
```

---

## QUICK REFERENCE: Keycloak Settings Summary

| Setting              | Value                                  |
| -------------------- | -------------------------------------- |
| Realm                | `my-app`                               |
| Backend Client ID    | `nestjs-backend`                       |
| Backend Client Type  | Confidential                           |
| Frontend Client ID   | `nextjs-frontend`                      |
| Frontend Client Type | Public                                 |
| Roles                | `app-admin`, `app-user`, `app-manager` |
| JWT Algorithm        | RS256                                  |
| Keycloak Port        | 8080                                   |
| NestJS Port          | 4000                                   |
| NextJS Port          | 3000                                   |
