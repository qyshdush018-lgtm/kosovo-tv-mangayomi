const mangayomiSources = [
    {
        name: "Kosovo TV",
        langs: ["sq"],
        baseUrl: "https://github.com/qyshdush018-lgtm/kosovo-tv-mangayomi",
        apiUrl: "",
        iconUrl: "https://raw.githubusercontent.com/qyshdush018-lgtm/kosovo-tv-mangayomi/main/images/kosovo_tv.png",
        typeSource: "single",
        itemType: 1,
        version: "1.0.0",
        pkgName: "kosovo_tv/KosovoTV.js",
        pkgPath: "kosovo_tv/KosovoTV.js"
    }
];
class DefaultExtension extends MProvider {

    #client;

    get client() {
        return this.#client ??= new Client();
    }


    // ============================================================
    // CHANNEL METADATA
    //
    // We attach the channel name + logo to the URL fragment.
    //
    // Example:
    //
    // https://example.com/live/index.m3u8#MANGO_NAME=RTK%201&MANGO_LOGO=https%3A%2F%2F...
    //
    // Everything after "#" is metadata for Mangayomi.
    // The fragment is NOT sent to the streaming server.
    // ============================================================

    createChannelUrl(name, logo, stream) {

        const encodedName =
            encodeURIComponent(name || "");

        const encodedLogo =
            encodeURIComponent(logo || "");

        return (
            stream +
            "#MANGO_NAME=" +
            encodedName +
            "&MANGO_LOGO=" +
            encodedLogo
        );
    }


    // ============================================================
    // EXTRACT CHANNEL METADATA
    // ============================================================

    parseChannelUrl(url) {

        try {

            if (!url) {

                return {
                    name: "",
                    logo: "",
                    stream: ""
                };
            }


            const marker =
                "#MANGO_NAME=";


            const markerIndex =
                url.indexOf(marker);


            // ----------------------------------------------------
            // No metadata attached
            // ----------------------------------------------------

            if (markerIndex === -1) {

                return {
                    name: "",
                    logo: "",
                    stream: url
                };
            }


            // ----------------------------------------------------
            // Real stream = everything before "#"
            // ----------------------------------------------------

            const stream =
                url.substring(
                    0,
                    markerIndex
                );


            // ----------------------------------------------------
            // Metadata
            // ----------------------------------------------------

            const metadata =
                url.substring(
                    markerIndex + 1
                );


            let name = "";
            let logo = "";


            const parts =
                metadata.split("&");


            for (
                const part of parts
            ) {

                if (
                    part.startsWith(
                        "MANGO_NAME="
                    )
                ) {

                    try {

                        name =
                            decodeURIComponent(
                                part.substring(
                                    "MANGO_NAME=".length
                                )
                            );

                    } catch (e) {

                        name =
                            part.substring(
                                "MANGO_NAME=".length
                            );
                    }
                }


                else if (
                    part.startsWith(
                        "MANGO_LOGO="
                    )
                ) {

                    try {

                        logo =
                            decodeURIComponent(
                                part.substring(
                                    "MANGO_LOGO=".length
                                )
                            );

                    } catch (e) {

                        logo =
                            part.substring(
                                "MANGO_LOGO=".length
                            );
                    }
                }
            }


            return {

                name:
                    name,

                logo:
                    logo,

                stream:
                    stream
            };


        } catch (e) {

            console.log(
                "parseChannelUrl error: " +
                e
            );


            return {

                name: "",

                logo: "",

                stream: url
            };
        }
    }


    // ============================================================
    // WORKING KOSOVO CHANNELS
    // ============================================================

