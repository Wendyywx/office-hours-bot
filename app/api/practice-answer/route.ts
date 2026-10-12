type PracticeAnswer = {
    correctOptionId: string;
    explanation: string;
    source: string;
};

const practiceAnswers: Record<string, PracticeAnswer> = {
    'participation-weight': {
        correctOptionId: 'option-15',
        explanation: 'The lecture says participation is 15 percent of the final grade.',
        source: 'Lecture 2: Research Methods — Participation',
    },
    'participation-basis': {
        correctOptionId: 'option-attendance-discussion',
        explanation: 'The lecture says participation is based on attendance and contributions during class discussions.',
        source: 'Lecture 2: Research Methods — Participation',
    },
    'participation-description': {
        correctOptionId: 'option-combined',
        explanation: 'This choice combines both facts stated in the lecture: participation is 15 percent of the final grade and is based on attendance and class discussion contributions.',
        source: 'Lecture 2: Research Methods — Participation',
    },
};

export async function POST(request: Request) {
    let body: { questionId?: unknown };

    try {
        body = (await request.json()) as { questionId?: unknown };
    } catch {
        return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }

    if (typeof body.questionId !== 'string' || !Object.hasOwn(practiceAnswers, body.questionId)) {
        return Response.json({ error: 'Practice question not found.' }, { status: 404 });
    }

    return Response.json(practiceAnswers[body.questionId]);
}
