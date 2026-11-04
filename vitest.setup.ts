import '@testing-library/jest-dom/vitest';
import * as matchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe/matchers';
import { expect } from 'vitest';

/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
declare module 'vitest' {
  export interface Assertion<T = any> extends AxeMatchers {}
  export interface AsymmetricMatchersContaining extends AxeMatchers {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

expect.extend(matchers);

// Variables de entorno para pruebas de Vitest
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder-anon-key';