    async getPopular(page) {

        try {

            const list = [];

            const client =
                new Client();


            // ====================================================
            // IPTV-ORG
            // ====================================================

            try {

                const m3uUrl =
                    "https://iptv-org.github.io/iptv/countries/xk.m3u";


                const res =
                    await client.get(
                        m3uUrl
                    );


                const m3uText =
                    res.body || "";


                const lines =
                    m3uText.split(
                        /\r?\n/
                    );


                let currentChannelName =
                    "";

                let currentLogoUrl =
                    "";


                for (
                    let i = 0;
                    i < lines.length;
                    i++
                ) {

                    const line =
                        lines[i].trim();


                    // --------------------------------------------
                    // CHANNEL INFORMATION
                    // --------------------------------------------

                    if (
                        line.startsWith(
                            "#EXTINF:"
                        )
                    ) {

                        const nameIndex =
                            line.lastIndexOf(
                                ","
                            );


                        if (
                            nameIndex !== -1
                        ) {

                            currentChannelName =
                                line
                                    .substring(
                                        nameIndex + 1
                                    )
                                    .trim();
                        }


                        // Correct regex.
                        //
                        // Your old code had:
                        //
                        // /tvg-logo=["']\([^"']+)["']/
                        //
                        // The "\(" was wrong.
                        //

                        const logoMatch =
                            line.match(
                                /tvg-logo=["']([^"']+)["']/i
                            ) ||
                            line.match(
                                /logo=["']([^"']+)["']/i
                            );


                        currentLogoUrl =
                            logoMatch
                                ? logoMatch[1]
                                : "";
                    }


                    // --------------------------------------------
                    // STREAM URL
                    // --------------------------------------------

                    else if (
                        line.startsWith("http") &&
                        currentChannelName !== ""
                    ) {

                        const lowerName =
                            currentChannelName
                                .toLowerCase();


                        const allowed =
                            lowerName.includes(
                                "arta"
                            ) ||
                            lowerName.includes(
                                "dielli"
                            ) ||
                            lowerName.includes(
                                "opoja"
                            ) ||
                            lowerName.includes(
                                "syri"
                            );


                        if (
                            allowed
                        ) {

                            list.push({

                                name:
                                    currentChannelName,

                                imageUrl:
                                    currentLogoUrl,

                                link:
                                    this.createChannelUrl(
                                        currentChannelName,
                                        currentLogoUrl,
                                        line
                                    )
                            });
                        }


                        currentChannelName =
                            "";

                        currentLogoUrl =
                            "";
                    }
                }


            } catch (iptvErr) {

                console.log(
                    "IPTV-org source failed: " +
                    iptvErr
                );
            }


            // ====================================================
            // GJIRAFA CHANNELS
            // ====================================================

            const gjirafaFeeds = [

                {
                    name:
                        "RTV 21",

                    logo:
                        "https://i.imgur.com/AqQltGh.png",

                    stream:
                        "https://gjirafa-video-live.gjirafa.net/gjvideo-live/2cz-npl-jfn-9he/index.m3u8"
                },


                {
                    name:
                        "KTV / Kohavision",

                    logo:
                        "https://i.imgur.com/LOi9yma.png",

                    stream:
                        "https://gjirafa-video-live.gjirafa.net/gjvideo-livestream/lj9-pxm-o53-rp0/index.m3u8"
                },


                {
                    name:
                        "RTK 1",

                    logo:
                        "https://i.imgur.com/KTcWcO6.png",

                    stream:
                        "https://gjvideo-live-xk.gjirafa.net/gjvideo-livestream/98r-d35-487-v6m/index.m3u8"
                },


                {
                    name:
                        "ATV",

                    logo:
                        "https://i.imgur.com/lX6sekx.png",

                    stream:
                        "https://gjirafa-video-live.gjirafa.net/gjvideo-live/0nj-g63-92x-few/index.m3u8"
                },


                {
                    name:
                        "A2 CNN",

                    logo:
                        "https://i.imgur.com/TgO3Lzi.png",

                    stream:
                        "https://gjirafa-video-live.gjirafa.net/gjvideo-live/2h7-5bc-xym-0k2/index.m3u8"
                },


                {
                    name:
                        "TV NEWS",

                    // Leave empty rather than using
                    // a fake/broken logo URL.
                    logo:
                        "",

                    stream:
                        "https://gjirafa-video-live.gjirafa.net/gjvideo-live-n1/js0-h8f-ifx-29f/index.m3u8"
                },


                {
                    name:
                        "ZICO TV",

                    logo:
                        "",

                    stream:
                        "https://gjirafa-video-live.gjirafa.net/gjvideo-live/j3a-n14-2pf-g3s/index.m3u8"
                },


                {
                    name:
                        "RTK 3",

                    logo:
                        "https://i.imgur.com/Ut9VcT3.png",

                    stream:
                        "https://gjirafa-video-live.gjirafa.net/gjvideo-livestream/rtk3/index.m3u8"
                },


                {
                    name:
                        "RTK 4",

                    logo:
                        "https://i.imgur.com/Urm4XDR.png",

                    stream:
                        "https://gjvideo-live-xk.gjirafa.net/gjvideo-livestream/rtk4/index.m3u8"
                },


                {
                    name:
                        "RTV BESA",

                    logo:
                        "https://i.imgur.com/Qi3mz4Q.png",

                    stream:
                        "https://gjirafa-video-live.gjirafa.net/gjvideo-live-n1/ehn-g2o-v7w-nh4/index.m3u8"
                },


                {
                    name:
                        "TV PRIZRENI",

                    logo:
                        "https://i.imgur.com/hvtJwOO.png",

                    stream:
                        "https://gjirafa-video-live.gjirafa.net/gjvideo-live/5m0-cok-g5z-1xi/index.m3u8"
                }

            ];


            // ====================================================
            // ADD GJIRAFA CHANNELS
            // ====================================================

            for (
                const channel of gjirafaFeeds
            ) {

                list.push({

                    name:
                        channel.name,

                    imageUrl:
                        channel.logo,

                    link:
                        this.createChannelUrl(
                            channel.name,
                            channel.logo,
                            channel.stream
                        )
                });
            }


            // ====================================================
            // REMOVE DUPLICATES
            // ====================================================

            const unique = [];

            const seen =
                new Set();


            for (
                const channel of list
            ) {

                const key =
                    channel.name
                        .toLowerCase()
                        .trim();


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
    // LATEST UPDATES
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


            const filtered =
                catalog.list.filter(
                    channel =>
                        channel.name
                            .toLowerCase()
                            .includes(
                                query.toLowerCase()
                            )
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
    // THIS IS THE IMPORTANT PART.
    //
    // We recover the actual channel name + logo from the
    // metadata that was attached in getPopular().
    //
    // Therefore:
    //
    // RTV 21
    // stays RTV 21
    //
    // RTK 1
    // stays RTK 1
    //
    // ATV
    // stays ATV
    //
    // etc.
    // ============================================================

    async getDetail(url) {

        try {

            const channel =
                this.parseChannelUrl(
                    url
                );


            const channelName =
                channel.name ||
                "Live TV";


            const channelLogo =
                channel.logo ||
                "";


            const streamUrl =
                channel.stream;


            return {

                name:
                    channelName,

                description:
                    "Live Kosovo television channel.",

                imageUrl:
                    channelLogo,

                episodes: [

                    {

                        name:
                            "Shiko " +
                            channelName,

                        url:
                            streamUrl
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
                    "Live TV",

                description:
                    "",

                imageUrl:
                    "",

                episodes: [

                    {

                        name:
                            "Luaj",

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
    // IMPORTANT:
    //
    // Mangayomi gets the CLEAN stream URL.
    //
    // The #MANGO_NAME and #MANGO_LOGO metadata are removed.
    // ============================================================

    async getVideoList(url) {

        try {

            const channel =
                this.parseChannelUrl(
                    url
                );


            const streamUrl =
                channel.stream ||
                url;


            return [

                {

                    url:
                        streamUrl,

                    originalUrl:
                        streamUrl,

                    quality:
                        "Live"
                }

            ];


        } catch (e) {

            console.log(
                "getVideoList error: " +
                e
            );


            return [];
        }
    }
}
