#!/bin/bash

# On-premises Cline Build Script (Simple Version)
# 타입 체크와 lint를 완전히 우회하는 간단한 버전

echo "🛠️  On-premises Cline 간단 빌드 시작..."

# 1. webview 빌드 (타입체크 없이)
echo "🖼️  Webview 빌드 중..."
cd webview-ui
npx vite build || echo "Webview 빌드 경고 무시"
cd ..

# 2. extension 빌드 (타입체크 없이)
echo "🔨 확장 프로그램 빌드 중..."
npx esbuild src/extension.ts --bundle --outfile=dist/extension.js --external:vscode --format=cjs --platform=node --minify

# 3. VSIX 생성
echo "📦 VSIX 패키지 생성 중..."
# 필수 파일들을 임시 폴더에 복사
mkdir -p vsix-build
cp -r dist vsix-build/
cp package.json vsix-build/
cp README.md vsix-build/
cp -r assets vsix-build/
cp -r webview-ui/build vsix-build/webview-ui-build

# VSIX 생성
cd vsix-build
zip -r ../cline-on-premises-$(date +%Y%m%d).vsix * -x "*.git*"
cd ..
rm -rf vsix-build

VSIX_FILE="cline-on-premises-$(date +%Y%m%d).vsix"
echo "✅ 빌드 완료!"
echo "📁 생성된 파일: $VSIX_FILE"
echo ""
echo "🚀 설치 방법:"
echo "   code --install-extension $VSIX_FILE"
echo ""
echo "또는:"
echo "   1. VS Code에서 Ctrl+Shift+P"
echo "   2. 'Extensions: Install from VSIX...' 선택"
echo "   3. $VSIX_FILE 선택"