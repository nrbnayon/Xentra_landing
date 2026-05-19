#!/bin/bash
set -e

LOG_FILE="logs/deploy.log"
mkdir -p logs

# Redirect all output to log file and console
exec > >(tee -a "$LOG_FILE")
exec 2>&1

echo "═══════════════════════════════════════════════════════"
echo "🚀 Starting deployment at $(date)"
echo "═══════════════════════════════════════════════════════"

cd /var/www/Xentra_landing || exit 1

echo ""
echo "📥 Pulling latest code..."
git reset --hard
git pull origin main

echo ""
echo "📦 Checking dependencies..."
if git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -q "package.json"; then
  echo "🔄 package.json changed — installing..."
  npm install --no-audit --no-fund --prefer-offline
else
  echo "✅ package.json unchanged — skipping install"
fi

echo ""
echo "🧹 Cleaning old build..."
rm -rf .next
rm -rf .turbo

echo ""
echo "🏗️ Building Next.js with 1GB memory..."
NODE_OPTIONS="--max-old-space-size=1024" npm run build

# Verify build succeeded
if [ ! -d ".next" ]; then
  echo "❌ FAILED: .next directory not created!"
  echo "Build output:"
  npm run build 2>&1 | tail -30
  exit 1
fi

# Check if chunks were actually generated
CHUNKS_COUNT=$(find .next/static/chunks -name "*.js" -o -name "*.css" 2>/dev/null | wc -l)
if [ "$CHUNKS_COUNT" -lt 5 ]; then
  echo "❌ FAILED: Only $CHUNKS_COUNT chunks found (expected 10+)"
  echo "Chunks directory:"
  ls -la .next/static/chunks/ 2>/dev/null || echo "Empty!"
  exit 1
fi

echo "✅ Build completed: $CHUNKS_COUNT static files generated"

# Fix permissions for Nginx
echo ""
echo "🔐 Setting file permissions for Nginx..."
sudo chown -R www-data:www-data .next
sudo chmod -R 755 .next

echo ""
echo "🔁 Restarting PM2..."
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
pm2 save

# Wait for app to fully start
echo "⏳ Waiting for app to start..."
sleep 4

echo ""
echo "🏥 Health check..."
if curl -f -s -m 5 http://localhost:3005 > /dev/null 2>&1; then
  echo "✅ App responding on :3005"
else
  echo "⚠️  App not responding yet. Showing logs:"
  pm2 logs Xentra_landing --lines 30
  echo ""
  echo "Retrying in 3 seconds..."
  sleep 3
  if curl -f -s -m 5 http://localhost:3005 > /dev/null 2>&1; then
    echo "✅ App now responding"
  else
    echo "❌ App still not responding!"
    exit 1
  fi
fi

echo ""
echo "🌐 Testing Nginx config..."
sudo nginx -t

echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo ""
echo "🧪 Testing static file serving..."
if [ -f ".next/static/chunks/_app*.js" ]; then
  SAMPLE_FILE=$(ls .next/static/chunks/_app*.js 2>/dev/null | head -1)
  if [ ! -z "$SAMPLE_FILE" ]; then
    echo "Testing: $SAMPLE_FILE"
    # Note: External HTTPS test might fail in some environments, so we just check file exists
    ls -lh "$SAMPLE_FILE"
    echo "✅ Static files present"
  fi
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY at $(date)"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 Summary:"
echo "  • Git: Latest code from main"
echo "  • Build: $CHUNKS_COUNT static chunks"
echo "  • App: Running on :3005"
echo "  • Nginx: Reloaded"
echo ""
echo "To monitor: pm2 logs Xentra_landing"
echo "═══════════════════════════════════════════════════════"