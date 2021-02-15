import React, { Component } from 'react'
import 'aframe';
import { Entity } from 'aframe-react';

export default class Door extends Component {
    constructor (props) {
        super(props);
        this.state = { color: '#CCCCCC' };
        this.onDoorMouseEnter = this.onDoorMouseEnter.bind(this)
        this.onDoorMouseLeave = this.onDoorMouseLeave.bind(this)
        this.onDoorClick = this.onDoorClick.bind(this)
    }
    onDoorClick () {
        this.props.doorClick()
    }
    onDoorMouseEnter () {
        this.setState({ color: '#474747' })
    }
    onDoorMouseLeave () {
        this.setState({ color: '#CCCCCC' })
    }
    render () {
        return (
            <Entity
                geometry={{ primitive: 'plane', height: 1, width: 1 }}
                material={{ color: this.state.color }}
                position={{ x: 0, y: 0, z: -5 }}
                events={{
                    click: this.onDoorClick,
                    mouseenter: this.onDoorMouseEnter,
                    mouseleave: this.onDoorMouseLeave,
                }}
            />
        )
    }
}
