#!/usr/bin/env bash

# Avoid 'unresolved variable' warnings in Webstorm:
export COMPOSE_FILE
export COMPOSE_PROJECT_NAME
export DX_BUILD_ENV_FILE
export DX_BUILD_HOOK
export DX_ENV
export DX_HOST
export DX_HUB
export DX_VOLUMES
export DXF_IMAGES
export EXT_IMAGES
export FE_PROTOCOL
export LOG_ENVIRONMENT
export NODE_ENV

# Get the directory of this script:
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
JS_DIR="${DIR}/js"

# --------------------------------------------------------------------------------------------------

REQUIRED_VARS=(
  "DX_HOST"
  "DX_HUB"
  "DX_VOLUMES"
  "FE_PROTOCOL"
)

# Assert that required vars are specified:
assertRequiredVars () {
  for VAR in "${REQUIRED_VARS[@]}"
  do
    if [ -z "${!VAR}" ]
    then
      printerr "Please provide the required variable ${VAR} in your .env file."
      exit 1
    fi
  done
}

# --------------------------------------------------------------------------------------------------

build () {
  local SERVICES
  case "${1}" in
    --dev)
      set_env dev
      SERVICES="${@:2}"
      build_images
      ;;
    --dxdev)
      set_env dxdev
      SERVICES="${@:2}"
      build_images
      ;;
    --test)
      set_env test
      SERVICES="${@:2}"
      build_images
      build_test_services
      ;;
    --dxtest)
      set_env dxdev
      SERVICES="${@:2}"
      build_images
      build_test_services
      ;;
    *)
      set_env prod
      SERVICES="${@}"
      build_images
  esac
}

build_images () {
  log_environment

  if [ "${SERVICES}" ] && [ "$(current_build_env)" != "${DX_ENV}" ]
  then
    printerr "Please rebuild all services when changing build environment."
    exit 1
  fi

  # The azure registry login doesn't last very long
  if [ "${DX_HUB}" == "duxis.azurecr.io" ]
  then
    az acr login --name duxis
  fi

  printf "\nCreating Dockerfiles for v${PROJECT_VERSION} in ${DX_ENV} mode:\n"
  find ./images/ -name "Dockerfile.template" -exec bash -c 'build_docker_file "$0"' {} \;

  if [ "${DX_BUILD_HOOK}" ]
  then "${DX_BUILD_HOOK}"
  fi

  if [ -z "${SERVICES}" ]
  then
    printf "\nBuilding ${PROJECT_NAME} ${PROJECT_VERSION} in ${DX_ENV} mode:\n"
    if [ ${DX_ENV} != dxdev ]
    then
      pull_dxf_images
      docker-compose pull
    fi
    pull_ext_images
    node ${JS_DIR}/copyProjectSetup.js
    docker-compose build
    node ${JS_DIR}/copyProjectSetup.js --clean
  else
    printf "\nBuilding ${SERVICES[@]} in ${DX_ENV} mode:\n"
    if [ ${DX_ENV} != dxdev ]; then docker-compose pull "${SERVICES[@]}"; fi
    node ${JS_DIR}/copyProjectSetup.js "${SERVICES[@]}"
    docker-compose build "${SERVICES[@]}"
    node ${JS_DIR}/copyProjectSetup.js --clean
  fi

  # Write the current environment to the `.build-env` file:
  echo "${DX_ENV}" > ${DX_BUILD_ENV_FILE}
}

pull_ext_images () {
  if [ "${EXT_IMAGES}" ]
  then
    IFS=' ' read -r -a IMAGES <<< "$EXT_IMAGES"
    for IMAGE in "${IMAGES[@]}"
    do
      printf "\nPulling ${IMAGE}\n"
      docker pull "${IMAGE}"
    done
    printf "\n"
  fi
}

