import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../drizzle/schema.js";
import crypto from "crypto";

// Simple password hashing
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function seed() {
  const db = drizzle(process.env.DATABASE_URL);

  const adminUsers = [
    { username: "seub", name: "Seub" },
    { username: "nadia", name: "Nadia" },
    { username: "jm", name: "JM" },
    { username: "cody", name: "Cody" },
    { username: "phil", name: "Phil" },
    { username: "will", name: "Will" },
  ];

  const password = "banana";
  const hashedPassword = hashPassword(password);

  console.log("🌱 Seeding database with admin users...");

  for (const user of adminUsers) {
    try {
      await db.insert(users).values({
        username: user.username.toLowerCase(), // Store in lowercase for case-insensitive comparison
        password: hashedPassword,
        name: user.name,
        role: "admin",
        loginMethod: "custom",
        openId: null,
        email: null,
      });
      console.log(`✓ Created admin user: ${user.username}`);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        console.log(`⚠ User ${user.username} already exists, skipping...`);
      } else {
        console.error(`✗ Error creating user ${user.username}:`, error.message);
      }
    }
  }

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
