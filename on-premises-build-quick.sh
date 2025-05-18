#!/bin/bash

echo "🚀 On-premises Cline 간편 빌드 시작..."
echo ""

# 1. 기존 빌드 정리 (dist와 vsix만)
echo "1️⃣ 기존 빌드 정리 중..."
rm -rf dist
rm -f cline-on-premises-*.vsix

# 2. 의존성 확인 (필요시만 설치)
echo ""
echo "2️⃣ 의존성 확인 중..."
if [ ! -d "node_modules" ]; then
    echo "   의존성 설치가 필요합니다..."
    npm install
else
    # pkce-challenge 패키지 업데이트 확인
    if ! npm list pkce-challenge | grep -q "pkce-challenge@5.0.0"; then
        echo "   pkce-challenge 패키지 업데이트 중..."
        npm install pkce-challenge@latest --save
    fi
fi
if [ ! -d "webview-ui/node_modules" ]; then
    echo "   Webview 의존성 설치가 필요합니다..."
    cd webview-ui && npm install && cd ..
fi

# 3. Webview 빌드
echo ""
echo "3️⃣ Webview 빌드 중..."
cd webview-ui
npx vite build || true

# 경로 수정 - 빌드 후 HTML 파일 수정
if [ -f "build/index.html" ]; then
  # 절대 경로를 상대 경로로 변경
  sed -i 's|src="/assets/|src="./assets/|g' build/index.html
  sed -i 's|href="/assets/|href="./assets/|g' build/index.html
fi
cd ..

# 4. 확장 프로그램 빌드
echo ""
echo "4️⃣ 확장 프로그램 빌드 중..."
node esbuild.js --production || true

# 5. VSIX 패키지 생성
echo ""
echo "5️⃣ VSIX 패키지 생성 중..."

# 임시 디렉토리 구조 생성
mkdir -p vsix-temp/extension
cp -r README.md LICENSE package.json ./vsix-temp/extension/
cp -r assets ./vsix-temp/extension/

# dist 폴더 복사
mkdir -p ./vsix-temp/extension/dist
cp -r dist/* ./vsix-temp/extension/dist/ 2>/dev/null || true

# webview 빌드 폴더 복사 (중요: webview-ui-build가 아닌 webview-ui/build로 복사)
mkdir -p ./vsix-temp/extension/webview-ui/build
cp -r webview-ui/build/* ./vsix-temp/extension/webview-ui/build/

# 필요한 CSS 파일 복사
mkdir -p ./vsix-temp/extension/node_modules/@vscode/codicons/dist
cp -r node_modules/@vscode/codicons/dist/codicon.css ./vsix-temp/extension/node_modules/@vscode/codicons/dist/
cp -r node_modules/@vscode/codicons/dist/codicon.ttf ./vsix-temp/extension/node_modules/@vscode/codicons/dist/

mkdir -p ./vsix-temp/extension/webview-ui/node_modules/katex/dist
cp -r webview-ui/node_modules/katex/dist/katex.min.css ./vsix-temp/extension/webview-ui/node_modules/katex/dist/
cp -r webview-ui/node_modules/katex/dist/fonts ./vsix-temp/extension/webview-ui/node_modules/katex/dist/

# Content Types 파일 생성
cat > ./vsix-temp/\[Content_Types\].xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension=".json" ContentType="application/json"/>
  <Default Extension=".js" ContentType="text/javascript"/>
  <Default Extension=".css" ContentType="text/css"/>
  <Default Extension=".html" ContentType="text/html"/>
  <Default Extension=".png" ContentType="image/png"/>
  <Default Extension=".svg" ContentType="image/svg+xml"/>
  <Default Extension=".gif" ContentType="image/gif"/>
  <Default Extension=".ttf" ContentType="application/x-font-ttf"/>
  <Default Extension=".woff" ContentType="application/font-woff"/>
  <Default Extension=".woff2" ContentType="font/woff2"/>
  <Default Extension=".md" ContentType="text/markdown"/>
  <Default Extension="" ContentType="application/octet-stream"/>
</Types>
EOF

# Manifest 파일 생성
cat > ./vsix-temp/extension.vsixmanifest << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vscode-manifest-schema/2011">
  <Metadata>
    <Identity Language="en-US" Id="cline-for-on-premises" Version="3.16.1-onpremises.1" Publisher="khm.nyf"/>
    <DisplayName>Cline for On-Premises</DisplayName>
    <Description>On-premises version of Cline</Description>
    <Categories>Other</Categories>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="^1.84.0" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionKind" Value="ui" />
    </Properties>
    <Icon>extension/assets/icons/icon.png</Icon>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code"/>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
  </Assets>
</PackageManifest>
EOF

# VSIX 파일 생성
cd vsix-temp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
VSIX_NAME="../cline-on-premises-$TIMESTAMP.vsix"

python3 -c "
import zipfile
import os

vsix_name = '$VSIX_NAME'
with zipfile.ZipFile(vsix_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        for file in files:
            file_path = os.path.join(root, file)
            archive_path = os.path.relpath(file_path, '.')
            zipf.write(file_path, archive_path)
print(f'✅ VSIX 생성 완료: {vsix_name}')
"

cd ..

# 6. 임시 디렉토리 정리
echo ""
echo "6️⃣ 임시 파일 정리 중..."
rm -rf vsix-temp

echo ""
echo "🎉 빌드 완료!"
echo "📦 생성된 파일: $VSIX_NAME"
echo ""
echo "📌 설치 방법:"
echo "   code --install-extension $VSIX_NAME"