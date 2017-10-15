#!/usr/bin/env bash

# Color variables. Use `echo -e` to allow the backslash escapes in these variables.
# Example:
# $ printf "I ${RED}love${NC} Duxis\n"
#
RED='\033[0;31m'
NC='\033[0m' # No Color

case $(uname -s) in
  Darwin)
    ./scripts/install-completion.mac.sh
    ;;
  *)
    printf "${RED}Installation of dx auto-completion is not yet supported on '$(uname -s)'${NC}. We welcome PRs!\n"
esac
