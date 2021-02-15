import React from 'react'
import Scene from '../../aframe-components/Scene'
import EditorHeader from './EditorHeader'
import EditorFooter from './EditorFooter'

export default function EditorRoute () {

    /*const [roomId, setRoomId] = useState('room-id-1')

    const story = {
        rooms:[
            {
                id:'room-id-1',
                backgroundImage:'france'
            },
            {
                id:'room-id-2',
                backgroundImage:'germany'
            }
        ]
    }*/



    return (
        <>
            <EditorHeader />
            <Scene />
            <EditorFooter />
        </>
    )
}
