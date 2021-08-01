# Introduction

The webRTCService contains a build script for a Janus Server that can be used as a WebRTC Server Forwarding Unit (SFU) or Multipoint Control Unit (MCU).You can find more about janus at: (https://janus.conf.meetecho.com/docs/README.html).
This webRTCService also contains a docker container and build script to run the service inside of docker.

# Setup

1. go to <mark>janus.sh</mark> and change the installed dependencies depending on the features you want to support. Eg. when you want your build janus instance to support the rabbitMQ plugin, then you need to have it installed in your instance before building janus. Janus then checks the installed dependencies at compile time, and will include the RabbitMQ plugin when RabbitMQ is installed on the system. You can simply comment in the plugins you need in janus.sh <mark>main()</mark> function.

###### to install janus inside /opt/janus run: #######
```bash
    sudo bash janus.sh setup
    sudo bash janus.sh build
    sudo bash janus.sh start
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