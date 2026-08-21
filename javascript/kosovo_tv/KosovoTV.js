const mangayomiSources = [
    {
        "name": "Kosovo TV",
        "lang": "en",
        "typeSource": "single",
        "version": "1.0.0",
        "pkgPath": "kosovo_tv",
        "pkgName": "KosovoTV",
        "iconUrl": "https://raw.githubusercontent.com/qyshdush018-lgtm/kosovo-tv-mangayomi/main/images/kosovo_tv.png",
        "itemType": 1
    }
];


class DefaultExtension extends MProvider {

    #client;

    get client() {
        return this.#client ??= new Client();
    }


    // ============================================================
    // STATIC CHANNEL DATABASE
    //
    // These are FALLBACK streams.
    //
    // IPTV-org is checked dynamically when a channel is played.
    // ============================================================

    getChannelDatabase() {

        return [

            {
                name: "RTV 21",
                logo: "https://i.imgur.com/AqQltGh.png",
                stream:
                    "https://gjirafa-video-live.gjirafa.net/gjvideo-live/2cz-npl-jfn-9he/index.m3u8"
            },

            {
                name: "KTV / Kohavision",
                logo: "https://i.imgur.com/LOi9yma.png",
                stream:
                    "https://gjirafa-video-live.gjirafa.net/gjvideo-livestream/lj9-pxm-o53-rp0/index.m3u8"
            },

            {
                name: "RTK 1",
                logo: "https://i.imgur.com/KTcWcO6.png",
                stream:
                    "https://gjvideo-live-xk.gjirafa.net/gjvideo-livestream/98r-d35-487-v6m/index.m3u8"
            },

            {
                name: "TV ARTA",
                logo: "https://i.imgur.com/MAhJkK9.png",
                stream: ""
            },

            {
                name: "TV DIELLI",
                logo: "",
                stream: ""
            },

            {
                name: "TV OPOJA",
                logo: "https://i.imgur.com/hxi4Qiq.png",
                stream: ""
            },

            {
                name: "TV SYRI",
                logo: "https://i.imgur.com/ZQuFosn.png",
                stream: ""
            },

            {
                name: "ATV",
                logo: "https://i.imgur.com/lX6sekx.png",
                stream:
                    "https://gjirafa-video-live.gjirafa.net/gjvideo-live/0nj-g63-92x-few/index.m3u8"
            },

            {
                name: "A2 CNN",
                logo: "https://i.imgur.com/TgO3Lzi.png",
                stream:
                    "https://gjirafa-video-live.gjirafa.net/gjvideo-live/2h7-5bc-xym-0k2/index.m3u8"
            },

            {
                name: "TV NEWS",
                logo: "",
                stream:
                    "https://gjirafa-video-live.gjirafa.net/gjvideo-live-n1/js0-h8f-ifx-29f/index.m3u8"
            },

            {
                name: "ZICO TV",
                logo: "",
                stream:
                    "https://gjirafa-video-live.gjirafa.net/gjvideo-live/j3a-n14-2pf-g3s/index.m3u8"
            },

            {
                name: "RTK 3",
                logo: "https://i.imgur.com/Ut9VcT3.png",
                stream:
                    "https://gjirafa-video-live.gjirafa.net/gjvideo-livestream/rtk3/index.m3u8"
            },

            {
                name: "RTK 4",
                logo: "https://i.imgur.com/Urm4XDR.png",
                stream:
                    "https://gjvideo-live-xk.gjirafa.net/gjvideo-livestream/rtk4/index.m3u8"
            },

            {
                name: "RTV BESA",
                logo: "https://i.imgur.com/Qi3mz4Q.png",
                stream:
                    "https://gjirafa-video-live.gjirafa.net/gjvideo-live-n1/ehn-g2o-v7w-nh4/index.m3u8"
            },

            {
                name: "TV PRIZRENI",
                logo: "https://i.imgur.com/hvtJwOO.png",
                stream:
                    "https://gjirafa-video-live.gjirafa.net/gjvideo-live/5m0-cok-g5z-1xi/index.m3u8"
            }

        ];
    }


    // ============================================================
    // IPTV-ORG M3U DOWNLOADER
    // ============================================================

