import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadDotEnv } from "../src/utils/env";

loadDotEnv();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in .env");
    return;
  }

  console.log(`🔑 Found API Key: ${apiKey.slice(0, 5)}...${apiKey.slice(-5)}`);

  // 1. List Models via fetch (since SDK method is sometimes tricky)
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
        throw new Error(`Failed to list models: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log("---------------------------------------------------");
    console.log(`Found ${(data as any).models?.length || 0} models.`);
    const modelNames = (data as any).models?.map((m: any) => m.name) || [];
    console.log("Available models:", modelNames);
    console.log("---------------------------------------------------");

    // 2. Test Multiple Models for Availability
    console.log("\n🧪 Testing availability of 2.5 models...");
    const modelsToTest = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.5-pro",
      "gemini-3-flash-preview"
    ];

    const genAI = new GoogleGenerativeAI(apiKey);
    const workingModels: string[] = [];

    for (const modelName of modelsToTest) {
      process.stdout.write(`Testing ${modelName}... `);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        await response.text(); // Ensure we can read it
        console.log(`✅ SUCCESS`);
        workingModels.push(modelName);
      } catch (error: any) {
        console.log(`❌ FAILED`);
        if (error.status) console.log(`   Status: ${error.status}`);
      }
      // Short delay to avoid rate limiting the test itself
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log("\n🎉 Working Models Summary:");
    if (workingModels.length > 0) {
        console.log("You can use any of these in your env:");
        workingModels.forEach(m => console.log(`- ${m}`));
    } else {
        console.error("❌ No working models found. Check your API key quota.");
    }

  } catch (error: any) {
    console.error("❌ Error testing Gemini API:");
    console.error(error.message);
  }
}

testGemini();
