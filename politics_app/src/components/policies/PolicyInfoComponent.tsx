// src/components/policies/PolicyInfoComponent.tsx
import React from "react";

const PolicyInfoComponent = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-white rounded p-4 shadow-sm">
        <h1 className="text-xl font-bold mb-4">政策情報の取り扱いについて</h1>
        <p className="text-sm mb-4">
          当サイト「POLITICS
          HUB」では、政策情報を完全に中立的な立場から提供することを最重要視しております。掲載されている全ての政策情報は、各政党の公式ホームページに公開されている資料のみを情報源としています。
        </p>
        <p className="text-sm mb-4">
          情報収集・掲載プロセスについては、以下の厳格な手順を踏んでいます：
          <br />
          1. 各政党公式ホームページから公開資料（HTML、PDF等）を収集
          <br />
          2. AIによる客観的な解析と要約
          <br />
          3. サイト管理者による内容の存在・中立性のダブルチェック
        </p>
        <p className="text-sm mb-4">
          当サイトは特定の政党や政治的立場を支持・推奨するものではなく、有権者の皆様が各政党の政策を正確に理解し、自らの判断で政治参加できる環境づくりを目指しています。
        </p>
        <p className="text-sm">
          情報の正確性には最大限の注意を払っておりますが、最新の政策変更が反映されていない可能性もございます。
        </p>
      </div>
    </div>
  );
};

export default PolicyInfoComponent;
