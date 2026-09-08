import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  postId: string;
  platform: string;
  content: string;
  visualIdea?: string;
  language?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse(401, "Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return errorResponse(401, "Invalid authentication token");
    }

    const body: GenerateRequest = await req.json();
    const { postId, platform, content, visualIdea, language = "en" } = body;

    if (!postId || !platform || !content) {
      return errorResponse(400, "Missing required fields: postId, platform, content");
    }

    const { data: post } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!post) {
      return errorResponse(404, "Post not found");
    }

    await supabase
      .from("posts")
      .update({ status: "generating_content" })
      .eq("id", postId);

    const generated = await generateContent(platform, content, visualIdea, language);

    const { data: existing } = await supabase
      .from("generated_contents")
      .select("id")
      .eq("post_id", postId)
      .maybeSingle();

    let savedContent;
    if (existing) {
      const { data: updated } = await supabase
        .from("generated_contents")
        .update(generated)
        .eq("post_id", postId)
        .select()
        .single();
      savedContent = updated;
    } else {
      const { data: created } = await supabase
        .from("generated_contents")
        .insert({ post_id: postId, ...generated })
        .select()
        .single();
      savedContent = created;
    }

    await supabase
      .from("posts")
      .update({ status: "content_generated" })
      .eq("id", postId);

    return jsonResponse({ success: true, content: savedContent });
  } catch (err) {
    return errorResponse(500, err.message || "Internal server error");
  }
});

async function generateContent(
  platform: string,
  content: string,
  visualIdea: string | undefined,
  language: string
): Promise<Record<string, any>> {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(11, 0, 0, 0);

  const suggestedTime = tomorrow.toISOString();

  if (platform === "instagram") {
    return generateInstagramContent(content, visualIdea, language, suggestedTime);
  } else if (platform === "twitter") {
    return generateTwitterContent(content, language, suggestedTime);
  } else if (platform === "youtube") {
    return generateYouTubeContent(content, visualIdea, language, suggestedTime);
  }

  return {
    content_type: "text_and_hashtags",
    generated_text: content,
    suggested_hashtags: "",
    suggested_publish_time: suggestedTime,
  };
}

function generateInstagramContent(
  content: string,
  visualIdea: string | undefined,
  language: string,
  suggestedTime: string
): Record<string, any> {
  const isFa = language === "fa";

  const hooksEn = [
    `Ready for this? ${content}`,
    `Here's something I've been excited to share: ${content}`,
    `This changed everything for me. ${content}`,
    `Let's talk about ${content}`,
  ];

  const hooksFa = [
    `آماده‌ای برای این؟ ${content}`,
    `چندی هست می‌خواستم اینو به اشتراک بذارم: ${content}`,
    `این همه چیز رو برام تغییر داد. ${content}`,
    `بیایید درباره ${content} صحبت کنیم`,
  ];

  const hooks = isFa ? hooksFa : hooksEn;
  const hook = hooks[Math.floor(Math.random() * hooks.length)];

  const ctasEn = [
    "Double tap if you agree!",
    "Save this for later!",
    "Share with someone who needs this!",
    "Drop a comment with your thoughts!",
    "Follow for more content like this!",
  ];

  const ctasFa = [
    "اگه موافقی دابل تپ کن!",
    "برای بعد ذخیره کن!",
    "با کسی که اینو نیاز داره به اشتراک بذار!",
    "نظرت رو کامنت کن!",
    "برای محتوای بیشتر فالو کن!",
  ];

  const ctas = isFa ? ctasFa : ctasEn;
  const cta = ctas[Math.floor(Math.random() * ctas.length)];

  const bodyText = isFa
    ? `${hook}\n\n${visualIdea ? `تصویری که در ذهن دارم: ${visualIdea}` : ""}\n\n${cta}`
    : `${hook}\n\n${visualIdea ? `Visual concept: ${visualIdea}` : ""}\n\n${cta}`;

  const hashtagSets = {
    en: [
      "#contentcreator #socialmedia #instagram #instagood #instadaily #contentstrategy #digitalmarketing #brandbuilding #engagement #growyouraccount",
      "#instabusiness #contentmarketing #socialmediatips #creatoreconomy #instagramgrowth #viralpost #explore #trending #postoftheday #contentcreation",
    ],
    fa: [
      "#اینستاگرام #تولیدمحتوا #بازاریابی #کسبوکار #رشداینستاگرام #محتوایروزانه #اینستاگرامر #پست_روز #ترند #فالو",
      "#مدیریت_شبکه_اجتماعی #استراتژی_محتوا #برندسازی #آموزش_اینستاگرام #تعامل #بازار_هدف #محتوای_حرفه‌ای #رشد_پیج #اینستاگرام_مارکتینگ",
    ],
  };

  const hashtags = (isFa ? hashtagSets.fa : hashtagSets.en)[Math.floor(Math.random() * 2)];

  return {
    content_type: "text_and_hashtags",
    generated_text: bodyText,
    suggested_hashtags: hashtags,
    suggested_publish_time: suggestedTime,
  };
}

