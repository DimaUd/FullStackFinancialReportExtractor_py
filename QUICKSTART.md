# 🚀 מדריך התחלה מהיר - מחלץ נתונים מדוחות כספיים

מדריך זה יעזור לך להתחיל להשתמש במערכת לחילוץ טבלאות מדוחות כספיים במהירות וביעילות.

## 📋 דרישות מערכת

- **Docker** & **Docker Compose**
- **Google Cloud Platform Service Account** עם גישה ל-Gemini API

## 🔑 הגדרת GCP Authentication

1. **הכן את קובץ ה-Service Account Key**:
   - וודא שקובץ ה-JSON של ה-Service Account נמצא בנתיב `key/service-account-key.json`

2. **צור קובץ .env**:
   ```bash
   # בסיסי
   GCP_SERVICE_ACCOUNT_KEY_PATH=./key/service-account-key.json
   GEMINI_MODEL=models/gemini-2.5-flash-lite
   
   # הגדרות נוספות
   VITE_API_BASE_URL=http://localhost:8000/api
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

## ⚡ הפעלה מהירה

### עם Docker Compose (מומלץ)

1. **בנה והפעל את השירותים**:
   ```bash
   docker-compose up -d --build
   ```

2. **גש לממשק המשתמש**:
   - פתח את הדפדפן בכתובת: http://localhost

3. **עצירת השירותים**:
   ```bash
   docker-compose down
   ```

## 🔄 שימוש במערכת

1. **העלאת קובץ PDF**:
   - גרור קובץ PDF לאזור ההעלאה או לחץ לבחירת קובץ

2. **חילוץ טבלאות**:
   - המערכת תזהה טבלאות בכל העמודים במקביל
   - תוכל לצפות בתצוגה מקדימה של ה-HTML

3. **המרה לנתונים מובנים**:
   - לחץ על "המשך" כדי להמיר את הטבלאות ל-JSON מובנה

4. **ייצוא הנתונים**:
   - הורד את התוצאות כ-JSON או CSV

## 🛠️ פתרון בעיות נפוצות

### בעיית אימות GCP
אם מופיעה שגיאת אימות, וודא ש:
- קובץ ה-Service Account נמצא במיקום הנכון
- ל-Service Account יש הרשאות מתאימות (Vertex AI User או Editor)

### בעיית מודל לא נמצא
אם מופיעה שגיאת "Model not found", בדוק:
- את רשימת המודלים הזמינים בכתובת: http://localhost/api/models
- עדכן את ערך GEMINI_MODEL בקובץ .env

## 📊 בדיקת תקינות המערכת

```bash
# בדיקת תקינות בסיסית
curl http://localhost/health

# בדיקת מודלים זמינים
curl http://localhost/api/models
```

## 🌟 תכונות עיקריות

- **חילוץ מבוסס AI** - שימוש במודלי Gemini דרך GCP
- **תהליך דו-שלבי** - HTML → JSON מובנה
- **עיבוד מקבילי** - כל עמודי ה-PDF במקביל
- **תמיכה מלאה בעברית** - ממשק RTL ועיבוד טקסט בעברית
- **ייצוא מגוון** - JSON, CSV עם תמיכה בExcel

## 📝 הערות

- המערכת משתמשת במודל `gemini-2.5-flash-lite` כברירת מחדל
- ניתן לשנות את המודל בקובץ .env
- לקבלת מידע נוסף, עיין בקובץ README.md המלא
