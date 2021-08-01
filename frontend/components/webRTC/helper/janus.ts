import adapter from 'webrtc-adapter';
import Janus, { JanusJS } from 'janusjs';
import { SERVER } from './janus.config';
import { Auth, WebSocketRoom } from '../../../@types/types';

export type JanusEventType = { event: string, data: any };
type JanusPublisher = {
    id: number;
    display: string;
    talking: boolean;
    audio_codec: string;
    video_codec: string;
    mediaStream?: MediaStream; // only available after subscribing to above id
    // when you attach to a publisher, you are not recieving any media over the stream, therefore you are in the 'attached' state. If you are recieving video you are in the 'running' state. If the recieved media failed, you are in the 'error' state
    state?: 'attached' | 'running' | 'error'; 
};

export const dispatchGlobalEvent = (dispatch: JanusEventType) => {
    window.dispatchEvent(new CustomEvent('janus', { 'detail': dispatch }));
};

export class StreamManager {
    wsRoom: WebSocketRoom;
    auth: Auth;
    setShowConsentDialog: Function;
    mediaStreamWrapper: HTMLDivElement;
    /**
     * Step (2) Janus instance available after initSession (see constructor);
     */
    janus: Janus;
     /**
     * Step (3) Video.PluginHandle - initialized in attachVideoRoom(), after initSession (see constructor)
     */
    pluginHandlePublish: JanusJS.PluginHandle;

    /**
     * Step (4) after JSEP -> connection established
     * this is the upstream video/audio webrtc stream.
     */
    publishedFeed: MediaStream;
    publisherJanusId: number;
    subscribedFeeds: Set<MediaStream>;
    subscribedToPublishers: { [publisherId: string] : JanusPublisher };
    
