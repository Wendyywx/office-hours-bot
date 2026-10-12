import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import HomePage from './page';

const practiceAnswerFixtures: Record<string, unknown> = {
    'participation-weight': {
        correctOptionId: 'option-15',
        explanation: 'Participation makes up 15 percent of the final grade.',
        source: 'Lecture 2: Research Methods — Participation',
    },
    'participation-basis': {
        correctOptionId: 'option-attendance-discussion',
        explanation: 'The lecture says participation is based on attendance and contributions during class discussions.',
        source: 'Lecture 2: Research Methods — Participation',
    },
    'participation-description': {
        correctOptionId: 'option-combined',
        explanation: 'The lecture connects participation to attendance, class discussion contributions, and 15 percent of the final grade.',
        source: 'Lecture 2: Research Methods — Participation',
    },
};

const originalFetch = globalThis.fetch;

afterEach(() => {
    globalThis.fetch = originalFetch;
});

function mockPracticeAnswerEndpoint() {
    const fetchMock = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        const { questionId } = JSON.parse(String(init?.body)) as { questionId: string };
        return {
            ok: true,
            json: async () => practiceAnswerFixtures[questionId],
        } as Response;
    });

    globalThis.fetch = fetchMock as typeof fetch;
    return fetchMock;
}

function openPracticeSet() {
    fireEvent.click(screen.getByRole('tab', { name: /practice/i }));
    fireEvent.click(screen.getByRole('button', { name: /start practice set/i }));
}

describe('Office Hours Bot - Story 1', () => {
    it('lets a student ask a course-related question and receives a grounded answer with a source', () => {
        render(<HomePage />);

        fireEvent.change(screen.getByLabelText(/student name/i), {
            target: { value: 'Alex' },
        });

        fireEvent.change(screen.getByLabelText(/your question/i), {
            target: { value: 'What is the late policy?' },
        });

        fireEvent.click(screen.getByRole('button', { name: /ask question/i }));

        expect(screen.getAllByText(/late policy/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/^source$/i)).toBeInTheDocument();
        expect(screen.getAllByText(/course syllabus/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/^alex/i)).toBeInTheDocument();
    });

    it('shows a helpful message when the form is blank', () => {
        render(<HomePage />);

        fireEvent.change(screen.getByLabelText(/student name/i), {
            target: { value: 'Alex' },
        });

        fireEvent.click(screen.getByRole('button', { name: /ask question/i }));

        expect(screen.getByText(/please enter a question before submitting/i)).toBeInTheDocument();
    });

    it('returns a safe “not enough information” answer for out-of-scope questions', () => {
        render(<HomePage />);

        fireEvent.change(screen.getByLabelText(/student name/i), {
            target: { value: 'Alex' },
        });

        fireEvent.change(screen.getByLabelText(/your question/i), {
            target: { value: 'Who won the World Series in 2024?' },
        });

        fireEvent.click(screen.getByRole('button', { name: /ask question/i }));

        expect(screen.getByText(/i can't determine that from the available course materials/i)).toBeInTheDocument();
    });

    it('stops answering after the session question limit', () => {
        render(<HomePage />);

        fireEvent.change(screen.getByLabelText(/student name/i), {
            target: { value: 'Alex' },
        });

        const askButton = screen.getByRole('button', { name: /ask question/i });
        const questionInput = screen.getByLabelText(/your question/i);

        for (let i = 0; i < 40; i += 1) {
            fireEvent.change(questionInput, {
                target: { value: 'What is the late policy?' },
            });
            fireEvent.click(askButton);
        }

        fireEvent.change(questionInput, {
            target: { value: 'What is the late policy?' },
        });
        fireEvent.click(askButton);

        expect(screen.getByText(/question limit reached for this session/i)).toBeInTheDocument();
    });

    it('sends a suggested course question and shows its source', () => {
        render(<HomePage />);

        fireEvent.click(screen.getByRole('button', { name: /ask about late policy/i }));

        expect(screen.getByText(/three days late with a 10 percent penalty/i)).toBeInTheDocument();
        expect(screen.getAllByText(/course syllabus/i).length).toBeGreaterThan(0);
    });

    it('lets the student start a new conversation', () => {
        render(<HomePage />);

        fireEvent.change(screen.getByLabelText(/your question/i), {
            target: { value: 'What is the late policy?' },
        });
        fireEvent.click(screen.getByRole('button', { name: /ask question/i }));
        fireEvent.click(screen.getByRole('button', { name: /new conversation/i }));

        expect(screen.queryByText(/three days late with a 10 percent penalty/i)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ask about late policy/i })).toBeInTheDocument();
    });

    it('shows the question character count and enforces the text limit', () => {
        render(<HomePage />);

        const questionInput = screen.getByLabelText(/your question/i);
        expect(screen.getByText('0 / 2000')).toBeInTheDocument();
        expect(questionInput).toHaveAttribute('maxLength', '2000');

        fireEvent.change(questionInput, {
            target: { value: 'What is the late policy?' },
        });

        expect(screen.getByText('24 / 2000')).toBeInTheDocument();
    });

    it('provides three practice questions from the named lecture and shows its source', async () => {
        mockPracticeAnswerEndpoint();
        render(<HomePage />);
        openPracticeSet();

        expect(screen.getByText(/question 1 of 3/i)).toBeInTheDocument();
        expect(screen.getByText(/lecture 2: research methods/i)).toBeInTheDocument();
        expect(screen.getByText(/what percentage of the final grade is participation/i)).toBeInTheDocument();

        for (let questionNumber = 1; questionNumber <= 3; questionNumber += 1) {
            expect(screen.getByText(new RegExp(`question ${questionNumber} of 3`, 'i'))).toBeInTheDocument();
            fireEvent.click(screen.getAllByRole('radio')[0]);
            fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
            await screen.findByText(/correct answer:/i);

            fireEvent.click(screen.getByRole('button', {
                name: questionNumber === 3 ? /finish practice/i : /next question/i,
            }));
        }

        expect(screen.getByText(/practice complete/i)).toBeInTheDocument();
    });

    it('does not request or show an answer until the student chooses to show it', async () => {
        const fetchMock = mockPracticeAnswerEndpoint();
        render(<HomePage />);
        openPracticeSet();

        expect(screen.queryByText(/correct answer:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/participation makes up 15 percent/i)).not.toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('radio', { name: /15 percent/i }));
        fireEvent.click(screen.getByRole('button', { name: /show answer/i }));

        expect(await screen.findByText(/correct answer: 15 percent/i)).toBeInTheDocument();
        expect(screen.getByText(/participation makes up 15 percent of the final grade/i)).toBeInTheDocument();
        expect(screen.getAllByText(/lecture 2: research methods — participation/i)).toHaveLength(2);
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    });
});
