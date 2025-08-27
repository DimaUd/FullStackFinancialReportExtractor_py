# 📊 מחלץ נתונים מדוחות כספיים

> **אפליקציית Full-Stack מתקדמת לחילוץ טבלאות מדוחות כספיים באמצעות בינה מלאכותית**

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![React](https://img.shields.io/badge/React-19+-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)
![GCP](https://img.shields.io/badge/GCP-Service_Account-orange.svg)
![Hebrew](https://img.shields.io/badge/Hebrew-RTL_Support-orange.svg)

## 🚀 תיאור הפרויקט

מערכת מתקדמת המשתמשת ב-**Google Gemini AI** דרך **Google Cloud Platform** לחילוץ אוטומטי של טבלאות נתונים מדוחות כספיים בפורמט PDF. המערכת ממירה את הטבלאות לפורמטים מובנים (JSON, CSV) עם תמיכה מלאה בעברית ו-RTL.

### ✨ תכונות עיקריות

- 🤖 **חילוץ מבוסס AI** - שימוש במודלי Gemini דרך GCP
- 🔄 **תהליך דו-שלבי** - HTML → JSON מובנה
- ⚡ **עיבוד מקבילי** - כל עמודי ה-PDF במקביל
- 🌍 **תמיכה מלאה בעברית** - ממשק RTL ועיבוד טקסט בעברית
- 📊 **ייצוא מגוון** - JSON, CSV עם תמיכה בExcel
- 🐳 **Docker Ready** - פריסה קלה עם Docker Compose
- 🔒 **אבטחה מתקדמת** - GCP Service Account authentication
- 🎯 **מודלים מרובים** - בחירה בין מודלי Gemini שונים

## 🏗️ ארכיטקטורה

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  React Frontend │───▶│  Nginx Proxy     │───▶│  FastAPI Backend│
│  (Port 3000)    │    │  (Port 80)       │    │  (Port 8000)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │  Google Cloud   │
                                                │   Gemini API    │
                                                │ (Service Account)│
                                                └─────────────────┘
```

## 📋 דרישות מערכת

### בסיסי
- **Docker** & **Docker Compose** (מומלץ)
- **Google Cloud Platform Service Account** ([הוראות הגדרה למטה](#-הגדרת-gcp-authentication))

### פיתוח מקומי
- **Python 3.11+**
- **Node.js 18+**
- **Git**

## 🔑 הגדרת GCP Authentication

### שיטה 1: Service Account Key File (מומלץ)

1. **צור Service Account ב-GCP:**
   ```bash
   # ב-Google Cloud Console:
   # 1. לך ל-IAM & Admin → Service Accounts
   # 2. CREATE SERVICE ACCOUNT
   # 3. תן שם: financial-report-extractor
   # 4. Grant permissions: Basic → Editor (או Vertex AI User)
   # 5. CREATE KEY → JSON → יוצר קובץ JSON
   ```

2. **הגדר את הקובץ:**
   ```bash
   # שים את קובץ ה-JSON בתיקיית הפרויקט
   cp /path/to/downloaded-key.json ./gcp-service-account-key.json
   
   # הגדר ב-.env
   echo "GCP_SERVICE_ACCOUNT_KEY_PATH=./gcp-service-account-key.json" >> .env
   ```

### שיטה 2: Service Account Key as JSON String

```bash
# הדבק את תוכן קובץ ה-JSON כstring ב-.env
echo 'GCP_SERVICE_ACCOUNT_KEY_JSON={"type": "service_account", "project_id": "your-project", ...}' >> .env
```

### שיטה 3: Fallback - Direct API Key

```bash
# לbackward compatibility בלבד
echo "GEMINI_API_KEY=your-api-key" >> .env
```

## 🚀 התקנה והפעלה

### שיטה 1: Docker Compose (מומלץ)

```bash
# שכפול הפרויקט
git clone https://github.com/DimaUd/FullStackFinancialReportExtractor_py.git
cd FullStackFinancialReportExtractor_py

# הגדרה ראשונית
make setup

# ערוך את קובץ .env והוסף את הגדרות GCP
nano .env

# הפעלת הפרויקט
make start
```

### שיטה 2: פיתוח מקומי

```bash
# הגדרה ראשונית
make setup

# הפעלת סביבת פיתוח
make dev
```

### 🌐 קישורים לאחר הפעלה

- **🏠 Frontend**: http://localhost
- **⚡ Backend API**: http://localhost/api  
- **📚 API תיעוד**: http://localhost/api/docs
- **❤️ Health Check**: http://localhost/health
- **🎯 רשימת מודלים**: http://localhost/api/models

## 🎯 בחירת מודל Gemini

המערכת תומכת במודלים שונים. הגדר ב-.env:

```bash
# מודל מתקדם (ברירת מחדל)
GEMINI_MODEL=gemini-2.0-flash-exp

# מודלים נוספים:
# GEMINI_MODEL=gemini-1.5-pro        # מדויק יותר, איטי יותר
# GEMINI_MODEL=gemini-1.5-flash      # מאוזן
# GEMINI_MODEL=gemini-1.0-pro        # בסיסי
```

## 📖 איך להשתמש

1. **📤 העלאת קובץ** - גרור PDF או לחץ לבחירה
2. **🔍 זיהוי טבלאות** - המערכת מזהה טבלאות בכל העמודים במקביל
3. **👀 תצוגה מקדימה** - בדיקת התוצאות HTML
4. **⚙️ המרה לנתונים** - יצירת JSON מובנה לפי Schema
5. **💾 ייצוא** - הורדה כ-JSON או CSV

## 🔧 פקודות ניהול

```bash
make help      # הצגת כל הפקודות
make setup     # הגדרה ראשונית
make start     # הפעלה
make stop      # עצירה
make restart   # הפעלה מחדש
make logs      # צפייה בלוגים
make dev       # סביבת פיתוח
make clean     # ניקוי
make health    # בדיקת תקינות
```

## 📁 מבנה הפרויקט

```
FullStackFinancialReportExtractor_py/
├── 🐍 backend/              # Python FastAPI
│   ├── main.py              # שרת ראשי (מעודכן ל-GCP)
│   ├── requirements.txt     # תלויות Python (מעודכן)
│   └── Dockerfile          # Docker image
├── ⚛️ frontend/             # React TypeScript
│   ├── App.tsx             # רכיב ראשי
│   ├── services/api.ts     # API calls
│   ├── components/         # רכיבי React
│   └── types.ts           # TypeScript types
├── 🔑 gcp-service-account-key.json  # GCP credentials (אל תעלה ל-Git!)
├── 🌐 nginx/               # Reverse Proxy
├── 📜 scripts/             # סקריפטי עזר
├── 🐳 docker-compose.yml   # הגדרות Docker
├── 📝 .env.example         # משתני סביבה (מעודכן)
└── 📋 Makefile            # פקודות ניהול
```

## 🔐 הגדרת משתני סביבה

צור קובץ `.env` מבוסס על `.env.example`:

```bash
# GCP Authentication (בחר אחד)
GCP_SERVICE_ACCOUNT_KEY_PATH=./gcp-service-account-key.json
# GCP_SERVICE_ACCOUNT_KEY_JSON={"type": "service_account", ...}
# GEMINI_API_KEY=fallback-api-key

# מודל Gemini
GEMINI_MODEL=gemini-2.0-flash-exp

# הגדרות Backend
VITE_API_BASE_URL=http://localhost:8000/api
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 🧪 בדיקות לאחר התקנה

### 1. בדיקת תקינות בסיסית
```bash
# בדיקת health
make health

# בדיקת מודלים זמינים
curl http://localhost/api/models

# בדיקת logs
make logs
```

### 2. בדיקת פונקציונליות
- ✅ Frontend נטען ב-http://localhost  
- ✅ Backend API עובד ב-http://localhost/api
- ✅ תיעוד API נגיש ב-http://localhost/api/docs
- ✅ רשימת מודלים ב-http://localhost/api/models
- ✅ העלאת PDF פועלת
- ✅ חילוץ טבלאות עובד

## 🚨 פתרון בעיות נפוצות

### ❌ שגיאת GCP Authentication
```
ValueError: No valid Google Cloud authentication found
```
**פתרון**: 
1. וודא שיש לך Service Account עם הרשאות מתאימות
2. בדוק שקובץ ה-JSON במיקום הנכון
3. וודא שה-JSON תקין

### ❌ שגיאת Permissions
```
403 Forbidden: User does not have permission
```
**פתרון**: הוסף לService Account את התפקיד "Vertex AI User" או "Editor"

### ❌ שגיאת מודל לא נמצא
```
Model 'gemini-xyz' not found
```
**פתרון**: בדוק רשימת מודלים זמינים ב-http://localhost/api/models

## 📊 API Endpoints

| Method | Endpoint | תיאור |
|--------|----------|--------|
| POST | `/api/extract-html` | חילוץ HTML מ-PDF |
| POST | `/api/structure-data` | המרה ל-JSON מובנה |
| GET | `/health` | בדיקת תקינות + מודל נוכחי |
| GET | `/api/docs` | תיעוד API אינטראקטיבי |
| GET | `/api/models` | רשימת מודלי Gemini זמינים |

## 🔄 השוואה לגירסה הישנה

| תכונה | גירסה ישנה | גירסה חדשה (GCP) |
|--------|------------|------------------|
| **Authentication** | API key ישיר | GCP Service Account |
| **מודלים** | מודל אחד | בחירה בין מודלים |
| **אבטחה** | API key חשוף | Credentials מוגנים |
| **גמישות** | מוגבל | גישה לכל שירותי GCP |
| **ניהול** | ידני | ניהול מרכזי בGCP |

## 🔄 עדכונים חדשים

- ✅ **GCP Service Account** authentication  
- ✅ **Multi-model support** - בחירה בין מודלי Gemini
- ✅ **Model listing API** - רשימת מודלים זמינים
- ✅ **Enhanced security** - credentials management
- ✅ **Backward compatibility** - תמיכה במפתח ישיר

## 🤝 תרומה לפרויקט

1. **Fork** את הפרויקט
2. צור **branch** חדש: `git checkout -b feature/gcp-improvements`
3. **Commit** השינויים: `git commit -m 'Add GCP multi-model support'`
4. **Push** ל-branch: `git push origin feature/gcp-improvements`
5. פתח **Pull Request**

## 📄 רישיון

פרויקט זה מורשה תחת רישיון **MIT** - ראה [LICENSE](LICENSE) לפרטים.

## 🆘 תמיכה

- 🐛 **Issues**: [GitHub Issues](https://github.com/DimaUd/FullStackFinancialReportExtractor_py/issues)
- 📧 **Email**: your-email@example.com
- 📚 **GCP Docs**: [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)

## 🙏 תודות

- **Google Cloud Platform** - תשתית וכלי פיתוח
- **Google Gemini AI** - עיבוד הבינה המלאכותית
- **FastAPI** - Web framework מהיר ומודרני
- **React** - ממשק משתמש אינטראקטיבי
- **PyMuPDF** - עיבוד קבצי PDF
- **Docker** - containerization מקצועי

---

**נוצר עם ❤️ בישראל** | **Built with ❤️ in Israel**

> האם הפרויקט עזר לך? תן לו ⭐ ב-GitHub!