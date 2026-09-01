import { store } from "../lib/services/data-store";

async function runSeed() {
  console.log("🚀 Seeding Personal Log Book database...");
  await store.initDefaultData();
  console.log(`✅ Categories seeded: ${store.categories.length}`);
  console.log(`✅ Initial logbooks seeded: ${store.logbooks.length}`);
  console.log(`✅ Profile initialized for: ${store.profile.name}`);
  console.log("🎉 Database seeding completed successfully!");
}

runSeed().catch((err) => {
  console.error("❌ Seeding error:", err);
  process.exit(1);
});
