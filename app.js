import {
  Bot,
  InlineKeyboard,
  GrammyError,
  HttpError,
  webhookCallback,
} from "grammy";
import { createServer } from "http";

const bot = new Bot(
  process.env.BOT_TOKEN || "8365665338:AAH4UhL1VDBpOrFJSI8iBBKoqEkV6DYYLHk",
);
const CHANNEL_ID = "@slidemind";

// Set the bot's command menu
bot.api.setMyCommands([
  { command: "start", description: "🚀 Ilovani ishga tushirish" },
  { command: "help", description: "❓ Yordam va ma'lumot" },
]);

async function isSubscribed(ctx) {
  try {
    const member = await ctx.api.getChatMember(CHANNEL_ID, ctx.from.id);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch (error) {
    if (
      error.description &&
      error.description.includes("member list is inaccessible")
    ) {
      console.error(
        `CRITICAL ERROR: The bot cannot check member status in ${CHANNEL_ID}.\n` +
          `Please add the bot as an ADMINISTRATOR to the channel ${CHANNEL_ID} to fix this.`,
      );
    } else {
      console.error("Error checking subscription:", error);
    }
    return false;
  }
}

bot.command("start", async (ctx) => {
  const subscribed = await isSubscribed(ctx);

  if (subscribed) {
    const keyboard = new InlineKeyboard()
      .webApp("🚀 Slidemind ilovasini ochish", "https://slidemind.uz/")
      .row()
      .url("🌐 Saytga o'tish", "https://slidemind.uz/");

    await ctx.reply(
      `<b>Xush kelibsiz, ${ctx.from.first_name}!</b> 👋\n\n` +
        `✨ <b>Slidemind</b> — bu sizning intellektual yordamchingiz!\n\n` +
        `Siz bu yerda:\n` +
        `• 🤖 <b>AI</b> yordamida slaydlar yaratishingiz\n` +
        `• 🎨 <b>Premium</b> dizaynlardan foydalanishingiz\n` +
        `• 📄 <b>PPTX/PDF</b> formatida yuklab olishingiz mumkin\n\n` +
        `💻 Bizning sayt: <a href="https://slidemind.uz">slidemind.uz</a>\n\n` +
        `👇 Ilovani ishga tushirish uchun quyidagi tugmani bosing:`,
      {
        reply_markup: keyboard,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      },
    );
  } else {
    const keyboard = new InlineKeyboard()
      .url(
        "📢 Kanalga a'zo bo'lish",
        `https://t.me/${CHANNEL_ID.replace("@", "")}`,
      )
      .row()
      .text("✅ A'zolikni tekshirish", "check_subscription")
      .row()
      .url("🌐 Saytga o'tish", "https://slidemind.uz/");

    await ctx.reply(
      `<b>Assalomu alaykum, ${ctx.from.first_name}!</b> 😊\n\n` +
        `Sizni <b>Slidemind</b> botida ko'rganimizdan xursandmiz!\n\n` +
        `⚠️ <b>Diqqat:</b> Botdan to'liq foydalanish uchun rasmiy kanalimizga a'zo bo'lishingiz lozim.\n\n` +
        `1️⃣ Pastdagi tugma orqali kanalga kiring\n` +
        `2️⃣ A'zo bo'lgach <b>"A'zolikni tekshirish"</b> tugmasini bosing\n\n` +
        `🌐 Saytimiz: <a href="https://slidemind.uz">slidemind.uz</a>`,
      {
        reply_markup: keyboard,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      },
    );
  }
});

bot.callbackQuery("check_subscription", async (ctx) => {
  const subscribed = await isSubscribed(ctx);

  if (subscribed) {
    const keyboard = new InlineKeyboard()
      .webApp("🚀 Slidemind ilovasini ochish", "https://slidemind.uz/")
      .row()
      .url("🌐 Saytga o'tish", "https://slidemind.uz/");

    await ctx.editMessageText(
      `<b>Tabriklaymiz!</b> 🎉\n\n` +
        `Siz muvaffaqiyatli ro'yxatdan o'tdingiz. Endi barcha imkoniyatlar siz uchun ochiq! ✨\n\n` +
        `💻 Bizning sayt: <a href="https://slidemind.uz">slidemind.uz</a>\n\n` +
        `👇 Taqdimot yaratishni boshlash uchun quyidagi tugmani bosing:`,
      {
        reply_markup: keyboard,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      },
    );
  } else {
    await ctx.answerCallbackQuery({
      text: "❌ Kechirasiz, siz hali kanalga a'zo bo'lmadingiz. Iltimos, qaytadan urinib ko'ring.",
      show_alert: true,
    });
  }
});

bot.command("help", (ctx) => {
  ctx.reply(
    `<b>📚 Slidemind — Yo'riqnoma</b>\n\n` +
      `Ushbu bot orqali siz sun'iy intellekt yordamida professional taqdimotlar tayyorlashingiz mumkin.\n\n` +
      `<b>Asosiy buyruqlar:</b>\n` +
      `• /start — Botni ishga tushirish\n` +
      `• /help — Yordam olish\n\n` +
      `<b>Imkoniyatlar:</b>\n` +
      `• ✨ Tezkor slaydlar yaratish\n` +
      `• 📊 Ma'lumotlarni vizuallash\n` +
      `• 💾 Fayllarni eksport qilish\n\n` +
      `🌐 Sayt: <a href="https://slidemind.uz">slidemind.uz</a>\n` +
      `🆘 Qo'llab-quvvatlash: @Jamshidbek_Rasulov`,
    {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    },
  );
});

// Error handling
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

// --- Serverless / Webhook Configuration ---

const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN?.trim();

if (process.env.NODE_ENV === "production" || process.env.VERCEL || DOMAIN) {
  // Production: Use Webhooks (Serverless)
  console.log(`Starting in WEBHOOK mode on port ${PORT}`);

  const server = createServer(webhookCallback(bot, "http"));

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
} else {
  // Development: Use Long Polling
  console.log("Starting in LONG POLLING mode");
  bot.start();
}
