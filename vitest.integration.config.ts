import {mergeConfig} from 'vitest/config';
import {baseConfig} from './vitest.config.base.js';

export default mergeConfig(baseConfig, {
	test: {
		include: ['**/*.integration.spec.ts'],
		setupFiles: ['src/utils/test-utils/integration-test-setup.ts'],
	},
});
