# 🧪 FUNCTION-BASED BLACKBOX TESTING GUIDE

## 📚 Pengertian Blackbox Testing yang Benar

> **Blackbox Testing** adalah metode pengujian perangkat lunak yang berfokus pada **fungsionalitas sistem dari sudut pandang pengguna** tanpa mengetahui struktur internal atau kode sumbernya, dengan tujuan memvalidasi apakah perangkat lunak menghasilkan **output yang sesuai dengan input yang diberikan**.

### 🎯 **Prinsip Dasar:**
- **Input → Process → Output** testing
- **User perspective** testing
- **Functionality validation** tanpa melihat kode internal
- **Requirements-based** testing

### ❌ **Bukan Blackbox Testing:**
- Testing implementasi teknis (puppeteer, browser automation)
- Testing struktur kode internal
- Testing yang melihat detail implementasi
- Complex technical testing scenarios

### ✅ **Yang Benar untuk Blackbox Testing:**
- Testing function behavior dari user perspective
- Input validation testing
- Output verification testing
- Functional requirements validation

---

## 🏗️ **STRUKTUR BLACKBOX TESTING YANG DIIMPLEMENTASIKAN**

### 📋 **Function Categories (4 Halaman Utama):**

#### 1. **🔐 LOGIN FUNCTIONS (10 Test Cases)**
Testing fungsionalitas halaman login dari perspektif user:

| ID | Function | Input | Expected Output | Focus |
|----|----------|-------|----------------|-------|
| LOGIN-01 | Login Function | Valid email & password | Success + redirect | Core login functionality |
| LOGIN-02 | Login Function | Invalid password | Error message | Login validation |
| LOGIN-03 | Login Function | Non-existent email | User not found error | Email validation |
| LOGIN-04 | Email Validation | Invalid email format | Format error | Input validation |
| LOGIN-05 | Required Fields | Empty email | Required field error | Form validation |
| LOGIN-06 | Required Fields | Empty password | Required field error | Form validation |
| LOGIN-07 | Rate Limiting | Multiple failed attempts | Account lockout | Security function |
| LOGIN-08 | Session Creation | Successful login | Session created | Authentication function |
| LOGIN-09 | Auth Check | Valid session | User authenticated | Session validation |
| LOGIN-10 | Logout Function | Logout action | Session cleared | Logout functionality |

#### 2. **📝 REGISTRATION FUNCTIONS (10 Test Cases)**
Testing fungsionalitas halaman registrasi dari perspektif user:

| ID | Function | Input | Expected Output | Focus |
|----|----------|-------|----------------|-------|
| REG-01 | Registration Function | Valid user data | User created | Core registration |
| REG-02 | Duplicate Validation | Existing email | Email exists error | Duplicate prevention |
| REG-03 | Password Validation | Weak password | Password requirements error | Password policy |
| REG-04 | Email Validation | Invalid email format | Format error | Email validation |
| REG-05 | Required Fields | Empty name | Name required error | Form validation |
| REG-06 | Required Fields | Empty email | Email required error | Form validation |
| REG-07 | Required Fields | Empty password | Password required error | Form validation |
| REG-08 | Name Validation | Special characters | Validation/sanitization | Input sanitization |
| REG-09 | Password Complexity | No uppercase | Complexity error | Password policy |
| REG-10 | Complete Flow | Full registration | User can login | End-to-end function |

#### 3. **📷 FACE REGISTRATION FUNCTIONS (10 Test Cases)**
Testing fungsionalitas face registration dari perspektif user:

| ID | Function | Input | Expected Output | Focus |
|----|----------|-------|----------------|-------|
| FACE-REG-01 | Image Upload | Valid JPG image | Upload success + preview | Upload function |
| FACE-REG-02 | Format Validation | PDF file | Invalid format error | File validation |
| FACE-REG-03 | Size Validation | Large file >10MB | File too large error | Size validation |
| FACE-REG-04 | Face Detection | Valid face image | Face detected | Detection function |
| FACE-REG-05 | Face Detection | No face image | No face detected error | Detection validation |
| FACE-REG-06 | Multiple Detection | Multiple faces | Multiple faces error | Face count validation |
| FACE-REG-07 | Registration | Complete face reg | Registration success | Core registration |
| FACE-REG-08 | Duplicate Prevention | Already registered | Duplicate error | Duplicate prevention |
| FACE-REG-09 | Quality Check | Low quality image | Quality too low error | Quality validation |
| FACE-REG-10 | Status Check | User status | Registration status | Status function |

