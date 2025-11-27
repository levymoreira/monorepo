# Drizzle ORM - Database Management Guide

This project uses **Drizzle ORM** with PostgreSQL. Here's how to manage database changes.

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration files from schema changes |
| `npm run db:migrate` | Apply pending migrations to database |
| `npm run db:push` | Push schema directly (dev only, no migrations) |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run db:introspect` | Pull existing DB schema into Drizzle format |
| `npm run db:check` | Check migration consistency |
| `npm run db:drop` | Drop a migration file |

## Project Structure

```
lib/
  db/
    schema.ts    # All table definitions, relations, and types
    index.ts     # Database connection and exports
drizzle/
  *.sql          # Generated migration files (auto-created)
drizzle.config.ts  # Drizzle Kit configuration
```

## Making Schema Changes

### 1. Edit the Schema

Open `lib/db/schema.ts` and make your changes:

```ts
// Add a new column
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  newColumn: text('new_column'),  // ← Add new column
})

// Add a new table
export const newTable = pgTable('new_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
```

### 2. Generate Migration

```bash
npm run db:generate
```

This creates a `.sql` migration file in the `drizzle/` folder.

### 3. Apply Migration

**Development:**
```bash
npm run db:push     # Quick push (skips migrations)
# OR
npm run db:migrate  # Apply migration files
```

**Production:**
```bash
npm run db:migrate  # Always use migrations in production
```

## When to Use Each Command

| Scenario | Command |
|----------|---------|
| Local development, rapid iteration | `db:push` |
| Before deploying changes | `db:generate` → `db:migrate` |
| Production deployment | `db:migrate` |
| View/edit data visually | `db:studio` |
| New project from existing DB | `db:introspect` |

## Common Patterns

### Adding a Column (nullable)
```ts
// In schema.ts - add nullable column (no migration issues)
newField: text('new_field'),
```

### Adding a Column (required)
```ts
// Option 1: Add with default
status: text('status').notNull().default('active'),

// Option 2: Two-step migration
// Step 1: Add as nullable, deploy, backfill data
// Step 2: Add .notNull(), generate new migration
```

### Adding an Index
```ts
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  status: text('status'),
}, (table) => [
  index('posts_user_id_idx').on(table.userId),
  index('posts_status_idx').on(table.status),
])
```

### Adding Relations
```ts
// In schema.ts after table definitions
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}))

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}))
```

## Type Exports

The schema exports TypeScript types automatically:

```ts
import type { User, NewUser, Post, NewPost } from '@/lib/db'

// User = select type (full row)
// NewUser = insert type (for creating records)
```

## Environment Variables

Required in `.env` or `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

## Troubleshooting

### "relation does not exist"
Run `npm run db:push` or `npm run db:migrate` to sync schema.

### Migration conflicts
```bash
npm run db:drop     # Remove problematic migration
npm run db:generate # Regenerate
```

### View current DB state
```bash
npm run db:studio   # Opens browser GUI at localhost:4983
```

## Resources

- [Drizzle Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle Kit CLI](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Column Types](https://orm.drizzle.team/docs/column-types/pg)
