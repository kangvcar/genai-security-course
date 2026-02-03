import { gateway } from '@ai-sdk/gateway';
import { convertToModelMessages, streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const reqJson = await req.json();

  const result = streamText({
    model: gateway('openai/gpt-4o-mini'),
    system: `你是一个 AI 安全课程的智能助手。你的主要职责是帮助学生理解 AI 安全相关的概念，包括提示词注入、越狱技术、对抗样本、隐私攻击和数据投毒等主题。

请用中文回答问题，保持专业、友好和易于理解的语气。如果问题与 AI 安全无关，你可以礼貌地引导用户回到课程相关的话题。`,
    messages: await convertToModelMessages(reqJson.messages, {
      ignoreIncompleteToolCalls: true,
    }),
  });

  return result.toUIMessageStreamResponse();
}
