import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Server-only. 앱 서버가 Notion MCP 서버(@notionhq/notion-mcp-server)에
// stdio로 연결하는 MCP 클라이언트가 되어 Notion DB에 페이지를 만든다.

export type NotionArticleInput = {
  title: string;
  summary: string;
  categoryName: string;
  url: string;
  publishedAt: string | null;
};

const SERVER_BIN = path.join(
  process.cwd(),
  "node_modules",
  "@notionhq",
  "notion-mcp-server",
  "bin",
  "cli.mjs",
);

// Notion rich_text 한 덩어리는 2000자 제한이라 잘라서 보낸다.
const clip = (text: string, max = 2000) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

// 저장된 Notion 페이지 URL을 돌려준다. 실패하면 Error를 던진다.
export async function saveArticleToNotion(
  article: NotionArticleInput,
): Promise<string> {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    throw new Error("NOTION_TOKEN 또는 NOTION_DATABASE_ID가 설정되지 않았어요.");
  }

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER_BIN],
    env: { ...process.env, NOTION_TOKEN: token } as Record<string, string>,
    stderr: "ignore",
  });
  const client = new Client({ name: "ai-news-collector", version: "0.1.0" });

  try {
    await client.connect(transport);

    const properties: Record<string, unknown> = {
      제목: { title: [{ text: { content: clip(article.title) } }] },
      요약: { rich_text: [{ text: { content: clip(article.summary) } }] },
      출처: { url: article.url },
      카테고리: { select: { name: article.categoryName.replaceAll(",", " ") } },
    };
    if (article.publishedAt) {
      properties["날짜"] = { date: { start: article.publishedAt } };
    }

    const result = await client.callTool({
      name: "API-post-page",
      arguments: { parent: { database_id: databaseId }, properties },
    });

    const text = (
      result.content as { type: string; text?: string }[] | undefined
    )?.find((c) => c.type === "text")?.text;

    let body: { url?: string; message?: string } = {};
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      // JSON이 아니면 아래에서 오류로 처리한다.
    }

    if (result.isError || !body.url) {
      throw new Error(
        `Notion 페이지 생성 실패: ${body.message ?? text ?? "알 수 없는 응답"}`,
      );
    }
    return body.url;
  } finally {
    await client.close().catch(() => {});
  }
}
