/**
 * saved-wrong-question controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::saved-wrong-question.saved-wrong-question', ({strapi}) => ({
    async saveQuestions(ctx) {
        const user = ctx.state.user
        const { questionsToSave } = ctx.request.body

        console.log(questionsToSave)

        await Promise.all(
            questionsToSave.map((q) =>
                strapi.entityService.create("api::saved-wrong-question.saved-wrong-question", {
                    data: {
                        ...q,
                        users_permissions_user: user.id,
                        wrongCount: 1,
                        correctStreak: 0,
                        learningStatus: "active",
                        lastMistakeAt: new Date(),
                    },
                })
            )
        );
    },

    async getSavedQuestionForHome(ctx) {
        const user = ctx.state.user

        const savedQuestion = await strapi.entityService.findMany("api::saved-wrong-question.saved-wrong-question", {
            filters: {
                users_permissions_user: user.id,
                learning_status: "active",
            },
            sort: [
                { wrong_count: "desc" },
                { last_mistake_at: "desc" },
            ],
            pagination: {
                page: 1,
                pageSize: 1,
            }
        })

        ctx.body = savedQuestion[0] 
    },

    async getSavedQuestions(ctx) {
        const user = ctx.state.user
        const page = Number(ctx.query.page)
        const pageSize = 15

        const total = await strapi.entityService.count("api::saved-wrong-question.saved-wrong-question", {
            filters: {
                users_permissions_user: user.id,
                learning_status: "active",
            },
        })

        if ((page - 1) * pageSize >= total) {
            ctx.body = [];
            return;
        }

        const savedQuestions = await strapi.entityService.findMany("api::saved-wrong-question.saved-wrong-question", {
            filters: {
                users_permissions_user: user.id,
                learning_status: "active"
            },
            pagination: {
                page,
                pageSize: pageSize,
            },
            fields: ["question", 'answer', 'choices', 'correct_streak', 'wrong_count', 'explanation']
        })

        console.log(savedQuestions)

        ctx.body = savedQuestions
    },

    async updateSavedQuestions(ctx) {
        const user = ctx.state.user
        const questions = ctx.request.body


        console.log(questions)

        for (const q of questions) {
            const existing = await strapi.entityService.findMany("api::saved-wrong-question.saved-wrong-question", {
                filters: {
                    users_permissions_user: user.id,
                    question: q.question.question,
                },
                pagination: { pageSize: 1 },
            });

            if (!existing || existing.length === 0) continue;

            const saved = existing[0];

            const correct_streak = saved.correct_streak ?? 0;
            const wrong_count = saved.wrong_count ?? 0;

            if (q.isCorrect) {
                const newStreak = correct_streak + 1;

                await strapi.entityService.update(
                    "api::saved-wrong-question.saved-wrong-question",
                    saved.id,
                    {
                    data: {
                        correct_streak: newStreak,
                        learning_status: newStreak >= 3 ? "mastered" : "active",
                    },
                    }
                );  
            } else {
                await strapi.entityService.update(
                    "api::saved-wrong-question.saved-wrong-question",
                    saved.id,
                    {
                    data: {
                        wrong_count: wrong_count + 1,
                        correct_streak: 0,
                        learning_status: "active",
                        last_mistake_at: new Date().toISOString(),
                    },
                    }
                );
            }
        }
    }
}))