pull_dxf_images () {
  if [ "${DXF_IMAGES}" ]
  then
    IFS=' ' read -r -a IMAGES <<< "$DXF_IMAGES"
    for IMAGE in "${IMAGES[@]}"
    do
      printf "\nPulling ${DX_HUB}/${IMAGE}:${DX_VERSION}\n"
      docker pull "${DX_HUB}/${IMAGE}:${DX_VERSION}"
    done
    printf "\n"
  fi
}

build_test_services () {
  printf "\nBuild test images:\n"
  set_env test
  node ${JS_DIR}/copyProjectSetup.js --composefile dc.test.yml
  docker-compose build
  node ${JS_DIR}/copyProjectSetup.js --clean

  # Write the current environment to the `.build-env` file:
  echo "${DX_ENV}" > ${DX_BUILD_ENV_FILE}
}

build_docker_file () {
  local SOURCE=$1
  local TARGET="$(dirname ${SOURCE})/Dockerfile"
  if [ ${DX_ENV} == dxdev ]
  then PREFIX=""
  else PREFIX="${DX_HUB}\/"
  fi
  sed -E "s/^FROM (cargo|dxf|duxis)-([a-zA-Z0-9_-]*)/FROM ${PREFIX}\1-\2:${DX_VERSION}/; s/^FROM node/FROM node:${NODE_VERSION}/" ${SOURCE} > ${TARGET}
  echo "Wrote ${TARGET}"
}
export -f build_docker_file

# --------------------------------------------------------------------------------------------------

clean () {
  stop_services

  case "${1}" in
    --test) clean_tests ;;
    *) clean_services
  esac

  clean_common
}

clean_services () {
  local SERVICES="$(${JS_DIR}/getServiceNames.js)"
  IFS=' ' read -r -a SERVICES <<< "$SERVICES"

  echo "Remove containers and images..."
  for SERVICE in "${SERVICES[@]}"
  do
    docker rm -f "$(container_name ${SERVICE})" 2> /dev/null
    docker rmi -f "${COMPOSE_PROJECT_NAME}_${SERVICE}" 2> /dev/null
  done

  local NETWORKS="$(${JS_DIR}/getNetworkNames.js --prepend)"
  echo "Remove networks ${NETWORKS}..."
  docker network rm ${NETWORKS} 2> /dev/null
}

clean_tests () {
  set_env test

  echo "Remove test containers and images..."
  local SERVICES="$(${JS_DIR}/getServiceNames.js)"
  IFS=' ' read -r -a SERVICES <<< $SERVICES
  for SERVICE in "${SERVICES[@]}"
  do
    docker rm -f "$(container_name ${SERVICE})" 2> /dev/null
    docker rmi -f "${COMPOSE_PROJECT_NAME}_${SERVICE}" 2> /dev/null
  done

  local NETWORKS="$(${JS_DIR}/getNetworkNames.js --prepend)"
  echo "Remove networks ${NETWORKS}..."
  docker network rm ${NETWORKS} 2> /dev/null

  local VOLUMES="$(${JS_DIR}/getTestVolumeNames.js)"
  IFS=' ' read -r -a VOLUMES <<< $VOLUMES
  for NAME in "${VOLUMES[@]}"
  do
    echo "Remove volume ${DX_VOLUMES}/${NAME}..."
    rm -rf ${DX_VOLUMES}/${NAME}
  done
}

clean_common () {
  rm -f ${DX_BUILD_ENV_FILE}

  echo "Remove dangling images..."
  docker rmi $(docker images --quiet --filter "dangling=true") 2> /dev/null

  echo "Remove unused volumes..."
  docker volume prune --force
}

# --------------------------------------------------------------------------------------------------

down_project () {
  if [ -e "$(current_build_env)" ]
  then
    printerr "Please first build the project."
    exit 1
  fi

  docker-compose down --remove-orphans --volumes
}

# --------------------------------------------------------------------------------------------------

