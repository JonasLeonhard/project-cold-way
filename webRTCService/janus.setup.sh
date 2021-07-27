#!/bin/bash

# This File only works when apt-get is installed!

# Exit on Error
set -e

# Ansi color code variables
green="\033[0;92m"
red="\033[0;91m"
reset="\033[0m"

#? 1: List of packages to install before building Janus Gatway
packagelist=(
    git
    libjansson-dev
    libconfig-dev
    libnice-dev
    libssl-dev
    libsrtp2-dev
    libmicrohttpd-dev
    cmake
)
echo -e "🐲 Installing packages required for Janus Gateway... ${green}${packagelist[*]}${reset}"
apt-get update
apt-get install -y ${packagelist[*]}

#? Compiling Janus Gateway
echo -e "🐲 Compiling ${green}Janus Gateway${reset}..."
git clone https://github.com/meetecho/janus-gateway.git
cd janus-gateway
# generate the configuration file
sh autogen.sh
cd ..

echo -e "
🐲 Done installing ${green}Janus Gateway${reset}. \n 
Configure the janus config file before building in .jcfg \n 
If your are ready run $
{green}make${reset} and 
${green}make install${reset} and then 
${green}make configs${reset} \n
\n
To test if the binary is working run: ${green}/opt/janus/bin/janus --help${reset}
"