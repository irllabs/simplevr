export default function PanelButton({event, icon, position}) {
    const params = () => {
        return `event: ${event};`;
    };

    return (
        <a-entity position={position} panel-button={params()}>
            <a-entity
                class="button-trigger raycast-trigger"
                position="-.5 0 -.1"
                material="
                    opacity: 0;
                    alphaTest: .5;
                    transparent: true"
                geometry="
                    primitive: plane;
                    height: 1;
                    width: 1;"
            />
            <a-image
                src={icon}
                class="button-image"
                position="-.5 0 .1"
                alpha-test=".5"
                width=".5"
                height=".5"
            />
        </a-entity>
    );
}
