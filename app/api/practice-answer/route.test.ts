/** @jest-environment node */

import { POST } from './route';

describe('practice answer endpoint', () => {
    it('reveals the answer and source for a known practice question', async () => {
        const request = new Request('http://localhost/api/practice-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId: 'participation-weight' }),
        });

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.correctOptionId).toBe('option-15');
        expect(body.source).toBe('Lecture 2: Research Methods — Participation');
    });

    it('does not return an answer for an unknown question', async () => {
        const request = new Request('http://localhost/api/practice-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId: 'unknown-question' }),
        });

        const response = await POST(request);

        expect(response.status).toBe(404);
    });
});