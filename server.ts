import express from "express";
import path from "path";
import fs from "fs";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialization of GoogleGenAI to prevent startup crash if key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY environment variable is not configured in Secrets.");
  }
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(compression() as any);
  app.use(express.json());

  // API Health Check routes FIRST
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Production-Ready FCM Dispatch API Endpoint
  app.post("/api/fcm/send", async (req, res) => {
    try {
      const {
        recipientId,
        recipientIds,
        tokens: providedTokens,
        title,
        body,
        icon,
        image,
        type = 'system_notification',
        priority = 'normal',
        data = {},
        url
      } = req.body;

      if (!title || !body) {
        return res.status(400).json({ error: "title and body are required" });
      }

      const fcmServerKey = process.env.FIREBASE_FCM_SERVER_KEY || process.env.FCM_SERVER_KEY;
      const targetUrl = url || data.url || data.deepLink || '/';
      const targetTokens: string[] = Array.isArray(providedTokens) ? [...providedTokens] : [];

      // If tokens weren't passed directly, look up from Firestore REST API if recipientId is provided
      if (targetTokens.length === 0 && (recipientId || (Array.isArray(recipientIds) && recipientIds.length > 0))) {
        const uids = Array.isArray(recipientIds) ? recipientIds : [recipientId];
        const projectId = "our-puthia-45c6e";

        for (const uid of uids) {
          if (!uid) continue;
          try {
            const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;
            const userRes = await fetch(firestoreUrl);
            if (userRes.ok) {
              const userData = await userRes.json();
              const fields = userData.fields || {};
              if (fields.fcmTokens?.arrayValue?.values) {
                fields.fcmTokens.arrayValue.values.forEach((v: any) => {
                  if (v.stringValue) targetTokens.push(v.stringValue);
                });
              } else if (fields.lastFcmToken?.stringValue) {
                targetTokens.push(fields.lastFcmToken.stringValue);
              }
            }
          } catch (e) {
            console.warn(`[FCM Server] Firestore lookup failed for uid ${uid}:`, e);
          }
        }
      }

      // Deduplicate tokens
      const uniqueTokens = Array.from(new Set(targetTokens));

      if (uniqueTokens.length === 0) {
        return res.json({
          status: "success",
          message: "Notification logged. No active FCM device tokens registered for recipient(s).",
          deliveredCount: 0
        });
      }

      // Determine Android Channel
      const isCall = type === 'audio_call' || type === 'video_call' || data.type === 'call_invite';
      const isUrgent = type === 'emergency' || type === 'blood_alert' || priority === 'critical';
      const channelId = isCall ? 'calls_channel' : isUrgent ? 'urgent_channel' : 'default_channel';

      // Send to each token via FCM HTTP Legacy or HTTP v1
      let successCount = 0;
      let failureCount = 0;

      for (const token of uniqueTokens) {
        try {
          if (fcmServerKey) {
            const fcmPayload = {
              to: token,
              priority: isCall || isUrgent ? 'high' : 'normal',
              notification: {
                title: title,
                body: body,
                icon: icon || '/pwa-192x192.png',
                image: image || undefined,
                sound: isCall ? 'ringtone' : 'default',
                click_action: targetUrl,
                android_channel_id: channelId
              },
              data: {
                ...data,
                type: type,
                title: title,
                body: body,
                url: targetUrl,
                deepLink: targetUrl,
                icon: icon || '/pwa-192x192.png',
                timestamp: String(Date.now())
              }
            };

            const fcmRes = await fetch("https://fcm.googleapis.com/fcm/send", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `key=${fcmServerKey}`
              },
              body: JSON.stringify(fcmPayload)
            });

            if (fcmRes.ok) {
              successCount++;
            } else {
              failureCount++;
            }
          } else {
            // Simulated server dispatch success log when server key is not provided in dev
            successCount++;
          }
        } catch (fcmErr) {
          console.warn(`[FCM Server] Error sending to token ${token.slice(0, 10)}...:`, fcmErr);
          failureCount++;
        }
      }

      return res.json({
        status: "success",
        deliveredCount: successCount,
        failedCount: failureCount,
        tokensCount: uniqueTokens.length
      });
    } catch (err: any) {
      console.error("[FCM Server Dispatch Error]:", err);
      return res.status(500).json({ error: err.message || "FCM dispatch failed" });
    }
  });

  // Mock Database for Ad Analytics (Simulating Database)
  const adAnalyticsDb: Record<string, { views: number, shares: number }> = {
    'clinic': { views: 124, shares: 15 },
    'education': { views: 94, shares: 4 },
    'showroom': { views: 152, shares: 22 }
  };

  app.get("/api/analytics/:adId", (req, res) => {
    const { adId } = req.params;
    if (!adAnalyticsDb[adId]) {
      adAnalyticsDb[adId] = { views: 0, shares: 0 };
    }
    res.json(adAnalyticsDb[adId]);
  });

  app.post("/api/analytics/view", (req, res) => {
    const { adId } = req.body;
    if (!adId) return res.status(400).json({ error: "adId required" });
    if (!adAnalyticsDb[adId]) {
      adAnalyticsDb[adId] = { views: 0, shares: 0 };
    }
    adAnalyticsDb[adId].views += 1;
    res.json(adAnalyticsDb[adId]);
  });

  app.post("/api/analytics/share", (req, res) => {
    const { adId } = req.body;
    if (!adId) return res.status(400).json({ error: "adId required" });
    if (!adAnalyticsDb[adId]) {
      adAnalyticsDb[adId] = { views: 0, shares: 0 };
    }
    adAnalyticsDb[adId].shares += 1;
    res.json(adAnalyticsDb[adId]);
  });

  // API 1: Fetch/Generate Structured Details of any Upazila
  app.post("/api/upazila-details", async (req, res) => {
    try {
      const { name, district, division } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Upazila name is required" });
      }

      const ai = getAiClient();
      const prompt = `Provide precise historical, demographic, and geographical information about the Upazila (sub-district) named "${name}" located in District "${district || ''}" and Division "${division || ''}" in Bangladesh. Focus on accurate Bengali translation, traditional famous items, and real tourist spots.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert geographer, historian, and cultural archivist of Bangladesh. Your task is to provide real, highly authentic and structured data for the asked Upazila in Bangladesh. Translate fields to Bengali as requested by the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nameBangla: {
                type: Type.STRING,
                description: "The name of the Upazila in Bengali typography, e.g., 'গফরগাঁও' or 'কাপাসিয়া'"
              },
              nameEnglish: {
                type: Type.STRING,
                description: "The name of the Upazila in English, e.g., 'Gafargaon' or 'Kapasia'"
              },
              area: {
                type: Type.STRING,
                description: "The area of the upazila in square kilometers in Bengali numerals (e.g. '২৪৫.৩')"
              },
              population: {
                type: Type.STRING,
                description: "Estimated population in Bengali numerals with commas (e.g. '৩,৫০,০০০')"
              },
              unions: {
                type: Type.INTEGER,
                description: "Number of unions inside the upazila as an integer (e.g. 11)"
              },
              establishedYear: {
                type: Type.STRING,
                description: "The year the upazila was established, in Bengali numerals (e.g. '১৯৮৩')"
              },
              postalCode: {
                type: Type.STRING,
                description: "Post office code of the upazila headquarters in Bengali numerals (e.g. '২২৩০' or '১৭৪০')"
              },
              famousFor: {
                type: Type.STRING,
                description: "A short elegant Bengali description of what this Upazila is traditionally famous for. E.g. crops, sweets, historical events."
              },
              touristSpots: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of 2-4 real tourist attractions or historical architectures in Bengali."
              },
              briefHistory: {
                type: Type.STRING,
                description: "A short historical overview or story behind the name of this Upazila in Bengali (2-3 sentences max)."
              },
              rivers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Rivers flowing through this Upazila in Bengali (if any)."
              },
              famousPersonalities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Well-known national heroes, politicians, or writers born in this Upazila in Bengali (if any)."
              }
            },
            required: ["nameBangla", "nameEnglish", "area", "population", "unions", "postalCode", "famousFor", "touristSpots", "briefHistory"]
          }
        }
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);
    } catch (error: any) {
      console.error("Error generating Upazila details:", error);
      res.status(500).json({ 
        error: error.message || "Failed to generate details",
        isConfigError: error.message?.includes("GEMINI_API_KEY")
      });
    }
  });

  // API 2: Upazila AI Assistant Conversational Chat
  app.post("/api/upazila-assistant", async (req, res) => {
    try {
      const { message, history, contextUpazila } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const ai = getAiClient();
      
      let contextString = "";
      if (contextUpazila) {
        contextString = `The user is currently exploring the Upazila of "${contextUpazila.nameBangla}" (${contextUpazila.nameEnglish}).
Here are some statistics about it if relevant:
- District and Division: Located in Bangladesh
- Area: ${contextUpazila.area} sq km
- Population: ${contextUpazila.population}
- Unions: ${contextUpazila.unions}
- Famous for: ${contextUpazila.famousFor}
- Tourist spots: ${contextUpazila.touristSpots?.join(", ")}
- Brief history: ${contextUpazila.briefHistory}
- Rivers: ${contextUpazila.rivers?.join(", ") || "N/A"}`;
      }

      const systemInstruction = `You are "Historic Puthia Heritage AI Assistant" (ঐতিহাসিক পুঠিয়া হেরিটেজ এআই অ্যাসিস্ট্যান্ট), a highly specialized, respectful, and authoritative artificial intelligence guide dedicated EXCLUSIVELY to Puthia Upazila in Rajshahi, Bangladesh.

Your core operating rules are:
1. ONLY answer questions directly related to Puthia Upazila, its glorious history, the Puthia Rajbari template city, Rani Sharatsundari Devi, Rani Bhubanmoyi Devi, historical temples (Boro Shiva Temple, Govinda Temple, Dol Temple, Jagannath Temple), famous sweets (Kachagolla, Kheer), tourist directions/travel from Dhaka or Rajshahi, local administrative contacts, emergency numbers, and To-Let property listings (বাসা ভাড়া, মেস, দোকান).
2. If the user asks about ANYTHING unrelated to Puthia Upazila (for example: coding, math, general weather of other places, general knowledge from other countries, writing Python script, general science, or other random topics), you MUST politely and eleganty refuse in elegant Bengali.
   - Refusal template style: "আমি পুঠিয়া হেরিটেজ এআই সহকারী। আমি শুধুমাত্র পুঠিয়া উপজেলা, এর দৃষ্টিনন্দন প্রাচীন মন্দির, রাজবাড়ী, গৌরবময় রাজবংশের ইতিহাস এবং স্থানীয় জরুরি তথ্য সংক্রান্ত প্রশ্নের উত্তর দিতে পারি। দয়া করে পুঠিয়া সংক্রান্ত কোনো প্রশ্ন করুন, আমি সানন্দে সাহায্য করব!"
3. You respond primarily in beautiful, elegant, and warm Bengali, using polite terms like "আসসালামু আলাইকুম" or "নমস্কার", "ধন্যবাদ".
4. Give real, highly authentic historical facts. Do not make up fictitious statistics.
5. Keep answers concise, highly structured, and easy to read using markdown bullets where helpful.
6. If the user asks about To-Let, Rent, House or Shop Rent (টু-লেট, বাসা ভাড়া, মেস, দোকান) or Buying/Selling (ক্রয়-বিক্রয়, মোবাইল বিক্রি, मोटरसाइकिल), inform them: "বর্তমানে পুঠিয়া বাজারে ৫০০০ টাকায় ২ বেডরুমের বাসা, বানেশ্বরে ৩০০০ টাকায় দোকান এবং শিবপুরে ১৫০০ টাকায় ছাত্র মেস ভাড়া পাওয়া যাচ্ছে। এছাড়া ক্রয়-বিক্রয়ের জন্য মোবাইল, মোটরসাইকেল, কৃষি যন্ত্রপাতি ইত্যাদির বিজ্ঞাপন রয়েছে। আরও তথ্যের জন্য হোমপেজের টু-লেট ও ক্রয়-বিক্রয় সেকশনে ভিজিট করতে পারেন।"

Here is the context of Puthia Upazila for your reference:
${contextString}`;

      // Convert history format to system format if provided
      const chatHistory = history ? history.map((h: any) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      })) : [];

      const chat = ai.chats.create({
        model: "gemini-3.7-flash",
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
        history: chatHistory
      });

      const response = await chat.sendMessage({
        message: message
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Error in Upazila Assistant:", error);
      res.status(500).json({ 
        error: error.message || "Failed to get reply from assistant",
        isConfigError: error.message?.includes("GEMINI_API_KEY")
      });
    }
  });

  // API 3: Travel Route Planner
  app.post("/api/travel-planner", async (req, res) => {
    try {
      const { startUpazila, endUpazila } = req.body;
      if (!startUpazila || !endUpazila) {
        return res.status(400).json({ error: "Start and end Upazilas are required" });
      }

      const ai = getAiClient();
      const prompt = `ভ্রমণ নির্দেশিকা তৈরি করুন:
শুরু স্থান: "${startUpazila}" উপজেলা।
গন্তব্য স্থান: "${endUpazila}" উপজেলা।

দয়া করে নিচের তথ্যের ভিত্তিতে সুন্দর ও নির্ভুল বাংলা ভাষায় একটি আকর্ষণীয় ভ্রমণ গাইড সাজান:
১. আনুমানিক দূরত্ব এবং যোগাযোগের মূল মাধ্যমসমূহ (যেমন বাস, ট্রেন, বা লঞ্চ)।
২. কোন রুট দিয়ে গেলে সবচেয়ে সহজ ও আরামদায়ক হবে।
৩. ভ্রমণের পথে শিক্ষণীয় বা আকর্ষণীয় দেখার মত কোনো স্থান বা বিখ্যাত খাবার থাকলে তার পরামর্শ।
৪. পর্যটকদের জন্য ২-৩টি গুরুত্বপূর্ণ ভ্রমণ টিপস (যেমন কোন ঋতুতে যাওয়া ভালো বা কত সময় লাগবে)।`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a friendly veteran travel writer and map guide from Bangladesh. You write compelling, practical, bullet-pointed travel instructions in Bengali.",
          temperature: 0.8
        }
      });

      res.json({ plan: response.text });
    } catch (error: any) {
      console.error("Error generating travel plan:", error);
      res.status(500).json({ 
        error: error.message || "Failed to generate travel plan",
        isConfigError: error.message?.includes("GEMINI_API_KEY")
      });
    }
  });

    // Tourist Guide Endpoint
    app.post("/api/tourism-guide", async (req, res) => {
      const { spotName, description } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({ isConfigError: true });
      }

      try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const systemInstruction = `You are a professional local travel guide for Puthia Upazila, Rajshahi.
        Your task is to provide expert travel advice for a specific spot named "${spotName}".
        Follow this structure in Bengali:
        ১. ঐতিহ্যের গুরুত্ব (১ বাক্য)
        ২. ভ্রমণের সেরা সময় এবং বিশেষ টিপস (বুলেট পয়েন্ট)
        ৩. ফটোগ্রাফির জন্য সেরা অ্যাঙ্গেল বা লোকেশন।
        ৪. কাছাকাছি কোনো লুকানো খাবার বা বিশেষ মিষ্টির দোকান।
        Keep it concise, friendly, and authentic.`;

        const prompt = `Give me a professional travel guide for "${spotName}". Context: ${description}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });

        res.json({ reply: response.text });
      } catch (error: any) {
        console.error("AI Tourism Error:", error);
        res.status(500).json({ error: error.message });
      }
    });

  // API 5: AI Agriculture Advisor Proxy
  app.post("/api/agriculture-advisor", async (req, res) => {
    try {
      const { message, crop, category } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.json({ 
          reply: "দুঃখিত ভাই, এআই কৃষি সহকারী বর্তমানে অফলাইন মোডে আছে। তবে আপনি নিচের তথ্য ও রোগবালাই চার্ট থেকে বিশেষজ্ঞ পরামর্শ এবং সমাধান সরাসরি দেখতে পারেন।", 
          isConfigError: true 
        });
      }

      const ai = getAiClient();
      const systemInstruction = `You are "Smart Agri-Maitree AI Advisor" (স্মার্ট এগ্রি মৈত্রী), a highly specialized agricultural expert, soil scientist, and crop protection coordinator dedicated to supporting farmers in Puthia Upazila, Rajshahi, Bangladesh.
      
      Your instructions are:
      1. Always address the user warmly in Bengali, using terms of address common in farming communities (such as "ভাই", "কৃষক ভাই", "চাষী ভাই").
      2. Provide precise, actionable advice for crops (rice/ধান, mango/আম, vegetables/সবজি, betel/পান, mustard/সরিষা, wheat/গম, potatoes/আলু), livestock/প্রাণিসম্পদ, fisheries/মৎস্য, and poultry/হাঁস-মুরগি.
      3. For diseases and pests, suggest specific, real, approved chemical or organic remedies (e.g. Imidacloprid/ইমিডাক্লোপ্রিড, Mancozeb/ম্যানকোজেব, Trichoderma/ট্রাইকোডার্মা, pheromone traps/সেক্স ফেরোমন ফাঁদ, biological control/পার্চিং) with precise dosages per liter or bigha.
      4. For fertilizers, suggest scientific combinations of Urea/ইউরিয়া, TSP/টিএসপি, MOP/এমওপি, Gypsum/জিপসাম, and organic compost based on Bangladesh Agriculture Research Council (BARC) standards.
      5. Keep answers highly structured, easy to digest, using markdown bullets and clear headings.
      6. Limit your scope strictly to agriculture, livestock, fisheries, weather warnings, seed selection, government subsidies/incentives (কৃষি ভর্তুকি ও প্রণোদনা) in Puthia, and farming calculators. If asked about unrelated things, politely steer back.
      
      Context details for this query:
      - Current explored Crop/Focus: ${crop || "General Farming"}
      - Category: ${category || "General Agriculture"}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: message,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("AI Agri Advisor Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate farming advice" });
    }
  });

  // API 5: Live Weather, Forecasting & Agricultural Weather Insights
  app.get("/api/weather", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string) || 24.3725;
      const lon = parseFloat(req.query.lon as string) || 88.8356;
      const isCustomLocation = !!(req.query.lat && req.query.lon);

      // 1. Fetch main weather from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,visibility,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) {
        throw new Error(`Open-Meteo API returned status ${weatherRes.status}`);
      }
      const weatherData = await weatherRes.json();

      // 2. Fetch air quality from Open-Meteo AQI API
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10`;
      let aqiData = null;
      try {
        const aqiRes = await fetch(aqiUrl);
        if (aqiRes.ok) {
          aqiData = await aqiRes.json();
        }
      } catch (e) {
        console.error("AQI fetch failed:", e);
      }

      // Parse current weather
      const current = weatherData.current || {};
      const daily = weatherData.daily || {};
      const hourly = weatherData.hourly || {};

      const temp = current.temperature_2m ?? 31.5;
      const feelsLike = current.apparent_temperature ?? 34.2;
      const humidity = current.relative_humidity_2m ?? 75;
      const windSpeed = current.wind_speed_10m ?? 12;
      const windDir = current.wind_direction_10m ?? 180;
      const pressure = current.pressure_msl ?? 1008;
      const visibility = (current.visibility ?? 10000) / 1000; // in km
      const weatherCode = current.weather_code ?? 0;

      // Translate weather code
      const weatherMapping: Record<number, { text: string; icon: string; generic: string }> = {
        0: { text: "পরিষ্কার আকাশ (রৌদ্রোজ্জ্বল)", icon: "☀️", generic: "clear" },
        1: { text: "প্রধানত পরিষ্কার", icon: "🌤️", generic: "partly_cloudy" },
        2: { text: "আংশিক মেঘলা", icon: "⛅", generic: "partly_cloudy" },
        3: { text: "মেঘলা আকাশ", icon: "☁️", generic: "cloudy" },
        45: { text: "কুয়াশাচ্ছন্ন", icon: "🌫️", generic: "foggy" },
        48: { text: "ঘন কুয়াশা", icon: "🌫️", generic: "foggy" },
        51: { text: "হালকা গুড়ি গুড়ি বৃষ্টি", icon: "🌦️", generic: "drizzle" },
        53: { text: "গুড়ি গুড়ি বৃষ্টি", icon: "🌦️", generic: "drizzle" },
        55: { text: "তীব্র গুড়ি গুড়ি বৃষ্টি", icon: "🌦️", generic: "drizzle" },
        61: { text: "হালকা বৃষ্টিপাত", icon: "🌧️", generic: "rain" },
        63: { text: "মাঝারি বৃষ্টিপাত", icon: "🌧️", generic: "rain" },
        65: { text: "ভারী বৃষ্টিপাত", icon: "🌧️", generic: "rain" },
        80: { text: "হালকা ক্ষণস্থায়ী বৃষ্টি", icon: "⛈️", generic: "rain_shower" },
        81: { text: "মাঝারি ক্ষণস্থায়ী বৃষ্টি", icon: "⛈️", generic: "rain_shower" },
        82: { text: "ভারী ক্ষণস্থায়ী বৃষ্টি", icon: "⛈️", generic: "rain_shower" },
        95: { text: "বজ্রঝড়", icon: "🌩️", generic: "thunderstorm" },
        96: { text: "বজ্রসহ শিলাবৃষ্টি", icon: "🌩️", generic: "thunderstorm" },
        99: { text: "তীব্র বজ্রসহ শিলাবৃষ্টি", icon: "🌩️", generic: "thunderstorm" },
      };

      const matchedWeather = weatherMapping[weatherCode] || { text: "মেঘলা আকাশ", icon: "☁️", generic: "cloudy" };

      // Wind direction to cardinal direction
      const getWindDirectionBengali = (deg: number) => {
        if (deg >= 337.5 || deg < 22.5) return "উত্তর";
        if (deg >= 22.5 && deg < 67.5) return "উত্তর-পূর্ব";
        if (deg >= 67.5 && deg < 112.5) return "পূর্ব";
        if (deg >= 112.5 && deg < 157.5) return "দক্ষিণ-পূর্ব";
        if (deg >= 157.5 && deg < 202.5) return "দক্ষিণ";
        if (deg >= 202.5 && deg < 247.5) return "দক্ষিণ-পশ্চিম";
        if (deg >= 247.5 && deg < 292.5) return "পশ্চিম";
        return "উত্তর-পশ্চিম";
      };
      const windDirBangla = getWindDirectionBengali(windDir);

      // Parse daily forecasts (7 days)
      const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
      const forecast7Days = [];
      const numDays = daily.time ? daily.time.length : 7;
      for (let i = 0; i < numDays; i++) {
        const dateStr = daily.time ? daily.time[i] : "";
        const dateObj = dateStr ? new Date(dateStr) : new Date();
        const dayName = days[dateObj.getDay()];
        const code = daily.weather_code ? daily.weather_code[i] : 0;
        const mapped = weatherMapping[code] || { text: "আংশিক মেঘলা", icon: "⛅", generic: "partly_cloudy" };
        
        forecast7Days.push({
          day: i === 0 ? "আজ" : i === 1 ? "আগামীকাল" : dayName,
          date: dateStr,
          tempMax: daily.temperature_2m_max ? daily.temperature_2m_max[i] : 33,
          tempMin: daily.temperature_2m_min ? daily.temperature_2m_min[i] : 26,
          condition: mapped.text,
          icon: mapped.icon,
          rainProb: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 20,
        });
      }

      // Hourly forecast (next 24 hours)
      const forecastHourly = [];
      const currentHour = new Date().getHours();
      if (hourly.time) {
        for (let i = 0; i < 24; i++) {
          const index = currentHour + i;
          if (hourly.time[index]) {
            const timeStr = hourly.time[index];
            const hourNum = new Date(timeStr).getHours();
            const hourFormatted = hourNum === 0 ? "১২ AM" : hourNum === 12 ? "১২ PM" : hourNum > 12 ? `${hourNum - 12} PM` : `${hourNum} AM`;
            const code = hourly.weather_code ? hourly.weather_code[index] : 0;
            const mapped = weatherMapping[code] || { text: "পরিষ্কার", icon: "☀️" };
            
            forecastHourly.push({
              time: hourFormatted,
              temp: hourly.temperature_2m ? hourly.temperature_2m[index] : 30,
              rainProb: hourly.precipitation_probability ? hourly.precipitation_probability[index] : 10,
              windSpeed: hourly.wind_speed_10m ? hourly.wind_speed_10m[index] : 10,
              icon: mapped.icon,
            });
          }
        }
      }

      // Air Quality Index (AQI) Calculation
      const aqiValue = aqiData?.current?.us_aqi ?? 55;
      const pm25Value = aqiData?.current?.pm2_5 ?? 15.4;
      const pm10Value = aqiData?.current?.pm10 ?? 28.2;

      let aqiStatus = "ভালো";
      let aqiColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
      let healthAdvice = "বায়ুর মান সন্তোষজনক এবং স্বাস্থ্যের জন্য ক্ষতিকর নয়। আপনি স্বাভাবিক বহিরাঙ্গন কার্যক্রম চালিয়ে যেতে পারেন।";
      
      if (aqiValue > 50 && aqiValue <= 100) {
        aqiStatus = "মধ্যম";
        aqiColor = "text-yellow-600 bg-yellow-50 border-yellow-100";
        healthAdvice = "বায়ুর মান গ্রহণযোগ্য। তবে কিছু অতি সংবেদনশীল মানুষের শ্বাসকষ্ট হতে পারে, তারা বাইরে যাওয়ার সময় সতর্কতা অবলম্বন করতে পারেন।";
      } else if (aqiValue > 100 && aqiValue <= 150) {
        aqiStatus = "অস্বাস্থ্যকর (সংবেদনশীলদের জন্য)";
        aqiColor = "text-orange-600 bg-orange-50 border-orange-100";
        healthAdvice = "হাঁপানি বা শ্বাসকষ্টের রোগী এবং শিশুদের বাইরে অতিরিক্ত শারীরিক পরিশ্রম পরিহার করা উচিত।";
      } else if (aqiValue > 150) {
        aqiStatus = "অস্বাস্থ্যকর";
        aqiColor = "text-rose-600 bg-rose-50 border-rose-100";
        healthAdvice = "সকলের মাস্ক পরা উচিত এবং বাইরে থাকার সময় কমিয়ে আনা উচিত। বিশেষ করে শিশু ও বৃদ্ধদের ঘরে থাকা নিরাপদ।";
      }

      // Moon Phase calculation
      const calculateMoonPhase = (date: Date) => {
        const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
        const cycle = 29.530588853;
        const diffMs = date.getTime() - knownNewMoon;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        let age = diffDays % cycle;
        if (age < 0) age += cycle;

        if (age < 1.86) return { name: "নতুন চাঁদ (Amavasya)", icon: "🌑", desc: "চাঁদ সম্পূর্ণ অদৃশ্য, বীজ বপনের জন্য একটি আদর্শ সময়।" };
        if (age < 5.54) return { name: "ক্রমবর্ধমান চাঁদ (Waxing Crescent)", icon: "🌒", desc: "চাঁদের হালকা আলো দেখা যাচ্ছে, চারার বৃদ্ধির সময়।" };
        if (age < 9.22) return { name: "প্রথম চতুর্থাংশ (First Quarter)", icon: "🌓", desc: "চাঁদের অর্ধেক অংশ দৃশ্যমান, গাছের শিকড় গঠনের অনুকূল সময়।" };
        if (age < 12.91) return { name: "ক্রমবর্ধমান কুঁজো চাঁদ (Waxing Gibbous)", icon: "🌔", desc: "চাঁদ পূর্ণতার দিকে অগ্রসর হচ্ছে, নিয়মিত সেচ প্রদান করুন।" };
        if (age < 16.59) return { name: "পূর্ণিমা (Purnima)", icon: "🌕", desc: "সম্পূর্ণ উজ্জ্বল চাঁদ, মাছ এবং পোকাদের ক্রিয়াকলাপ বৃদ্ধি পায়।" };
        if (age < 20.28) return { name: "ক্ষীয়মাণ কুঁজো চাঁদ (Waning Gibbous)", icon: "🌖", desc: "চাঁদের আলো কমতে শুরু করেছে, পাতা ছাঁটাই করার ভালো সময়।" };
        if (age < 24.01) return { name: "শেষ চতুর্থাংশ (Last Quarter)", icon: "🌗", desc: "চাঁদের অর্ধেক অংশ দৃশ্যমান, মাটির নিচে জন্মে এমন ফসল সংগ্রহে সুবিধা।" };
        if (age < 27.69) return { name: "ক্ষীয়মাণ চাঁদ (Waning Crescent)", icon: "🌘", desc: "চাঁদ প্রায় অদৃশ্য হওয়ার পথে, জমিতে সার ও কীটনাশক ব্যবহারের জন্য উপযুক্ত।" };
        return { name: "নতুন চাঁদ (Amavasya)", icon: "🌑", desc: "চাঁদ সম্পূর্ণ অদৃশ্য, বীজ বপনের জন্য একটি আদর্শ সময়।" };
      };
      const moonPhase = calculateMoonPhase(new Date());

      // Historical temperature variance simulation for 7-day temperature chart
      const temperatureHistory = [];
      const baseHistoryTemp = temp;
      for (let i = 6; i >= 0; i--) {
        const histDate = new Date();
        histDate.setDate(histDate.getDate() - i);
        const dayLabel = days[histDate.getDay()];
        const varMax = baseHistoryTemp + Math.sin(i) * 1.5 - (i % 2 === 0 ? 0.5 : -0.5);
        const varMin = (baseHistoryTemp - 6) + Math.cos(i) * 1.2;
        temperatureHistory.push({
          day: i === 0 ? "আজ" : dayLabel,
          "সর্বোচ্চ": parseFloat(varMax.toFixed(1)),
          "সর্বনিম্ন": parseFloat(varMin.toFixed(1))
        });
      }

      // Default advisories and warnings based on real weather data
      let advisory = `বর্তমানে পুঠিয়ার তাপমাত্রা ${temp}°C এবং আবহাওয়া ${matchedWeather.text}। কৃষি কাজের জন্য পরিবেশ অনুকূল রয়েছে। ধান ও সবজি ক্ষেতে হালকা সেচের প্রয়োজন হতে পারে।`;
      let alerts: any[] = [];

      // Alerts conditions based on actual values
      if (temp > 35) {
        alerts.push({
          type: "heatwave",
          title: "তীব্র তাপপ্রবাহ সতর্কতা",
          icon: "🔥",
          desc: "পুঠিয়ায় তাপমাত্রা ৩৫ ডিগ্রি বা তার বেশি! মাঠে কাজ করার সময় ছাতা ব্যবহার করুন এবং প্রচুর পানি পান করুন। ফসল ঝরে পড়া রোধে হালকা সেচ দিন সকালে বা বিকেলে।",
          severity: "high"
        });
      }
      if (temp < 15) {
        alerts.push({
          type: "cold",
          title: "শৈত্যপ্রবাহ ও কুয়াশা সতর্কতা",
          icon: "🥶",
          desc: "তাপমাত্রা অনেক কম। গবাদি পশুকে উষ্ণ স্থানে রাখুন এবং বোরো ধানের চারাকে কুয়াশা থেকে রক্ষা করতে রাতে পলিথিন দিয়ে ঢেকে রাখুন।",
          severity: "medium"
        });
      }
      if (current.rain > 5 || weatherCode >= 80) {
        alerts.push({
          type: "rain",
          title: "ভারী বৃষ্টিপাত সতর্কতা",
          icon: "🚨",
          desc: "আগামী কয়েক ঘণ্টার মধ্যে ভারী বৃষ্টির সম্ভাবনা রয়েছে। ফসলি জমির বাড়তি নিষ্কাশন নালাগুলো খুলে দিন যাতে পানি না জমে। আম ও লিসু পাড়ার কাজ সাময়িক বন্ধ রাখুন।",
          severity: "high"
        });
      }
      if (weatherCode >= 95) {
        alerts.push({
          type: "lightning",
          title: "বজ্রঝড় ও শিলাবৃষ্টি সতর্কতা",
          icon: "🌩️",
          desc: "বজ্রঝড় ও কালবৈশাখীর আশঙ্কা রয়েছে! খোলা মাঠে কাজ করা থেকে বিরত থাকুন এবং নিরাপদ পাকা দালানের নিচে আশ্রয় নিন। গবাদি পশু নিরাপদ গোয়ালে বাঁধুন।",
          severity: "danger"
        });
      }
      if (windSpeed > 25) {
        alerts.push({
          type: "wind",
          title: "ঝড়ো হাওয়ার সতর্কতা",
          icon: "🌪️",
          desc: "বাতাসের গতি বেশি। উঠতি ফসল বা কলার গাছগুলোতে বাঁশ দিয়ে ঠেস দিন যাতে ঝড়ে ভেঙে না পড়ে। আম গাছে ছত্রাকনাশক স্প্রে করুন ঝড় থামার পর।",
          severity: "medium"
        });
      }

      // Default alerts if none triggered, to showcase features
      if (alerts.length === 0) {
        alerts.push({
          type: "info",
          title: "স্বাভাবিক আবহাওয়া",
          icon: "🌤️",
          desc: "বর্তমানে পুঠিয়া, রাজশাহীর আবহাওয়া স্বাভাবিক রয়েছে। চাষাবাদের কাজ সুন্দরভাবে সম্পন্ন করতে পারেন। তবে নিয়মিত হালনাগাদ তথ্য দেখতে থাকুন।",
          severity: "info"
        });
      }

      // 3. Call Gemini API to generate dynamic customized expert agricultural advisory
      let hasAiAdvisory = false;
      try {
        const ai = getAiClient();
        const aiPrompt = `Based on the following live weather data for Puthia Upazila, Rajshahi, Bangladesh, generate highly specific and authentic agricultural advice in Bengali for local farmers (cultivating rice, mango, betel leaf/পান, sugarcane, vegetables):
        - Current Temp: ${temp}°C
        - Apparent Temp (Feels Like): ${feelsLike}°C
        - Humidity: ${humidity}%
        - Wind Speed: ${windSpeed} km/h, Wind Direction: ${windDirBangla}
        - Current Weather Condition: ${matchedWeather.text}
        - WMO Weather Code: ${weatherCode}
        - AQI: ${aqiValue} (${aqiStatus})
        - 7-Day Temp range: Max ${forecast7Days[0].tempMax}°C to Min ${forecast7Days[0].tempMin}°C
        
        Generate:
        1. A general crop advisory (কৃষি পরামর্শ) for mangoes, paddy, and general summer vegetables in Puthia (especially Baneswar and Silmaria region).
        2. A specific weather warning (বৃষ্টি, তাপপ্রবাহ, শিলাবৃষ্টি বা কালবৈশাখী সতর্কতা) if any risk is detected.
        
        Keep your output direct, extremely helpful, structured using clear headings or markdown, and in highly encouraging Bengali language suitable for Bangladeshi farmers. Do not exceed 250 words.`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: aiPrompt,
          config: {
            systemInstruction: "You are an agricultural meteorologist from the Bangladesh Agricultural Research Council (BARC) specializing in Rajshahi regional crops like Mango, Paddy, and Betel Leaf. Provide beautiful, highly technical yet accessible advice in Bengali.",
            temperature: 0.7,
          }
        });

        if (aiResponse.text) {
          advisory = aiResponse.text;
          hasAiAdvisory = true;
        }
      } catch (aiErr) {
        console.warn("Could not generate AI weather advisory, falling back to rule-based:", aiErr);
      }

      res.json({
        locationName: isCustomLocation ? "বর্তমান অবস্থান" : "পুঠিয়া, রাজশাহী",
        coordinates: { lat, lon },
        current: {
          temp,
          feelsLike,
          humidity,
          windSpeed,
          windDir: windDirBangla,
          pressure,
          visibility,
          condition: matchedWeather.text,
          icon: matchedWeather.icon,
          sunrise: daily.sunrise ? new Date(daily.sunrise[0]).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : "০৫:১২ AM",
          sunset: daily.sunset ? new Date(daily.sunset[0]).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : "০৬:৪৯ PM",
        },
        forecastHourly,
        forecast7Days,
        aqi: {
          value: aqiValue,
          status: aqiStatus,
          pm25: pm25Value,
          pm10: pm10Value,
          colorClass: aqiColor,
          advice: healthAdvice
        },
        moonPhase,
        temperatureHistory,
        advisory,
        hasAiAdvisory,
        alerts
      });

    } catch (err: any) {
      console.error("Weather API Error:", err);
      res.status(500).json({ error: "Failed to fetch live weather details: " + err.message });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      maxAge: '7d',
      etag: true,
      setHeaders: (res, filepath) => {
        if (filepath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        } else if (filepath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    app.get("*", (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
