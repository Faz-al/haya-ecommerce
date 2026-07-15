import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnv } from "vite";

const SITE_URL = "https://byhaya.in";

/*
 * Loads variables from:
 * - .env
 * - .env.local
 * - Vercel environment variables
 */
const fileEnv = loadEnv(
  process.env.NODE_ENV || "development",
  process.cwd(),
  ""
);

const env = {
  ...fileEnv,
  ...process.env,
};

const supabaseUrl = env.VITE_SUPABASE_URL;

const supabaseKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY;

const today = new Date().toISOString().split("T")[0];

/**
 * Public static routes that should appear in Google.
 *
 * Do not include:
 * - /admin
 * - /account
 * - /auth
 * - /checkout
 * - /cart
 * - /wishlist
 * - /order-success
 */
const staticPages = [
  {
    path: "/",
    changefreq: "daily",
    priority: "1.0",
  },
  {
    path: "/shop",
    changefreq: "daily",
    priority: "0.9",
  },
  {
    path: "/about",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/contact",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/delivery",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/returns",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/size-guide",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/faqs",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/journal",
    changefreq: "weekly",
    priority: "0.6",
  },
  {
    path: "/privacy",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/terms",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/cookies",
    changefreq: "yearly",
    priority: "0.3",
  },
];

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeDate(value) {
  if (!value) return today;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return today;
  }

  return date.toISOString().split("T")[0];
}

function normalizeSlug(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const slug = value.trim().replace(/^\/+|\/+$/g, "");

  return slug || null;
}

function createUrlEntry({
  path,
  lastmod = today,
  changefreq = "weekly",
  priority = "0.5",
}) {
  const normalizedPath =
    path === "/" ? "/" : `/${String(path).replace(/^\/+/, "")}`;

  return `  <url>
    <loc>${escapeXml(`${SITE_URL}${normalizedPath}`)}</loc>
    <lastmod>${escapeXml(normalizeDate(lastmod))}</lastmod>
    <changefreq>${escapeXml(changefreq)}</changefreq>
    <priority>${escapeXml(priority)}</priority>
  </url>`;
}

async function getProducts(supabase) {
  const { data, error } = await supabase
    .from("products")
    .select("slug, updated_at")
    .not("slug", "is", null)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.warn(
      `Could not load products for sitemap: ${error.message}`
    );

    return [];
  }

  return (data || [])
    .map((product) => {
      const slug = normalizeSlug(product.slug);

      if (!slug) return null;

      return {
        path: `/product/${encodeURIComponent(slug)}`,
        lastmod: product.updated_at,
        changefreq: "weekly",
        priority: "0.8",
      };
    })
    .filter(Boolean);
}

async function getCategories(supabase) {
  const { data, error } = await supabase
    .from("categories")
    .select("slug, updated_at")
    .not("slug", "is", null)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.warn(
      `Could not load categories for sitemap: ${error.message}`
    );

    return [];
  }

  return (data || [])
    .map((category) => {
      const slug = normalizeSlug(category.slug);

      if (!slug) return null;

      return {
        path: `/category/${encodeURIComponent(slug)}`,
        lastmod: category.updated_at,
        changefreq: "weekly",
        priority: "0.7",
      };
    })
    .filter(Boolean);
}

function removeDuplicateUrls(pages) {
  const uniquePages = new Map();

  for (const page of pages) {
    uniquePages.set(page.path, page);
  }

  return Array.from(uniquePages.values());
}

async function generateSitemap() {
  let dynamicPages = [];

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Supabase environment variables were not found during the build."
    );

    console.warn(
      "The sitemap will contain static pages only."
    );
  } else {
    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const [products, categories] =
      await Promise.all([
        getProducts(supabase),
        getCategories(supabase),
      ]);

    dynamicPages = [
      ...categories,
      ...products,
    ];

    console.log(
      `Found ${categories.length} categories.`
    );

    console.log(
      `Found ${products.length} products.`
    );
  }

  const pages = removeDuplicateUrls([
    ...staticPages,
    ...dynamicPages,
  ]);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${pages.map(createUrlEntry).join("\n")}
</urlset>
`;

  const publicDirectory = resolve(
    process.cwd(),
    "public"
  );

  const sitemapPath = resolve(
    publicDirectory,
    "sitemap.xml"
  );

  await mkdir(publicDirectory, {
    recursive: true,
  });

  await writeFile(
    sitemapPath,
    sitemap,
    "utf8"
  );

  console.log(
    `Sitemap generated successfully with ${pages.length} URLs.`
  );

  console.log(
    `Saved to: ${sitemapPath}`
  );
}

generateSitemap().catch((error) => {
  console.error(
    "Sitemap generation failed:",
    error
  );

  process.exit(1);
});