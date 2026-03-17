# 👥 BLIH System - Team Member Quick Start

## Welcome!

You're joining a team that uses a **shared VPS database** for development. This means you'll run code on your laptop, but connect to databases on our VPS server.

## ⚡ 5-Minute Setup

### 1. Get VPS Connection Info

Ask your team lead for:

- VPS hostname or IP address (example: `192.168.1.100` or `dev.blih.com`)
- Confirm you have network access to the VPS

### 2. Clone Repository

```bash
git clone <repository-url>
cd blih-system-backend
npm install
```

### 3. Configure Environment

```bash
# Copy the team template
cp .env.team.template .env

# Edit .env and replace <VPS_HOST> with actual VPS IP/hostname
nano .env
# or
code .env
```

**Find and replace** all instances of `<VPS_HOST>` with your actual VPS hostname/IP.

Example:

```env
# Before
DATABASE_URL=postgresql://blih_dev_user:blih_dev_pass_2024@<VPS_HOST>:5432/blih-system-dev

# After (if VPS IP is 192.168.1.100)
DATABASE_URL=postgresql://blih_dev_user:blih_dev_pass_2024@192.168.1.100:5432/blih-system-dev
```

### 4. Test Connection

```bash
# Test if you can reach the VPS database
# Replace <VPS_HOST> with your VPS IP
psql -h <VPS_HOST> -p 5432 -U blih_dev_user -d blih-system-dev
# Password when prompted: blih_dev_pass_2024

# If psql is not installed, test with telnet:
telnet <VPS_HOST> 5432
```

### 5. Generate Prisma Client

```bash
npm run prisma:generate
```

### 6. Start Development Server

```bash
npm run start:dev
```

Your application will start on `http://localhost:5000` and connect to the VPS database!

### 7. Verify Setup

Open in browser:

- Your API: http://localhost:5000/api/v1/docs (Swagger)
- Keycloak: http://\<VPS_HOST\>:8080 (Admin console)
- MailHog: http://\<VPS_HOST\>:8025 (Email testing)

## 🎯 Connection Details

Replace `<VPS_HOST>` with your actual VPS hostname/IP.

### Database (blih-system-dev)

```
Host: <VPS_HOST>
Port: 5432
Database: blih-system-dev
Username: blih_dev_user
Password: blih_dev_pass_2024
```

### Keycloak Admin

```
URL: http://<VPS_HOST>:8080
Username: admin
Password: admin
```

### MailHog

```
URL: http://<VPS_HOST>:8025
```

## 📝 Daily Workflow

### Starting Work

```bash
# Get latest code
cd blih-system-backend
git pull

# Start your dev server (connects to VPS)
npm run start:dev

# Your app runs at http://localhost:5000
```

### Making Changes

```bash
# Make your code changes
# Test locally (using shared VPS database)

# Commit and push
git add .
git commit -m "feat: your feature"
git push
```

### Before Running Migrations

⚠️ **IMPORTANT**: Always coordinate with team before running migrations!

```bash
# Announce in team chat
# "Running migration: [description] - please save work"

# Wait for team to acknowledge
# Then run:
npm run prisma:migrate:dev

# Commit migration files
git add ../../packages/database/migrations/
git commit -m "feat: migration for [feature]"
git push

# Announce completion
# "Migration complete - please run: git pull && npm run prisma:generate"
```

## 🛠️ Useful Commands

```bash
# Generate Prisma client after migrations
npm run prisma:generate

# View database with Prisma Studio
npx prisma studio --schema ../../packages/database/schema

# Connect to database with psql
psql -h <VPS_HOST> -p 5432 -U blih_dev_user -d blih-system-dev
```

## 🐛 Troubleshooting

### Cannot Connect to VPS

```bash
# Test connectivity
ping <VPS_HOST>
telnet <VPS_HOST> 5432

# If fails:
# 1. Check VPN connection (if using VPN)
# 2. Ask admin to whitelist your IP
# 3. Verify VPS services are running
```

### Database Authentication Failed

- Double-check username/password in `.env`
- Verify you replaced `<VPS_HOST>` correctly
- Ask team lead if passwords were changed

### Application Won't Start

```bash
# Check .env file is configured
cat .env | grep VPS_HOST
# Should NOT contain <VPS_HOST> - it should be replaced

# Regenerate Prisma client
npm run prisma:generate

# Check for errors in logs
npm run start:dev
```

### Migration Conflicts

```bash
# Pull latest code
git pull

# Reset your local Prisma client
npm run prisma:generate

# Restart dev server
npm run start:dev
```

## 📞 Getting Help

### Common Issues

| Problem               | Solution                               |
| --------------------- | -------------------------------------- |
| Can't connect to VPS  | Check network, VPN, firewall           |
| Wrong password        | Verify .env file, ask team lead        |
| Migration conflicts   | Pull latest, regenerate Prisma client  |
| Port already in use   | Change PORT in .env to different value |
| Slow database queries | Report to admin, check VPS resources   |

### Contact

- **VPS/Database Issues**: Contact VPS Administrator
- **Code Issues**: Create GitHub issue
- **General Questions**: Ask in team chat

## ✅ Setup Checklist

- [ ] Repository cloned
- [ ] `npm install` completed
- [ ] `.env` file created from template
- [ ] All `<VPS_HOST>` replaced with actual VPS IP/hostname
- [ ] Can ping VPS successfully
- [ ] Can connect to database with psql
- [ ] Prisma client generated
- [ ] Dev server starts successfully
- [ ] Can access Swagger at http://localhost:5000/api/v1/docs
- [ ] Can access Keycloak admin console at http://\<VPS_HOST\>:8080

## 🎓 Additional Resources

- **Main README**: `README.md`
- **Main README**: `README.md`

## 🎉 You're Ready!

You're now connected to the shared development environment. Happy coding! 🚀

### Quick Reference Card (Bookmark This)

```bash
# Daily commands
git pull                    # Get latest code
npm run start:dev          # Start dev server
npm run prisma:generate    # After migrations

# Useful commands
npm run test               # Run tests
npm run lint              # Check code style
git status                # Check your changes

# Database access
psql -h <VPS_HOST> -p 5432 -U blih_dev_user -d blih-system-dev
```

**Questions?** Ask in the team chat or read the main `README.md`.
