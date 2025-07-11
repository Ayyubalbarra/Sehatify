echo "🚀 Setting up Sehatify Healthcare System..."

# Create directories if they don't exist
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p user-portal/public
mkdir -p admin-dashboard/public

# Copy environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "Please create backend/.env manually"
fi

if [ ! -f user-portal/.env ]; then
    echo "📝 Creating user-portal .env file..."
    cp user-portal/.env.example user-portal/.env 2>/dev/null || echo "Please create user-portal/.env manually"
fi

if [ ! -f admin-dashboard/.env ]; then
    echo "📝 Creating admin-dashboard .env file..."
    cp admin-dashboard/.env.example admin-dashboard/.env 2>/dev/null || echo "Please create admin-dashboard/.env manually"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if ! mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   - On macOS: brew services start mongodb-community"
    echo "   - On Ubuntu: sudo systemctl start mongod"
    echo "   - On Windows: net start MongoDB"
    exit 1
fi

echo "✅ MongoDB is running!"

# Seed the database
echo "🌱 Seeding database with sample data..."
cd backend && npm run seed && cd ..

echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the development servers:"
echo "   npm run dev"
echo ""
echo "📱 User Portal will be available at: http://localhost:3001"
echo "🏥 Admin Dashboard will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:5000"
echo ""
echo "📚 Demo credentials:"
echo "   Patient: patient@sehatify.com / password123"
echo "   Doctor: doctor@sehatify.com / password123"
echo "   Admin: admin@sehatify.com / password123"
