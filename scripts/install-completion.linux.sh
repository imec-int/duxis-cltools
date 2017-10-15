#!/usr/bin/env bash

#COMPLETION_D="/etc/bash_completion.d"
COMPLETION_D="$(pwd)/tmp_bash_completion.d"
FORWARD_FILE="${COMPLETION_D}/dx"
DC_FILE="$(pwd)/dx-completion.sh"
LINE="[ -f ${DC_FILE} ] && source ${DC_FILE}"

echo "Adding dx auto-completion in ${FORWARD_FILE}"
mkdir -p ${COMPLETION_D}
touch ${FORWARD_FILE}
echo ${LINE} > ${FORWARD_FILE}
