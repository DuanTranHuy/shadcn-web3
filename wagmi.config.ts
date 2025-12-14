import { defineConfig } from '@wagmi/cli'
import { hardhat } from '@wagmi/cli/plugins'
import { react } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'lib/generated.ts',
  plugins: [
    hardhat({
      project: './hardhat',
      commands: {
        build: 'pnpm hardhat compile',
      },
    }),
    react(),
  ],
})
