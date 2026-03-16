.PHONY: up down restart clean fclean re logs

# Start the application
up:
	@docker compose up -d --build
	@echo "✓ App started at https://localhost"

# Stop the application
down:
	@docker compose down
	@echo "✓ App stopped"

# Restart the application
restart: down up

# Stop and remove containers/images
clean: down
	@docker system prune -af > /dev/null 2>&1
	@echo "✓ Docker containers and images removed"

# Full clean - also remove database
fclean: clean
	@rm -rf ./backend/data/*
	@echo "✓ Database removed"

# Rebuild from scratch
re: fclean up

# View logs
logs:
	@docker compose logs -f