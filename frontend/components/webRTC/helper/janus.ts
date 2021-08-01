import adapter from 'webrtc-adapter';
import Janus, { JanusJS } from 'janusjs';
import { SERVER } from './janus.config';
import { Auth, WebSocketRoom, Ws } from '../../../@types/types';

export type JanusEventType = { event: string, data: any };

const dispatchGlobalEvent = (data: any) => {
    window.dispatchEvent(new CustomEvent('janus', { 'detail': data }));
};

export class StreamManager {
    ws: Ws; // todo check if deploy message is correct on publish? how do i get the feed publisherId?
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
    pluginHandlePublish: JanusJS.PluginHandle;
    pluginHandleSub: JanusJS.PluginHandle;

    /**
     * Step (4) after JSEP -> connection established
     * this is the upstream video/audio webrtc stream.
     */
    publishedFeed: MediaStream;
    subscribedFeeds: MediaStream[];
    
    constructor(ws: Ws, wsRoom: WebSocketRoom, auth: Auth) {
        this.ws = ws;
        this.wsRoom = wsRoom;
        this.auth = auth;
        this.subscribedFeeds = [];
        
        try {
            this.initJanus().then(this.initSession).then(janus => {
                this.janus = janus;
                this.attachToVideoRoomAsPublisher();
            });
        } catch(err) {
            console.log('StreamManager Error', err);
        }
    }
    