inspect_service () {
  if [ -e "$(current_build_env)" ]
  then
    printerr "Please first build the project."
    exit 1
  fi

  # CLI param 1: The name of the service to inspect.
  local SERVICE=$1

  if [ -z "${SERVICE}" ]
  then
    echo "Error: You need to provide a service name to inspect."
    exit 1
  fi

  docker exec -ti "$(container_name ${SERVICE})" /bin/bash
}

# -- logs --------------- --- --  -

logs () {
  if [ -e "$(current_build_env)" ]
  then
    printerr "Please first build the project."
    exit 1
  fi

  docker-compose logs --follow "${@}"
}

# -- outdated --------------- --- --  -

outdated () {
  npm outdated
  ${JS_DIR}/outdated.js .
}

# -- restart --------------- --- --  -

restart_services () {
  if [ -e "$(current_build_env)" ]
  then
    printerr "Please first build the project."
    exit 1
  fi

  stop_services "${@}"
  up_services "${@}"
}

# --------------------------------------------------------------------------------------------------

stop_services () {
  if [ -e "$(current_build_env)" ]
  then exit
  fi

  local SERVICE="${1}"

  if [ -z "${SERVICE}" ]
  then
    if [ -f dc.test.yml ]
    then docker-compose -f dc.test.yml stop
    fi
    docker-compose -f dc.prod.yml stop
  else
    set_env $(current_build_env)
    docker-compose stop ${SERVICE}
  fi
}

# --------------------------------------------------------------------------------------------------

test_services () {
  local SERVICE="${1}"
  local WATCH=0
  if [ "${1}" == "--watch" ]
  then
    WATCH=1
    SERVICE="${2}"
    if [ -z "${SERVICE}" ]
    then
      printerr "Please specify which service you want to watch."
      exit -1
    fi
  fi

  set_env test
  log_environment

  if [ -z "${SERVICE}" ]
  then
    local SERVICES="$(${JS_DIR}/getServiceNames.js --testable)"
    #echo "Test all: $(${JS_DIR}/getServiceNames.js --composefile dc.prod.yml --testable)"
    IFS=' ' read -r -a SERVICES <<< $SERVICES
    for I_ALL in ${!SERVICES[@]}
    do test_service 0 ${SERVICES[I_ALL]}
    done
  else
    test_service ${WATCH} "${SERVICE}"
  fi
}

test_service () {
  export WATCH_TESTS=${1} # must be exported
  local SERVICE=${2}
  export TEST_SUBJECT="test-${SERVICE}" # must be exported
  local SERVICES="$(${JS_DIR}/getServiceNames.js --test ${SERVICE})"
  local CONTAINER="${COMPOSE_PROJECT_NAME}_${TEST_SUBJECT}_1"

  # Stop services:
  docker-compose stop ${SERVICES}

  # Define signal handlers:
  up_on_sigint () {
    echo "[dx - up_on_sigint]"
    docker-compose stop ${SERVICES}
    exit
  }
  trap up_on_sigint SIGINT

  printf "\nTesting '${SERVICE}' using '${SERVICES}':\n"
  docker-compose up -d ${SERVICES}
  docker logs --follow --since 1s ${CONTAINER}
  STATUS=$(docker wait ${CONTAINER})
  if [ ! $STATUS -eq 0 ]
  then exit $STATUS
  fi
}

# --------------------------------------------------------------------------------------------------

