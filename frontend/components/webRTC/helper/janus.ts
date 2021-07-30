import adapter from 'webrtc-adapter';
import Janus, { JanusJS } from 'janusjs';
import { SERVER } from './janus.config';
import { Auth, WebSocketRoom } from '../../../@types/types';

export class StreamManager {
    wsRoom: WebSocketRoom;
    auth: Auth;
    setShowConsentDialog: Function;

    /**
     * Step (2) Janus instance available after initSession (see constructor);
     */
    janus: Janus;
     /**
     * Step (3) Video.PluginHandle - initialized in attachVideoRoom(), after initSession (see constructor)
     */
    pluginHandle: JanusJS.PluginHandle;

    constructor(wsRoom: WebSocketRoom, auth: Auth, setShowConsentDialog: Function) {
        this.wsRoom = wsRoom;
        this.auth = auth;
        this.setShowConsentDialog = setShowConsentDialog;

        this.initJanus().then(this.initSession).then(janus => {
            console.log('constructor', this.wsRoom);
            this.janus = janus;
            this.attachVideoRoom();
        });
    }
    /**
     * Step (1) Initialize Janus.js with webrtc-adapter
     * @resolve .then(initSession) to connect to janus Server
     * .catch(errmsg: string) if webrtc is not supported by the browser
     */
    private initJanus(): Promise<void> {
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
    }
    /**
     * Step (2) Connect Janus.js to the janus Server, requires initJanus to be run first.
     * @resolve .then((janus: Janus) => {...})
     */
    private initSession(): Promise<Janus> {
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
     * Step (3). Attach janus to the video room with roomUuid,
     * pass in the janus instance created in initSession.
     */
    private attachVideoRoom (): Promise<void> {
        return new Promise((resolve, reject) => {
            this.janus.attach({
                plugin: "janus.plugin.videoroom",
                opaqueId: this.wsRoom.uuid,
                success: (pluginHandle) => {
                    console.log('debug', this.wsRoom);
                    console.log('janus.ts attachvideoRoom success.', { plugin: pluginHandle.getPlugin(), id: pluginHandle.getId() });
                    //? join a room
                    const joinRequest = {
                        request: 'join',
                        room: this.wsRoom.janusRoom.id,
                        ptype: 'publisher',
                        display: this.auth.user.displayName,
                        pin: this.wsRoom.uuid
                    }
                    pluginHandle.send( { message: joinRequest });
                    this.pluginHandle = pluginHandle;
                    resolve();
                },
                error: (error) => {
                    console.log('janus.ts attachvideoRoom error', error);
                    reject(error);
                },
                consentDialog: (on) => {
                    console.log('janus.ts attachvideoRoom - consentDialog should be:', on);
                    this.setShowConsentDialog(on);
                },
                iceState: (state) => {
                    console.log('janus.ts attachvideoRoom - Icestate changed to ', state);
                },
                mediaState: (medium, on) => {
                    console.log('janus.ts attachvideoRoom - Mediastate: medium', medium, "on: ", on);
                },
                webrtcState: (on) => {
                    console.log('janus.ts attachvideoRoom - webrtcState: ', on);
                },
                onmessage: (msg, jsep) => {
                    console.log('janus.ts attachvideoRoom - onmessage: ', msg, jsep);
                    const msgType = msg['videoroom'];
                    if (msgType) {
                        switch (msgType) {
                            case 'joined':
                                this.publishFeed(true);
                                if(msg['publishers']) {
                                    msg['publishers'].forEach(feed => {
                                        this.attachToFeed(feed);
                                    });
                                }
                        }
                    }
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

     // Step (3)
    private publishFeed(useAudio: boolean) {
        console.log('publishFeed');
        this.pluginHandle.createOffer({
            media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },   // publishers don't recv because they are send only
            // simulcast: true, //! (Chrome and Firefox only),
            // simulcast2: true,
            success: jsep => {
                const publish = { "request": "configure", "audio": useAudio, "video": true };
                Janus.debug(jsep);
                this.pluginHandle.send({ "message": publish, "jsep": jsep });
            },
            error: error => {
                alert("WebRTC error... " + error.message);
            }
        })
    }

    // Step (3)
    private attachToFeed(feed: any) {
        const { id, display, audio_codec, video_codec } = feed;
        console.log('attachToFeed', feed, id, display, audio_codec, video_codec);
    }
};