import { createClient } from "redis";

async function run() {
  const client = createClient({ url: "redis://localhost:6379" });
  await client.connect();
  
  const drivers = [
    "35829590-253c-4427-97a0-a29af853d801",
    "c918f8ae-bfe0-49ea-a762-da28c684043a"
  ];
  for (const driverId of drivers) {
    await client.sAdd("driver:available", driverId);
    await client.sAdd("driver:vehicle:ECONOMY", driverId);
  }
  
  const testSet = await client.sMembers("driver:available");
  console.log("driver:available:", testSet);
  
  await client.quit();
}
run().catch(console.error);
