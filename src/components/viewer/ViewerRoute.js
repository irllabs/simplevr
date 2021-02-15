import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import 'aframe';
import 'aframe-look-at-component';
import Scene from '../../aframe-components/Scene'

const styles = makeStyles((theme) => ({
    root: {
        paddingTop: 96,

    }
}))
export default function ViewerRoute () {
    const classes = styles()
    return (
        <>
            <Scene />
        </>
    )
}
