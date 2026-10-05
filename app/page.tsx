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

const MAX_QUESTIONS_PER_SESSION = 40;
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
    const [totalQuestions, setTotalQuestions] = useState(0);

    const submitQuestion = (submittedQuestion: string) => {
        const trimmedQuestion = submittedQuestion.trim();

        if (!trimmedQuestion) {
            setFormError('Please enter a question before submitting.');
            return;
        }

        if (trimmedQuestion.length > MAX_QUESTION_LENGTH) {
            setFormError('Question is too long. Please shorten it to 2000 characters or fewer.');
            return;
        }

        if (totalQuestions >= MAX_QUESTIONS_PER_SESSION) {
            setFormError('Question limit reached for this session.');
            return;
        }

        setFormError('');
        const response = findAnswer(trimmedQuestion);
        setTotalQuestions((count) => count + 1);

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

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        submitQuestion(question);
    };

    const startNewConversation = () => {
        setMessages([]);
        setQuestion('');
        setFormError('');
    };

    const displayName = studentName.trim() || 'Student';

    return (
        <main className="page-shell">
            <div className="app-shell">
                <header className="topbar">
                    <a className="brand" href="/" aria-label="Office Hours Bot home">
                        <span className="brand-mark" aria-hidden="true">OH</span>
                        <span className="brand-name">Office Hours Bot</span>
                    </a>
                    <div className="topbar-meta">
                        <span className="course-code">70-445 <span aria-hidden="true">/</span> FALL 2026</span>
                        <span className="student-tag"><span className="status-dot" /> Student mode</span>
                    </div>
                </header>

                <div className="workspace">
                    <aside className="course-rail" aria-label="Course information">
                        <div className="course-heading">
                            <p className="rail-label">YOUR COURSE</p>
                            <h1>Office Hours Bot</h1>
                            <p className="course-title">Artificial Intelligence<br />for Business Leaders</p>
                            <p className="term-label">Fall 2026 <span>•</span> 70-445</p>
                        </div>

                        <div className="rail-divider" />

                        <section className="source-section" aria-labelledby="source-heading">
                            <p className="rail-label">REFERENCE LIBRARY</p>
                            <h2 id="source-heading">Course sources</h2>
                            <ul className="source-list">
                                <li>
                                    <span className="source-index">01</span>
                                    <span><strong>Course Syllabus</strong><small>Policies and office hours</small></span>
                                </li>
                                <li>
                                    <span className="source-index source-index-coral">02</span>
                                    <span><strong>Lecture 2</strong><small>Research methods</small></span>
                                </li>
                            </ul>
                        </section>

                        <div className="rail-footer">
                            <div className="capacity-label">
                                <span className="rail-label">THIS SESSION</span>
                                <span className="capacity-count">{totalQuestions}<span> / {MAX_QUESTIONS_PER_SESSION}</span></span>
                            </div>
                            <progress value={totalQuestions} max={MAX_QUESTIONS_PER_SESSION} aria-label="Session questions used" />
                        </div>
                    </aside>

                    <section className="conversation" aria-label="Course Q&A">
                        <div className="conversation-header">
                            <div>
                                <p className="eyebrow">OFFICE HOURS <span>/</span> 01</p>
                                <h2>Ask the course</h2>
                            </div>
                            {messages.length > 0 ? (
                                <button className="new-conversation" type="button" onClick={startNewConversation}>
                                    <span aria-hidden="true">+</span> New conversation
                                </button>
                            ) : null}
                        </div>

                        {messages.length === 0 ? (
                            <div className="empty-state">
                                <div className="welcome-line">
                                    <span className="welcome-mark" aria-hidden="true">?</span>
                                    <div>
                                        <p className="welcome-label">WELCOME, {displayName.toUpperCase()}</p>
                                        <h3>What are you working through?</h3>
                                    </div>
                                </div>
                                <div className="prompt-heading">
                                    <span>QUICK QUESTIONS</span>
                                    <span className="prompt-count">03</span>
                                </div>
                                <div className="prompt-grid">
                                    <button type="button" className="prompt-option" aria-label="Ask about late policy" onClick={() => submitQuestion('What is the late policy?')}>
                                        <span className="prompt-number">01</span>
                                        <span className="prompt-title">Late policy</span>
                                        <span className="prompt-arrow" aria-hidden="true">↗</span>
                                    </button>
                                    <button type="button" className="prompt-option" aria-label="Ask about office hours" onClick={() => submitQuestion('When are office hours?')}>
                                        <span className="prompt-number">02</span>
                                        <span className="prompt-title">Office hours</span>
                                        <span className="prompt-arrow" aria-hidden="true">↗</span>
                                    </button>
                                    <button type="button" className="prompt-option" aria-label="Ask about participation grade" onClick={() => submitQuestion('How much is participation worth?')}>
                                        <span className="prompt-number">03</span>
                                        <span className="prompt-title">Participation grade</span>
                                        <span className="prompt-arrow" aria-hidden="true">↗</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="chat-log" aria-live="polite">
                                {messages.map((message, index) => (
                                    <article key={`${message.role}-${index}`} className={`message ${message.role}`}>
                                        {message.role === 'student' ? (
                                            <>
                                                <p className="message-label">{displayName} <span>• YOU</span></p>
                                                <p className="message-text">{message.text}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="message-label assistant-label"><span className="assistant-mark">OH</span> OFFICE HOURS BOT</p>
                                                <p className="message-text">{message.text}</p>
                                                <p className="source-line"><span className="source-dot" /> <strong>Source</strong> {message.source}</p>
                                            </>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="question-form">
                            <div className="field-group">
                                <label htmlFor="studentName">Student name</label>
                                <input
                                    id="studentName"
                                    type="text"
                                    value={studentName}
                                    onChange={(event) => {
                                        setStudentName(event.target.value);
                                        if (formError) setFormError('');
                                    }}
                                    placeholder="Type your name"
                                />
                            </div>

                            <div className="field-group question-field">
                                <label htmlFor="question">Your question</label>
                                <textarea
                                    id="question"
                                    value={question}
                                    onChange={(event) => {
                                        setQuestion(event.target.value);
                                        if (formError) setFormError('');
                                    }}
                                    rows={3}
                                    maxLength={MAX_QUESTION_LENGTH}
                                    placeholder="Ask about a course policy, concept, or deadline..."
                                />
                                <span className="character-count" aria-live="polite">{question.length} / {MAX_QUESTION_LENGTH}</span>
                            </div>

                            <button className="ask-button" type="submit">Ask question <span aria-hidden="true">↗</span></button>
                            {formError ? <p className="validation-message" role="alert">{formError}</p> : null}
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
}
