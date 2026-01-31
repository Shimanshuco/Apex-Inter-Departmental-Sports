import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import dbConnection from "./config/db";
import { Team } from "./models/Team";

const PORT = process.env.PORT || 5000;

// Function to sync database indexes (handles migration from old schema)
const syncIndexes = async () => {
  try {
    // Get the collection
    const collection = Team.collection;
    
    // Get existing indexes
    const indexes = await collection.indexes();
    
    // Check if old index exists (sport + department without gender)
    const oldIndex = indexes.find((idx: any) => 
      idx.key && 
      idx.key.sport === 1 && 
      idx.key.department === 1 && 
      !idx.key.gender &&
      idx.unique === true
    );
    
    if (oldIndex) {
      console.log("🔄 Dropping old team index (sport + department)...");
      await collection.dropIndex(oldIndex.name);
      console.log("✅ Old index dropped successfully");
    }
    
    // Sync indexes (this will create the new index if it doesn't exist)
    await Team.syncIndexes();
    console.log("✅ Team indexes synced");
  } catch (error) {
    console.error("⚠️ Error syncing indexes:", error);
    // Don't fail startup, just log the error
  }
};

dbConnection().then(async () => {
  // Sync indexes after DB connection
  await syncIndexes();
  
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error("❌ Database connection failed:", error);
  process.exit(1);
});
