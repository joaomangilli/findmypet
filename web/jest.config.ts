import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.ts",
    "\\.(png|jpg|jpeg|gif|svg|ico)$": "<rootDir>/__mocks__/fileMock.ts",
    "^leaflet$": "<rootDir>/__mocks__/leaflet.ts",
    "^react-leaflet$": "<rootDir>/__mocks__/react-leaflet.ts",
    "^next/link$": "<rootDir>/__mocks__/next/link.tsx",
    "^next/dynamic$": "<rootDir>/__mocks__/next/dynamic.tsx",
  },
  testMatch: ["**/__tests__/**/*.{ts,tsx}", "**/*.{test,spec}.{ts,tsx}"],
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
};

export default config;
