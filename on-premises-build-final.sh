#!/bin/bash

# On-premises Cline Build Script (Final Version)
# 이 스크립트는 내부망 환경을 위한 Cline 확장 프로그램을 빌드합니다.

echo "🛠️  On-premises Cline 최종 빌드 시작..."

# 빌드 전 클린업
echo "🧹 이전 빌드 정리 중..."
rm -rf dist webview-ui/build *.vsix

# 1. 의존성 설치 (없는 경우에만)
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 설치 중..."
    npm install --legacy-peer-deps
fi

if [ ! -d "webview-ui/node_modules" ]; then
    echo "📦 Webview 의존성 설치 중..."
    cd webview-ui && npm install --legacy-peer-deps && cd ..
fi

# 2. Webview 빌드
echo "🖼️  Webview 빌드 중..."
cd webview-ui
npm run build
cd ..

# 3. Extension 빌드
echo "🔨 확장 프로그램 빌드 중..."
npm run compile || npm run package || node esbuild.js --production

# 4. VSIX 생성
echo "📦 VSIX 패키지 생성 중..."

# VSCE가 없으면 설치
if ! command -v vsce &> /dev/null; then
    npm install -g @vscode/vsce
fi

# VSIX 생성 시도
vsce package --no-dependencies --allow-star-activation || \
vsce package --no-dependencies || \
echo "VSCE 실패, 수동 패키징 시도..."

# 5. 수동 VSIX 생성 (vsce 실패 시)
if [ ! -f *.vsix ]; then
    echo "⚠️  수동으로 VSIX 생성 중..."
    
    # 필요한 파일들 확인
    if [ -d "dist" ] && [ -d "webview-ui/build" ]; then
        TEMP_DIR="vsix-package"
        mkdir -p $TEMP_DIR
        
        # 필수 파일들 복사
        cp -r dist $TEMP_DIR/
        cp -r webview-ui/build $TEMP_DIR/webview-ui-build
        cp package.json $TEMP_DIR/
        cp README.md $TEMP_DIR/ 2>/dev/null || echo "README.md not found"
        cp LICENSE $TEMP_DIR/ 2>/dev/null || echo "LICENSE not found"
        cp -r assets $TEMP_DIR/
        
        # package.json 수정 (publisher 추가)
        cd $TEMP_DIR
        if ! grep -q '"publisher"' package.json; then
            # publisher가 없으면 추가
            sed -i 's/"version"/"publisher": "on-premises",\n  "version"/' package.json
        fi
        
        # VSIX 생성
        if command -v zip &> /dev/null; then
            zip -r ../cline-on-premises.vsix * -x "*.git*" "node_modules/*"
        else
            # tar 사용 (zip이 없는 경우)
            tar czf ../cline-on-premises.vsix.tar.gz *
            echo "⚠️  ZIP이 없어서 TAR.GZ로 생성했습니다. 수동으로 변환 필요."
        fi
        
        cd ..
        rm -rf $TEMP_DIR
    else
        echo "❌ 빌드 파일을 찾을 수 없습니다."
        exit 1
    fi
fi

# 6. 결과 확인
echo ""
VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -1)
if [ -n "$VSIX_FILE" ]; then
    echo "✅ 빌드 성공!"
    echo "📁 생성된 파일: $VSIX_FILE"
    echo ""
    echo "🚀 설치 방법:"
    echo "   code --install-extension $VSIX_FILE"
    echo ""
    echo "또는:"
    echo "   1. VS Code에서 Ctrl+Shift+P"
    echo "   2. 'Extensions: Install from VSIX...' 선택"
    echo "   3. $VSIX_FILE 선택"
else
    echo "❌ VSIX 파일 생성 실패"
    echo "다음을 확인하세요:"
    echo "- dist/ 폴더 존재 여부"
    echo "- webview-ui/build/ 폴더 존재 여부"
    echo "- npm install이 정상적으로 완료되었는지"
fi

echo ""
echo "⚠️  주의사항:"
echo "   - 이 빌드는 내부망 전용입니다"
echo "   - 외부망 기능들이 비활성화되어 있습니다"
echo "   - MCP Marketplace, Cline 계정 로그인 사용 불가"
echo "   - PostHog 텔레메트리, Firebase 인증 비활성화"