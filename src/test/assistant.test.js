import { describe, it, expect } from 'vitest';

// Test the JSON action extraction logic
// (extracted from AssistantChat.jsx into a pure function for testing)

function extractAction(text) {
  const jsonMatch = text.match(/\{[\s\S]*"action"[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

function stripActionFromText(text) {
  const jsonMatch = text.match(/\{[\s\S]*"action"[\s\S]*\}/);
  if (!jsonMatch) return text;
  return text.replace(jsonMatch[0], '').trim();
}

function sanitizeExpenseData(data) {
  const { type, ...rest } = data;
  return rest;
}

describe('AI Assistant — action extraction', () => {
  it('extracts create_expense action from response', () => {
    const response = 'I will add $120 electricity bill.\n{"action":"create_expense","data":{"name":"Electricity","amount":120,"category":"Utilities","date":"2026-06-10"}}';
    const action = extractAction(response);
    expect(action).not.toBeNull();
    expect(action.action).toBe('create_expense');
    expect(action.data.amount).toBe(120);
    expect(action.data.name).toBe('Electricity');
  });

  it('extracts create_recurring action from response', () => {
    const response = 'Adding monthly rent.\n{"action":"create_recurring","data":{"name":"Rent","amount":800,"category":"Housing","frequency":"monthly","start_date":"2026-06-10"}}';
    const action = extractAction(response);
    expect(action).not.toBeNull();
    expect(action.action).toBe('create_recurring');
    expect(action.data.frequency).toBe('monthly');
  });

  it('returns null when no JSON action in response', () => {
    const response = 'You spent $450 this month on groceries.';
    expect(extractAction(response)).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    const response = 'Here is the action: {"action":"create_expense","data":{broken json';
    expect(extractAction(response)).toBeNull();
  });

  it('strips JSON from display text', () => {
    const response = 'Adding electricity bill.\n{"action":"create_expense","data":{"name":"Electricity","amount":120,"category":"Utilities","date":"2026-06-10"}}';
    const stripped = stripActionFromText(response);
    expect(stripped).toBe('Adding electricity bill.');
    expect(stripped).not.toContain('"action"');
  });

  it('handles response with only JSON and no text', () => {
    const response = '{"action":"create_expense","data":{"name":"Electricity","amount":120,"category":"Utilities","date":"2026-06-10"}}';
    const stripped = stripActionFromText(response);
    expect(stripped).toBe('');
  });
});

describe('AI Assistant — data sanitization', () => {
  it('removes type field from expense data', () => {
    const data = { name: 'Electricity', amount: 120, category: 'Utilities', date: '2026-06-10', type: 'one-time' };
    const sanitized = sanitizeExpenseData(data);
    expect(sanitized.type).toBeUndefined();
    expect(sanitized.name).toBe('Electricity');
    expect(sanitized.amount).toBe(120);
  });

  it('preserves all valid expense fields', () => {
    const data = { name: 'Rent', amount: 800, category: 'Housing', date: '2026-06-10' };
    const sanitized = sanitizeExpenseData(data);
    expect(Object.keys(sanitized)).toEqual(['name', 'amount', 'category', 'date']);
  });
});

describe('AI Assistant — session storage', () => {
  it('correctly serializes and deserializes messages', () => {
    const messages = [
      { role: 'assistant', content: 'Hi!' },
      { role: 'user', content: 'Add $120 electricity' },
      { role: 'assistant', content: 'Added successfully!' }
    ];
    const serialized = JSON.stringify(messages);
    const deserialized = JSON.parse(serialized);
    expect(deserialized).toHaveLength(3);
    expect(deserialized[1].content).toBe('Add $120 electricity');
  });

  it('handles empty messages array', () => {
    const messages = [];
    const serialized = JSON.stringify(messages);
    expect(JSON.parse(serialized)).toHaveLength(0);
  });
});
