#!/bin/bash

echo "🛑 עוצר את מחלץ הנתונים מדוחות כספיים..."
docker-compose down
echo "✅ כל השירותים נעצרו."
echo "📋 כדי להפעיל שוב: make start או ./scripts/start.sh"
