import React, {
	useEffect,
	useRef,
	useState,
} from 'react';
import qrcode from 'qrcode';
import copy from 'copy-to-clipboard';

import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	makeStyles,
	Typography,
} from '@material-ui/core';
import StorageProject from '../../models/storage/StorageProject';
import { v1 as uuid } from 'uuid';

const styles = makeStyles(() => {
	return {
		publicDataContainer: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			paddingTop: '12px',
			paddingLeft: '24px',
			paddingRight: '24px',
			paddingBottom: '24px',
		},
	};
});

interface StoryQRCodeDialogProps {
	project: StorageProject;
	onClose: () => void;
}

const StoryQRCodeDialog = ({ project, onClose }: StoryQRCodeDialogProps): JSX.Element => {
	const classes = styles();

	const [link, setLink] = useState('');

	const qrCodeCanvas = useRef<HTMLCanvasElement>();

	useEffect(() => {
		setLink(`${window.location.origin}/session/${project.id}/${uuid().replace(/-/g, '')}`);
	}, [project]);

	useEffect(() => {
		if (!qrCodeCanvas.current) {
			return;
		}

		qrcode.toCanvas(qrCodeCanvas.current, link);
	}, [qrCodeCanvas, link]);

	const onCopyLink = () => {
		copy(link);
	};

	return (
		<Dialog onClose={onClose} open maxWidth="xs" fullWidth>
			<DialogTitle>
				<div>
					<Typography variant="body1">
						Story QR Code
					</Typography>
				</div>
			</DialogTitle>
			<DialogContent>
				<div className={classes.publicDataContainer}>
					<canvas ref={qrCodeCanvas} />
					<Typography variant="body2" align="center" style={{wordWrap: 'break-word'}}>
						{link}
					</Typography>
					<Box m={2} />
					<Button fullWidth variant="outlined" onClick={onCopyLink}>
						Copy session link
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
export default StoryQRCodeDialog;
