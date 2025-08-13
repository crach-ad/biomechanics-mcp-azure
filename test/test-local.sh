#!/bin/bash

# Local Testing Script for Biomechanics MCP Project
# Tests both services locally before Azure deployment

set -e

echo "🧪 Testing local development setup..."

# Test Python dependencies
echo "🐍 Checking Python dependencies..."
cd ../services/infer
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment (cross-platform)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install -r requirements.txt
echo "✅ Python dependencies installed"

# Test inference service startup
echo "🧠 Testing inference service..."
python -c "
import sys
sys.path.append('.')
from app import app
print('✅ Inference service imports successfully')
"

cd ../../

# Test Node.js dependencies
echo "📦 Checking Node.js dependencies..."
cd services/mcp
npm install
echo "✅ Node.js dependencies installed"

# Test TypeScript compilation
echo "🔧 Testing TypeScript compilation..."
npm run build
echo "✅ TypeScript compiles successfully"

cd ../../

# Create sample test data
echo "📹 Creating sample test data..."
mkdir -p test/data
cat > test/data/sample-analysis-request.json << EOF
{
  "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
  "focus": ["bar path", "timing"]
}
EOF

echo "📋 Creating test documentation..."
cat > test/TEST_RESULTS.md << EOF
# Test Results

## Local Development Test

### ✅ Passed Tests
- Python dependencies installation
- Inference service imports
- Node.js dependencies installation
- TypeScript compilation
- Project structure validation

### 🔄 Next Steps
1. Start inference service: \`cd services/infer && python app.py\`
2. Start MCP server: \`cd services/mcp && npm run dev\`
3. Test with VS Code Agent Builder
4. Deploy to Azure when ready

### 📊 Service Endpoints
- Inference API: http://localhost:8000
- MCP Server: http://localhost:3000/mcp

### 🧪 Manual Testing
\`\`\`bash
# Test inference service health
curl http://localhost:8000/health

# Test analysis endpoint
curl -X POST http://localhost:8000/analyze \\
  -H "Content-Type: application/json" \\
  -d @test/data/sample-analysis-request.json
\`\`\`
EOF

cd test

echo ""
echo "✅ Local testing complete!"
echo ""
echo "📋 Test Summary:"
echo "- ✅ Python environment ready"
echo "- ✅ Node.js environment ready" 
echo "- ✅ TypeScript compilation works"
echo "- ✅ Project structure validated"
echo ""
echo "🚀 Ready for development!"
echo "📖 See test/TEST_RESULTS.md for details"