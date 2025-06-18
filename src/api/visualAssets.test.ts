import { simpleSemanticScore } from './visualAssets';

describe('simpleSemanticScore', () => {
  it('returns higher score for more keyword overlap', () => {
    const query = 'Ancient Rome Map';
    const asset1 = { title: 'Map of Ancient Rome', attribution: '', url: '', source: '' };
    const asset2 = { title: 'Banana', attribution: '', url: '', source: '' };
    expect(simpleSemanticScore(query, asset1)).toBeGreaterThan(simpleSemanticScore(query, asset2));
  });

  it('returns 0 for no overlap', () => {
    const query = 'Space Shuttle';
    const asset = { title: 'Banana', attribution: '', url: '', source: '' };
    expect(simpleSemanticScore(query, asset)).toBe(0);
  });

  it('is case-insensitive and ignores short words', () => {
    const query = 'The Map';
    const asset = { title: 'map', attribution: '', url: '', source: '' };
    expect(simpleSemanticScore(query, asset)).toBe(1);
  });
});
