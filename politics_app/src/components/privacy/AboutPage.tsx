// src/components/about/AboutPage.tsx
import React from "react";
import { Building, Users, FileText, Globe, MessageCircle } from "lucide-react";

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* ヒーローセクション - ヘッダーの色に合わせる */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-3">POLITICS HUBについて</h1>
        <p className="text-white/90 leading-relaxed">
          私たちは、政治をもっと身近なものにし、民主主義への参加を促進するためのプラットフォームを提供しています。政治家や政党、政策について学び、意見を共有することで、より良い社会の実現に貢献しましょう。
        </p>
      </div>

      {/* コンテンツセクション */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="space-y-6">
          {/* ミッションセクション */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-slate-700 flex items-center">
              <Globe size={20} className="mr-2" />
              私たちのミッション
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              POLITICS
              HUBは、政治をより理解しやすく、参加しやすいものにするという使命のもとに作られました。複雑で敷居が高いと感じられがちな政治の世界を、わかりやすく透明性のある形で提供することで、すべての国民が政治プロセスに参加できるよう支援します。
            </p>
            <p className="text-gray-700 leading-relaxed">
              私たちは、政治的な議論が建設的で情報に基づいたものであるべきだと信じています。このプラットフォームを通じて、異なる意見や視点を尊重する対話の場を提供し、より良い民主主義社会の構築に貢献していきます。
            </p>
          </div>

          {/* 中立性セクション */}
          <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-700">
            <h2 className="text-lg font-semibold mb-2 text-slate-700">
              政治的中立性について
            </h2>
            <p className="text-gray-700">
              POLITICS
              HUBは、特定の政党や政治的立場を支持していません。私たちの目標は、あらゆる政治的見解を公平に扱い、ユーザーがそれぞれの視点から情報を評価できる環境を提供することです。このサイト上のデータやコンテンツは、できる限り正確で中立的な形で提供されるよう努めています。
            </p>
          </div>

          {/* 参加の呼びかけ */}
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-5 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-slate-700">
              政治参加へのお誘い
            </h2>
            <p className="text-gray-700 mb-3">
              政治は私たちの日常生活に大きな影響を与えています。選挙で投票するだけでなく、日々の政治動向を追い、議論に参加することで、より良い社会づくりに貢献できます。POLITICS
              HUBは、そんな皆さんの政治参加を応援します。
            </p>
          </div>
        </div>
      </div>

      {/* 運営者情報 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-700 flex items-center">
          <MessageCircle size={20} className="mr-2" />
          運営者情報
        </h2>
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="運営団体" value="POLITICS HUB運営委員会" />
            <InfoItem label="連絡先" value="politicshub.info@gmail.com" />
          </div>
          <p className="text-sm text-gray-500 mt-6">
            2025 Politics Hub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

// 情報項目コンポーネント
const InfoItem: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  return (
    <div className="py-2">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
};

export default AboutPage;
