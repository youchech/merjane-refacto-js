import {type QueryResultHKT, type PgDatabase} from 'drizzle-orm/pg-core';
import type * as schema from './schema.js';

export type Database = PgDatabase<QueryResultHKT, typeof schema>;

