# 🧪 Testing CI/CD Locally - Complete Guide

## Method 1: GitHub Actions with `act` ⭐ (Recommended)

### Install act (already done)
```bash
curl -sSL https://raw.githubusercontent.com/nektos/act/master/install.sh | bash
mkdir -p ~/.local/bin && mv ./bin/act ~/.local/bin/act
export PATH=$PATH:~/.local/bin
```

### Test Basic CI Workflow
```bash
# Test the basic CI pipeline
~/.local/bin/act -W .github/workflows/basic-ci.yml

# Test specific job
~/.local/bin/act -j basic-checks

# Test with specific event (push to main)
~/.local/bin/act push -e .github/workflows/events/push.json
```

### Test Comprehensive Testing Workflow
```bash
# Test comprehensive pipeline (may take longer)
~/.local/bin/act -W .github/workflows/comprehensive-testing.yml

# Test specific jobs
~/.local/bin/act -j setup
~/.local/bin/act -j smoke-tests
~/.local/bin/act -j unit-tests
```

### Common act Options
```bash
# Run with specific platform
~/.local/bin/act -P ubuntu-latest=nektos/act-environments-ubuntu:18.04

# Run with secrets
~/.local/bin/act --secret-file .secrets

# Verbose output
~/.local/bin/act -v

# Dry run (just show what would run)
~/.local/bin/act --dryrun
```

---

## Method 2: Manual CI Simulation 🔧

### Simulate the Basic CI Steps
```bash
# 1. Code Quality Checks
echo "🔍 Running code quality checks..."
npm run lint || echo "⚠️ Linting issues found"
npm run type-check || echo "⚠️ Type checking issues found"

# 2. Build Test
echo "🏗️ Testing build process..."
npm run build

# 3. Test Suite
echo "🧪 Running test suite..."
npm run test:setup
npm run test:smoke
npm run test:unit  
npm run test:integration

# 4. Deployment Readiness
echo "🚀 Checking deployment readiness..."
test -f package.json && echo "✅ package.json exists"
test -f next.config.ts && echo "✅ next.config.ts exists"
test -d .next && echo "✅ Build output exists"

echo "🎉 Local CI simulation complete!"
```

### Advanced Test Simulation
```bash
# Simulate different environments
NODE_ENV=production npm run build
NODE_ENV=test npm run test:smoke

# Test with clean install (like CI)
rm -rf node_modules package-lock.json
npm ci
npm run build
```

---

## Method 3: Docker-based Testing 🐳

### Create CI Test Container
```dockerfile
# Dockerfile.ci-test
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm run test:setup
RUN npm run test:smoke

CMD ["npm", "start"]
```

### Run CI Tests in Docker
```bash
# Build test image
docker build -f Dockerfile.ci-test -t face-recognition-ci-test .

# Run CI tests
docker run --rm face-recognition-ci-test

# Interactive testing
docker run -it --rm -v $(pwd):/app face-recognition-ci-test sh
```

---

## Method 4: Pre-commit Hooks (Continuous Testing) 🪝

### Install pre-commit
```bash
npm install --save-dev husky lint-staged

# Setup husky
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

### Configure lint-staged (package.json)
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "npm run lint --fix",
      "npm run type-check"
    ],
    "*.{ts,tsx}": [
      "npm run test:unit -- --passWithNoTests"
    ]
  }
}
```

---

## Method 5: GitHub Actions Alternative Testing 🔄

### Test with Local Scripts
Create `scripts/ci-test.js`:
```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');

const steps = [
  { name: 'Install Dependencies', cmd: 'npm ci' },
  { name: 'Lint Code', cmd: 'npm run lint', continueOnError: true },
  { name: 'Type Check', cmd: 'npm run type-check', continueOnError: true },
  { name: 'Build Project', cmd: 'npm run build' },
  { name: 'Setup Tests', cmd: 'npm run test:setup' },
  { name: 'Run Smoke Tests', cmd: 'npm run test:smoke' },
  { name: 'Run Unit Tests', cmd: 'npm run test:unit' },
  { name: 'Run Integration Tests', cmd: 'npm run test:integration' }
];

steps.forEach((step, index) => {
  console.log(`\n🔄 Step ${index + 1}: ${step.name}`);
  try {
    execSync(step.cmd, { stdio: 'inherit' });
    console.log(`✅ ${step.name} - PASSED`);
  } catch (error) {
    if (step.continueOnError) {
      console.log(`⚠️ ${step.name} - FAILED (continuing...)`);
    } else {
      console.log(`❌ ${step.name} - FAILED`);
      process.exit(1);
    }
  }
});

console.log('\n🎉 All CI steps completed!');
```

### Run Local CI Script
```bash
node scripts/ci-test.js
```

---

## Method 6: Branch-based Testing 🌿

### Create Test Branch
```bash
# Create test branch
git checkout -b test-ci-pipeline

# Make minor change
echo "# CI Test" >> README.md
git add README.md
git commit -m "test: CI pipeline validation"

# Push to test branch (triggers CI)
git push origin test-ci-pipeline

# Delete test branch after verification
git branch -D test-ci-pipeline
git push origin --delete test-ci-pipeline
```

---

## 🎯 Quick Testing Commands

### Basic Validation (30 seconds)
```bash
npm run build && npm run test:smoke
```

### Full Local CI (5 minutes)
```bash
~/.local/bin/act -j basic-checks
```

### Production Simulation
```bash
NODE_ENV=production npm run build && npm start &
sleep 5 && curl http://localhost:3000 && pkill -f "npm start"
```

### Memory & Performance Check
```bash
npm run test:performance || echo "Performance tests may fail, that's OK for now"
```

---

## 🔍 Debugging Failed CI

### Common Issues & Solutions
```bash
# Node modules issues
rm -rf node_modules package-lock.json && npm ci

# TypeScript issues
npm run type-check | grep "error TS"

# Build issues
npm run build 2>&1 | grep -i error

# Test issues
npm run test:smoke -- --verbose
```

### Environment Debugging
```bash
# Check environment
node -v
npm -v
echo $NODE_ENV

# Check dependencies
npm ls --depth=0
npm audit
```

---

## 📊 Expected Results

### ✅ What Should Pass
- Code linting (with warnings OK)
- TypeScript compilation (with warnings OK)  
- Build process
- Smoke tests
- Unit tests
- Integration tests

### ⚠️ What Might Fail (but won't break CI)
- Complex browser-based tests
- Performance tests
- Security tests requiring Chrome
- E2E tests

### ❌ What Would Break CI
- Build failures
- Critical TypeScript errors
- Basic test suite failures
- Missing essential files