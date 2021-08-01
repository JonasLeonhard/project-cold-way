# Introduction

The webRTCService contains a dockerized Janus Server that can be used as a WebRTC Server Forwarding Unit (SFU) or Multipoint Control Unit (MCU).You can find more about janus at: (https://janus.conf.meetecho.com/docs/README.html).

# Setup

1. go to <mark>janus.sh</mark> and change the installed dependencies depending on the features you want to support. Eg. when you want your build janus instance to support the rabbitMQ plugin, then you need to have it installed in your instance before building janus. Janus then checks the installed dependencies at compile time, and will include the RabbitMQ plugin when RabbitMQ is installed on the system. You can simply comment in the plugins you need in janus.sh <mark>main()</mark> function.

2. Now you can <mark>build</mark> the docker container with:
```bash
    yarn janus:build
```

3. !!!<mark>You can skip this step if you have not changed any dependencies in janus.sh</mark>!!! 

Your janus instance is created with configuration of your dependencies and has created </opt/janus> binary inside the docker container. It also generated default
config files for all installed plugins in </opt/janus/etc/janus/*.jcfg>. 

If you changed any dependencies, eg. you included more dependencies in janus.sh, then you will need to resync these <jcfg> config files with the config files inside </conf>.

Run this only the first time setting up janus, when you have no config files in /conf or want to create a new set of them, that are dependent on
your installed dependencies. ATTENTION: !!!Be aware that this deletes your old configuration files inside of ./conf!!!

You might need to add other ports inside the dockerfile to support other features.
```bash
yarn janus:build
yarn janus:up:noVolumne
yarn janus:syncConfigToHost #press y here after propmt.
yarn janus:stop
yarn janus:down
```

4. Now create the Janus Docker Container by running:
```bash
    yarn janus:up
```

# Development
start the container with:
```bash
    yarn janus:start
```
stop the container with:
```bash
    yarn janus:stop
```


# Deployment
Make sure the secrets inside ./conf files are changed!


# Setup in linux ubuntu server without docker (recommended):
```
    ###### WITH THIS REPO #######
    sudo bash janus.sh setup
    sudo bash janus.sh build
    sudo bash janus.sh start

    ##### Go to /opt/janus/etc/janus & edit janus.jcfg ####
    debug_level = 7
    admin_secret = "JANUSROOMSECRET"
    session_timeout = 1000
    stun_server = "stun.voip.eutelia.it"
    stun_port = 3478
    nat_1_1_mapping = "!your natted server ip adress!"
```