#### 4. **🎯 FACE RECOGNITION FUNCTIONS (10 Test Cases)**
Testing fungsionalitas face recognition dari perspektif user:

| ID | Function | Input | Expected Output | Focus |
|----|----------|-------|----------------|-------|
| FACE-REC-01 | Recognition | Registered face | User identified + attendance | Core recognition |
| FACE-REC-02 | Recognition | Unregistered face | Face not recognized | Recognition validation |
| FACE-REC-03 | Confidence Check | Low confidence match | Confidence too low error | Confidence validation |
| FACE-REC-04 | Quality Check | Blurry image | Quality too low error | Image quality validation |
| FACE-REC-05 | Multiple Detection | Group photo | Multiple faces error | Face count validation |
| FACE-REC-06 | Attendance Recording | Successful recognition | Attendance recorded | Attendance function |
| FACE-REC-07 | Duplicate Prevention | Same day recognition | Already recorded warning | Duplicate prevention |
| FACE-REC-08 | History Function | User history request | Recognition history | History function |
| FACE-REC-09 | Statistics | User stats request | Recognition statistics | Stats function |
| FACE-REC-10 | Real-time | Live recognition | Fast response <2s | Performance function |

---

## 🚀 **CARA MENJALANKAN BLACKBOX TESTING**

### **Quick Start:**
```bash
# Jalankan semua blackbox function tests
npm run test:blackbox:all

# Atau gunakan script khusus
node tests/scripts/run-blackbox-tests.js
```

### **Individual Categories:**
```bash
# Test login functions
npm run test:blackbox:login

# Test registration functions  
npm run test:blackbox:register

# Test face registration functions
npm run test:blackbox:face-registration

# Test face recognition functions
npm run test:blackbox:face-recognition
```

### **Expected Output:**
```
🧪 BLACKBOX FUNCTION TESTING - FACE RECOGNITION APP
====================================================
Testing aplikasi dari perspektif user (Input → Output)

🔐 Running Login Functions...
   Description: Testing login page functionality
   ✅ Login Functions: 8/10 passed (2.5s)

📝 Running Registration Functions...
   Description: Testing registration page functionality
   ✅ Registration Functions: 9/10 passed (3.2s)

📷 Running Face Registration Functions...
   Description: Testing face registration functionality
   ✅ Face Registration Functions: 7/10 passed (4.1s)

🎯 Running Face Recognition Functions...
   Description: Testing face recognition functionality
   ✅ Face Recognition Functions: 8/10 passed (3.8s)

📊 BLACKBOX FUNCTION TESTING SUMMARY
====================================

📋 Category Results:
   ✅ 🔐 Login Functions: 8/10 (2.5s)
   ✅ 📝 Registration Functions: 9/10 (3.2s)
   ⚠️  📷 Face Registration Functions: 7/10 (4.1s)
   ✅ 🎯 Face Recognition Functions: 8/10 (3.8s)

🎯 Overall Statistics:
   Total Tests: 40
   Passed: 32 ✅
   Failed: 8 ❌  
   Pass Rate: 80.0%
   Total Duration: 13.6s
```

---

## 📊 **REPORT YANG DIHASILKAN**

### **1. Console Output**
Real-time progress dan summary statistics

### **2. JSON Report**
```json
{
  "summary": {
    "totalTests": 40,
    "totalPassed": 32,
    "totalFailed": 8,
    "passRate": 80.0,
    "totalDuration": 13.6,
    "timestamp": "2025-01-09T10:30:00Z"
  },
  "categories": [
    {
      "category": "Login Functions",
      "emoji": "🔐",
      "passed": 8,
      "failed": 2,
      "total": 10,
      "duration": 2.5,
      "status": "PARTIAL"
    }
    // ... other categories
  ]
}
```

