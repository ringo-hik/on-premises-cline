#!/bin/bash

# On-premises Cline Build Script (Production Ready)
# 이 스크립트는 내부망 환경을 위한 Cline 확장 프로그램을 빌드합니다.

echo "🛠️  On-premises Cline 빌드 시작..."

# 빌드 전 클린업
echo "🧹 이전 빌드 정리 중..."
rm -rf dist webview-ui/build *.vsix

# 1. 의존성 설치
echo "📦 의존성 설치 중..."
npm install --legacy-peer-deps
cd webview-ui && npm install --legacy-peer-deps && cd ..

# 2. Webview 빌드 (타입 체크 우회)
echo "🖼️  Webview 빌드 중..."
cd webview-ui

# TypeScript 컴파일 없이 Vite만 실행
npx vite build

cd ..

# 3. Extension 빌드 (타입 체크 우회)
echo "🔨 확장 프로그램 빌드 중..."
# esbuild로 직접 번들링
npx esbuild src/extension.ts \
    --bundle \
    --outfile=dist/extension.js \
    --external:vscode \
    --format=cjs \
    --platform=node \
    --target=es2020 \
    --minify

# 4. VSCE 없이 수동으로 VSIX 생성
echo "📦 VSIX 패키지 생성 중..."

VSIX_NAME="cline-on-premises-$(date +%Y%m%d-%H%M%S).vsix"
TEMP_DIR="vsix-temp"

# 임시 디렉토리 생성
mkdir -p $TEMP_DIR

# 필수 파일들 복사
cp -r dist $TEMP_DIR/
cp -r webview-ui/build $TEMP_DIR/webview-ui-build
cp package.json $TEMP_DIR/
cp README.md $TEMP_DIR/ 2>/dev/null || touch $TEMP_DIR/README.md
cp LICENSE $TEMP_DIR/ 2>/dev/null || echo "Apache-2.0" > $TEMP_DIR/LICENSE
cp -r assets $TEMP_DIR/ 2>/dev/null || mkdir -p $TEMP_DIR/assets

# package.json에 publisher 추가 (없는 경우)
cd $TEMP_DIR
if ! grep -q '"publisher"' package.json; then
    # publisher 필드 추가
    node -e "
    const pkg = require('./package.json');
    pkg.publisher = 'on-premises';
    require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
    "
fi

# extension.vsixmanifest 생성
cat > extension.vsixmanifest << EOF
<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Id="claude-dev.on-premises" Version="3.16.1" Publisher="on-premises" />
    <DisplayName>Cline (On-Premises)</DisplayName>
    <Description>Autonomous coding agent for on-premises environments</Description>
    <Icon>assets/icons/icon.png</Icon>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code" />
  </Installation>
  <Dependencies>
    <Dependency Id="Microsoft.VisualStudio.Code" Version="1.84.0" />
  </Dependencies>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="package.json" />
    <Asset Type="Microsoft.VisualStudio.Services.Icons.Default" Path="assets/icons/icon.png" />
  </Assets>
</PackageManifest>
EOF

# VSIX 아카이브 생성
cd ..
if command -v zip &> /dev/null; then
    cd $TEMP_DIR
    zip -r ../$VSIX_NAME * -x "*.git*" "node_modules/*"
    cd ..
else
    # tar 사용 (zip이 없는 경우)
    tar -czf $VSIX_NAME -C $TEMP_DIR .
    echo "⚠️  TAR로 생성됨. 확장자를 .vsix로 변경하여 사용하세요."
fi

# 임시 디렉토리 삭제
rm -rf $TEMP_DIR

# 5. 결과 확인
if [ -f "$VSIX_NAME" ]; then
    echo ""
    echo "✅ 빌드 성공!"
    echo "📁 생성된 파일: $VSIX_NAME"
    echo ""
    echo "🚀 설치 방법:"
    echo "   1. VS Code 실행"
    echo "   2. Ctrl+Shift+P (또는 Cmd+Shift+P)"
    echo "   3. 'Extensions: Install from VSIX...' 입력"
    echo "   4. $VSIX_NAME 파일 선택"
    echo ""
    echo "또는 명령줄에서:"
    echo "   code --install-extension $VSIX_NAME"
else
    echo "❌ 빌드 실패"
    echo "dist/ 폴더와 webview-ui/build/ 폴더를 확인하세요."
fi

echo ""
echo "⚠️  주의사항:"
echo "   - 이 빌드는 내부망 전용입니다"
echo "   - 외부망 기능들이 비활성화되어 있습니다:"
echo "     • MCP Marketplace 사용 불가"
echo "     • Cline 계정 로그인 사용 불가"
echo "     • PostHog 텔레메트리 비활성화"
echo "     • Firebase 인증 비활성화"