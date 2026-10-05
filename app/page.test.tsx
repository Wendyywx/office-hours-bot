import { fireEvent, render, screen } from '@testing-library/react';
import HomePage from './page';

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
});
