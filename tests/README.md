# 🧪 Comprehensive Testing Suite - Face Recognition App

Dokumentasi lengkap untuk testing suite aplikasi Face Recognition yang mencakup **190+ test cases** dengan berbagai jenis testing.

## 📋 Daftar Isi

- [Overview](#-overview)
- [Struktur Testing](#-struktur-testing)
- [Jenis Testing](#-jenis-testing)
- [Setup dan Instalasi](#-setup-dan-instalasi)
- [Menjalankan Tests](#-menjalankan-tests)
- [Blackbox Testing (190 Test Cases)](#-blackbox-testing-190-test-cases)
- [Reports dan Dokumentasi](#-reports-dan-dokumentasi)
- [CI/CD Integration](#-cicd-integration)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

Testing suite ini dirancang untuk memberikan coverage testing yang komprehensif untuk aplikasi Face Recognition dengan fokus pada:

- **Kualitas Code**: Unit dan Integration testing
- **User Experience**: End-to-End dan Blackbox testing  
- **Keamanan**: Security vulnerability testing
- **Performance**: Load dan stress testing
- **Reliability**: Smoke testing dan error handling

### 📊 Statistik Testing

| Kategori | Jumlah Tests | Coverage |
|----------|-------------|----------|
| **Smoke Tests** | 15+ | Basic functionality |
| **Unit Tests** | 50+ | Component & utilities |
| **Integration Tests** | 40+ | API & database |
| **E2E Tests** | 25+ | Complete user flows |
| **Blackbox Tests** | 190 | Comprehensive scenarios |
| **Security Tests** | 20+ | Vulnerability assessment |
| **Performance Tests** | 15+ | Load & speed testing |
| **TOTAL** | **355+** | **Comprehensive coverage** |

## 📁 Struktur Testing

```
tests/
├── 📂 smoke/              # Smoke tests - basic functionality
├── 📂 unit/               # Unit tests - components & utilities
├── 📂 integration/        # Integration tests - API & database
├── 📂 e2e/               # End-to-end tests - user journeys
├── 📂 blackbox/          # Blackbox tests - 190 comprehensive scenarios
├── 📂 security/          # Security tests - vulnerability assessment
├── 📂 performance/       # Performance tests - load & stress
├── 📂 fixtures/          # Test data & sample files
│   ├── 📂 images/        # Sample face images for testing
│   ├── 📂 data/          # Test user data & fixtures
│   └── 📂 files/         # Various test files (valid/invalid)
├── 📂 utils/             # Test utilities & helpers
├── 📂 scripts/           # Automation scripts
└── 📂 reports/           # Generated test reports
    ├── 📂 html/          # HTML reports with visualizations
    ├── 📂 json/          # JSON data for CI/CD integration
    ├── 📂 csv/           # CSV exports for analysis
    ├── 📂 screenshots/   # Test evidence screenshots
    └── 📂 coverage/      # Code coverage reports
```

## 🔧 Jenis Testing

### 1. 💨 Smoke Tests
**Tujuan**: Memastikan fungsi dasar aplikasi berjalan
- Database connectivity
- API endpoints availability
- Basic page loads
- Authentication flow

### 2. 🧩 Unit Tests  
**Tujuan**: Testing komponen individual
- React component rendering
- Utility functions
- Face detection logic
- Form validations

### 3. 🔗 Integration Tests
**Tujuan**: Testing interaksi antar sistem
- API endpoints dengan database
- Authentication & authorization
- Face registration flow
- File upload handling

### 4. 🎭 End-to-End Tests
**Tujuan**: Testing complete user journeys
- Login → Dashboard flow
- Face registration process
- Face recognition workflow
- Admin management flows

### 5. 📦 Blackbox Tests (190 Test Cases)
**Tujuan**: Testing dari perspektif user tanpa melihat implementation

#### Breakdown 190 Test Cases:
- **Authentication & Authorization**: 25 cases
- **Face Registration Flow**: 30 cases  
- **Face Recognition & Attendance**: 25 cases
- **User Dashboard & Profile**: 20 cases
- **Admin Panel & Management**: 35 cases
- **Error Handling & Edge Cases**: 20 cases
- **Security & Penetration**: 20 cases
- **Performance & Load Testing**: 15 cases

### 6. 🛡️ Security Tests
**Tujuan**: Mengidentifikasi vulnerability
- SQL Injection testing
- XSS prevention
- CSRF protection
- Authentication bypass attempts
- Session security

### 7. ⚡ Performance Tests
**Tujuan**: Mengukur performa aplikasi
- Face recognition speed
- API response times
- Database query performance
- Memory usage monitoring
- Concurrent user load testing

## 🚀 Setup dan Instalasi

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Browser untuk E2E testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Test Environment
```bash
npm run test:setup
```

Script ini akan:
- ✅ Membuat direktori testing structure
- ✅ Generate sample face images untuk testing
- ✅ Setup test data fixtures
- ✅ Configure Jest dan Playwright
- ✅ Install browser dependencies

### 3. Setup Database Testing
```bash
# Setup test database
export DATABASE_URL="postgresql://user:password@localhost:5432/face_recognition_test"

# Run migrations
npm run db:generate
npm run db:push
```

### 4. Install Additional Testing Tools
```bash
# Install Playwright browsers
npx playwright install

# Install Puppeteer (for blackbox testing)
npx puppeteer install
```

## ▶️ Menjalankan Tests

### Quick Start - All Tests
```bash
npm test                  # Run semua jenis testing
npm run test:all         # Sama dengan npm test
```

### Individual Test Categories
```bash
npm run test:smoke       # 💨 Smoke tests (2-3 menit)
npm run test:unit        # 🧩 Unit tests dengan coverage (5-10 menit)
npm run test:integration # 🔗 Integration tests (10-15 menit)
npm run test:e2e         # 🎭 End-to-end tests (15-20 menit)
npm run test:blackbox    # 📦 Blackbox tests (30-40 menit)
npm run test:security    # 🛡️ Security tests (20-30 menit)
npm run test:performance # ⚡ Performance tests (20-25 menit)
```

### Specific Test Files
```bash
# Blackbox testing spesifik
npm run test:blackbox:auth    # Authentication blackbox tests
npm run test:blackbox:face    # Face registration blackbox tests

# Security testing spesifik  
npm run test:security:auth    # Authentication security tests

# Performance testing spesifik
npm run test:performance:face # Face recognition performance tests
```

### E2E Testing Options
```bash
npm run test:e2e          # Headless mode
npm run test:e2e:headed   # Dengan browser UI
npm run test:e2e:debug    # Debug mode dengan pause
npm run test:e2e:report   # Show HTML report
```

### Coverage dan Reports
```bash
npm run test:coverage     # Generate code coverage
npm run test:reports      # Generate semua reports
npm run test:clean        # Clean report directories
```

### Development Testing
```bash
npm run test:watch        # Watch mode untuk development
```

### CI/CD Testing
```bash
npm run test:ci          # Optimized untuk CI/CD environment
```

## 📦 Blackbox Testing (190 Test Cases)

Blackbox testing adalah inti dari testing suite ini dengan **190 comprehensive test cases** yang menguji aplikasi dari perspektif end-user.

### 🎯 Filosofi Blackbox Testing

> **"Testing aplikasi tanpa melihat implementation code, fokus pada input-output dan user experience"**

### 📋 Detailed Test Cases

#### A. Authentication & Authorization (25 Tests)

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| BB-AUTH-001 | Login dengan kredensial valid | User berhasil login dan diarahkan ke dashboard |
| BB-AUTH-002 | Login dengan password salah | Error "Invalid credentials", tetap di halaman login |
| BB-AUTH-003 | Login dengan email tidak terdaftar | Error "User not found", tetap di halaman login |
| BB-AUTH-004 | Login dengan email kosong | Error "Email is required", form validation aktif |
| BB-AUTH-005 | Login dengan password kosong | Error "Password is required", form validation aktif |
| BB-AUTH-006 | Login dengan format email invalid | Error "Invalid email format", form validation aktif |
| BB-AUTH-007 | Multiple failed login attempts | Account lockout atau rate limiting aktif |
| BB-AUTH-008 | Registrasi dengan data valid | User baru terbuat, redirect ke login |
| BB-AUTH-009 | Akses halaman protected tanpa login | Redirect ke halaman login dengan return URL |
| BB-AUTH-010 | Session timeout test | Auto logout setelah inaktif, redirect ke login |
| ... | ... | ... |
| BB-AUTH-025 | Browser auto-complete untuk login | Auto-complete berfungsi dan tidak mengganggu validasi |

#### B. Face Registration Flow (30 Tests)

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| BB-FACE-026 | Upload foto wajah dengan format JPG | Foto berhasil diupload, preview muncul, tombol register aktif |
| BB-FACE-027 | Upload foto dengan format tidak didukung | Error "Format not supported", upload gagal |
| BB-FACE-028 | Upload foto berukuran besar >10MB | Error "File too large", upload gagal dengan pesan jelas |
| BB-FACE-029 | Upload foto tanpa wajah (landscape) | Error "No face detected", foto ditolak |
| BB-FACE-030 | Upload foto dengan multiple wajah | Error "Multiple faces detected" atau pilihan wajah mana |
| BB-FACE-031 | Capture foto dari kamera | Foto berhasil diambil, preview muncul, kualitas cukup |
| BB-FACE-032 | Drag & drop foto ke upload area | Foto berhasil diupload melalui drag & drop |
| BB-FACE-033 | Progress indicator saat upload | Progress bar muncul dan akurat selama upload |
| BB-FACE-034 | Cancel registration di tengah proses | Proses terhenti, data temporary terhapus |
| BB-FACE-035 | Network error saat upload | Error handling yang baik, retry option tersedia |
| ... | ... | ... |
| BB-FACE-055 | Registration dengan koneksi lambat | Loading indicator aktif, timeout handling yang baik |

#### C. Face Recognition & Attendance (25 Tests)
- Recognition wajah terdaftar vs tidak terdaftar
- Variation pose, lighting, accessories
- Double attendance prevention
- Confidence threshold testing
- Export attendance data

#### D. User Dashboard & Profile (20 Tests)  
- Personal dashboard functionality
- Profile updates dan validations
- Password change flows
- Notification systems

#### E. Admin Panel & Management (35 Tests)
- User management (CRUD operations)
- Bulk operations
- System statistics
- Audit logs dan reporting

#### F. Error Handling & Edge Cases (20 Tests)
- Network failures
- Server errors  
- Browser compatibility
- Accessibility compliance

#### G. Security & Penetration (20 Tests)
- SQL injection attempts
- XSS prevention
- CSRF protection
- Session hijacking tests

#### H. Performance & Load Testing (15 Tests)
- Response time measurements
- Concurrent user load
- Memory usage monitoring
- Database query performance

### 🔍 Blackbox Test Execution

Setiap blackbox test menghasilkan:

1. **🖼️ Screenshots**: Visual evidence setiap step
2. **⏱️ Performance Metrics**: Response times dan resource usage
3. **📊 Pass/Fail Status**: Clear success/failure indication
4. **📝 Detailed Logs**: Step-by-step execution details
5. **🐛 Error Analysis**: Root cause untuk failures

### 📊 Blackbox Test Reports

Reports yang dihasilkan:

- **HTML Report**: Interactive dashboard dengan filters dan visualizations
- **JSON Data**: Machine-readable untuk CI/CD integration  
- **CSV Export**: Data analysis dan spreadsheet compatibility
- **Screenshots Gallery**: Visual evidence untuk setiap test

## 📈 Reports dan Dokumentasi

### Generated Reports

Setelah menjalankan tests, berbagai report akan di-generate:

#### 1. 📊 HTML Reports (Interactive)
- **Location**: `tests/reports/html/`
- **Features**:
  - Interactive dashboard dengan charts
  - Filter berdasarkan kategori test
  - Screenshot gallery
  - Performance metrics visualization
  - Pass/fail trends

#### 2. 📋 JSON Reports (CI/CD Integration)
- **Location**: `tests/reports/json/`
- **Usage**: Untuk integration dengan CI/CD pipeline
- **Contents**: Test results, metrics, timestamps

#### 3. 📄 CSV Reports (Data Analysis)
- **Location**: `tests/reports/csv/`
- **Usage**: Import ke spreadsheet untuk analysis
- **Contents**: Tabular test results dengan all metrics

#### 4. 📸 Screenshots & Evidence
- **Location**: `tests/reports/screenshots/`
- **Contents**: Visual evidence setiap test step

#### 5. 🎯 Coverage Reports
- **Location**: `tests/reports/coverage/`
- **Features**: Code coverage dengan detailed breakdowns

### Viewing Reports

```bash
# Generate dan open HTML report
npm run test:reports

# Open specific reports
open tests/reports/html/comprehensive-report-latest.html
open tests/reports/html/playwright-report/index.html
open tests/reports/coverage/index.html
```

### Sample HTML Report Features

- 🎯 **Executive Summary**: High-level metrics dan pass rates
- 📊 **Category Breakdown**: Results per test category
- 📈 **Performance Metrics**: Response times dan resource usage
- 🔍 **Detailed Test Results**: Searchable dan filterable
- 📸 **Visual Evidence**: Screenshots dari test execution
- 📱 **Mobile Responsive**: Viewable di semua devices

## 🚀 CI/CD Integration

### GitHub Actions Workflow

Testing suite terintegrasi dengan GitHub Actions untuk automated testing:

#### 🔧 Workflow Features:
- **Multi-matrix testing**: Different Node.js versions, browsers
- **Parallel execution**: Tests run concurrently untuk speed
- **Comprehensive reporting**: Automated report generation
- **PR integration**: Results commented pada Pull Requests
- **Artifact storage**: Test results stored untuk review
- **Scheduled testing**: Nightly comprehensive test runs

#### 📋 Workflow Jobs:
1. **Setup & Environment Check**
2. **Smoke Tests** (💨)
3. **Unit Tests** (🧩) - Multi Node.js versions
4. **Integration Tests** (🔗) - dengan database
5. **E2E Tests** (🎭) - Multi browser support
6. **Blackbox Tests** (📦) - 190 comprehensive scenarios  
7. **Security Tests** (🛡️) - Vulnerability assessment
8. **Performance Tests** (⚡) - Load & speed testing
9. **Report Generation** (📊) - Consolidated reporting

#### 🎯 Trigger Conditions:
- Push ke main/develop branches
- Pull request creation/updates
- Scheduled nightly runs
- Manual workflow dispatch

### Running in CI Environment

```bash
# CI-optimized test run
npm run test:ci

# Environment variables untuk CI
export HEADLESS=true
export TEST_BASE_URL=http://localhost:3000
export DATABASE_URL=postgresql://user:pass@localhost:5432/test_db
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database connection
npm run db:generate
npm run db:push

# Reset test database
dropdb face_recognition_test
createdb face_recognition_test
npm run db:push
```

#### 2. Browser/Playwright Issues
```bash
# Reinstall browsers
npx playwright install --force

# Check browser availability
npx playwright list
```

#### 3. Memory Issues (Performance Tests)
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Run with garbage collection
node --expose-gc ./node_modules/.bin/jest tests/performance
```

#### 4. Port Conflicts (E2E Tests)
```bash
# Check port usage
lsof -i :3000

# Kill existing processes
pkill -f "next"
```

#### 5. Blackbox Test Timeouts
```bash
# Increase timeout untuk specific tests
npm run test:blackbox -- --testTimeout=60000

# Run individual blackbox categories
npm run test:blackbox:auth
npm run test:blackbox:face
```

### Debug Options

#### 1. Visual Debugging (E2E/Blackbox)
```bash
# Run dengan browser visible
HEADLESS=false npm run test:e2e

# Debug mode dengan pause
npm run test:e2e:debug
```

#### 2. Verbose Logging
```bash
# Enable detailed logging
DEBUG=* npm run test:blackbox

# Jest verbose mode
npm run test:unit -- --verbose
```

#### 3. Test Isolation
```bash
# Run specific test file
npm test -- tests/blackbox/auth-blackbox.test.ts

# Run specific test case
npm test -- tests/blackbox/auth-blackbox.test.ts -t "BB-AUTH-001"
```

### Performance Optimization

#### 1. Parallel Test Execution
```bash
# Run tests parallel (Jest)
npm test -- --maxWorkers=4

# Playwright parallel execution  
npm run test:e2e -- --workers=2
```

#### 2. Test Filtering
```bash
# Run only failed tests
npm test -- --onlyFailures

# Run tests yang changed
npm test -- --changedSince=main
```

### Getting Help

#### 1. Check Logs
- Test execution logs: `tests/reports/`
- CI/CD logs: GitHub Actions interface
- Application logs: Console output

#### 2. Review Test Reports
- HTML reports untuk visual debugging
- JSON reports untuk detailed data
- Screenshots untuk visual evidence

#### 3. Documentation References
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

---

## 🎉 Kesimpulan

Testing suite ini menyediakan **comprehensive coverage** untuk aplikasi Face Recognition dengan:

- ✅ **355+ Test Cases** across semua categories
- ✅ **190 Detailed Blackbox Scenarios** 
- ✅ **Automated CI/CD Integration**
- ✅ **Rich Reporting & Documentation**
- ✅ **Security & Performance Testing**
- ✅ **Visual Evidence & Screenshots**

### 🚀 Next Steps

1. **Run Initial Tests**: `npm run test:setup && npm run test:smoke`
2. **Review Reports**: Check `tests/reports/html/` untuk results
3. **Customize Tests**: Modify test cases sesuai kebutuhan spesifik
4. **CI/CD Setup**: Configure GitHub Actions untuk automated testing
5. **Monitor & Maintain**: Regular review dan update test cases

---

**📞 Support & Feedback**

Untuk pertanyaan, issues, atau feedback, silakan:
- Create GitHub Issue
- Review dokumentasi di `tests/README.md`
- Check troubleshooting guide di atas

**🎯 Happy Testing!** 🧪