import { ReasonsData } from "../types";

export const reasonsData: ReasonsData = {
  support: [
    {
      id: "r1",
      text: "教育政策に共感します。特に教員の待遇改善への取り組みが評価できます。",
      user: "市民太郎",
      likes: 42,
      date: "2日前",
      replies: [
        {
          id: "reply1",
          text: "具体的にどの政策が良いと思いましたか？教員給与の引き上げ案についても評価されていますか？",
          user: "教育関係者",
          likes: 12,
          date: "1日前",
          replies: [
            {
              id: "reply1-1",
              text: "私は特に教員の働き方改革と、ICT環境整備への予算拡大を評価しています。給与引き上げも必要ですが、まずは労働環境の改善が優先だと考えます。",
              user: "市民太郎",
              likes: 8,
              date: "1日前",
              replyTo: "教育関係者",
            },
            {
              id: "reply1-2",
              text: "市民太郎さんのご意見に同感です。私も現場の環境改善なしに単なる給与アップだけでは状況は変わらないと思います。",
              user: "別の教師",
              likes: 5,
              date: "20時間前",
              replyTo: "市民太郎",
            },
          ],
          replyTo: "市民太郎",
        },
        {
          id: "reply2",
          text: "私も同意見です。特に地方の学校への支援が手厚い点が評価できると思います。",
          user: "地方在住",
          likes: 7,
          date: "1日前",
          replyTo: "市民太郎",
          replies: [],
        },
      ],
    },
    {
      id: "r2",
      text: "地域の課題に真摯に向き合う姿勢が素晴らしいと思います。先日の洪水被害への素早い対応は評価に値します。",
      user: "東京花子",
      likes: 27,
      date: "4日前",
      replies: [],
    },
  ],
  oppose: [
    {
      id: "r4",
      text: "財政政策に一貫性がありません。以前は緊縮財政を主張していましたが、選挙前になると突然方針を変えました。",
      user: "政治マニア",
      likes: 31,
      date: "1日前",
      replies: [
        {
          id: "reply4",
          text: "それは状況の変化に応じて柔軟に対応しているとも取れるのではないでしょうか？",
          user: "別の見方",
          likes: 5,
          date: "1日前",
          replyTo: "政治マニア",
          replies: [
            {
              id: "reply4-1",
              text: "柔軟性と一貫性のなさは違います。具体的には2年前の予算委員会での発言と今回の選挙公約が完全に矛盾しています。",
              user: "政治マニア",
              likes: 14,
              date: "23時間前",
              replyTo: "別の見方",
            },
          ],
        },
      ],
    },
    {
      id: "r5",
      text: "地元での活動が少なく、国会での発言も限られています。もっと積極的に行動してほしいです。",
      user: "地元住民",
      likes: 19,
      date: "3日前",
      replies: [],
    },
  ],
};
