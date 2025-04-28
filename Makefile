# Styles
YELLOW := $(shell echo "\033[00;33m")
RED := $(shell echo "\033[00;31m")
RESTORE := $(shell echo "\033[0m")

# Variables
.DEFAULT_GOAL := list
PACKAGE_MANAGER := bun
CURRENT_DIR := $(shell pwd)
DEPENDENCIES := bun git
RUNTIME := bun
CLIFF_VERSION := $(shell bun -e "console.log(require('./cliff/package.json').version)")
CLI_DIR := $(CURRENT_DIR)/cliff

.PHONY: list
list:
	@echo "${YELLOW}***${RED}***${RESTORE}***${YELLOW}***${RED}***${RESTORE}***${YELLOW}***${RED}***${RESTORE}***${YELLOW}***${RED}***${RESTORE}"
	@echo "${RED}CLI${YELLOW}ffhanger${RED}: ${YELLOW}Available targets${RESTORE}:"
	@grep -E '^[a-zA-Z-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf " ${YELLOW}%-15s${RESTORE} > %s\n", $$1, $$2}'
	@echo "${RED}=================================${RESTORE}"

.PHONY: check-dependencies
check-dependencies:
	@for dependency in $(DEPENDENCIES); do \
		if ! command -v $$dependency &> /dev/null; then \
			echo "${RED}Error:${RESTORE} ${YELLOW}$$dependency${RESTORE} is not installed."; \
			exit 1; \
		fi; \
	done
	@echo "All ${YELLOW}dependencies are installed.${RESTORE}"

.PHONY: install
install: check-dependencies update ## Install the Application and reset the database

.PHONY: update
update: check-dependencies ## Update the Repo
	@$(PACKAGE_MANAGER) install

.PHONY: codeclean
codeclean: ## Code Clean
	@$(PACKAGE_MANAGER) run prettier:fix
	@$(PACKAGE_MANAGER) run prettier:check

.PHONY: release
release: ## Create a Realease (tag and push)
	@git tag -s -a v$(CLIFF_VERSION) -m "v$(CLIFF_VERSION)"
	@git push origin v$(CLIFF_VERSION)

.PHONY: build-cli
build-cli:  ## Build CLI
	@cd $(CLI_DIR) && bun build --compile --minify src/index --outfile cliffhanger
	@cd $(CLI_DIR) && rm -f .*.bun-build

.PHONY: build-all-cli
build-all-cli:  
	@cd $(CLI_DIR) && for target in bun-linux-x64 bun-linux-arm64 bun-windows-x64 bun-darwin-x64 bun-darwin-arm64; do \
		bun build --compile --minify src/index --outfile cliffhanger-$$target --target=$$target; \
	done
	@cd $(CLI_DIR) && rm -f .*.bun-build


.PHONY: serve-mcp-debugger
serve-mcp-debugger: ## Serve MCP Debugger
	@$(RUNTIME) x @modelcontextprotocol/inspector $(RUNTIME) $(CLI_DIR)/src/index.ts serve
