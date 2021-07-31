#!/bin/bash

# This file build and installs a janus instance. To customize 
# go to the main() function and comment out build_... functions
# inside setup, to have janus be build without 
# this dependency and feature.
#? Janus build directory: '/opt/janus'
#? Janus main config: '/opt/janus/etc/janus/janus.jcfg'
#? Janus config files: '/opt/janus/etc/janus/*.jcfg'

# Exit on Error
set -e

# Ansi color code variables
GREEN="\033[0;92m"
RED="\033[0;91m"
RESET="\033[0m"

# Build Arguments
BUILD_SRC="$(pwd)/janusSH_build_src"

install_janus_user() {
    echo -e "🐲 Creating ${GREEN}<janus>${RESET} User"
    /usr/sbin/groupadd -r janus || echo -e "...skipping, as usergroup is already created."
    /usr/sbin/useradd -r -g janus janus || echo -e "...skipping, as user is already created."
}

install_apt_get() {
    #? 1: List of packages to install before building Janus Gatway (see. https://janus.conf.meetecho.com/docs/README.html)
    packagelist=(
        git
        libmicrohttpd-dev 
        libjansson-dev
        libssl-dev 
        libsrtp0 # other distro? (https://packages.ubuntu.com/search?suite=all&section=all&arch=any&keywords=libsrtp&searchon=names)
        libsofia-sip-ua-dev 
        libglib2.0-dev
        libopus-dev 
        libogg-dev 
        libcurl4-openssl-dev 
        liblua5.2-dev
        libconfig-dev 
        pkg-config 
        gengetopt
        libtool
        automake
        gtk-doc-tools
        cmake
        curl

        #? for libnice
        python3 
        python3-pip 
        python3-setuptools
        python3-wheel 
        ninja-build
    )
    echo -e "🐲 Installing packages required for Janus Gateway... ${GREEN}${packagelist[*]}${RESET}"
    apt-get update -y
    apt-get install -y ${packagelist[*]}

    #? Libnice install deps
    pip3 install meson
}

build_libnice() {
    echo -e "🐲 Building ${GREEN}libnice${RESET}"
    git clone https://gitlab.freedesktop.org/libnice/libnice "${BUILD_SRC}"/libnice
	cd "${BUILD_SRC}"/libnice
	meson --prefix=/usr build && ninja -C build && ninja -C build install
}

build_libsrtp() {
    echo -e "🐲 Building ${GREEN}libsrtp${RESET}"
    curl -fSL https://github.com/cisco/libsrtp/archive/v2.2.0.tar.gz -o "${BUILD_SRC}"/v2.2.0.tar.gz
    tar xzf "${BUILD_SRC}"/v2.2.0.tar.gz -C "${BUILD_SRC}"
    cd "${BUILD_SRC}"/libsrtp-2.2.0
    ./configure --prefix=/usr --enable-openssl
    make shared_library
    make install
}

build_libwebsockets() {
    echo -e "🐲 Building ${GREEN}libwebsockets${RESET}"
    git clone https://github.com/warmcat/libwebsockets.git "${BUILD_SRC}"/libwebsockets
    cd "${BUILD_SRC}"/libwebsockets
    git checkout v3.2-stable
    mkdir "${BUILD_SRC}"/libwebsockets/build
    cd "${BUILD_SRC}"/libwebsockets/build
    cmake -DLWS_MAX_SMP=1 -DLWS_WITHOUT_EXTENSIONS=0 -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_C_FLAGS="-fpic" ..
    make
    make install
}

build_usrsctp() {
    echo -e "🐲 Building ${GREEN}usrsctp${RESET}"
    git clone https://github.com/sctplab/usrsctp "${BUILD_SRC}"/usrsctp
    cd "${BUILD_SRC}"/usrsctp
    ./bootstrap
    ./configure --prefix=/usr --disable-programs --disable-inet --disable-inet6
    make
    make install
}

#? OPTIONAL
build_nanomsg() {
    echo -e "🐲 Building ${GREEN}nanomsg${RESET}"
    apt-get install -y libnanomsg-dev
}

