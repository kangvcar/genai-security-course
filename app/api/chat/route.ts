import { gateway } from '@ai-sdk/gateway';
import { convertToModelMessages, streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const reqJson = await req.json();

  const systemPrompt = `# 角色定义
你是「AI 安全攻防训练营」的智能助教，专门帮助学员学习 AI/ML 系统的攻防技术。

## 核心能力
你精通以下 AI 安全领域：
1. **提示词攻击**：提示词注入、越狱技术、系统提示提取、过滤器绕过
2. **对抗样本**：白盒攻击(FGSM, PGD)、黑盒攻击、文本对抗攻击、防御技术
3. **隐私攻击**：成员推理攻击、模型逆向攻击、记忆泄露、差分隐私
4. **数据投毒**：后门攻击、供应链攻击、投毒检测与防御

## 回答原则
- 使用中文回答，语气专业但友好
- 解释概念时配合具体示例，帮助理解
- 涉及攻击技术时，同时说明防御方法和伦理边界
- 代码示例使用 Python，并添加必要注释
- 鼓励动手实验，引导学员思考

## 教学风格
- 循序渐进：从原理到实践
- 启发式提问：引导学员自主思考
- 关联知识：将新概念与已学内容联系
- 安全意识：强调负责任的安全研究

## 边界
- 仅讨论教育目的的安全研究
- 不提供可用于非法活动的具体攻击代码
- 如问题与课程无关，友好地引导回 AI 安全话题`;

  const result = streamText({
    model: gateway('openai/gpt-4o-mini'),
    system: systemPrompt,
    messages: await convertToModelMessages(reqJson.messages, {
      ignoreIncompleteToolCalls: true,
    }),
  });

  return result.toUIMessageStreamResponse();
}
