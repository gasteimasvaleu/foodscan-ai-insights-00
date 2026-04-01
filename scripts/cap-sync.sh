#!/bin/bash
# =============================================================
# cap-sync.sh — Wrapper seguro para npx cap sync
# Preserva o project.pbxproj customizado (targets, plugins
# nativos, entitlements, build settings) durante o sync.
# Uso: bash scripts/cap-sync.sh  ou  npm run cap:sync
# =============================================================

set -e

PBXPROJ="ios/App/App.xcodeproj/project.pbxproj"
BACKUP="${PBXPROJ}.bak"

# 1. Verificar se o pbxproj existe
if [ ! -f "$PBXPROJ" ]; then
  echo "❌ Arquivo $PBXPROJ não encontrado. Execute a partir da raiz do projeto."
  exit 1
fi

echo "📦 Fazendo backup do project.pbxproj..."
cp "$PBXPROJ" "$BACKUP"

echo "🔄 Executando npx cap sync ios..."
npx cap sync ios

echo "♻️ Restaurando project.pbxproj customizado..."
cp "$BACKUP" "$PBXPROJ"
rm -f "$BACKUP"

echo "📱 Executando pod install..."
cd ios/App && pod install --repo-update
cd ../..

echo ""
echo "✅ Cap sync concluído com sucesso!"
echo "   → Web assets atualizados"
echo "   → project.pbxproj preservado (plugins nativos, entitlements, build settings)"
echo "   → Pods sincronizados"
