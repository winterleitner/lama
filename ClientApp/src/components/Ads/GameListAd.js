import React, {useEffect} from 'react'

export const GameListAd = props => {
    useEffect(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    }, [])
    return <ins className="adsbygoogle"
             style={{display:"block"}}
             data-ad-format="fluid"
             data-ad-layout-key="-gw-3+1f-3d+2z"
             data-ad-client="ca-pub-9990572970648519"
             data-ad-slot="1335210316"></ins>;
}