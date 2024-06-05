import process from 'node:process';
import {$} from 'zx';

const DOCKER_PROJECT = 'merjane-test';
const DOCKER_COMPOSE_PATH = './docker/docker-compose-test.yml';
const TEST_ENV_FILE = process.env['CONFIG_PATH'];

export async function setupIntegrationTest() {
	try {
		await $`docker compose -p ${DOCKER_PROJECT} --env-file ${TEST_ENV_FILE} -f ${DOCKER_COMPOSE_PATH} up -d --wait`;
		await $`echo initial delay && sleep 1`;
		await $`pnpm drizzle:migrate`;
	} catch (error) {
		console.error(error);
		await teardownIntegrationTest();
		throw error;
	}
}

export async function teardownIntegrationTest() {
	console.log('[globalTeardown] Stopping docker test env...');

	await $`docker compose -p ${DOCKER_PROJECT} --env-file ${TEST_ENV_FILE} -f ${DOCKER_COMPOSE_PATH} down -v`;
}
