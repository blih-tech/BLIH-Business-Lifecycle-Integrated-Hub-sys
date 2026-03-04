import { computeCandidateScreeningScore } from './candidate-scoring.utils';

describe('computeCandidateScreeningScore', () => {
  it('applies the documented weighted recruitment factors', () => {
    const result = computeCandidateScreeningScore([
      { factor: 'experience', rating: 4 },
      { factor: 'skills', rating: 5 },
      { factor: 'education', rating: 3 },
      { factor: 'culture_fit', rating: 4 },
      { factor: 'communication', rating: 4 },
    ]);

    expect(result.score).toBe(84);
    expect(result.recommendation).toBe('SELECT');
    expect(result.band).toBe('SHORTLIST');
  });

  it('falls back to decline for weak scores', () => {
    const result = computeCandidateScreeningScore([
      { factor: 'experience', rating: 1 },
      { factor: 'skills', rating: 2 },
    ]);

    expect(result.recommendation).toBe('DECLINE');
    expect(result.band).toBe('AUTO_DECLINE');
  });
});