#? Optional
build_rabbitmq_c() {
    echo -e "🐲 Building ${GREEN}rabbitmq_c${RESET}"
    git clone https://github.com/alanxz/rabbitmq-c "${BUILD_SRC}"/rabbitmq-c
    cd "${BUILD_SRC}"/rabbitmq-c
    git submodule init
    git submodule update
    mkdir build && cd build
    cmake -DCMAKE_INSTALL_PREFIX=/usr ..
    make && sudo make install
}

#? OPTIONAL
build_paho_mqtt_c() {
    echo -e "🐲 Building ${GREEN}paho_mqtt_c${RESET}"
    git clone https://github.com/eclipse/paho.mqtt.c.git "${BUILD_SRC}"/paho.mqtt.c
    cd "${BUILD_SRC}"/paho.mqtt.c
    make
    make install
}

configure_janus() {
    # you can add any config in a .jcfg file here with --CONFIGURATION=SOMETHING
    # also see ./configure --help
    ${BUILD_SRC}/janus-gateway/configure \
    --prefix=/opt/janus \
    /
}

build_janus() {
    echo -e "🐲 Building ${GREEN}Janus-Gateway${RESET}"
    git clone https://github.com/meetecho/janus-gateway.git "${BUILD_SRC}"/janus-gateway \
    
    cd "${BUILD_SRC}"/janus-gateway
    ./autogen.sh
    configure_janus #<- build a default config, gets overridden in start
    make
    make install
    # folder ownership
    chown -R janus:janus /opt/janus
    make configs
}

cleanup() {
    echo -e "🐲 ${GREEN}Cleanup${RESET}..."
    cd "${BUILD_SRC}"
    echo -e "🐲 skipped cleanup..."
    # rm -rf paho.mqtt.c
    # rm -rf rabbitmq-c

    # rm -rf v2.2.0.tar.gz libsrtp-2.2.0 janus-gateway
    # apt-get -y clean
    # apt-get -y autoclean
    # apt-get -y autoremove
    # rm -rf /usr/share/locale/*
    # rm -rf /var/cache/debconf/*-old
    # rm -rf /usr/share/doc/*
    # rm -rf /var/lib/apt/*
}

start_janus() { 
    echo -e "🐲  Starting Janus..." && env
    cd /opt/janus/bin/
    # for more start configs see ./janus --help
    ./janus \
    --nat_1_1_mapping $NAT_1_1_MAPPING \
    --debug_level $DEBUG_LEVEL \
    --rtp_port_range $RTP_PORT_RANGE \
    --stun_server ${STUN_SERVER}:${STUN_PORT} \
    --server_name $SERVER_NAME \
    --ws_port $WS_PORT \
    --session-timeout=${SESSION_TIMEOUT} \
    --admin_key $ADMIN_KEY \
    /
}

docker_sync_config_to_host() {
    read -r -p "🐲 Are you sure? This will delete/overwrite your old config files in ./conf! [y/N]" response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            rm -rf ./conf 
            mkdir ./conf 
            docker cp project_cold_way_janus:/opt/janus/etc/janus/. ./conf
            echo -e "🐲 ${GREEN}Synced Config Files!${RESET}"
            ;;
        *)
            echo -e "🐲 ${RED}...Aborted Config Snyc from Docker to Host.${RESET}"
            exit 0
            ;;
    esac
}

main() {
    if [ "$1" = 'setup' ]
    then
        #? Required!
        install_janus_user
        install_apt_get
        build_libnice
        build_libsrtp
        build_usrsctp
        build_libwebsockets

        #? Optional: comment them out and they will not be included in the build
        #build_paho_mqtt_c
        #build_rabbitmq_c
        #build_nanomsg
    elif [ "$1" = 'build' ]
    then
        build_janus
        cleanup
    elif [ "$1" = 'docker:syncConfigToHost' ]
    then
        docker_sync_config_to_host
    elif [ "$1" = 'start' ]
    then 
        start_janus
    else 
        echo -e "
        ${RED}no arguments specified:${RESET} run 
        -- ${GREEN}bash janus.setup.sh setup${RESET} or 
        -- ${GREEN}bash janus.setup.sh build${RESET} or
        -- ${GREEN}bash janus.setup.sh start${RESET}"
        exit 1
    fi
}

#? RUN:
main "$@"








