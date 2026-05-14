import { describe, it, expect } from 'vitest'
import { parseAIJson } from './parseAIJson'

describe('parseAIJson', () => {
  describe('Well-formed JSON', () => {
    it('parses valid JSON object', () => {
      const json = '{"name": "John", "age": 30}'
      const result = parseAIJson(json)
      expect(result).toEqual({ name: 'John', age: 30 })
    })

    it('parses JSON with nested objects', () => {
      const json = '{"user": {"name": "John", "email": "john@example.com"}}'
      const result = parseAIJson(json)
      expect(result).toEqual({
        user: { name: 'John', email: 'john@example.com' },
      })
    })

    it('parses JSON with arrays', () => {
      const json = '{"items": [1, 2, 3], "names": ["a", "b"]}'
      const result = parseAIJson(json)
      expect(result).toEqual({
        items: [1, 2, 3],
        names: ['a', 'b'],
      })
    })
  })

  describe('Markdown code fences', () => {
    it('strips ```json fences', () => {
      const json = '```json\n{"name": "John"}\n```'
      const result = parseAIJson(json)
      expect(result).toEqual({ name: 'John' })
    })

    it('strips triple backticks without json label', () => {
      const json = '```\n{"name": "John"}\n```'
      const result = parseAIJson(json)
      expect(result).toEqual({ name: 'John' })
    })

    it('handles mixed case ```JSON', () => {
      const json = '```JSON\n{"name": "John"}\n```'
      const result = parseAIJson(json)
      expect(result).toEqual({ name: 'John' })
    })

    it('strips fences with extra whitespace', () => {
      const json = '  ```json  \n{"name": "John"}\n  ```  '
      const result = parseAIJson(json)
      expect(result).toEqual({ name: 'John' })
    })
  })

  describe('Extra prose before/after JSON', () => {
    it('ignores text before JSON object', () => {
      const json = 'Here is the JSON:\n{"name": "John"}'
      const result = parseAIJson(json)
      expect(result).toEqual({ name: 'John' })
    })

    it('ignores text after JSON object', () => {
      const json = '{"name": "John"}\nThat is the result.'
      const result = parseAIJson(json)
      expect(result).toEqual({ name: 'John' })
    })

    it('ignores prose before and after', () => {
      const json = 'Here is data:\n{"name": "John"}\nEnd of data.'
      const result = parseAIJson(json)
      expect(result).toEqual({ name: 'John' })
    })
  })

  describe('Bare control characters in strings', () => {
    it('handles newlines in string values', () => {
      const json = '{"text": "line1\nline2"}'
      const result = parseAIJson(json)
      expect(result).toEqual({ text: 'line1\nline2' })
    })

    it('handles tabs in string values', () => {
      const json = '{"text": "col1\tcol2"}'
      const result = parseAIJson(json)
      expect(result).toEqual({ text: 'col1\tcol2' })
    })

    it('handles multiple control characters', () => {
      const json = '{"text": "line1\nline2\ttab"}'
      const result = parseAIJson(json)
      expect(result).toEqual({ text: 'line1\nline2\ttab' })
    })
  })

  describe('Invalid escape sequences', () => {
    it('fixes invalid \\p escape', () => {
      const json = '{"text": "\\p is not valid"}'
      const result = parseAIJson(json)
      expect(result).toHaveProperty('text')
    })

    it('handles Windows paths with backslashes', () => {
      const json = '{"path": "C:\\\\Users\\\\file"}'
      const result = parseAIJson(json)
      expect(result).toEqual({ path: 'C:\\Users\\file' })
    })

    it('preserves valid escape sequences', () => {
      const json = '{"text": "quote\\"here", "newline": "line1\\nline2"}'
      const result = parseAIJson(json)
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('newline')
    })
  })

  describe('Complex AI-generated responses', () => {
    it('parses AI response with explanation text', () => {
      const response = `
        Based on the data, here's the analysis:
        
        \`\`\`json
        {
          "status": "success",
          "analysis": "The data shows...",
          "metrics": [10, 20, 30]
        }
        \`\`\`
        
        This means that...
      `
      const result = parseAIJson(response)
      expect(result).toEqual({
        status: 'success',
        analysis: expect.any(String),
        metrics: [10, 20, 30],
      })
    })

    it('parses AI response with multiple JSON properties', () => {
      const response = `
        \`\`\`json
        {
          "title": "Analysis Results",
          "content": "This is a
multi-line
response",
          "score": 0.95,
          "tags": ["analysis", "data"]
        }
        \`\`\`
      `
      const result = parseAIJson(response)
      expect(result).toHaveProperty('title')
      expect(result).toHaveProperty('content')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('tags')
    })
  })

  describe('Error handling', () => {
    it('throws error for non-JSON content', () => {
      const text = 'This is just plain text with no JSON'
      expect(() => parseAIJson(text)).toThrow('No JSON object found')
    })

    it('throws error for empty string', () => {
      expect(() => parseAIJson('')).toThrow()
    })

    it('throws error for unclosed JSON object', () => {
      const json = '{"name": "John"'
      expect(() => parseAIJson(json)).toThrow()
    })

    it('throws error for only opening brace', () => {
      const text = 'Some text with { but no closing'
      expect(() => parseAIJson(text)).toThrow()
    })
  })

  describe('Edge cases', () => {
    it('parses empty JSON object', () => {
      const json = '{}'
      const result = parseAIJson(json)
      expect(result).toEqual({})
    })

    it('parses JSON with empty strings', () => {
      const json = '{"name": "", "value": ""}'
      const result = parseAIJson(json)
      expect(result).toEqual({ name: '', value: '' })
    })

    it('parses JSON with null values', () => {
      const json = '{"value": null, "optional": null}'
      const result = parseAIJson(json)
      expect(result).toEqual({ value: null, optional: null })
    })

    it('parses JSON with boolean values', () => {
      const json = '{"active": true, "deleted": false}'
      const result = parseAIJson(json)
      expect(result).toEqual({ active: true, deleted: false })
    })

    it('parses JSON with numeric values', () => {
      const json = '{"int": 42, "float": 3.14, "negative": -5}'
      const result = parseAIJson(json)
      expect(result).toEqual({ int: 42, float: 3.14, negative: -5 })
    })

    it('parses deeply nested objects', () => {
      const json = '{"a": {"b": {"c": {"d": "value"}}}}'
      const result = parseAIJson(json)
      expect(result).toEqual({
        a: { b: { c: { d: 'value' } } },
      })
    })

    it('handles special characters in strings', () => {
      const json = '{"text": "!@#$%^&*()_+-=[]{}|;:,.<>?"}'
      const result = parseAIJson(json)
      expect(result).toEqual({
        text: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      })
    })
  })
})
