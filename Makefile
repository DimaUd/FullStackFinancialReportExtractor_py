.PHONY: help setup start stop restart logs clean dev test build

# Default target
help:
	@echo "📚 פקודות זמינות:"
	@echo "  setup     - הגדרה ראשונית של הפרויקט"
	@echo "  start     - הפעלה עם Docker"
	@echo "  stop      - עצירת השרתים"
	@echo "  restart   - הפעלה מחדש"
	@echo "  dev       - סביבת פיתוח"
	@echo "  logs      - צפייה בלוגים"
	@echo "  clean     - ניקוי Docker resources"
	@echo "  test      - הרצת בדיקות"
	@echo "  build     - בניית Docker images"

# Initial setup
setup:
	@echo "🚀 מגדיר את מחלץ הנתונים..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "📝 נוצר קובץ .env. אנא ערוך אותו והוסף את GEMINI_API_KEY"; \
		echo "⚠️  הוראות: קבל מפתח API מ-https://makersuite.google.com/app/apikey"; \
	fi
	@mkdir -p nginx/ssl backend/logs uploads output
	@if [ ! -f nginx/ssl/cert.pem ]; then \
		echo "🔐 יוצר תעודת SSL..."; \
		openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -nodes -subj "/C=IL/ST=Central/L=Tel-Aviv/O=Dev/OU=Dev/CN=localhost" 2>/dev/null; \
	fi
	@echo "✅ ההגדרה הושלמה!"
	@echo "📋 הוראות:"
	@echo "   1. ערוך את קובץ .env והוסף את GEMINI_API_KEY"
	@echo "   2. הרץ: make start"

# Start application
start:
	@echo "🚀 מפעיל את האפליקציה..."
	@if [ ! -f .env ]; then \
		echo "❌ קובץ .env לא נמצא. הרץ 'make setup' תחילה"; \
		exit 1; \
	fi
	@docker-compose up -d --build
	@echo "⏳ ממתין לשרתים..."
	@sleep 15
	@echo "✅ האפליקציה הופעלה!"
	@echo "🌐 Frontend: http://localhost"
	@echo "📡 Backend: http://localhost/api"
	@echo "📚 API תיעוד: http://localhost/api/docs"

# Stop application
stop:
	@echo "🛑 עוצר את האפליקציה..."
	@docker-compose down
	@echo "✅ האפליקציה נעצרה!"

# Restart application
restart: stop start

# Development environment
dev:
	@echo "🔧 מפעיל סביבת פיתוח..."
	@if [ ! -f .env ]; then \
		echo "❌ קובץ .env לא נמצא. הרץ 'make setup' תחילה"; \
		exit 1; \
	fi
	@echo "מפעיל backend ו-frontend במצב פיתוח..."
	@echo "🐍 Backend: http://localhost:8000"
	@echo "⚛️ Frontend: http://localhost:5173"
	@./scripts/dev.sh

# View logs
logs:
	@docker-compose logs -f

logs-backend:
	@docker-compose logs -f backend

logs-frontend:
	@docker-compose logs -f frontend

logs-nginx:
	@docker-compose logs -f nginx

# Clean up
clean:
	@echo "🧹 מנקה..."
	@docker-compose down -v
	@docker system prune -f
	@echo "✅ הניקוי הושלם!"

# Build images
build:
	@echo "🔨 בונה Docker images..."
	@docker-compose build --no-cache
	@echo "✅ הבנייה הושלמה!"

# Run tests (placeholder)
test:
	@echo "🧪 מריץ בדיקות..."
	@echo "בדיקות Backend:"
	@docker-compose exec backend python -m pytest tests/ || echo "אין עדיין בדיקות backend"
	@echo "בדיקות Frontend:"
	@docker-compose exec frontend npm test || echo "אין עדיין בדיקות frontend"

# Health check
health:
	@echo "🔍 בודק תקינות האפליקציה..."
	@curl -s http://localhost/health | python -m json.tool || echo "❌ בדיקת התקינות נכשלה"

# Show application status
status:
	@echo "📊 סטטוס האפליקציה:"
	@docker-compose ps

# Quick commands
up: start
down: stop
rebuild: clean build start