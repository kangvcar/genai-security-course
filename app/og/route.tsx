import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              fontSize: '56px',
            }}
          >
            🛡️
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-1px',
            }}
          >
            GenAI 安全攻防实战课程
          </div>
        </div>

        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.6,
            marginBottom: '48px',
          }}
        >
          系统掌握大语言模型和 AI 系统的安全攻防技术
        </div>

        <div
          style={{
            display: 'flex',
            gap: '32px',
          }}
        >
          {[
            { value: '5', label: '个模块' },
            { value: '20', label: '章精讲' },
            { value: '16', label: '个实验' },
            { value: '48', label: '学时' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 32px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <div
                style={{
                  fontSize: '40px',
                  fontWeight: 800,
                  color: '#60a5fa',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: '18px',
                  color: '#94a3b8',
                  marginTop: '4px',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '40px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['提示词注入', '对抗样本', '隐私泄露', '数据投毒', 'AI红队'].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  padding: '8px 20px',
                  borderRadius: '20px',
                  background: 'rgba(148, 163, 184, 0.1)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  color: '#cbd5e1',
                  fontSize: '16px',
                }}
              >
                {tag}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
