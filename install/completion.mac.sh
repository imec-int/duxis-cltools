#!/usr/bin/env bash

DOT_BC="${HOME}/.bash_completion"
DC_FILE="$(pwd)/dx-completion.sh"
LINE="[ -f ${DC_FILE} ] && source ${DC_FILE}"

if [ ! -s ${DOT_BC} ] || ! grep -q "${DC_FILE}" ${DOT_BC}
then
  echo "Adding '$LINE' in ${DOT_BC}"
  echo '' >> ${DOT_BC}
  echo ${LINE} >> ${DOT_BC}
fi
