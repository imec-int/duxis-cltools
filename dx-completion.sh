#!/usr/bin/env bash
#
# Source this script from your .bashrc|.profile|... to enable argument auto-completion.

cd "$(dirname ${BASH_SOURCE[0]})"

all_services () {
  echo "$(js/getServiceNames.js)"
}

testable_services () {
  echo "$(js/getServiceNames.js --composefile dc.prod.yml --testable)"
}

available_services () {
  local ALL_SERVICES
  IFS=' ' read -r -a ALL_SERVICES <<< "$(all_services)"
  local CURR_SERVICES=(${COMP_WORDS[@]:2:$1})
  local NEXT_SERVICES=""
  for I_ALL in ${!ALL_SERVICES[@]}
  do
    local FOUND=0
    for I_CURR in "${!CURR_SERVICES[@]}"
    do
      if [ "${ALL_SERVICES[I_ALL]}" = "${CURR_SERVICES[I_CURR]}" ]
      then
        FOUND=1
        break
      fi
    done
    if [ ${FOUND} = 0 ]
    then
      NEXT_SERVICES+=" ${ALL_SERVICES[I_ALL]}"
    fi
  done
  echo "${NEXT_SERVICES}"
}

_dx_completion () {
  COMPREPLY=()

  local ACTIONS=("build" "clean" "down" "help" "inspect" "log" "outdated" "restart" "stop" "test" "up" "watch")

  local CUR=${COMP_WORDS[COMP_CWORD]}  # current word being autocompleted

  if (( ${COMP_CWORD} == 1 ))
  then
    COMPREPLY=( `compgen -W "${ACTIONS[*]}" -- ${CUR}` )

  # cases: `build`
  elif [ ${COMP_WORDS[1]} == "build" ]
  then
    if (( ${COMP_CWORD} == 2 ))
    then COMPREPLY=( `compgen -W "--dev --dxdev --test $(all_services)" -- ${CUR}` )
    elif [ ${COMP_WORDS[2]} == "--dev" ] || [ ${COMP_WORDS[2]} == "--dxdev" ]
    then COMPREPLY=( `compgen -W "$(available_services ${COMP_CWORD})" -- ${CUR}` )
    fi

  # cases: `clean`
  elif [ ${COMP_WORDS[1]} == "clean" ]
  then
    if (( ${COMP_CWORD} == 2 ))
    then COMPREPLY=( `compgen -W "--test" -- ${CUR}` )
    fi

  # cases: `inspect` or `watch`
  elif [ ${COMP_WORDS[1]} == "inspect" ] || [ ${COMP_WORDS[1]} == "watch" ]
  then
    if (( ${COMP_CWORD} == 2 ))
    then COMPREPLY=( `compgen -W "$(all_services)" -- ${CUR}` )
    fi

  # cases: `log` or `restart` or `up`
  elif [ ${COMP_WORDS[1]} == "log" ] || [ ${COMP_WORDS[1]} == "restart" ] || [ ${COMP_WORDS[1]} == "up" ]
  then
    if (( ${COMP_CWORD} == 2 ))
    then COMPREPLY=( `compgen -W "$(all_services)" -- ${CUR}` )
    else COMPREPLY=( `compgen -W "$(available_services ${COMP_CWORD})" -- ${CUR}` )
    fi

  # cases: `test`
  elif [ ${COMP_WORDS[1]} == "test" ]
  then
    if (( ${COMP_CWORD} == 2 ))
    then COMPREPLY=( `compgen -W "--watch $(testable_services)" -- ${CUR}` )
    elif (( ${COMP_CWORD} == 3 )) && [ ${COMP_WORDS[2]} == "--watch" ]
    then COMPREPLY=( `compgen -W "$(testable_services)" -- ${CUR}` )
    fi

  fi
}

complete -F _dx_completion dx

cd - > /dev/null
