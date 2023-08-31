# List of subdirectories containing project Makefiles
PROJECT_DIRS := encrypted-messaging private-payments rock-paper-scissors streaming-payments swap

# Targets to pass to the sub-Makefiles
TARGETS := all

.PHONY: $(PROJECT_DIRS)

all: $(PROJECT_DIRS)

$(PROJECT_DIRS):
	$(MAKE) -C $@ $(TARGETS)

.PHONY: clean

clean:
	for dir in $(PROJECT_DIRS); do \
    	$(MAKE) -C $$dir clean; \
	done