up_services () {
  if [ -z "$(current_build_env)" ]
  then
    printerr "Please first build the project."
    exit 1
  fi

  # Initialize environment:
  local BUILD_ENV=$(current_build_env)
  if [ "${BUILD_ENV}" == "dev" ]
  then set_env dev
  elif [ "${BUILD_ENV}" == "dxdev" ]
  then set_env dxdev
  else set_env prod
  fi
  local SERVICES="${@}"
  log_environment

  # Define signal handlers:
  up_on_sigint () {
    #echo "[dx - up_on_sigint]"
    if [ -z "${SERVICES}" ]
    then docker-compose stop
    else docker-compose stop "${SERVICES[@]}"
    fi
    exit
  }
  up_on_sigterm () {
    #echo "[dx - up_on_sigterm]"
    if [ -z "${SERVICES}" ]
    then docker-compose stop
    else docker-compose stop "${SERVICES[@]}"
    fi
    exit
  }

  if [ -z "${SERVICES}" ]
  then
    printf "\nStart ${PROJECT_NAME} (${COMPOSE_PROJECT_NAME}) in ${DX_ENV} mode:\n"
    if [ ${DX_ENV} == "dev" ] || [ ${DX_ENV} == "dxdev" ]
    then
      trap up_on_sigint SIGINT
      trap up_on_sigterm SIGTERM
      docker-compose up -t 5
    else
      docker-compose up -d
    fi
  else
    printf "\nStart ${SERVICES[@]} (${COMPOSE_PROJECT_NAME}) in ${DX_ENV} mode:\n"
    if [ ${DX_ENV} == "dev" ] || [ ${DX_ENV} == "dxdev" ]
    then
      trap up_on_sigint SIGINT
      trap up_on_sigterm SIGTERM
      docker-compose up -t 5 ${SERVICES[@]}
    else
      docker-compose up -d ${SERVICES[@]}
    fi
  fi
}

# --------------------------------------------------------------------------------------------------

watch_service () {
  if [ -e "$(current_build_env)" ]
  then
    printerr "Please first build the project."
    exit 1
  fi

  local BUILD_ENV=$(current_build_env)
  if [ "${BUILD_ENV}" == "dev" ]
  then set_env dev
  elif [ "${BUILD_ENV}" == "dxdev" ]
  then set_env dxdev
  else
    printerr "The watch command is not available in production."
    exit 2
  fi
  local SERVICE="${1}"
  log_environment

  if [ -z "${SERVICE}" ]
  then
    printerr "The watch command expects one service name."
    exit 3
  fi

  local WATCHABLE=$(${JS_DIR}/watchable.js ${SERVICE})
  if [ ${WATCHABLE} == 0 ]
  then
    printerr "The '${SERVICE}' service is not watchable."
    exit 4
  elif [ ${WATCHABLE} == 1 ]
  then export WATCH_SERVICE=1
  else export WATCH_FRONTEND=1
  fi

  stop_services ${SERVICE}
  up_services ${SERVICE}
}

# --------------------------------------------------------------------------------------------------
# Support functions:

current_build_env () {
  if [ -e ${DX_BUILD_ENV_FILE} ]
  then echo $(head -n 1 ${DX_BUILD_ENV_FILE})
  else echo ""
  fi
}

set_env () {
  DX_ENV=${1:-prod}
  if [ -z "${DX_HUB}" ]
  then
    DX_HUB="imec" # the default Docker hub prefix
  fi
  COMPOSE_FILE="dc.${DX_ENV}.yml"
  case "${DX_ENV}" in
    prod)
      NODE_ENV=production
      ;;
    dev)
      NODE_ENV=development
      ;;
    dxdev)
      NODE_ENV=development
      DX_HUB=""  # use locally built Duxis images
      ;;
    test)
      NODE_ENV=test
      ;;
    *)
      printerr "Unexpected DX_ENV value: ${DX_ENV}"
      exit -10
  esac
}

log_environment () {
  if [ ${LOG_ENVIRONMENT} == 1 ]
  then
    echo "- COMPOSE_FILE: ${COMPOSE_FILE}"
    echo "- COMPOSE_PROJECT_NAME: ${COMPOSE_PROJECT_NAME}"
    echo "- DX_ENV: ${DX_ENV}"
    echo "- DX_HOST: ${DX_HOST}"
    echo "- DX_HUB: ${DX_HUB}"
    echo "- DX_VERSION: ${DX_VERSION}"
    echo "- DX_VOLUMES: ${DX_VOLUMES}"
    echo "- FE_PROTOCOL: ${FE_PROTOCOL}"
    echo "- NODE_ENV: ${NODE_ENV}"
  fi
}

