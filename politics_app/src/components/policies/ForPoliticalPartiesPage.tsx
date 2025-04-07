// src/components/political-parties/PoliticalPartiesPage.tsx
import React, { useState, useEffect } from "react";
import { Mail, ChevronRight } from "lucide-react";

const PoliticalPartiesPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // ページロード時のシンプルなフェードイン
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // 色の定義
  const colors = {
    primary: "#3B5EDB",
    secondary: "#6050DC",
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-6">
      {/* ヘッダー */}
      <header className="mb-8">
        <h1
          className={`mb-2 text-2xl font-bold transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ color: colors.primary }}
        >
          政党の皆様へ - メディアバイアスなしに、自らの声を直接有権者へ
        </h1>
      </header>

      {/* 主要コンテンツ */}
      <section className="mb-8">
        <div
          className={`mb-6 rounded border-l-4 p-4 shadow-sm transition-opacity duration-500 delay-200 bg-white ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ borderLeftColor: colors.primary }}
        >
          <h2 className="mb-3 text-lg font-bold">
            「報道されない政策」をなくす。あなたの政党の「本当の姿」を届けるために
          </h2>

          <p className="mb-4 font-semibold" style={{ color: colors.primary }}>
            POLITICS HUBは、メディアの解釈に左右されない直接発信を可能にします。
          </p>

          <p className="mb-3 text-sm">
            従来の政治情報は、各メディアの視点や意図による編集・解釈を経由して有権者に届けられてきました。その過程で切り取られ、本来伝えたかったメッセージが変質したり、重要な政策が十分に報道されないこともあります。
          </p>

          <p className="mb-3 text-sm">
            また、各政党の公式ウェブサイトは、デザインや構成がバラバラで、主に既存の支持層しか訪問しないという課題があります。政策比較を検討している有権者に効果的にリーチできていないのが現状です。
          </p>

          <p className="mb-0 text-sm">
            当プラットフォームでは、
            <span className="font-bold">
              政党の皆様がメディアを介さず直接コンテンツを管理できる専用システム
            </span>
            を提供。政策の追加・更新・削除をリアルタイムで行い、メディアフィルターのない「一次情報」をそのまま有権者へ届けることができます。さらに、すべての政党の政策が一箇所に集約されることで、政策比較中の有権者にも自然に露出する機会が増えます。
          </p>
        </div>
      </section>

      {/* なぜPOLITICS HUBなのか？ - 分けないように */}
      <section
        className={`mb-8 transition-opacity duration-500 delay-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="rounded border p-4 shadow-sm">
          <h2
            className="mb-3 text-lg font-bold"
            style={{ color: colors.primary }}
          >
            なぜPOLITICS HUBなのか？
          </h2>

          <ul className="space-y-2 ml-5 list-disc">
            <li className="text-sm">
              <span className="font-semibold">メディアの解釈から解放</span>:
              報道機関による編集や解釈に左右されず、政策の真意をそのまま伝達
            </li>
            <li className="text-sm">
              <span className="font-semibold">完全自己管理</span>:
              政策情報や政党情報を、外部に依存することなく自らの手で更新・追加・削除
            </li>
            <li className="text-sm">
              <span className="font-semibold">
                クロスオーディエンスへのリーチ
              </span>
              :
              自党の支持層だけでなく、他党の政策を比較検討している有権者にも自然にアプローチ
            </li>
            <li className="text-sm">
              <span className="font-semibold">プラットフォーム統一</span>:
              各党で異なるウェブサイトデザインや操作性の違いを解消し、ユーザーが政策本位で比較検討可能
            </li>
            <li className="text-sm">
              <span className="font-semibold">若年層へのリーチ</span>:
              Z世代・ミレニアル世代の興味を引く最適化されたデザインで若年層の政治参加を促進
            </li>
            <li className="text-sm">
              <span className="font-semibold">モバイルファースト</span>:
              スマートフォン利用が中心の現代に合わせた、完全レスポンシブデザイン
            </li>
            <li className="text-sm">
              <span className="font-semibold">リアルタイムフィードバック</span>:
              政策への支持率やコメントをリアルタイムで確認可能
            </li>
            <li className="text-sm">
              <span className="font-semibold">透明性の証明</span>:
              有権者と直接つながることで、政治への信頼構築に貢献
            </li>
            <li className="text-sm">
              <span className="font-semibold">公認マーク表示</span>:
              政党が公式に更新した情報には「政党公認」マークが表示され、積極的な情報提供の姿勢を示せます
            </li>
          </ul>
        </div>
      </section>

      {/* ご利用の流れ */}
      <section
        className={`mb-8 transition-opacity duration-500 delay-400 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="rounded border p-4 shadow-sm">
          <h2
            className="mb-3 text-lg font-bold"
            style={{ color: colors.primary }}
          >
            ご利用の流れ
          </h2>

          <ol className="space-y-2 ml-5 list-decimal">
            <li className="text-sm">
              <span className="font-semibold">専用管理アカウントの発行</span>
              （公式政党確認後）
            </li>
            <li className="text-sm">
              <span className="font-semibold">
                管理画面から政策情報の登録・編集
              </span>
            </li>
            <li className="text-sm">
              <span className="font-semibold">
                リアルタイムで一般ユーザーへの情報公開
              </span>
              （「政党公認」マーク付き）
            </li>
            <li className="text-sm">
              <span className="font-semibold">
                有権者からのコメントや支持率を直接確認
              </span>
            </li>
          </ol>
        </div>
      </section>

      {/* お問い合わせ */}
      <section
        className={`transition-opacity duration-500 delay-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="rounded border p-4 shadow-sm">
          <h2
            className="mb-3 text-lg font-bold"
            style={{ color: colors.primary }}
          >
            お問い合わせ
          </h2>

          <p className="mb-4 text-sm">
            政党専用管理システムの詳細や申請について、以下の連絡先までお気軽にお問い合わせください。
          </p>

          <div className="flex items-center justify-center mb-4">
            <Mail
              className="mr-2"
              size={16}
              style={{ color: colors.primary }}
            />
            <a
              href="mailto:politics-hub-support@example.com"
              className="text-base font-semibold hover:underline"
              style={{ color: colors.primary }}
            >
              politicshub.info@gmail.com
            </a>
          </div>

          <p className="text-center text-sm">PLITICS HUB 運営</p>

          <p
            className="mt-4 text-center italic"
            style={{ color: colors.secondary }}
          >
            POLITICS HUB - 政治をもっと身近に、もっと透明に
          </p>
        </div>
      </section>
    </article>
  );
};

export default PoliticalPartiesPage;
