import { num, fmt, pct } from '../num'

test('num safely parses', ()=>{
  expect(num('123')).toBe(123)
  expect(num(undefined)).toBe(0)
  expect(num('')).toBe(0)
})
test('fmt formats', ()=>{
  expect(fmt(1234)).toContain('1,234')
})
test('pct formats', ()=>{
  expect(pct(0.123)).toContain('12.3')
})
