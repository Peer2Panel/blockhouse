import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ReactMarkdown from 'react-markdown'
import T from "../Translator.jsx";
import i18n from 'meteor/universe:i18n';

export default function TOS() {
  const [open, setOpen] = React.useState(false);
  const [tos, setTOS] = useState("Loading...");

  useEffect(() => {
    // declare the data fetching function
    const fetchData = async () => {
      const lang = i18n.getLocale();
      let res;
      if(lang == "en"){
        res = await (await fetch("/tos.md")).text();
      }
      else if(lang == "de"){
        res = await (await fetch("/agb.md")).text();
      }
      else {
        res = "";
      }
      setTOS(res);
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
        <T>Common.terms_of_service</T>
      </span>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <T>Common.terms_of_service</T>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <ReactMarkdown>
              {tos}
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
