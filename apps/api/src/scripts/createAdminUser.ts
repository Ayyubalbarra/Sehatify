const bcrypt = require("bcrypt")
const dbConnection = require("../config/database")
const User = require("../models/User")

async function createAdminUser() {
  try {
    console.log("🔌 Connecting to database...")
    await dbConnection.connect()

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@sehatify.com" })
    
    if (existingAdmin) {
      console.log("✅ Admin user already exists")
      console.log("📧 Email: admin@sehatify.com")
      console.log("🔑 Password: admin123")
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10)
    
    const adminUser = new User({
      name: "Administrator",
      email: "admin@sehatify.com",
      password: hashedPassword,
      role: "Super Admin",
      status: "Active",
    })

    await adminUser.save()

    console.log("✅ Admin user created successfully!")
    console.log("📧 Email: admin@sehatify.com")
    console.log("🔑 Password: admin123")
    console.log("👤 Role: Super Admin")

  } catch (error) {
    console.error("❌ Error creating admin user:", error)
  } finally {
    await dbConnection.disconnect()
    process.exit(0)
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser()
}

module.exports = createAdminUser
