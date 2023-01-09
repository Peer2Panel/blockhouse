import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ReactMarkdown from 'react-markdown'
import T from "../Translator.jsx";

export default function PrivacyPolicy() {
  const [open, setOpen] = useState(false);
  const [policy, setPolicy] = useState("Loading...");

  useEffect(() => {
    // declare the data fetching function
    const fetchData = async () => {
      const res = await (await fetch("/policy.md")).text();
      setPolicy(res);
    }
  
    fetchData().catch(console.error);
  }, [])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <span onClick={handleClickOpen}>
        <T>Common.privacy_policy</T>
      </span>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Privacy Policy"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <ReactMarkdown>
              {policy}
            </ReactMarkdown>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
