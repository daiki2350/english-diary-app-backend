/**
 * diary controller
 * export default factories.createCoreController(
  "api::diary.diary",
  ({ strapi }) => ({
    // カスタムアクション：GPT添削
    async correct(ctx) {
      const { content } = ctx.request.body;

      if (!content) {
        ctx.throw(400, "content is required");
      }

      const result = await strapi
        .service("api::diary.gpt")
        .correct(content);

      ctx.body = result;
    },
  })
);
 */

import { factories } from "@strapi/strapi";
import { ISSUE_MAP } from "../services/issueMaps";


type GrammarIssue = {
  id: string;
  type: string;
  label: string;
  message: string;
  example_before?: string;
  example_after?: string;
};

type PreWeeklyLevel = {
  week: number;
  avg: number;
}

type WeeklyLevel = {
  week: number;
  avgLevel: string;
}

export default factories.createCoreController("api::diary.diary", ({ strapi }) => ({


  async correctAndSave(ctx) {
    const user = ctx.state.user

    const { content, word_count } = ctx.request.body;

    const result = await strapi
      .service("api::diary.gpt")
      .correct(content);

      const issuesWithLabels = result.grammar_issues.map(issue => ({
        ...issue,
        label: ISSUE_MAP[issue.type] || issue.type,
      }));

      console.log(issuesWithLabels)
      console.log(user)

    const saved = await strapi.documents("api::diary.diary").create({
      data: {
        content,
        corrected_content: result.corrected,
        grammar_issues: issuesWithLabels,
        word_count,
        feedback: result.feedback,
        level: result.cefr,
        tokens_used: result.tokens,
        publishedAt: new Date(),
        users_permissions_user: user.id
      },
    });

    return saved;
  },

  async monthlyWordCount(ctx) {
    const user = ctx.state.user
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0–11 → 今月

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    const diaries = await strapi.entityService.findMany("api::diary.diary", {
      filters: {
        users_permissions_user: user.id,
        createdAt: {
          $gte: start,
          $lt: end,
        },
        
      },
      fields: ["word_count"],
    });

    const total = diaries.reduce(
      (sum, d) => sum + (d.word_count || 0),
      0
    );

    ctx.body = {
      month: `${year}-${String(month + 1).padStart(2, "0")}`,
      total,
    };
  },

  async getLastDiary(ctx) {
    const user = ctx.state.user

    const diaries = await strapi.entityService.findMany("api::diary.diary", {
      filters: {
        users_permissions_user: user.id
      },
      sort: { createdAt: "desc" },
      pagination: {
        page: 1,
        pageSize: 1,
      },
      fields: ["content", "corrected_content", "feedback"],
    })

    ctx.body = diaries[0] ?? null
  },

  async recentWeeklyLevels(ctx) {
    const user = ctx.state.user

    const WEEK_COUNT = 12; //after making user authentication, it needs to compare to created_at in user table.

    const now = new Date();
    const result = [] as PreWeeklyLevel[];

    const weeklyLevel = [] as WeeklyLevel[]

    for (let i = 0; i < WEEK_COUNT; i++) {

      // 今週の開始日と終了日を計算
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay() - (i * 7)); // 日曜始まり
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 7);

      // 週内のデータ取得
      const diaries = await strapi.entityService.findMany("api::diary.diary", {
        filters: {
          users_permissions_user: user.id,
          createdAt: {
            $gte: start,
            $lt: end,
          },
        },
        fields: ["level"],
      });

      console.log(diaries)
      if (diaries.length === 0) {
        result.push({ week: i+1, avg: null });
        continue;
      }

      const levelMap = { null:0, A1:1, A2:2, B1:3, B2:4, C1:5, C2:6 };
      const nums = diaries.map(d => levelMap[d.level]);

      const avg = nums.reduce((a,b)=>a+b,0) / nums.length;
      const rounded = Math.round(avg);

      result.push({
        week: i + 1,  // 0 = 今週, 1 = 先週...
        avg: rounded,
      });
    }

    console.log(result)

    const reverseLevelMap = {
      0: null,
      1: "A1",
      2: "A2",
      3: "B1",
      4: "B2",
      5: "C1",
      6: "C2",
    };

    for(let i=0; i<result.length; i++) {
      const rounded = Math.round(result[i].avg);
      const avgLevel = reverseLevelMap[rounded];
      weeklyLevel.push({week: result[i].week, avgLevel: avgLevel})
    }
    

    ctx.body = weeklyLevel
  },

  async weeklyLevel(ctx) {
    const user = ctx.state.user
    const now = new Date();

    // 今週の開始日と終了日を計算
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay()); // 日曜始まり
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    // 週内のデータ取得
    const diaries = await strapi.entityService.findMany("api::diary.diary", {
      filters: {
        users_permissions_user: user.id,
        createdAt: {
          $gte: start,
          $lt: end,
        },
      },
      fields: ["level"],
    });
    const levelMap = { null:0, A1:1, A2:2, B1:3, B2:4, C1:5, C2:6 };
    const nums = diaries.map(d => levelMap[d.level]);

    const avg = nums.reduce((a,b)=>a+b,0) / nums.length;
    const rounded = Math.round(avg);

    const reverseLevelMap = {
      0: null,
      1: "A1",
      2: "A2",
      3: "B1",
      4: "B2",
      5: "C1",
      6: "C2",
    };

    const avgLevel = reverseLevelMap[rounded];
    console.log(avgLevel)

    ctx.body = {
      avgLevel
    }
  },

  async recentGrammarIssues(ctx) {
    const user = ctx.state.user

    const diaries = await strapi.entityService.findMany("api::diary.diary", {
      filters: {
        users_permissions_user: user.id,
      },
      sort: { createdAt: "desc" },
      pagination: {
        page: 10,
        pageSize: 1,
      },
      fields: ["grammar_issues"],
    });
    const issues = diaries.flatMap(d => d.grammar_issues as GrammarIssue[] || []);

    // カウントする
    const counter: Record<string, number> = {};
    for (const issue of issues) {
      if (!issue.label) continue;
      counter[issue.label] = (counter[issue.label] || 0) + 1;
    }

    // 頻度順に並べ替える
    const sorted = Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));


    // top5
    const trends = sorted.slice(0,5)

    ctx.body = {
      trends: trends,
    };
  },

  async recentGrammarIssuesDetails(ctx) {
    const user = ctx.state.user

    const diaries = await strapi.entityService.findMany("api::diary.diary", {
      filters: {
        users_permissions_user: user.id,
      },
      sort: { createdAt: "desc" },
      pagination: {
        page: 1,
        pageSize: 10,
      },
      fields: ["grammar_issues"],
    });
    const issues = diaries.flatMap(d => d.grammar_issues as GrammarIssue[] || []);

    // カウントする
    const counter: Record<string, number> = {};
    for (const issue of issues) {
      if (!issue.label) continue;
      counter[issue.label] = (counter[issue.label] || 0) + 1;
    }

    // 頻度順に並べ替える
    const sorted = Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));

    // top5
    const trends = sorted.slice(0,5)

    const examples: Record<string, { before: string, after: string }> = {};

    for (const trend of trends) {
        // issues の中からラベルに一致する最初のものを探す
        const found = issues.find(issue => issue.label === trend.label);

        if (found) {
            examples[trend.label] = {
                before: found.example_before ?? "",
                after: found.example_after ?? ""
            };
        } else {
            examples[trend.label] = {
                before: "",
                after: ""
            };
        }
    }

    ctx.body = {
      trends,
      examples,
    }
  },

  async calculateStreak(ctx) {
    const user = ctx.state.user

    const diaries = await strapi.entityService.findMany("api::diary.diary", {
      filters: {
        users_permissions_user: user.id,
      },
      fields: ["createdAt"],
      sort: ["createdAt:desc"]
    })


    const dates = diaries.map(d => new Date(d.createdAt));
    const DAY = 1000 * 60 * 60 * 24;

    const normalized = dates
      .map(d => {
        const dt = new Date(d);
        dt.setHours(0, 0, 0, 0); // 時間情報を潰す
        return dt.getTime();     // number にする
      });

    // 重複（日付が同じもの）を削除
    const uniqueDays = Array.from(new Set(normalized)).sort((a, b) => b - a);

    console.log(uniqueDays)

    let streak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const yesterday = todayTime - DAY;

    const latest = uniqueDays[0];

    if (latest === todayTime) {
      streak = 1;
    }
  
    else if (latest === yesterday) {
      streak = 1;
    }

    else {
      streak = 0;
    }


    for (let i = 0; i < uniqueDays.length - 1; i++) {
      const diffDays = (uniqueDays[i] - uniqueDays[i + 1]) / DAY;

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    ctx.body = {
      streak: streak,
    }
  }

}));