# Usage: $ container_name service_name [index = 1]
#
container_name () {
  printf "${COMPOSE_PROJECT_NAME}_${1}_${2:-1}\n"
}

# Usage: $ image_name service_name
#
image_name () {
  echo "${COMPOSE_PROJECT_NAME}_${1}"
}

# Prettyprint errors:
#
printerr () {
  printf "\e[31mError: ${@}\e[0m\n"
}

# --------------------------------------------------------------------------------------------------

# Load the .env file:
set -o allexport
if [ -f .env ]
then source ./.env
else
  printerr "The '.env' file is missing, please run 'npm install'."
  exit 1
fi
set +o allexport

# Assert that all required environment variables are set:
assertRequiredVars

# Check for deprecated DX_HUB values:
if [ "${DX_HUB}" == "hub.duxis.io/" ] || [ "${DX_HUB}" == "imec/" ]
then
  printerr "Please remove the trailing slash from the DX_HUB variable in your .env file."
  exit 1
fi

# Export the Duxis Foundation version specified in `package.json`:
export NODE_VERSION=$(node -p -e "require('./package.json').nodeVersion")

# Export the Duxis Foundation version as specified in `package.json`:
export DX_VERSION=$(node -p -e "require('./package.json').dx_version")

# Export the project name as specified in `package.json`:
export PROJECT_NAME=$(node -p -e "require('./package.json').name")

# Export the project version as specified in `package.json`:
export PROJECT_VERSION=$(node -p -e "require('./package.json').version")

USAGE_LINE="[dx] Usage:
  $ ./dx build [<service>...]        # Build all/the given services in production mode.
  $ ./dx build --dev [<service>...]  # Build all/the given services in development mode.
  $ ./dx build --test                # Build all services in test mode.
  $ ./dx build --dxdev               # Build all services in Duxis co-development mode.
  $ ./dx build --dxtest              # Build all services in Duxis co-development test mode.
  $ ./dx clean                       # Remove all images, containers, etc.
  $ ./dx clean --test                # Remove all test images, test containers, etc.
  $ ./dx down                        # Stops containers and removes containers, networks, volumes and images created by up.
  $ ./dx help                        # prints this info.
  $ ./dx inspect <service>           # Inspect a service.
  $ ./dx logs [<service>...]         # Print the logs for all/the given services.
  $ ./dx outdated                    # Lists available updates for project dependencies.
  $ ./dx restart [<service>...]      # Restart all/the given services.
  $ ./dx stop [<service>...]         # Stop all/the given services.
  $ ./dx test [--watch <service>]    # Test all services or the given service (in watch mode).
  $ ./dx up [<service>...]           # Up all/the given services.
  $ ./dx watch <service>             # Run a service in watch mode (when built in dev mode).
"

# The first command-line argument is the action:
ACTION=${1:-}

# Print the instructions when no action is given:
if [ -z "${ACTION}" ]
then
  echo "${USAGE_LINE}"
  exit 1;
fi

# Call the appropriate action handler:
case ${ACTION} in
  build)        build ${@:2};;
  clean)        clean ${@:2};;
  down)         down_project;;
  help)         echo "${USAGE_LINE}";;
  inspect)      inspect_service ${@:2};;
  logs)         logs ${@:2};;
  outdated)     outdated;;
  restart)      restart_services ${@:2};;
  stop)         stop_services ${@:2};;
  test)         test_services ${@:2};;
  up)           up_services ${@:2};;
  watch)        watch_service ${2};;
  *)
    echo "Unrecognized action: '${ACTION}'"
    echo "${USAGE_LINE}"
    exit 1
    ;;
esac
