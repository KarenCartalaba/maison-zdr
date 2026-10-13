import { ENV } from "@/config/env";
import { sendEmail } from "@/lib/email";
import { redis } from "@/lib/redis";
import { NewsRepository } from "@/repositories/news.repository";

const newsRepo = new NewsRepository();

// ---------------------------------------------------------------------------
// Bulk "new article" notification.
//
// Sending strategy (mirrors the Docs/EMAIL.md table): FIRE-AND-FORGET.
// News mail is nice-to-have — the article is already persisted — so the
// admin's create/publish request must never wait on thousands of sends.
// The request handler calls dispatchNewsPublishedNotification() and returns
// immediately; this module swallows and logs every per-recipient failure.
//
// Safety rules:
//  - recipients are read in cursor pages (BATCH_SIZE), never all at once;
//  - each page is sent with bounded concurrency (CONCURRENCY);
//  - a hard cap (MAX_RECIPIENTS) stops a runaway loop;
//  - a Redis NX key dedupes retries/races (best-effort, 7-day TTL, and it
//    deliberately lives outside the `news:*` prefix that every news write
//    invalidates);
//  - if Resend isn't configured we log once and do nothing.
// ---------------------------------------------------------------------------

const BATCH_SIZE = 50;
const CONCURRENCY = 5;
const MAX_RECIPIENTS = 5000;
const DEDUP_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface NewsNotificationPayload {
  id: string;
  title: string;
  summary?: string | null;
  content: string;
  createdAt: Date | string;
  authorId: string;
  author?: { name: string } | null;
}

export interface NewsNotificationResult {
  sent: number;
  failed: number;
  recipients: number;
}

function dedupKey(newsId: string): string {
  return `news-email:sent:${newsId}`;
}

/** Returns false when this news article was already notified (or is in flight). */
async function acquireDedupLock(newsId: string): Promise<boolean> {
  if (!redis) return true; // no Redis → best-effort, a duplicate is acceptable
  try {
    const res = await redis.set(dedupKey(newsId), "1", "EX", DEDUP_TTL_SECONDS, "NX");
    return res === "OK";
  } catch {
    // Redis hiccup must not silently drop the notification — send anyway.
    return true;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Inline template using the same visual language as src/utils/template.ts
 * (green header, card layout, CTA button, footer). Kept local to the news
 * feature so the shared registry stays untouched.
 */
function renderNewsEmail(data: {
  name: string;
  title: string;
  summary?: string | null;
  url: string;
  publishedAt: string;
  authorName?: string | null;
}): string {
  const title = escapeHtml(data.title);
  const summary = data.summary ? escapeHtml(data.summary) : "";
  const name = escapeHtml(data.name);
  const authorName = data.authorName ? escapeHtml(data.authorName) : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="background-color: #f4f4f4; padding: 20px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <div style="background-color: #1a5c2a; padding: 30px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">Maison ZDR</h1>
            <p style="color: #c8e6d0; margin: 8px 0 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">New Article</p>
          </div>

          <div style="padding: 35px 40px;">
            <p style="color: #333333; font-size: 16px; margin: 0 0 20px;">Hi <strong>${name}</strong>,</p>
            <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 25px;">
              A new article was just published on Maison ZDR:
            </p>

            <div style="background-color: #f8faf8; border: 1px solid #d4e8da; border-radius: 6px; padding: 24px; margin-bottom: 25px;">
              <h2 style="color: #1a5c2a; font-size: 18px; margin: 0 0 12px; padding-bottom: 12px; border-bottom: 2px solid #e8f5ec;">${title}</h2>
              ${summary ? `<p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">${summary}</p>` : ""}
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #777777; font-size: 14px; width: 120px; vertical-align: top;">Published</td>
                  <td style="padding: 6px 0; color: #333333; font-size: 14px; font-weight: 500;">${escapeHtml(data.publishedAt)}</td>
                </tr>
                ${authorName ? `
                <tr>
                  <td style="padding: 6px 0; color: #777777; font-size: 14px; vertical-align: top;">Author</td>
                  <td style="padding: 6px 0; color: #333333; font-size: 14px; font-weight: 500;">${authorName}</td>
                </tr>` : ""}
              </table>
            </div>

            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.url}"
                 style="background-color: #1a5c2a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
                Read the article
              </a>
            </p>

            <p style="color: #555555; font-size: 15px; margin: 0;">
              — The Maison ZDR Team
            </p>
          </div>

          <div style="background-color: #f4f4f4; padding: 20px 40px; text-align: center;">
            <p style="color: #999999; font-size: 12px; margin: 0;">
              This email was sent by Maison ZDR &middot; Zone de Rassemblement
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendToPage(
  news: NewsNotificationPayload,
  url: string,
  publishedAt: string,
  opts: { limit: number; afterId?: string; excludeUserId?: string }
): Promise<{ users: { id: string; email: string }[]; sent: number; failed: number }> {
  const users = await newsRepo.findNotificationRecipients(opts);
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < users.length; i += CONCURRENCY) {
    const chunk = users.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (user) => {
        if (!user.email) return;
        try {
          await sendEmail({
            to: user.email,
            subject: `New article on Maison ZDR: ${news.title}`,
            html: renderNewsEmail({
              name: user.name || "there",
              title: news.title,
              summary: news.summary,
              url,
              publishedAt,
              authorName: news.author?.name,
            }),
          });
          sent++;
        } catch (error) {
          // Per-recipient failures are expected (bad address, provider hiccup):
          // swallow + log, never abort the batch.
          failed++;
          console.error(
            `[NewsEmail] Failed for ${user.email} (news ${news.id}):`,
            error instanceof Error ? error.message : error
          );
        }
      })
    );
  }

  return { users, sent, failed };
}

