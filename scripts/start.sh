#!/bin/bash

echo "🚀 מפעיל את מחלץ הנתונים מדוחות כספיים..."

if [ ! -f .env ]; then
    echo "❌ קובץ .env לא נמצא. אנא הרץ ./scripts/setup.sh תחילה."
    exit 1
fi

source .env

if [ -z "$GCP_SERVICE_ACCOUNT_KEY_PATH" ]; then
    echo "❌ המשתנה GCP_SERVICE_ACCOUNT_KEY_PATH לא הוגדר בקובץ .env"
    echo "🤔 אנא הרץ ./scripts/setup.sh תחילה."
    exit 1
fi

if [ ! -f "$GCP_SERVICE_ACCOUNT_KEY_PATH" ]; then
    echo "❌ קובץ מפתח השירות לא נמצא בנתיב שהוגדר ב-.env: $GCP_SERVICE_ACCOUNT_KEY_PATH"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker לא פועל. אנא הפעל את Docker תחילה."
    exit 1
fi

echo "🐳 מפעיל שירותי Docker..."
docker-compose up --build -d

echo "⏳ ממתין ל-Backend להיות מוכן (עד 60 שניות)..."

for i in {1..30}; do
    # Use -s for silent, -f for fail-fast
    if curl -fs http://localhost:8000/health > /dev/null; then
        echo "✅ Backend מוכן!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️ Backend לא הגיב בזמן. ייתכן שהוא עדיין עולה. ממשיך..."
        break
    fi
    sleep 2
done

echo "🔍 בודק תקינות השירותים..."

if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ שירותי Docker פועלים!"
    echo ""
    echo "🌐 קישורים:"
    echo "   Frontend:    http://localhost"
    echo "   Backend API: http://localhost/api"
    echo "   API תיעוד:   http://localhost/api/docs"
    echo ""
    echo "📋 פקודות שימושיות:"
    echo "   make logs        - צפייה בלוגים"
    echo "   make stop        - עצירת השירותים"
    echo "   make restart     - הפעלה מחדש"
    echo ""
else
    echo "❌ השירותים לא הופעלו כראוי. בדוק את הלוגים עם:"
    echo "   docker-compose logs -f"
fi

echo "🎉 מוכן לשימוש! העלה קובץ PDF ובדוק איך זה עובד."