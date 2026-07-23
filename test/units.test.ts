import { describe, it, expect } from 'vitest';
import { toUniteAchat } from '@/lib/units';

describe('toUniteAchat', () => {
  it('convertit g/kg et mL/L', () => {
    expect(toUniteAchat(500, 'g', 'kg')).toBe(0.5);
    expect(toUniteAchat(2, 'kg', 'kg')).toBe(2);
    expect(toUniteAchat(250, 'mL', 'L')).toBe(0.25);
    expect(toUniteAchat(1.5, 'L', 'L')).toBe(1.5);
  });

  it('convertit piece vers piece', () => {
    expect(toUniteAchat(3, 'piece', 'piece')).toBe(3);
  });

  it('utilise poidsEquivG pour piece/part vers kg', () => {
    expect(toUniteAchat(2, 'piece', 'kg', 50)).toBeCloseTo(0.1);
    expect(toUniteAchat(4, 'part', 'kg', 25)).toBeCloseTo(0.1);
  });

  it('renvoie null si conversion impossible', () => {
    expect(toUniteAchat(1, 'L', 'kg')).toBeNull();
    expect(toUniteAchat(1, 'piece', 'kg')).toBeNull();
    expect(toUniteAchat(1, 'part', 'kg', null)).toBeNull();
  });
});
