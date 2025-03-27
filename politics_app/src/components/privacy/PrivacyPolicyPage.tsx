// src/components/privacy/PrivacyPolicyPage.tsx
import React from "react";

// セクションデータを配列として定義して重複コードを削減
const privacyData = [
  {
    id: 1,
    title: "はじめに",
    content:
      "POLITICS HUB へようこそ。当サイトは、政治参加と情報共有を促進するために設計されたプラットフォームです。当サイトは利用者様のプライバシー保護を最優先事項と考えております。本プライバシーポリシーでは、当サイトが収集、使用する情報の取り扱いについてご説明いたします。",
  },
  {
    id: 2,
    title: "匿名利用について",
    content:
      "当サイトは基本的に匿名での利用を前提としております。ユーザー登録やログインを行わなくても、大部分の機能をご利用いただけます。コメントや評価を投稿する際も、実名やメールアドレスなどの個人情報の提供は必要ありません。",
  },
  {
    id: 3,
    title: "収集する情報",
    content:
      "当サイトでは、以下の情報を収集する場合があります：\n・コンテンツ情報：コメント、評価、返信など\n・利用者識別子：端末ごとに生成される一意の識別子\n・利用データ：アクセス日時、閲覧したページなど\n・デバイス情報：IP アドレス、ブラウザの種類など\n・Cookie 情報：サイト利用の際に保存される Cookie データ",
  },
  {
    id: 4,
    title: "情報の利用目的",
    content:
      "収集した情報は、サービスの提供・運営、サービスの改善、安全性の確保、利用傾向の分析などの目的で利用いたします。",
  },
  {
    id: 5,
    title: "情報の共有",
    content:
      "当サイトは、法的要請に応じる必要がある場合、当サイトの権利を保護するために必要な場合、サービス提供のために協力している第三者サービスプロバイダーを除き、ユーザーの情報を第三者と共有いたしません。",
  },
  {
    id: 6,
    title: "ローカルストレージの使用",
    content:
      "当サイトでは、最近閲覧した政治家や政策の情報などをブラウザのローカルストレージに保存します。この情報はお使いのデバイス上にのみ保存され、当サイトのサーバーには送信されません。",
  },
  {
    id: 7,
    title: "データの削除",
    content:
      "ブラウザの履歴や Cookie を削除することで、ローカルに保存された情報を消去することができます。",
  },
  {
    id: 8,
    title: "プライバシーポリシーの変更",
    content:
      "当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。変更があった場合は、当ページ上で通知いたします。",
  },
  {
    id: 9,
    title: "お問い合わせ",
    content:
      "本プライバシーポリシーに関するご質問やご意見は、当サイトのお問い合わせフォームよりご連絡ください。",
  },
];

const disclaimerData = [
  {
    id: 1,
    title: "情報の正確性について",
    content:
      "当サイト「POLITICS HUB」に掲載されている情報は、正確性を期すよう努めておりますが、その完全性、正確性、最新性、有用性等について保証するものではありません。",
  },
  {
    id: 2,
    title: "ユーザー投稿コンテンツについて",
    content:
      "当サイトに投稿されるコンテンツは、投稿者個人の意見であり、当サイトの見解を代表するものではありません。これらの内容について、当サイトは一切の責任を負いません。",
  },
  {
    id: 3,
    title: "外部リンクについて",
    content:
      "当サイトからリンクする外部サイトの内容については、当サイトは一切の責任を負いません。リンク先のサイトの利用については、ユーザー自身の責任において行ってください。",
  },
  {
    id: 4,
    title: "サービスの中断・終了について",
    content:
      "当サイトは、予告なくサービスの一部または全部を中断・終了する場合があります。これによりユーザーに生じた損害について、当サイトは一切の責任を負いません。",
  },
  {
    id: 5,
    title: "損害賠償の制限",
    content:
      "当サイトの利用によって生じたいかなる損害についても、当サイトは一切の責任を負いません。",
  },
  {
    id: 6,
    title: "知的財産権について",
    content:
      "当サイトに掲載されているコンテンツの著作権その他の知的財産権は、当サイトまたは当該権利を有する第三者に帰属します。これらのコンテンツを無断で複製、転用、販売などの二次利用することを禁じます。",
  },
  {
    id: 7,
    title: "法令の遵守",
    content:
      "ユーザーは、当サイトの利用にあたり、関連する法令を遵守する責任があります。",
  },
  {
    id: 8,
    title: "免責事項の変更",
    content:
      "当サイトは、必要に応じて本免責事項を変更する場合があります。変更後の免責事項は、当ページに掲載した時点から効力を生じるものとします。",
  },
];

// セクションコンポーネントを作成して繰り返しの記述を削減
const Section: React.FC<{ title: string; content: string }> = ({
  title,
  content,
}) => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold mb-1">{title}</h3>
    <p className="text-sm">{content}</p>
  </div>
);

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-white rounded p-4 mb-4 shadow-sm">
        <h1 className="text-xl font-bold mb-4">プライバシーポリシー</h1>
        {privacyData.map((section) => (
          <Section
            key={section.id}
            title={`${section.id}. ${section.title}`}
            content={section.content}
          />
        ))}
      </div>

      <div className="bg-white rounded p-4 shadow-sm">
        <h1 className="text-xl font-bold mb-4">免責事項</h1>
        {disclaimerData.map((section) => (
          <Section
            key={section.id}
            title={`${section.id}. ${section.title}`}
            content={section.content}
          />
        ))}
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
