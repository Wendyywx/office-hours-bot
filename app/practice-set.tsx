'use client';

import { useState } from 'react';

type PracticeOption = {
    id: string;
    label: string;
};

type PracticeQuestion = {
    id: string;
    prompt: string;
    options: PracticeOption[];
};

type RevealedAnswer = {
    correctOptionId: string;
    explanation: string;
    source: string;
};

const practiceQuestions: PracticeQuestion[] = [
    {
        id: 'participation-weight',
        prompt: 'What percentage of the final grade is participation?',
        options: [
            { id: 'option-5', label: '5 percent' },
            { id: 'option-10', label: '10 percent' },
            { id: 'option-15', label: '15 percent' },
            { id: 'option-20', label: '20 percent' },
        ],
    },
    {
        id: 'participation-basis',
        prompt: 'What does the lecture say participation is based on?',
        options: [
            { id: 'option-exams', label: 'Exam scores and attendance' },
            { id: 'option-attendance-discussion', label: 'Attendance and contributions during class discussions' },
            { id: 'option-assignments', label: 'Assignment scores only' },
            { id: 'option-presentations', label: 'Group presentation results' },
        ],
    },
    {
        id: 'participation-description',
        prompt: 'Which statement matches the lecture’s description of participation?',
        options: [
            { id: 'option-10-quizzes', label: 'It is 10 percent of the grade and based on quiz results.' },
            { id: 'option-projects', label: 'It is based on project scores and assignment deadlines.' },
            { id: 'option-combined', label: 'It is 15 percent of the grade and based on attendance and class discussion contributions.' },
            { id: 'option-exams-discussion', label: 'It is based on exam scores and discussion contributions.' },
        ],
    },
];

const lectureSource = 'Lecture 2: Research Methods — Participation';

export default function PracticeSet() {
    const [started, setStarted] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState('');
    const [revealedAnswer, setRevealedAnswer] = useState<RevealedAnswer | null>(null);
    const [answerError, setAnswerError] = useState('');
    const [isRevealing, setIsRevealing] = useState(false);
    const [score, setScore] = useState(0);

    const currentQuestion = practiceQuestions[questionIndex];
    const correctOption = currentQuestion?.options.find((option) => option.id === revealedAnswer?.correctOptionId);

    const startPractice = () => {
        setQuestionIndex(0);
        setSelectedOptionId('');
        setRevealedAnswer(null);
        setAnswerError('');
        setScore(0);
        setCompleted(false);
        setStarted(true);
    };

    const showAnswer = async () => {
        if (!currentQuestion || !selectedOptionId || isRevealing) {
            return;
        }

        setIsRevealing(true);
        setAnswerError('');

        try {
            const response = await fetch('/api/practice-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId: currentQuestion.id }),
            });

            if (!response.ok) {
                throw new Error('The answer is temporarily unavailable. Please try again.');
            }

            const answer = (await response.json()) as RevealedAnswer;
            setRevealedAnswer(answer);
            if (selectedOptionId === answer.correctOptionId) {
                setScore((currentScore) => currentScore + 1);
            }
        } catch {
            setAnswerError('The answer is temporarily unavailable. Please try again.');
        } finally {
            setIsRevealing(false);
        }
    };

    const continuePractice = () => {
        if (questionIndex === practiceQuestions.length - 1) {
            setCompleted(true);
            return;
        }

        setQuestionIndex((currentIndex) => currentIndex + 1);
        setSelectedOptionId('');
        setRevealedAnswer(null);
        setAnswerError('');
    };

    if (!started) {
        return (
            <section className="practice-panel" aria-labelledby="practice-title">
                <div className="practice-intro">
                    <p className="practice-kicker">LECTURE PRACTICE</p>
                    <h3 id="practice-title">Lecture 2: Research Methods</h3>
                    <p className="practice-description">Three quick questions based only on the available lecture sample. Answers stay hidden until you choose to reveal them.</p>
                    <div className="practice-source"><span>3 QUESTIONS</span><span className="practice-source-separator">/</span>{lectureSource}</div>
                    <button className="ask-button practice-start" type="button" onClick={startPractice}>
                        Start practice set <span aria-hidden="true">↗</span>
                    </button>
                </div>
            </section>
        );
    }

    if (completed) {
        return (
            <section className="practice-panel practice-complete" aria-live="polite">
                <p className="practice-kicker">PRACTICE COMPLETE</p>
                <h3>Nice work, {score} of {practiceQuestions.length} correct.</h3>
                <p className="practice-description">Your practice result is temporary and is not saved.</p>
                <button className="ask-button practice-start" type="button" onClick={startPractice}>
                    Try again <span aria-hidden="true">↗</span>
                </button>
            </section>
        );
    }

    return (
        <section className="practice-panel practice-session" aria-labelledby="practice-question">
            <div className="practice-progress-row">
                <p className="practice-kicker">QUESTION {questionIndex + 1} OF {practiceQuestions.length}</p>
                <span className="practice-score">{score} correct</span>
            </div>
            <progress className="practice-progress" value={questionIndex + 1} max={practiceQuestions.length} aria-label="Practice set progress" />
            <p className="practice-source practice-session-source"><span>SOURCE</span>{lectureSource}</p>
            <fieldset className="practice-question">
                <legend id="practice-question">{currentQuestion.prompt}</legend>
                <div className="practice-options" role="radiogroup" aria-label="Answer choices">
                    {currentQuestion.options.map((option) => (
                        <label key={option.id} className={`practice-option${selectedOptionId === option.id ? ' selected' : ''}`}>
                            <input
                                type="radio"
                                name="practice-answer"
                                value={option.id}
                                checked={selectedOptionId === option.id}
                                disabled={Boolean(revealedAnswer)}
                                onChange={() => setSelectedOptionId(option.id)}
                            />
                            <span className="practice-radio" aria-hidden="true" />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            {revealedAnswer && correctOption ? (
                <div className={`practice-reveal${selectedOptionId === revealedAnswer.correctOptionId ? ' is-correct' : ''}`} role="status">
                    <p className="practice-result">
                        {selectedOptionId === revealedAnswer.correctOptionId ? 'Correct — ' : 'Review this one — '}
                        <strong>Correct answer: {correctOption.label}</strong>
                    </p>
                    <p className="practice-explanation">{revealedAnswer.explanation}</p>
                    <p className="source-line"><span className="source-dot" /><strong>Source</strong> {revealedAnswer.source}</p>
                </div>
            ) : null}

            {answerError ? <p className="validation-message" role="alert">{answerError}</p> : null}

            <div className="practice-actions">
                {!revealedAnswer ? (
                    <button className="ask-button" type="button" onClick={showAnswer} disabled={!selectedOptionId || isRevealing}>
                        {isRevealing ? 'Checking…' : 'Show answer'} <span aria-hidden="true">↗</span>
                    </button>
                ) : (
                    <button className="ask-button" type="button" onClick={continuePractice}>
                        {questionIndex === practiceQuestions.length - 1 ? 'Finish practice' : 'Next question'} <span aria-hidden="true">↗</span>
                    </button>
                )}
            </div>
        </section>
    );
}
