import {exec as execCallback} from 'node:child_process';
import {promisify} from 'node:util';
import {rm} from 'node:fs/promises';
import {
	describe, it, expect, beforeEach,
	afterEach,
} from 'vitest';
import {mockDeep, type DeepMockProxy} from 'vitest-mock-extended';
import SqliteDatabase from 'better-sqlite3';
import {drizzle} from 'drizzle-orm/better-sqlite3';
import {type INotificationService} from '../notifications.port.js';
import {ProductService} from './product.service.js';
import {products, type Product} from '@/db/schema.js';
import * as schema from '@/db/schema.js';
import {type Database} from '@/db/type.js';

const exec = promisify(execCallback);

describe('ProductService Tests', () => {
	let notificationServiceMock: DeepMockProxy<INotificationService>;
	let productService: ProductService;
	let databaseMock: Database;

	beforeEach(async () => {
		databaseMock = await createDatabaseMock();
		notificationServiceMock = mockDeep<INotificationService>();
		productService = new ProductService({
			ns: notificationServiceMock,
			db: databaseMock,
		});
	});

	afterEach(cleanUp);

	it('should handle delay notification correctly', async () => {
		// GIVEN
		const product: Product = {
			id: 1,
			leadTime: 15,
			available: 0,
			type: 'NORMAL',
			name: 'RJ45 Cable',
			expiryDate: null,
			seasonStartDate: null,
			seasonEndDate: null,
		};
		await databaseMock.insert(products).values(product);

		// WHEN
		await productService.notifyDelay(product.leadTime, product);

		// THEN
		expect(product.available).toBe(0);
		expect(product.leadTime).toBe(15);
		expect(notificationServiceMock.sendDelayNotification).toHaveBeenCalledWith(product.leadTime, product.name);
		const result = await databaseMock.query.products.findFirst({
			where: (product, {eq}) => eq(product.id, product.id),
		});
		expect(result).toEqual(product);
	});
});

async function cleanUp() {
	await rm('./unit-test.db');
}

async function createDatabaseMock() {
	const sqlite = new SqliteDatabase('./unit-test.db');
	await exec('pnpm drizzle-kit push --schema=src/db/schema.ts --dialect=sqlite --url=./unit-test.db');

	const databaseMock = drizzle(sqlite, {
		schema,
	});
	return databaseMock;
}

