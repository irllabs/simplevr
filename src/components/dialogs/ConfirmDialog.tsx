import React, { FC } from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	text: string;
	onClose: () => void;
	onConfirm: () => void;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({open, title, text, onClose, onConfirm}): JSX.Element => {
	return (
		<Dialog
			maxWidth="xs"
			open={open}
		>
			<DialogTitle id="confirmation-dialog-title">
				{title}
			</DialogTitle>
			<DialogContent>
				<Typography variant='body2'>
					{text}
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button autoFocus onClick={onClose} color="primary">
					No
				</Button>
				<Button onClick={onConfirm} color="primary">
					Yes
				</Button>
			</DialogActions>
		</Dialog>
	)
}
export default ConfirmDialog;
