#!/bin/bash

echo "🔧 מפעיל סביבת פיתוח..."

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

echo "🐍 מפעיל Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "יוצר סביבה וירטואלית..."
    python -m venv venv
fi

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install -r requirements.txt

echo "מפעיל FastAPI server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

echo "⚛️ מפעיל Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "מתקין תלויות Node.js..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ סביבת פיתוח הופעלה!"
echo "🌐 Frontend: http://localhost:5173"
echo "📡 Backend: http://localhost:8000"
echo "📚 API תיעוד: http://localhost:8000/docs"
echo ""
echo "לחץ Ctrl+C כדי לעצור את כל השירותים"

cleanup() {
    echo ""
    echo "🛑 עוצר את שירותי הפיתוח..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ סביבת הפיתוח נסגרה"
    exit 0
}

trap cleanup INT
wait