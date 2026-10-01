'use client';

import { FormEvent, useState } from 'react';

type Message = {
    role: 'student' | 'assistant';
    text: string;
    source?: string;
};

type CourseMaterial = {
    title: string;
    section: string;
    text: string;
};

const MAX_QUESTIONS_PER_DAY = 40;
const MAX_QUESTION_LENGTH = 2000;
const STOP_WORDS = new Set([
    'a',
    'an',
    'and',
    'are',
    'as',
    'at',
    'be',
    'by',
    'for',
    'from',
    'how',
    'i',
    'in',
    'is',
    'it',
    'of',
    'on',
    'or',
    'that',
    'the',
    'this',
    'to',
    'what',
    'when',
    'where',
    'who',
    'why',
    'with',
    'you',
    'your',
]);

const courseMaterials: CourseMaterial[] = [
    {
        title: 'Course Syllabus',
        section: 'Late policy',
        text: 'Assignments may be submitted up to three days late with a 10 percent penalty. The late policy applies to all major assignments and projects.',
    },
    {
        title: 'Course Syllabus',
        section: 'Office hours',
        text: 'Professor office hours are Tuesday and Thursday from 2:00 PM to 3:00 PM in Room 204.',
    },
    {
        title: 'Lecture 2: Research Methods',
        section: 'Participation',
        text: 'Participation is 15 percent of the final grade and is based on attendance and contributions during class discussions.',
    },
];

function findAnswer(question: string) {
    const normalizedQuestion = question.toLowerCase();
    const questionWords = normalizedQuestion
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.replace(/[^a-z]/g, ''))
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

    if (questionWords.length === 0) {
        return {
            answer:
                "I can't determine that from the available course materials. Please ask a question about the syllabus or lecture content.",
            source: 'No approved source found',
        };
    }

    const bestMatch = courseMaterials
        .map((material) => {
            const haystack = `${material.title} ${material.section} ${material.text}`.toLowerCase();
            const score = questionWords.reduce((total, word) => {
                return total + (haystack.includes(word) ? 1 : 0);
            }, 0);

            return { material, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)[0];

    if (!bestMatch) {
        return {
            answer:
                "I can't determine that from the available course materials. Please ask a question about the syllabus or lecture content.",
            source: 'No approved source found',
        };
    }

    const { material } = bestMatch;

    return {
        answer: material.text,
        source: `${material.title} — ${material.section}`,
    };
}

export default function HomePage() {
    const [studentName, setStudentName] = useState('Alex');
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [formError, setFormError] = useState('');

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        const trimmedQuestion = question.trim();
        const totalStudentQuestions = messages.filter((message) => message.role === 'student').length;

        if (!trimmedQuestion) {
            setFormError('Please enter a question before submitting.');
            return;
        }

        if (trimmedQuestion.length > MAX_QUESTION_LENGTH) {
            setFormError('Question is too long. Please shorten it to 2000 characters or fewer.');
            return;
        }

        if (totalStudentQuestions >= MAX_QUESTIONS_PER_DAY) {
            setFormError('Daily limit reached. Please try again tomorrow.');
            return;
        }

        setFormError('');
        const response = findAnswer(trimmedQuestion);
        const displayName = studentName.trim() || 'Student';

        setMessages((previous) => [
            ...previous,
            {
                role: 'student',
                text: trimmedQuestion,
            },
            {
                role: 'assistant',
                text: response.answer,
                source: response.source,
            },
        ]);
        setQuestion('');
    };

    const displayName = studentName.trim() || 'Student';

    return (
        <main className="page-shell">
            <section className="chat-card">
                <header className="header">
                    <div>
                        <p className="eyebrow">Course Q&A</p>
                        <h1>Office Hours Bot</h1>
                    </div>
                    <div className="student-tag">Student mode</div>
                </header>

                <form onSubmit={handleSubmit} className="question-form">
                    <div className="field-group">
                        <label htmlFor="studentName">Student name</label>
                        <input
                            id="studentName"
                            type="text"
                            value={studentName}
                            onChange={(event) => {
                                setStudentName(event.target.value);
                                if (formError) {
                                    setFormError('');
                                }
                            }}
                            placeholder="Type your name"
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="question">Your question</label>
                        <textarea
                            id="question"
                            value={question}
                            onChange={(event) => {
                                setQuestion(event.target.value);
                                if (formError) {
                                    setFormError('');
                                }
                            }}
                            rows={4}
                            placeholder="Ask about the course syllabus or lecture content"
                        />
                    </div>

                    <button type="submit">Ask question</button>
                    {formError ? (
                        <p className="validation-message" role="alert">
                            {formError}
                        </p>
                    ) : null}
                </form>

                <div className="chat-log" aria-live="polite">
                    {messages.map((message, index) => (
                        <div key={`${message.role}-${index}`} className={`message ${message.role}`}>
                            {message.role === 'student' ? (
                                <p>
                                    <strong>{displayName}:</strong> {message.text}
                                </p>
                            ) : (
                                <>
                                    <p>{message.text}</p>
                                    <p className="source-line">
                                        <strong>Source:</strong> {message.source}
                                    </p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
