import adapter from 'webrtc-adapter';
import Janus, { JanusJS } from 'janusjs';
import { SERVER } from './janus.config';


/**
 * (1) Initialize Janus.js with webrtc-adapter
 * use .then(uuid) to connectJanus(uuid)
 * .catch(errmsg: string) if webrtc is not supported by the browser
 */
export const initJanus = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        Janus.init({
            debug: 'all',
            dependencies: Janus.useDefaultDependencies({ adapter }),
            callback: () => {
              console.log('janus.ts initJanus successful');
              if(!Janus.isWebrtcSupported()) {
				alert('Your Browser does not support WebRTC, update to the newest Browser Version to fully use this websites video and audio call features!');
				reject('Error: webtrc-not-supported');
			  }
              resolve();
            }
          })
    });
};

export const initSession = (): Promise<Janus> => {
    return new Promise((resolve, reject) => {
        const janus = new Janus({
            server: SERVER,
            success: () => {
                console.log('init session success');
                resolve(janus);
            },
            error: (error) => {
                console.log('Janus.ts initSession error:', error);
                reject(error);
            },
            destroyed: () => {
                console.log('Janus.ts initSession destroyed. Try reload');
                window.location.reload();
                reject('Janus.ts initSession destroyed. Try reload');
            }
        });
    });
}

export const attachVideoRoom = (janus: Janus, roomUuid: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        janus.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: roomUuid,
            success: (pluginHandle) => {
                console.log('janus.ts attachvideoRoom success');
                resolve();
            },
            error: (error) => {
                console.log('janus.ts attachvideoRoom error', error);
                reject(error);
            },
            consentDialog: (on) => {
                console.log('janus.ts attachvideoRoom - consentDialog should be:', on);
                if (on) {
                    //TODO - show 
                } else {
                    //TODO - dontshow
                }
            },
            iceState: (state) => {
                console.log('janus.ts attachvideoRoom - Icestate changed to ', state);
                //TODO https://github.com/moshangzhe/WebRTC-janus/blob/master/videoroomtest%20.js
            },
            mediaState: (medium, on) => {
                console.log('janus.ts attachvideoRoom - Mediastate: medium', medium, "on: ", on);
                //TODO https://github.com/moshangzhe/WebRTC-janus/blob/master/videoroomtest%20.js
            },
            webrtcState: (on) => {
                console.log('janus.ts attachvideoRoom - webrtcState: ', on);
                //TODO https://github.com/moshangzhe/WebRTC-janus/blob/master/videoroomtest%20.js
            },
            onmessage: (msg, jsep) => {
                console.log('janus.ts attachvideoRoom - onmessage: ', msg, jsep);
                //TODO https://github.com/moshangzhe/WebRTC-janus/blob/master/videoroomtest%20.js
            },
            onlocalstream: (stream) => {
                console.log('janus.ts attachvideoRoom - onmessage: ', stream);
                // TODO
            },
            onremotestream: (stream) => {
                // The publisher stream is sendonly, we don't expect anything here
            },
            oncleanup: () => {
                console.log('janus.ts attachvideoRoom - oncleanup');
                // todo cleanup
            }
        })
    });
}