    async getIptvOrgChannels() {

        try {

            const url =
                "https://iptv-org.github.io/iptv/countries/xk.m3u";

            const response =
                await this.client.get(url);

            const text =
                response.body || "";

            if (!text) {
                return [];
            }

            const lines =
                text.split(/\r?\n/);

            const channels = [];

            let current = null;


            for (const line of lines) {

                const trimmed =
                    line.trim();


                // ------------------------------------------------
                // Channel metadata
                // ------------------------------------------------

                if (
                    trimmed.startsWith("#EXTINF:")
                ) {

                    const comma =
                        trimmed.lastIndexOf(",");


                    const name =
                        comma !== -1
                            ? trimmed
                                .substring(comma + 1)
                                .trim()
                            : "";


                    const idMatch =
                        trimmed.match(
                            /tvg-id=["']([^"']+)["']/i
                        );


                    const logoMatch =
                        trimmed.match(
                            /tvg-logo=["']([^"']+)["']/i
                        );


                    current = {

                        name:
                            name,

                        id:
                            idMatch
                                ? idMatch[1]
                                : "",

                        logo:
                            logoMatch
                                ? logoMatch[1]
                                : ""
                    };

                    continue;
                }


                // ------------------------------------------------
                // Stream URL
                // ------------------------------------------------

                if (
                    trimmed.startsWith("http") &&
                    current
                ) {

                    channels.push({

                        name:
                            current.name,

                        id:
                            current.id,

                        logo:
                            current.logo,

                        stream:
                            trimmed
                    });


                    current = null;
                }
            }


            return channels;


        } catch (e) {

            console.log(
                "IPTV-org error: " + e
            );

            return [];
        }
    }


    // ============================================================
    // CHANNEL NAME NORMALIZATION
    // ============================================================

