#!/usr/bin/env bash

# Color variables. Use `echo -e` to allow the backslash escapes in these variables.
# Example:
# $ printf "I ${RED}love${NC} Duxis\n"
#
RED='\033[0;31m'
NC='\033[0m' # No Color

# return 0 if version A >= version B using semanatic versioning
function semver_lt() {
  local VERSION_A="${1}"
  local VERSION_B="${2}"
  local SEMVER_PATTERN="[^0-9]*\([0-9][0-9]*\)[.]\([0-9][0-9]*\)[.]\([0-9][0-9]*\).*"
  local SEG1_A="$(echo "${VERSION_A}" | sed -e "s#${SEMVER_PATTERN}#\1#")"
  local SEG1_B="$(echo "${VERSION_B}" | sed -e "s#${SEMVER_PATTERN}#\1#")"
  [[ ${SEG1_A} > ${SEG1_B} ]] && return 1
  [[ ${SEG1_A} < ${SEG1_B} ]] && return 0
  local SEG2_A="$(echo "${VERSION_A}" | sed -e "s#${SEMVER_PATTERN}#\2#")"
  local SEG2_B="$(echo "${VERSION_B}" | sed -e "s#${SEMVER_PATTERN}#\2#")"
  [[ ${SEG2_A} > ${SEG2_B} ]] && return 1
  [[ ${SEG2_A} < ${SEG2_B} ]] && return 0
  local SEG3_A="$(echo "${VERSION_A}" | sed -e "s#${SEMVER_PATTERN}#\3#")"
  local SEG3_B="$(echo "${VERSION_B}" | sed -e "s#${SEMVER_PATTERN}#\3#")"
  [[ ${SEG3_A} > ${SEG3_B} ]] && return 1
  return 1
}

# Check Node.js version
#
NODE_VERSION="8.6.0"
if semver_lt $(node --version) ${NODE_VERSION}
then
  echo -e "${RED}Please upgrade Node.js to v${NODE_VERSION}.${NC}"
fi
