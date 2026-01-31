import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import dbConnection from "./config/db";
import { Team } from "./models/Team";

const PORT = process.env.PORT || 5000;

// Function to sync database indexes and migrate old data
const syncIndexesAndMigrateData = async () => {
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
    
    // Migrate old teams without gender field - set them to "Boys" as default
    const teamsWithoutGender = await Team.countDocuments({ 
      $or: [
        { gender: { $exists: false } },
        { gender: null },
        { gender: "" }
      ]
    });
    
    if (teamsWithoutGender > 0) {
      console.log(`🔄 Migrating ${teamsWithoutGender} teams without gender field...`);
      await Team.updateMany(
        { 
          $or: [
            { gender: { $exists: false } },
            { gender: null },
            { gender: "" }
          ]
        },
        { $set: { gender: "Boys" } }
      );
      console.log("✅ Teams migrated successfully");
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
  // Sync indexes and migrate data after DB connection
  await syncIndexesAndMigrateData();
  
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error("❌ Database connection failed:", error);
  process.exit(1);
});
