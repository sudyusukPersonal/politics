// src/components/contact/ContactPage.tsx
import React from "react";
import { MessageCircle, Mail } from "lucide-react";

const ContactPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-white rounded p-4 mb-4 shadow-sm">
        <h1 className="text-xl font-bold mb-4">お問い合わせ</h1>

        <p className="text-sm mb-4">
          POLITICS
          HUBに関するご質問、ご意見、お問い合わせは以下の方法でご連絡ください。
        </p>

        <div className="space-y-4">
          {/* メールでのお問い合わせ */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <Mail size={20} className="mr-2 text-indigo-600" />
              メールでのお問い合わせ
            </h2>
            <p className="text-sm mb-2">
              以下のメールアドレスに直接ご連絡ください：
            </p>
            <a
              href="mailto:contact@politicshub.jp"
              className="inline-block text-indigo-600 font-medium hover:underline"
            >
              politicshub.info@gmail.com
            </a>
          </div>

          {/* フォームでのお問い合わせ */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <MessageCircle size={20} className="mr-2 text-indigo-600" />
              Google Formでのお問い合わせ
            </h2>
            <p className="text-sm mb-2">
              メールアドレスなどの個人情報を開示せずに匿名でお問い合わせいただけます。プライバシーを重視される方におすすめです。
            </p>
            <a
              href="https://docs.google.com/forms/d/1ZcgPtJWDM83K544yzeWrUjo7RHdk4AVVeoYnzprDlcM/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              Google Formでお問い合わせ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
