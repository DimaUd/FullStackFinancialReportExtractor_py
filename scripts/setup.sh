#!/bin/bash

echo "🚀 מגדיר את מחלץ הנתונים מדוחות כספיים..."

SERVICE_ACCOUNT_KEY_PATH="key/service-account-key.json"

if [ ! -f .env ]; then
    echo "📝 יוצר קובץ .env..."
    # Set the default service account key path in the .env file
    echo "GCP_SERVICE_ACCOUNT_KEY_PATH=${SERVICE_ACCOUNT_KEY_PATH}" > .env
    echo "✅ קובץ .env נוצר עם הנתיב לקובץ מפתח השירות."
fi

if [ ! -f "$SERVICE_ACCOUNT_KEY_PATH" ]; then
    echo ""
    echo "⚠️  קובץ מפתח השירות לא נמצא בנתיב: ${SERVICE_ACCOUNT_KEY_PATH}"
    echo "📋 אנא בצע את הפעולות הבאות:"
    echo "   1. ודא שיצרת מפתח שירות (Service Account Key) עבור פרויקט Google Cloud שלך."
    echo "   2. צור תיקייה בשם 'key' בתיקיית הפרויקט הראשית."
    echo "   3. שמור את קובץ ה-JSON של מפתח השירות בשם 'service-account-key.json' בתוך תיקיית 'key'."
    echo ""
    read -p "לחץ Enter אחרי שיצרת את הקובץ..."
fi

echo "📁 יוצר תיקיות נדרשות..."
mkdir -p key
mkdir -p nginx/ssl
mkdir -p backend/logs
mkdir -p uploads
mkdir -p output

if [ ! -f nginx/ssl/cert.pem ]; then
    echo "🔐 יוצר תעודת SSL לפיתוח מקומי..."
    openssl req -x509 -newkey rsa:4096 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -days 365 -nodes \
        -subj "/C=IL/ST=Central/L=Tel-Aviv/O=Dev/OU=Dev/CN=localhost" \
        2>/dev/null
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker לא מותקן. אנא התקן Docker תחילה."
    echo "📋 הוראות התקנה: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker לא פועל. אנא הפעל את Docker תחילה."
    exit 1
fi

echo ""
echo "✅ ההגדרה הושלמה בהצלחה!"
echo ""
echo "📋 שלבים הבאים:"
echo "   1. ודא שקובץ מפתח השירות נמצא ב: ${SERVICE_ACCOUNT_KEY_PATH}"
echo "   2. להפעלה בסביבת פיתוח, הרץ: bash ./scripts/dev.sh"
echo "   3. להפעלה עם Docker, הרץ: bash ./scripts/start.sh"
echo ""
echo "🆘 זקוק לעזרה? ראה README.md או הרץ: make help"