function generateTwitterContent(
  content: string,
  language: string,
  suggestedTime: string
): Record<string, any> {
  const isFa = language === "fa";

  const tweetsEn: string[] = [];
  const words = content.split(" ");

  if (content.length <= 280) {
    tweetsEn.push(content);
  } else {
    let tweet = "";
    for (const word of words) {
      if ((tweet + " " + word).length > 270) {
        tweetsEn.push(tweet.trim());
        tweet = word;
      } else {
        tweet += " " + word;
      }
    }
    if (tweet.trim()) tweetsEn.push(tweet.trim());
  }

  tweetsEn[0] = `🧵 ${tweetsEn[0]}`;
  if (tweetsEn.length > 1) {
    tweetsEn[tweetsEn.length - 1] += "\n\nFollow for more insights!";
  }

  const tweetsFa: string[] = [];
  if (content.length <= 280) {
    tweetsFa.push(content);
  } else {
    const faWords = content.split(" ");
    let tweet = "";
    for (const word of faWords) {
      if ((tweet + " " + word).length > 270) {
        tweetsFa.push(tweet.trim());
        tweet = word;
      } else {
        tweet += " " + word;
      }
    }
    if (tweet.trim()) tweetsFa.push(tweet.trim());
  }

  tweetsFa[0] = `🧵 ${tweetsFa[0]}`;
  if (tweetsFa.length > 1) {
    tweetsFa[tweetsFa.length - 1] += "\n\nبرای محتوای بیشتر فالو کنید!";
  }

  const tweets = isFa ? tweetsFa : tweetsEn;

  const hashtags = isFa
    ? "#توییتر #تولیدمحتوا #رشد #بازاریابی"
    : "#contentcreation #twitter #socialmedia #growth";

  return {
    content_type: "thread",
    generated_text: tweets[0],
    thread_tweets: tweets,
    suggested_hashtags: hashtags,
    suggested_publish_time: suggestedTime,
  };
}

function generateYouTubeContent(
  content: string,
  visualIdea: string | undefined,
  language: string,
  suggestedTime: string
): Record<string, any> {
  const isFa = language === "fa";

  const titlesEn = [
    `${content} - Complete Guide 2026`,
    `How to Master ${content} (Step by Step)`,
    `The Ultimate ${content} Tutorial`,
    `${content}: Everything You Need to Know`,
  ];

  const titlesFa = [
    `${content} - راهنمای کامل ۲۰۲۶`,
    `آموزش ${content} قدم به قدم`,
    `${content}: همه چیز که باید بدانید`,
    `تسلط بر ${content} در یک ویدیو`,
  ];

  const title = isFa
    ? titlesFa[Math.floor(Math.random() * titlesFa.length)]
    : titlesEn[Math.floor(Math.random() * titlesEn.length)];

  const descEn = `In this video, we cover ${content} in detail.\n\n${visualIdea ? `Visual concept: ${visualIdea}` : ""}\n\nChapters:\n0:00 Introduction\n1:30 Main Topic\n5:00 Tips & Tricks\n8:00 Conclusion\n\nDon't forget to like, subscribe, and hit the bell icon for more content!`;

  const descFa = `در این ویدیو، به طور کامل درباره ${content} صحبت می‌کنیم.\n\n${visualIdea ? `تصویر مورد نظر: ${visualIdea}` : ""}\n\nفصل‌بندی:\n0:00 مقدمه\n1:30 موضوع اصلی\n5:00 نکات و ترفندها\n8:00 نتیجه‌گیری\n\nفراموش نکنید لایک کنید، سابسکرایب کنید و زنگوله رو بزنید!`;

  const description = isFa ? descFa : descEn;

  const tagsEn = `${content}, ${content} tutorial, ${content} guide, how to, educational, 2026, tutorial, step by step, guide`;
  const tagsFa = `${content}, آموزش ${content}, راهنمای ${content}, آموزش, ۱۴۰۴, آموزش قدم به قدم`;

  const tags = isFa ? tagsFa : tagsEn;

  return {
    content_type: "youtube_seo",
    generated_text: description,
    seo_title: title,
    seo_description: description,
    seo_tags: tags,
    suggested_hashtags: tags.split(", ").map((t: string) => "#" + t.replace(/\s+/g, "")).slice(0, 8).join(" "),
    suggested_publish_time: suggestedTime,
  };
}

function jsonResponse(data: any): Response {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
