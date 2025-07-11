echo "🚀 Starting Sehatify Development Environment"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   Run: brew services start mongodb/brew/mongodb-community"
    echo "   Or: sudo systemctl start mongod"
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check required ports
echo "🔍 Checking required ports..."
check_port 5000 || exit 1
check_port 3001 || exit 1

# Start backend
echo "🔧 Starting Backend Server..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Backend .env file not found. Creating from template..."
    cp .env.example .env 2>/dev/null || echo "Please create backend/.env file manually"
fi

npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Start user portal
echo "🌐 Starting User Portal..."
cd user-portal
if [ ! -d "node_modules" ]; then
    echo "📦 Installing user portal dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  User portal .env file not found. Creating from template..."
    echo "REACT_APP_API_URL=http://localhost:5000/api/v1" > .env
fi

npm start &
USER_PORTAL_PID=$!
cd ..

echo ""
echo "✅ Development environment started successfully!"
echo ""
echo "🔗 Available Services:"
echo "   📱 User Portal:    http://localhost:3001"
echo "   🔧 Backend API:    http://localhost:5000"
echo "   📊 API Health:     http://localhost:5000/api/health"
echo ""
echo "🔐 Demo Credentials:"
echo "   📧 Email:    patient@sehatify.com"
echo "   🔑 Password: password123"
echo ""
echo "⚡ Quick Commands:"
echo "   🌱 Seed Database:  cd backend && npm run seed"
echo "   👤 Create Admin:   cd backend && npm run create-admin"
echo ""
echo "🛑 To stop all services, press Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development environment..."
    kill $BACKEND_PID 2>/dev/null
    kill $USER_PORTAL_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
