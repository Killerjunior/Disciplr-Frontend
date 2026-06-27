import { describe, it, expect } from 'vitest';
import {
  daysRemaining,
  urgencyColor,
  relativeTime,
  formatSummary,
  processDeadlines,
  processActivity,
  type Deadline,
  type Activity,
} from '../dashboard';

describe('Dashboard Utility Helpers', () => {
  // A fixed timestamp representing 2026-06-27T12:00:00Z
  const MOCK_NOW = new Date('2026-06-27T12:00:00Z').getTime();

  describe('daysRemaining', () => {
    it('returns positive days when deadline is in the future', () => {
      // 2026-06-29T12:00:00Z is exactly 2 days in the future
      const deadline = '2026-06-29T12:00:00Z';
      expect(daysRemaining(deadline, MOCK_NOW)).toBe(2);
    });

    it('returns 0 when deadline is exactly now or in the past', () => {
      const deadlineNow = '2026-06-27T12:00:00Z';
      const deadlinePast = '2026-06-25T12:00:00Z';
      expect(daysRemaining(deadlineNow, MOCK_NOW)).toBe(0);
      expect(daysRemaining(deadlinePast, MOCK_NOW)).toBe(0);
    });

    it('rounds up partial days remaining', () => {
      // 1.1 days in the future should round up to 2
      const deadline = '2026-06-28T14:24:00Z';
      expect(daysRemaining(deadline, MOCK_NOW)).toBe(2);
    });
  });

  describe('urgencyColor', () => {
    it('returns danger color when days remaining is 7 or less', () => {
      expect(urgencyColor(0)).toBe('var(--danger)');
      expect(urgencyColor(5)).toBe('var(--danger)');
      expect(urgencyColor(7)).toBe('var(--danger)');
    });

    it('returns warning color when days remaining is between 8 and 30', () => {
      expect(urgencyColor(8)).toBe('var(--warning)');
      expect(urgencyColor(15)).toBe('var(--warning)');
      expect(urgencyColor(30)).toBe('var(--warning)');
    });

    it('returns success color when days remaining is greater than 30', () => {
      expect(urgencyColor(31)).toBe('var(--success)');
      expect(urgencyColor(100)).toBe('var(--success)');
    });
  });

  describe('relativeTime', () => {
    it('returns "just now" when difference is less than an hour', () => {
      // 30 minutes ago
      const iso = new Date(MOCK_NOW - 30 * 60 * 1000).toISOString();
      expect(relativeTime(iso, MOCK_NOW)).toBe('just now');
    });

    it('returns "Xh ago" when difference is between 1 and 24 hours', () => {
      // 5 hours ago
      const iso = new Date(MOCK_NOW - 5 * 60 * 60 * 1000).toISOString();
      expect(relativeTime(iso, MOCK_NOW)).toBe('5h ago');
    });

    it('returns "Xd ago" when difference is 24 hours or more', () => {
      // 3 days ago
      const iso = new Date(MOCK_NOW - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(relativeTime(iso, MOCK_NOW)).toBe('3d ago');
    });
  });

  describe('formatSummary', () => {
    it('formats summary numbers and rates properly', () => {
      const summary = {
        totalLocked: 1250500,
        activeVaults: 15,
        pendingMilestones: 4,
        completionRate: 85,
      };

      const formatted = formatSummary(summary);
      expect(formatted).toEqual({
        totalLocked: '$1,250,500',
        activeVaults: '15',
        pendingMilestones: '4',
        completionRate: '85%',
      });
    });
  });

  describe('processDeadlines', () => {
    it('returns an empty array when given an empty list', () => {
      expect(processDeadlines([], MOCK_NOW)).toEqual([]);
    });

    it('sorts deadlines in ascending order of deadline date and formats items', () => {
      const deadlines: Deadline[] = [
        { id: '2', name: 'Later Vault', deadline: '2026-07-10T12:00:00Z', amount: 1000 },
        { id: '1', name: 'Earlier Vault', deadline: '2026-06-30T12:00:00Z', amount: 5000 },
      ];

      const processed = processDeadlines(deadlines, MOCK_NOW);
      expect(processed).toHaveLength(2);

      // Check sorting order (Earlier Vault first)
      expect(processed[0].id).toBe('1');
      expect(processed[1].id).toBe('2');

      // Check formatted properties
      expect(processed[0].daysRemaining).toBe(3);
      expect(processed[0].urgencyColor).toBe('var(--danger)'); // <= 7 days
      expect(processed[0].formattedDays).toBe('3d');
      expect(processed[0].formattedAmount).toBe('5,000 USDC');
      expect(processed[0].formattedDate).toBe('Jun 30');

      expect(processed[1].daysRemaining).toBe(13);
      expect(processed[1].urgencyColor).toBe('var(--warning)'); // <= 30 days
      expect(processed[1].formattedDays).toBe('13d');
      expect(processed[1].formattedAmount).toBe('1,000 USDC');
      expect(processed[1].formattedDate).toBe('Jul 10');
    });

    it('handles a single deadline item correctly', () => {
      const deadlines: Deadline[] = [
        { id: '1', name: 'Single Vault', deadline: '2026-06-27T12:00:00Z', amount: 250 },
      ];
      const processed = processDeadlines(deadlines, MOCK_NOW);
      expect(processed).toHaveLength(1);
      expect(processed[0].formattedDays).toBe('Today');
    });
  });

  describe('processActivity', () => {
    it('returns an empty array when given an empty list', () => {
      expect(processActivity([], MOCK_NOW)).toEqual([]);
    });

    it('sorts activities in descending order of timestamp (newest first) and formats items', () => {
      const activities: Activity[] = [
        { id: 'a2', type: 'created', vault: 'Alpha Vault', timestamp: '2026-06-25T12:00:00Z', amount: 2000 },
        { id: 'a1', type: 'validated', vault: 'Beta Vault', timestamp: '2026-06-26T12:00:00Z' },
      ];

      const processed = processActivity(activities, MOCK_NOW);
      expect(processed).toHaveLength(2);

      // Check sorting order (newest timestamp first, which is a1)
      expect(processed[0].id).toBe('a1');
      expect(processed[1].id).toBe('a2');

      // Check formatting
      expect(processed[0].relativeTime).toBe('24h ago'); // 2026-06-27T12:00:00 - 2026-06-26T12:00:00 = 24h
      expect(processed[0].formattedAmount).toBeUndefined();

      expect(processed[1].relativeTime).toBe('2d ago'); // 48h
      expect(processed[1].formattedAmount).toBe('2,000 USDC');
    });

    it('handles a single activity item correctly', () => {
      const activities: Activity[] = [
        { id: 'a1', type: 'created', vault: 'Beta Vault', timestamp: '2026-06-27T11:45:00Z' },
      ];
      const processed = processActivity(activities, MOCK_NOW);
      expect(processed).toHaveLength(1);
      expect(processed[0].relativeTime).toBe('just now');
    });
  });
});
