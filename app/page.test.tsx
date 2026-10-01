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
        expect(screen.getByText(/source:/i)).toBeInTheDocument();
        expect(screen.getByText(/course syllabus/i)).toBeInTheDocument();
        expect(screen.getByText(/alex:/i)).toBeInTheDocument();
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

    it('stops answering after the daily question limit', () => {
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

        expect(screen.getByText(/daily limit reached/i)).toBeInTheDocument();
    });
});
