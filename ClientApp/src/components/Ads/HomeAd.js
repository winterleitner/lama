import React, {useEffect} from 'react'

export const HomeAd = props => {
    useEffect(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    }, [])
    return <ins className="adsbygoogle"
         style={{display:"block"}}
         data-ad-client="ca-pub-9990572970648519"
         data-ad-slot="3514651091"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
}