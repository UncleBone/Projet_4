import { describe, it, expect, afterEach, beforeEach } from 'vitest'
// import { mount } from '@vue/test-utils'
// import { createRouter, createWebHistory } from 'vue-router'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})