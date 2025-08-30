#!/bin/bash

echo "Face API Attendance - Monorepo Validation"
echo "========================================="

echo "Checking pnpm installation..."
if command -v pnpm &> /dev/null; then
    echo "OK: pnpm is installed: $(pnpm --version)"
else
    echo "Error: pnpm is not installed. Please install it first:"
    echo "  npm install -g pnpm"
    exit 1
fi

echo "Validating workspace structure..."

required_dirs=(
    "apps/web"
    "apps/api"
    "packages/ui"
    "packages/types"
    "packages/config"
    "packages/utils"
    "prisma"
    "infra"
    "scripts"
    ".github/workflows"
)

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "OK: $dir exists"
    else
        echo "Error: $dir is missing"
        exit 1
    fi
done

echo "Checking critical configuration files..."

required_files=(
    "pnpm-workspace.yaml"
    "turbo.json"
    "package.json"
    ".env"
    "apps/web/package.json"
    "apps/api/package.json"
    "packages/ui/package.json"
    "packages/types/package.json"
    "packages/utils/package.json"
    "packages/config/package.json"
    "prisma/package.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "OK: $file exists"
    else
        echo "Error: $file is missing"
        exit 1
    fi
done

echo "Testing dependency installation..."
if pnpm install --frozen-lockfile 2>/dev/null; then
    echo "OK: Dependencies install successfully"
else
    echo "Warning: Dependencies failed to install (this is expected if lockfile doesn't exist yet)"
    echo "  Run 'pnpm install' to generate pnpm-lock.yaml"
fi

echo "Validating TypeScript configurations..."

ts_configs=(
    "apps/web/tsconfig.json"
    "packages/ui/tsconfig.json"
    "packages/types/tsconfig.json"
    "packages/utils/tsconfig.json"
    "packages/config/tsconfig.json"
)

for config in "${ts_configs[@]}"; do
    if [ -f "$config" ]; then
        echo "OK: $config exists"
    else
        echo "Error: $config is missing"
    fi
done

echo ""
echo "Monorepo validation complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'pnpm install' to install all dependencies"
echo "  2. Configure your environment variables in .env file"
echo "  3. Run 'pnpm run db:generate' to generate Prisma client"
echo "  4. Run 'pnpm run dev' to start development servers"
echo ""
echo "For detailed instructions, see README.md"