    normalizeName(name) {

        return String(name || "")
            .toLowerCase()
            .replace(/[\/_-]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }


    // ============================================================
    // CHANNEL MATCHING
    // ============================================================

    channelMatches(targetName, candidateName, candidateId) {

        const target =
            this.normalizeName(
                targetName
            );

        const candidate =
            this.normalizeName(
                candidateName
            );

        const id =
            this.normalizeName(
                candidateId
            );


        // Exact match
        if (
            target === candidate
        ) {
            return true;
        }


        // --------------------------------------------------------
        // RTV 21
        // --------------------------------------------------------

        if (
            target === "rtv 21" &&
            (
                candidate === "rtv21" ||
                candidate === "rtv 21" ||
                id.includes("rtv21")
            )
        ) {
            return true;
        }


        // --------------------------------------------------------
        // KTV / Kohavision
        // --------------------------------------------------------

        if (
            target.includes("kohavision") &&
            (
                candidate.includes("kohavision") ||
                candidate === "ktv" ||
                id.includes("kohavision")
            )
        ) {
            return true;
        }


        // --------------------------------------------------------
        // RTK channels
        // --------------------------------------------------------

        if (
            /^rtk [1-4]$/.test(target)
        ) {

            const number =
                target.replace(
                    "rtk ",
                    ""
                );

            if (
                candidate ===
                "rtk " + number
            ) {
                return true;
            }

            if (
                id.includes(
                    "rtk" + number
                )
            ) {
                return true;
            }
        }


        // --------------------------------------------------------
        // TV ARTA
        // --------------------------------------------------------

        if (
            target === "tv arta" &&
            (
                candidate === "tv arta" ||
                id.includes("tvarta")
            )
        ) {
            return true;
        }


        // --------------------------------------------------------
        // TV OPOJA
        // --------------------------------------------------------

        if (
            target === "tv opo ja" ||
            target === "tv opoja"
        ) {

            if (
                candidate.includes("opoja") ||
                id.includes("tvo poja") ||
                id.includes("tvopoja")
            ) {
                return true;
            }
        }


        // --------------------------------------------------------
        // TV SYRI
        // --------------------------------------------------------

        if (
            target === "tv syri" &&
            (
                candidate === "tv syri" ||
                candidate.includes("syri") ||
                id.includes("tvsyri")
            )
        ) {
            return true;
        }


        // --------------------------------------------------------
        // ATV
        // --------------------------------------------------------

        if (
            target === "atv" &&
            (
                candidate === "atv" ||
                id.includes("atv")
            )
        ) {
            return true;
        }


        // --------------------------------------------------------
        // A2 CNN
        // --------------------------------------------------------

        if (
            target === "a2 cnn" &&
            (
                candidate.includes("a2 cnn") ||
                candidate.includes("a2cnn") ||
                id.includes("a2cnn")
            )
        ) {
            return true;
        }


        return false;
    }


    // ============================================================
    // GET CURRENT STREAM + CURRENT LOGO
    // ============================================================

    async resolveIptvOrgChannel(channelName) {

        try {

            const channels =
                await this.getIptvOrgChannels();


            for (
                const channel
                of channels
            ) {

                if (
                    this.channelMatches(
                        channelName,
                        channel.name,
                        channel.id
                    )
                ) {

                    return {

                        stream:
                            channel.stream,

                        logo:
                            channel.logo,

                        name:
                            channel.name,

                        id:
                            channel.id
                    };
                }
            }


            return null;


        } catch (e) {

            console.log(
                "Channel resolution error: " +
                e
            );

            return null;
        }
    }


    // ============================================================
    // POPULAR
    // ============================================================

    async getPopular(page) {

        try {

            const list = [];

            const staticChannels =
                this.getChannelDatabase();


            // ----------------------------------------------------
            // Get IPTV-org data once.
            //
            // This gives us current stream + logo information.
            // ----------------------------------------------------

            const iptvChannels =
                await this.getIptvOrgChannels();


            // ----------------------------------------------------
            // Add our selected channels.
            // ----------------------------------------------------

            for (
                const channel
                of staticChannels
            ) {

                let finalLogo =
                    channel.logo;

                let finalStream =
                    channel.stream;


                // ------------------------------------------------
                // Look for current IPTV-org information.
                // ------------------------------------------------

                for (
                    const iptv
                    of iptvChannels
                ) {

                    if (
                        this.channelMatches(
                            channel.name,
                            iptv.name,
                            iptv.id
                        )
                    ) {

                        // Prefer IPTV-org's current logo
                        if (
                            iptv.logo
                        ) {
                            finalLogo =
                                iptv.logo;
                        }


                        // Prefer IPTV-org's current stream
                        if (
                            iptv.stream
                        ) {
                            finalStream =
                                iptv.stream;
                        }


                        break;
                    }
                }


                list.push({

                    name:
                        channel.name,

                    imageUrl:
                        finalLogo,

                    link:
                        finalStream
                });
            }


            // ----------------------------------------------------
            // Add additional IPTV-org Kosovo channels.
            //
            // Only these four are automatically imported.
            // ----------------------------------------------------

            const automaticNames = [

                "TV Arta",
                "TV Dielli",
                "TV Opoja",
                "TV Syri"

            ];


            for (
                const iptv
                of iptvChannels
            ) {

                const allowed =
                    automaticNames.some(
                        name =>
                            this.channelMatches(
                                name,
                                iptv.name,
                                iptv.id
                            )
                    );


                if (!allowed) {
                    continue;
                }


                const alreadyExists =
                    list.some(
                        item =>
                            this.channelMatches(
                                item.name,
                                iptv.name,
                                iptv.id
                            )
                    );


                if (!alreadyExists) {

                    list.push({

                        name:
                            iptv.name,

                        imageUrl:
                            iptv.logo,

                        link:
                            iptv.stream
                    });
                }
            }


            // ----------------------------------------------------
            // Remove duplicates
            // ----------------------------------------------------

            const unique = [];

            const seen =
                new Set();


            for (
                const channel
                of list
            ) {

                const key =
                    this.normalizeName(
                        channel.name
                    );


                if (
                    !seen.has(key)
                ) {

                    seen.add(key);

                    unique.push(
                        channel
                    );
                }
            }


            return {

                list:
                    unique,

                hasNextPage:
                    false
            };


        } catch (e) {

            console.log(
                "getPopular error: " +
                e
            );


            return {

                list: [],

                hasNextPage:
                    false
            };
        }
    }


    // ============================================================
    // LATEST
    // ============================================================

    async getLatestUpdates(page) {

        return await this.getPopular(
            page
        );
    }


    // ============================================================
    // SEARCH
    // ============================================================

    async search(
        query,
        page,
        filters
    ) {

        try {

            const catalog =
                await this.getPopular(
                    1
                );


            const q =
                this.normalizeName(
                    query
                );


            const filtered =
                catalog.list.filter(
                    channel =>
                        this.normalizeName(
                            channel.name
                        ).includes(q)
                );


            return {

                list:
                    filtered,

                hasNextPage:
                    false
            };


        } catch (e) {

            console.log(
                "search error: " +
                e
            );


            return {

                list: [],

                hasNextPage:
                    false
            };
        }
    }


    // ============================================================
    // CHANNEL DETAILS
    //
    // IMPORTANT:
    // The actual channel name and logo are preserved.
    //
    // We NEVER use "Kosovo Live TV" here.
    // ============================================================

    async getDetail(url) {

        try {

            const staticChannels =
                this.getChannelDatabase();


            let channel =
                staticChannels.find(
                    item =>
                        item.stream === url
                );


            // ----------------------------------------------------
            // If not found by static URL, check IPTV-org.
            // ----------------------------------------------------

            if (!channel) {

                const iptvChannels =
                    await this.getIptvOrgChannels();


                const found =
                    iptvChannels.find(
                        item =>
                            item.stream === url
                    );


                if (found) {

                    return {

                        name:
                            found.name,

                        description:
                            "Live Kosovo television.",

                        imageUrl:
                            found.logo,

                        episodes: [

                            {

                                name:
                                    "Shiko Live",

                                url:
                                    url
                            }

                        ]
                    };
                }
            }


            if (channel) {

                // ------------------------------------------------
                // Get latest metadata from IPTV-org.
                // ------------------------------------------------

                const current =
                    await this.resolveIptvOrgChannel(
                        channel.name
                    );


                let logo =
                    channel.logo;


                if (
                    current &&
                    current.logo
                ) {

                    logo =
                        current.logo;
                }


                return {

                    name:
                        channel.name,

                    description:
                        "Live Kosovo television.",

                    imageUrl:
                        logo,

                    episodes: [

                        {

                            name:
                                "Shiko Live",

                            url:
                                url
                        }

                    ]
                };
            }


            // ----------------------------------------------------
            // Last fallback.
            // ----------------------------------------------------

            return {

                name:
                    "Kosovo TV",

                description:
                    "Live Kosovo television.",

                imageUrl:
                    "",

                episodes: [

                    {

                        name:
                            "Shiko Live",

                        url:
                            url
                    }

                ]
            };


        } catch (e) {

            console.log(
                "getDetail error: " +
                e
            );


            return {

                name:
                    "Kosovo TV",

                description:
                    "Live Kosovo television.",

                imageUrl:
                    "",

                episodes: [

                    {

                        name:
                            "Shiko Live",

                        url:
                            url
                    }

                ]
            };
        }
    }


    // ============================================================
    // VIDEO PLAYER
    //
    // Whenever possible:
    //
    // Channel
    //    ↓
    // IPTV-org
    //    ↓
    // CURRENT stream
    //
    // Otherwise:
    //
    // Channel
    //    ↓
    // Existing Gjirafa fallback
    // ============================================================

    async getVideoList(url) {

        try {

            let channelName =
                "";


            // ----------------------------------------------------
            // Identify channel from existing fallback URL.
            // ----------------------------------------------------

            if (
                url.includes(
                    "2cz-npl-jfn-9he"
                )
            ) {

                channelName =
                    "RTV 21";

            } else if (
                url.includes(
                    "lj9-pxm-o53-rp0"
                )
            ) {

                channelName =
                    "KTV / Kohavision";

            } else if (
                url.includes(
                    "98r-d35-487-v6m"
                )
            ) {

                channelName =
                    "RTK 1";

            } else if (
                url.includes(
                    "0nj-g63-92x-few"
                )
            ) {

                channelName =
                    "ATV";

            } else if (
                url.includes(
                    "2h7-5bc-xym-0k2"
                )
            ) {

                channelName =
                    "A2 CNN";

            } else if (
                url.includes(
                    "js0-h8f-ifx-29f"
                )
            ) {

                channelName =
                    "TV NEWS";

            } else if (
                url.includes(
                    "j3a-n14-2pf-g3s"
                )
            ) {

                channelName =
                    "ZICO TV";

            } else if (
                url.includes(
                    "/rtk3/"
                )
            ) {

                channelName =
                    "RTK 3";

            } else if (
                url.includes(
                    "/rtk4/"
                )
            ) {

                channelName =
                    "RTK 4";

            } else if (
                url.includes(
                    "ehn-g2o-v7w-nh4"
                )
            ) {

                channelName =
                    "RTV BESA";

            } else if (
                url.includes(
                    "5m0-cok-g5z-1xi"
                )
            ) {

                channelName =
                    "TV PRIZRENI";
            }


            // ----------------------------------------------------
            // Dynamic resolution
            // ----------------------------------------------------

            if (
                channelName !== ""
            ) {

                const current =
                    await this.resolveIptvOrgChannel(
                        channelName
                    );


                if (
                    current &&
                    current.stream
                ) {

                    console.log(
                        "Using dynamic stream for " +
                        channelName
                    );


                    return [

                        {

                            url:
                                current.stream,

                            originalUrl:
                                current.stream,

                            quality:
                                "Live - IPTV-org Dynamic"
                        }

                    ];
                }
            }


            // ----------------------------------------------------
            // Fallback to existing URL.
            // ----------------------------------------------------

            console.log(
                "Using fallback stream: " +
                url
            );


            return [

                {

                    url:
                        url,

                    originalUrl:
                        url,

                    quality:
                        "Live - Gjirafa Fallback"
                }

            ];


        } catch (e) {

            console.log(
                "getVideoList error: " +
                e
            );


            return [

                {

                    url:
                        url,

                    originalUrl:
                        url,

                    quality:
                        "Live - Fallback"
                }

            ];
        }
    }
}