    /**
     * Step (1) Initialize Janus.js with webrtc-adapter
     * @resolve .then(initSession) to connect to janus Server
     * .catch(errmsg: string) if webrtc is not supported by the browser
     */
    private initJanus(): Promise<void> {
        return new Promise((resolve, reject) => {
            Janus.init({
                debug: false,
                dependencies: Janus.useDefaultDependencies({ adapter }),
                callback: () => {
                    dispatchGlobalEvent({ event: 'janus-initialized', data: { success: true }});

                  if(!Janus.isWebrtcSupported()) {
                    dispatchGlobalEvent({ event: 'error', data: { msg: 'Your Browser does not support WebRTC, update to the newest Browser Version to fully use this websites video and audio call features!' }});
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
                iceServers: [{
                    urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
                }],
                success: () => {
                    dispatchGlobalEvent({ event: 'session-initialized', data: { success: true }});
                    resolve(janus);
                },
                error: (error) => {
                    dispatchGlobalEvent({ event: 'error', data: { msg: error }});
                    reject(error);
                },
                destroyed: () => {
                    dispatchGlobalEvent({ event: 'destroyed', data: { active: false, msg: 'initSession destroyed. Try reloading the session.' }});
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
    private attachToVideoRoomAsPublisher (): Promise<void> {
        return new Promise((resolve, reject) => {
            this.janus.attach({
                plugin: "janus.plugin.videoroom",
                opaqueId: this.wsRoom.uuid,
                success: (pluginHandle) => {
                    dispatchGlobalEvent({ event: 'videoroom__publisher__initialized', data: { success: true, plugin: pluginHandle.getPlugin(), id: pluginHandle.getId() }});
                    
                    //? join a room
                    const joinRequest = {
                        request: 'join',
                        room: this.wsRoom.janusRoom.id,
                        ptype: 'publisher',
                        display: this.auth.user.displayName,
                        pin: this.wsRoom.uuid
                    }
                    pluginHandle.send( { message: joinRequest });
                    this.pluginHandlePublish = pluginHandle;
                    resolve();
                },
                error: (error) => {
                    dispatchGlobalEvent({ event: 'videoroom__publisher__error', data: { msg: error }});
                    reject(error);
                },
                consentDialog: (on) => {
                    dispatchGlobalEvent({ event: 'videoroom__publisher__consent-dialog', data: { on }});
                },
                iceState: (state) => {
                    dispatchGlobalEvent({ event: 'videoroom__publisher__ice-state', data: { state }});
                },
                mediaState: (medium, on) => {
                    dispatchGlobalEvent({ event: 'videoroom__publisher__media-state', data: { medium, on }});
                },
                webrtcState: (on) => {
                    dispatchGlobalEvent({ event: 'videoroom__publisher__webrtc-state', data: { on }});
                },
                onmessage: (msg, jsep) => {
                    dispatchGlobalEvent({ event: 'videoroom__publisher__on-message', data: { msg, jsep }});
                    const msgType = msg['videoroom'];
                    if (msgType) {
                        switch (msgType) {
                            case 'joined':
                                this.publishFeed(true);
                            default:
                                console.error('videoroom__publisher__on-message__error, unhandled onmessage type:', msgType);
                        }
                    }

                    // handle Javascript Session Establish Protocol (incoming UDP connection with ice candidates to connect to)
                    if (jsep) {
                        this.pluginHandlePublish.handleRemoteJsep({ jsep }); // connect via webrtc UDP to janus-gateway
                        const videoSupported = this.publishedFeed?.getVideoTracks()?.length > 0 && !msg["video_codec"];
                        const audioSupported = this.publishedFeed?.getAudioTracks()?.length > 0 && !msg["audio_codec"];
                        dispatchGlobalEvent({ event: 'videoroom__publisher__not-supported', data: { videoSupported, audioSupported }});
                    }
                },
                onlocalstream: (stream) => {
                    dispatchGlobalEvent({ event: 'videoroom__publisher__on-local-stream', data: { stream }});
                    this.publishedFeed = stream;
                },
                oncleanup: () => {
                    dispatchGlobalEvent({ event: 'videoroom__publisher__on-cleanup', data: undefined });
                }
            })
        });
    }

     // Step (3)
    private publishFeed(useAudio: boolean) {
        this.pluginHandlePublish.createOffer({
            media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },   // publishers don't recv because they are send only
            // simulcast: true, //! (Chrome and Firefox only), // TODO //TODO
            simulcast: false,
            success: jsep => {
                const publish = { "request": "configure", "audio": useAudio, "video": true };
                Janus.debug(jsep);
                this.pluginHandlePublish.send({ "message": publish, "jsep": jsep });
                dispatchGlobalEvent({ event: 'videoroom__publisher__published-feed', data: { publishRequest: { "message": publish, "jsep": jsep } } });
                this.ws.deploy({ type: 'publishedFeed', data: { feedId: 123133123 }});
            },
            error: error => {
                dispatchGlobalEvent({ event: 'videoroom__publisher__published-feed-error', data: { error } });
            },
            onmessage: (any) => {
                console.log('after publish message', any);
            }
        })
    }

    /**
     * Step (4): Attach to a published feed by its id. You can specify the codec you want to receive back (optional).
     *  */ 
    attachSubscriberToVideoRoomPublisher(janusPublisherId: number, videoCodec: (string | undefined)): Promise<void> {
        return new Promise((resolve, reject) => {
            this.janus.attach({
                plugin: "janus.plugin.videoroom",
                opaqueId: this.wsRoom.uuid,
                success: (pluginHandle) => {
                    this.pluginHandleSub = pluginHandle;
                    dispatchGlobalEvent({ event: 'videoroom__subscriber__initialized', data: { success: true, plugin: pluginHandle.getPlugin(), id: pluginHandle.getId() }});

                    const subscribe = {
                        request: 'join',
                        room: this.wsRoom.janusRoom.id,
                        ptype: 'subscriber',
                        feed: janusPublisherId,
                        pin: this.wsRoom.uuid
                    }
                    if (videoCodec) {
                        // @ts-ignore
                        subscribe.videoCodec = videoCodec;
                    }
                    this.pluginHandleSub.send({ "message": subscribe });
                    resolve();
                },
                error: (error) => {
                    dispatchGlobalEvent({ event: 'videoroom__subscriber__error', data: { msg: error }});
                    reject(error);
                },
                onmessage: (msg, jsep) => {
                    dispatchGlobalEvent({ event: 'videoroom__subscriber__on-message', data: { msg, jsep }});
                     // handle Javascript Session Establish Protocol (this time handle accept incoming webrtc connection)
                    if (jsep) {
                        this.pluginHandleSub.createAnswer({
                            jsep,
                            media: { audioSend: false, videoSend: false }, // we are recieve only!
                            success: (jsep) => {
                                const answer = { "request": "start", "room": this.wsRoom.janusRoom.id };
                                this.pluginHandleSub.send({ "message": answer, jsep });
                                dispatchGlobalEvent({ event: 'videoroom__subscriber__subscribed-to-feed', data: { publishRequest: { "message": answer, jsep } } });
                            },
                            error: (error) => {
                                dispatchGlobalEvent({ event: 'videoroom__subscriber__subscribed-to-feed-error', data: { error } });
                            }
                        })
                    }
                },
                webrtcState: (on) => {
                    dispatchGlobalEvent({ event: 'videoroom__subscriber__webrtc-state', data: { on }});
                },
                onremotestream: (stream) => {
                    dispatchGlobalEvent({ event: 'videoroom__subscriber__remote-stream', data: { stream }});
                    this.subscribedFeeds.push(stream);
                },
                oncleanup: () => {
                    dispatchGlobalEvent({ event: 'videoroom__subscriber__on-cleanup', data: undefined });
                }
            });
        });
    }


    // Step (4) - running
    /**
     * This stops your active video and audio feed.
     */
    unpublishFeed() {
        const unPublish = { "request": "unpublish" };
        this.pluginHandlePublish.send({ "message": unPublish });
        this.pluginHandlePublish.hangup();
        dispatchGlobalEvent({ event: 'videoroom__unpublished', data: { success: true } });
    }
};