### **3. HTML Report**
Interactive dashboard dengan:
- Executive summary dengan charts
- Category breakdown dengan statistics  
- Detailed results table
- Definition dan penjelasan blackbox testing
- Visual indicators untuk pass/fail status

### **4. Individual Test Reports**
Setiap category menghasilkan detailed report dengan:
- Input data yang digunakan
- Expected output
- Actual output  
- Pass/Fail status dengan reasons
- Execution time per test

---

## 🎯 **KEUNGGULAN APPROACH BARU**

### ✅ **Function-Based Testing:**
- **Fokus pada fungsionalitas** setiap halaman
- **Input → Output validation** yang jelas
- **User perspective** testing yang sesungguhnya
- **Maintainable** dan **scalable** test structure

### ✅ **Simplified Execution:**
- **API-based testing** lebih reliable dari browser automation
- **Faster execution** tanpa complex browser setup
- **Clear assertions** dengan specific expectations
- **Better error reporting** dan debugging

### ✅ **Comprehensive Coverage:**
- **40 function tests** across 4 main pages
- **All critical user journeys** covered
- **Edge cases** dan **validation scenarios**
- **Performance aspects** (response time)

### ✅ **Better Reporting:**
- **Visual HTML reports** dengan charts dan breakdowns
- **JSON data** untuk CI/CD integration
- **Category-based organization** untuk easy analysis
- **Pass rate tracking** dan trend analysis

---

## 🔧 **CUSTOMIZATION & EXTENSION**

### **Menambah Test Cases Baru:**
```typescript
test('NEW-01: New Function Test', async () => {
  const input = {
    // Define test input
  };

  const expectedOutput = {
    // Define expected output
  };

  await executeTest(
    'NEW-01',
    'New Function Description',
    input,
    expectedOutput,
    async () => {
      // Test implementation
      const response = await fetch(/*...*/);
      const data = await response.json();
      
      const actualOutput = {
        // Map response to output format
      };

      const success = /* validation logic */;

      return { actualOutput, success };
    }
  );
});
```

### **Menambah Category Baru:**
1. Buat file `tests/blackbox/new-category-functions.test.ts`
2. Update `package.json` dengan script baru
3. Update `run-blackbox-tests.js` dengan category baru

---

## 📚 **REFERENCES & BEST PRACTICES**

### **Blackbox Testing Principles:**
1. **Test dari user perspective** - tidak peduli implementasi
2. **Focus pada requirements** - apakah function sesuai spec
3. **Input-Output validation** - clear expectations
4. **Boundary testing** - edge cases dan limits
5. **Error handling** - negative scenarios

### **Test Design Guidelines:**
1. **Clear test naming** - function yang ditest jelas
2. **Specific assertions** - expected vs actual comparison
3. **Meaningful error messages** - debugging friendly
4. **Performance awareness** - response time tracking
5. **Data cleanup** - isolated test execution

### **Reporting Best Practices:**
1. **Executive summary** - high level metrics
2. **Category breakdown** - organized results
3. **Detailed evidence** - input/output data
4. **Visual indicators** - easy status identification
5. **Trend tracking** - historical comparison

---

## 🎉 **KESIMPULAN**

Blackbox testing yang telah diimplementasikan ini mengikuti **prinsip yang benar** dengan fokus pada:

- ✅ **Function-based testing** dari perspektif user
- ✅ **Input → Output validation** yang jelas dan specific
- ✅ **Requirements coverage** untuk semua halaman utama
- ✅ **Comprehensive reporting** dengan visual dashboard
- ✅ **Maintainable structure** untuk long-term usage

**Total: 40 Function Tests** across 4 main page categories, dengan execution time yang cepat dan reporting yang comprehensive.

---

**🚀 Ready untuk dijalankan dan memberikan confidence bahwa semua fungsi aplikasi bekerja sesuai ekspektasi user!**