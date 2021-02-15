/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react'
import 'aframe';
import { Entity, Scene as AframeScene } from 'aframe-react';
import Door from './Door'

export default class Scene extends Component {
    constructor (props) {
        super(props);
        this.state = {
            backgroundImage: '#france'
        }
        this.onDoorClick = this.onDoorClick.bind(this)
    }

    onDoorClick (e, args) {
        console.log('Room::onDoorClick', e, args);
        this.setState({
            backgroundImage: this.state.backgroundImage === '#france' ? '#germany' : '#france'
        })
    }

    render () {
        return (
            <AframeScene>
                <a-assets>
                    <audio id="click-sound" src="https://cdn.aframe.io/360-image-gallery-boilerplate/audio/click.ogg"></audio>
                    <img id="france" src="/france-pool.jpg" />
                    <img id="germany" src="/germany-castle.jpg" />
                </a-assets>

                <Entity primitive="a-sky" radius="10" src={this.state.backgroundImage} />

                <Door doorClick={this.onDoorClick} />

                <Entity primitive="a-camera">
                    <Entity primitive="a-cursor" animation__click={{ property: 'scale', startEvents: 'click', from: '0.1 0.1 0.1', to: '1 1 1', dur: 150 }} />
                </Entity>
            </AframeScene>
        )
    }
}
