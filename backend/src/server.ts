import dotenv from "dotenv";

dotenv.config();

import app from "./app";

import cron from "node-cron";
import { runCleanupJob } from "./jobs/cleanupExpiredFiles";

// 🧪 TESTING MODE: Runs every 1 minute
// 🚨 PRODUCTION MODE: Change to "30 19 * * *" (1:00 AM IST) before going live!
cron.schedule("* * * * *", async () => {
  console.log("[CRON] ⏰ Triggering test cleanup...");
  await runCleanupJob();
});

//server.ts =the power button nothing else lives here 
//start server 

const PORT=Number(process.env.PORT) || 3001;
app.listen(PORT,"0.0.0.0",()=>{
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});