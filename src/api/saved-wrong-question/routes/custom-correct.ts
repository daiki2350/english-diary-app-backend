export default {
    routes: [
        {
            method: "POST",
            path: "/saved-wrong-questions/saveQuestions",
            handler: "saved-wrong-question.saveQuestions",
            config: {
                auth: {},
            },
        },
        {
            method: "GET", 
            path: "/saved-wrong-questions/getSavedQuestionForHome",
            handler: "saved-wrong-question.getSavedQuestionForHome",
            config: {
                auth: {},
            },
        },
        {
            method: "GET",
            path: "/saved-wrong-questions/getSavedQuestions",
            handler: "saved-wrong-question.getSavedQuestions",
            config: {
                auth: {},
            },
        },
        {
            method: "PATCH",
            path: "/saved-wrong-questions/updateSavedQuestions",
            handler: "saved-wrong-question.updateSavedQuestions",
            config: {
                auth: {},
            },
        },
    ]
}