    constructor(wsRoom: WebSocketRoom, auth: Auth) {
        this.wsRoom = wsRoom;
        this.auth = auth;
        this.subscribedToPublishers = {};
        this.mediaStreamWrapper = document.querySelector('.webRTC__media-stream-wrapper');

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
                    const msgType: string = msg['videoroom'];
                    const publishers: Array<JanusPublisher> = msg['publishers'];
                    if (msgType) {
                        switch (msgType) {
                            case 'joined':
                                this.publisherJanusId = msg['id'];
                                this.attachLoadingStream('local', this.publisherJanusId);
                                this.publishFeed(true);
                                if (publishers) {
                                    // joined publishers have a media stream already!
                                    console.log('loadinpublishers', msg);
                                    this.attachSubscriberToVideoRoomPublishers(publishers);
                                }
                                break;
                            case 'event':
                                if (publishers) {
                                    // attach to all publishers we haven't published to already
                                    this.attachSubscriberToVideoRoomPublishers(publishers);
                                }
                                break;
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
                    this.attachMediaStream('local', this.publisherJanusId, stream);
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
     * Attaches to all Subscribers in @param publishers that we haven't subscribed to yet.
     */
    private attachSubscriberToVideoRoomPublishers(publishers: Array<JanusPublisher>) {
        publishers.forEach(publisher => {
            if (!this.subscribedToPublishers[publisher.id]) {
                this.subscribedToPublishers[publisher.id] = publisher;
                this.attachSubscriberToVideoRoomPublisher(publisher.id);
            }
        });
    };
    /**
     * Step (4): Attach to a published feed by its id. You can specify the codec you want to receive back (optional).
     *  */ 
    private attachSubscriberToVideoRoomPublisher(janusPublisherId: number, videoCodec?: (string | undefined)): Promise<void> {
        let pluginHandleSub = null;
        return new Promise((resolve, reject) => {
            this.janus.attach({
                plugin: "janus.plugin.videoroom",
                opaqueId: this.wsRoom.uuid,
                success: (pluginHandle) => {
                    pluginHandleSub = pluginHandle;
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
                    pluginHandleSub.send({ "message": subscribe });
                    resolve();
                },
                error: (error) => {
                    dispatchGlobalEvent({ event: 'videoroom__subscriber__error', data: { msg: error }});
                    reject(error);
                },
                onmessage: (msg, jsep) => {
                    dispatchGlobalEvent({ event: 'videoroom__subscriber__on-message', data: { msg, jsep }});
                    // handle Javascript Session Establish Protocol (this time handle accept incoming webrtc connection)
                    console.log('onmessage remotestream called', msg);
                    const event = msg['videoroom'];

                    // incoming streams have 3 states, attached and running/error
                    if (event === 'attached') {
                        this.subscribedToPublishers[janusPublisherId].state = 'attached';
                    } else if (event) {
                        this.subscribedToPublishers[janusPublisherId].state = msg['started'] ? 'running' : 'error';
                    }

                    if (jsep) {
                        pluginHandleSub.createAnswer({
                            jsep,
                            media: { audioSend: false, videoSend: false }, // we are recieve only!
                            success: (jsep) => {
                                const answer = { "request": "start", "room": this.wsRoom.janusRoom.id };
                                pluginHandleSub.send({ "message": answer, jsep });
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
                    //^ This will get called twice for each subscribed stream, once for audio and once for video. 
                    //^ It will also be called twice for each publisher state, once for attached and once for running.!
                    const publisher = this.subscribedToPublishers[janusPublisherId];
                    
                    // if the stream is attached or error - show the loading spinner
                    // else add the mediastream to the publisher and attach the media stream to the video
                    if (publisher.state !== 'running') {
                        //show loading spinner video
                        this.attachLoadingStream('remote', publisher.id)
                    } else {
                        // attach the media stream to the loading spinner video
                        dispatchGlobalEvent({ event: 'videoroom__subscriber__remote-stream', data: { stream }});
                        this.subscribedToPublishers[janusPublisherId].mediaStream = stream;
                        this.attachMediaStream('remote', publisher.id, stream);
                    }
                },
                oncleanup: () => {
                    dispatchGlobalEvent({ event: 'videoroom__subscriber__on-cleanup', data: undefined });
                    this.cleanUp(janusPublisherId);
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

    /**
     * create a new video object with the publisher id and a loading class in the htmldiv wrapper container (this.mediaStreamWrapper)
     */
    attachLoadingStream = (type: 'remote' | 'local', publisherId: number) => {
        console.log('attachLoadingStream', type, publisherId);
        const existingLoader: HTMLVideoElement = this.mediaStreamWrapper.querySelector(`.webRTC__mediastream__publisherId-${publisherId}`);
        if (!existingLoader) {
            const videoEl = document.createElement('video');
            videoEl.classList.add('webRTC__mediastream', `webRTC__mediastream__type-${type}`, `webRTC__mediastream__publisherId-${publisherId}`, 'webRTC__mediastream__is-loading');
            videoEl.autoplay = false;
            this.mediaStreamWrapper.appendChild(videoEl);
        }
    }

    /**
     * searchers for the loading spinner video object in the htmldiv wrapper container (this.mediaStreamWrapper) and attaches the running
     * stream, while removing the loading class
     */
    attachMediaStream = (type: 'remote' | 'local', publisherId: number, stream: MediaStream) => {
        const videoEl: HTMLVideoElement = this.mediaStreamWrapper.querySelector(`.webRTC__mediastream__publisherId-${publisherId}`);
        console.log('attachMediaStream', type, publisherId, stream, videoEl);
        if (videoEl) {
            videoEl.classList.remove('webRTC__mediastream__is-loading');
            videoEl.srcObject = stream;
            videoEl.autoplay = true;
        }
    }

    /**
     * removes publisher html node in mediaStreamWrapper
     */
    cleanUp(publisherId: number) {
        console.log('cleanup ', publisherId);
        const videoEl: HTMLVideoElement = this.mediaStreamWrapper.querySelector(`.webRTC__mediastream__publisherId-${publisherId}`);
        videoEl?.remove();
    }
};