## AutomaPost.com

Slogan:
Generating and scheduling posts across platforms
Generating and scheduling AI-powered posts across platforms
AI-Driven LinkedIn Growth
AI-Driven Social Growth

# Prisma
```
yarn db:generate    # Generate Prisma client
yarn db:push        # Push schema changes to database
yarn db:migrate     # Create and run migrations
yarn db:studio      # Open Prisma Studio (database GUI)
yarn db:validate    # Validate schema
yarn db:format      # Format schema file
```
Common Workflows:

Development (Quick Changes): (DONT USE!!!)
Edit prisma/schema.prisma
yarn db:push (pushes changes directly)
yarn db:generate (if not auto-generated)

Production (Proper Migrations): (USE THIS)
Edit prisma/schema.prisma
`yarn db:migrate (creates migration file)`
Commit migration files to git
Next run to apply to the DB: 
`yarn db:deploy`

If you can’t drop data: run yarn prisma db push.
If you’re using migrations: run yarn prisma migrate deploy (or dev in local).

First Time Setup:
yarn db:generate
yarn db:push or yarn db:migrate

Viewing Data:
yarn db:studio (anytime you want to see your data)

The key difference is db:push for quick dev changes vs db:migrate for trackable, production-ready changes!

# Claude code
How to start claude:
IS_SANDBOX=1 claude --dangerously-skip-permissions