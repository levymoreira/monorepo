COMPOSE ?= docker compose
PROJECT ?= monorepo

# Local dev domain overrides so we don't have to edit .env
DEV_TRAEFIK_ACME_EMAIL ?= dev@localhost
DEV_NEXT_APP_ONE_DOMAIN ?= nextone.localhost
DEV_NEXT_APP_TWO_DOMAIN ?= nexttwo.localhost
DEV_EXPRESS_API_DOMAIN ?= api.localhost
DEV_BLOG_DOMAIN ?= blog.localhost
DEV_GRAFANA_DOMAIN ?= grafana.localhost

SERVICES_WITH_REDUNDANCY = next-app-one next-app-two express-api levymoreira-blog

.PHONY: up
up:
	$(COMPOSE) --project-name $(PROJECT) up -d --build \
		--scale next-app-one=2 \
		--scale next-app-two=2 \
		--scale express-api=2 \
		--scale levymoreira-blog=2

.PHONY: down
down:
	$(COMPOSE) --project-name $(PROJECT) down --remove-orphans

.PHONY: logs
logs:
	$(COMPOSE) --project-name $(PROJECT) logs -f

.PHONY: redeploy
redeploy:
	@if [ -z "$(SERVICE)" ]; then \
		echo "Usage: make redeploy SERVICE=<service-name>"; \
		exit 1; \
	fi
	$(COMPOSE) --project-name $(PROJECT) build $(SERVICE)
	$(COMPOSE) --project-name $(PROJECT) up -d --no-deps --scale $(SERVICE)=2 $(SERVICE)

.PHONY: rebuild-server
rebuild-server:
	@echo "Rebuilding all services on the server (matching server architecture)..."
	$(COMPOSE) --project-name $(PROJECT) build --no-cache
	$(COMPOSE) --project-name $(PROJECT) up -d --build \
		--scale next-app-one=2 \
		--scale next-app-two=2 \
		--scale express-api=2 \
		--scale levymoreira-blog=2

.PHONY: up-dev
up-dev:
	TRAEFIK_ACME_EMAIL=$(DEV_TRAEFIK_ACME_EMAIL) \
	NEXT_APP_ONE_DOMAIN=$(DEV_NEXT_APP_ONE_DOMAIN) \
	NEXT_APP_TWO_DOMAIN=$(DEV_NEXT_APP_TWO_DOMAIN) \
	EXPRESS_API_DOMAIN=$(DEV_EXPRESS_API_DOMAIN) \
	BLOG_DOMAIN=$(DEV_BLOG_DOMAIN) \
	GRAFANA_DOMAIN=$(DEV_GRAFANA_DOMAIN) \
	$(COMPOSE) --project-name $(PROJECT) -f docker-compose.yml -f docker-compose.dev.yml up -d --build \
		--scale next-app-one=2 \
		--scale next-app-two=2 \
		--scale express-api=2 \
		--scale levymoreira-blog=2

.PHONY: verify
verify:
	@./scripts/verify-urls.sh

.PHONY: setup-dev-hosts
setup-dev-hosts:
	@sudo ./scripts/setup-dev-hosts.sh

.PHONY: deploy
deploy:
	@./scripts/deploy.sh $(SERVICE)

.PHONY: connect
connect:
	@./scripts/connect.sh
