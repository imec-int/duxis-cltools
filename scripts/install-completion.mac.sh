#!/usr/bin/env bash

DOT_BC="${HOME}/.bash_completion"
DC_FILE="$(pwd)/dx-completion.sh"
LINE="[ -f ${DC_FILE} ] && source ${DC_FILE}"

if [ -s ${DOT_BC} ]
then
  sed -i ".backup" -e "/duxis-cltools\/dx-completion.sh$/d" ${DOT_BC}
fi

echo "Adding dx auto-completion in ${DOT_BC}"
echo ${LINE} >> ${DOT_BC}
