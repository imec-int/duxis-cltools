#!/usr/bin/env bash

# -- images_to_pull ---------- --- --  -

images_to_pull () {
  source .env
  export COMPOSE_FILE
  export COMPOSE_PROJECT_NAME

  IFS=' ' read -r -a TST <<< $DX_PULL_IMAGES
  for NAME in "${TST[@]}"
  do
    echo NAME: ${NAME}
  done
}

#images_to_pull

# -- getServiceNames ---------- --- --  -

test_getServiceNames () {
  source .env
  export COMPOSE_FILE
  export COMPOSE_PROJECT_NAME

  echo "[]:" $(scripts/getServiceNames.js)
  echo "[--front]:" $(scripts/getServiceNames.js --front)
  echo "[--watchable]:" $(scripts/getServiceNames.js --watchable)
  echo "[--testable]:" $(scripts/getServiceNames.js --testable)
  echo "[--composefile dc.prod.yml]:" $(scripts/getServiceNames.js --composefile dc.prod.yml)
  echo "[--composefile dc.prod.yml --watchable]:" $(scripts/getServiceNames.js --composefile dc.prod.yml --watchable)
  echo "[--composefile dc.test.yml]:" $(scripts/getServiceNames.js --composefile dc.test.yml)
}

#test_getServiceNames

# -- network_names ---------- --- --  -

network_names () {
  source .env
  export COMPOSE_FILE
  export COMPOSE_PROJECT_NAME

  echo "getNetworkNames:" $(scripts/getNetworkNames.js)
  echo "getNetworkNames --prepend:" $(scripts/getNetworkNames.js --prepend)
}

#network_names

# -- network_names ---------- --- --  -

test_volume_names () {
  source .env
  export COMPOSE_FILE
  export COMPOSE_PROJECT_NAME

  echo "getTestVolumeNames:" $(scripts/getTestVolumeNames.js)
}

test_volume_names
