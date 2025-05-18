#!/bin/bash
# Fix extension ID references in the codebase

# Make the script executable
chmod +x "$0"

# Update the extension ID in key files
echo "Updating extension ID in key files..."

# Update getTheme.ts
sed -i 's/saoudrizwan\.claude-dev/khm\.nyf\.cline-for-on-premises/g' /home/hik90/sol/cline_origin/src/integrations/theme/getTheme.ts

# Update controller/index.ts
sed -i 's/saoudrizwan\.claude-dev/khm\.nyf\.cline-for-on-premises/g' /home/hik90/sol/cline_origin/src/core/controller/index.ts

# Update task/index.ts
sed -i 's/saoudrizwan\.claude-dev/khm\.nyf\.cline-for-on-premises/g' /home/hik90/sol/cline_origin/src/core/task/index.ts

# Update account/accountLoginClicked.ts
sed -i 's/saoudrizwan\.claude-dev/khm\.nyf\.cline-for-on-premises/g' /home/hik90/sol/cline_origin/src/core/controller/account/accountLoginClicked.ts

# Update ApiOptions.tsx
sed -i 's/saoudrizwan\.claude-dev/khm\.nyf\.cline-for-on-premises/g' /home/hik90/sol/cline_origin/webview-ui/src/components/settings/ApiOptions.tsx

# Update evals/cli/src/utils/vscode.ts
sed -i 's/saoudrizwan\.claude-dev/khm\.nyf\.cline-for-on-premises/g' /home/hik90/sol/cline_origin/evals/cli/src/utils/vscode.ts

# Update extension.test.js
sed -i 's/saoudrizwan\.claude-dev/khm\.nyf\.cline-for-on-premises/g' /home/hik90/sol/cline_origin/src/test/suite/extension.test.js

echo "Extension ID update completed!"
echo "Now rebuilding the extension..."

# Rebuild the extension
npm run build:webview && npm run compile

echo "Build completed! You can now reload the extension in VSCode."