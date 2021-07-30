import adapter from 'webrtc-adapter';
import Janus from 'janusjs';
import { SERVER } from './janus.config';
import { Auth, WebSocketRoom } from '../../../@types/types';

/**
 * (1) Initialize Janus.js with webrtc-adapter
 * @resolve .then(initSession) to connect to janus Server
 * .catch(errmsg: string) if webrtc is not supported by the browser
 */
export const initJanus = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        Janus.init({
            debug: false,
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

/**
 * (2) Connect Janus.js to the janus Server, requires initJanus to be run first.
 * @resolve .then((janus: Janus) => {...})
 */
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

/**
 * (3). Attach janus to the video room with roomUuid,
 * pass in the janus instance created in initSession.
 */
export const attachVideoRoom = (janus: Janus, wsRoom: WebSocketRoom, auth: Auth): Promise<void> => {
    return new Promise((resolve, reject) => {
        janus.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: wsRoom.uuid,
            success: (pluginHandle) => {
                console.log('debug', wsRoom);
                console.log('janus.ts attachvideoRoom success.', { plugin: pluginHandle.getPlugin(), id: pluginHandle.getId() });
                //? join a room
                const joinRequest = {
                    request: 'join',
                    room: wsRoom.janusRoom.id,
                    ptype: 'publisher',
                    display: auth.user.displayName,
                    pin: wsRoom.uuid
                }
                pluginHandle.send( { message: joinRequest });
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