/**
 * Awaited core — used by dispatchNewsPublishedNotification() and available
 * for tests/admin tooling that wants the counts. Never rejects.
 */
export async function sendNewsPublishedNotification(
  news: NewsNotificationPayload
): Promise<NewsNotificationResult> {
  const result: NewsNotificationResult = { sent: 0, failed: 0, recipients: 0 };

  try {
    if (!ENV.EMAIL.RESEND_API_KEY || !ENV.EMAIL.FROM) {
      console.warn(
        "[NewsEmail] RESEND_API_KEY / EMAIL_FROM not configured — skipping news notification"
      );
      return result;
    }

    if (!(await acquireDedupLock(news.id))) {
      console.log(`[NewsEmail] News ${news.id} already notified — skipping`);
      return result;
    }

    const url = `${ENV.FRONTEND_URL}/news/${news.id}`;
    const publishedAt = new Date(news.createdAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let afterId: string | undefined;
    // Cursor-paginated: one page in memory at a time.
    while (result.recipients < MAX_RECIPIENTS) {
      const limit = Math.min(BATCH_SIZE, MAX_RECIPIENTS - result.recipients);
      const page = await sendToPage(news, url, publishedAt, {
        limit,
        afterId,
        excludeUserId: news.authorId,
      });

      result.recipients += page.users.length;
      result.sent += page.sent;
      result.failed += page.failed;

      if (page.users.length < limit) break; // last page
      afterId = page.users[page.users.length - 1].id;
    }

    if (result.recipients >= MAX_RECIPIENTS) {
      console.warn(
        `[NewsEmail] Recipient cap reached (${MAX_RECIPIENTS}) for news ${news.id}`
      );
    }

    console.log(
      `[NewsEmail] News "${news.title}" → ${result.sent} sent, ${result.failed} failed across ${result.recipients} recipients`
    );
  } catch (error) {
    console.error(`[NewsEmail] Notification failed for news ${news.id}:`, error);
  }

  return result;
}

/**
 * Fire-and-forget entry point for the news services.
 *
 * Never throws and never returns a rejecting promise, so the caller can invoke
 * it without `await` and without an unhandled-rejection guard.
 */
export function dispatchNewsPublishedNotification(news: NewsNotificationPayload): void {
  void sendNewsPublishedNotification(news).catch((error) => {
    console.error("[NewsEmail] Unexpected notification failure:", error);
  });
}
